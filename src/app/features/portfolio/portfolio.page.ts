import { AsyncPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterLink } from '@angular/router';
import { combineLatest, map } from 'rxjs';
import { MoneyCopPipe } from '../../shared/pipes/money-cop.pipe';
import { ToastService } from '../../shared/toast/toast.service';
import { PortfolioStore } from '../../state/portfolio.store';

type HoldingVM = { fundId: number; fundName: string; category: string; amountCop: number };

@Component({
  selector: 'app-portfolio-page',
  standalone: true,
  imports: [
    AsyncPipe,
    ReactiveFormsModule,
    MoneyCopPipe,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './portfolio.page.html',
  styleUrl: './portfolio.page.scss',
})
export class PortfolioPage {
  private readonly store = inject(PortfolioStore);
  private readonly toast = inject(ToastService);

  readonly loading$ = this.store.loading$;
  readonly error$ = this.store.error$;

  readonly holdings$ = combineLatest([this.store.funds$, this.store.holdingsByFundId$]).pipe(
    map(([funds, holdings]) => {
      const list: HoldingVM[] = [];
      for (const f of funds) {
        const amount = holdings[f.id] ?? 0;
        if (amount > 0) list.push({ fundId: f.id, fundName: f.name, category: f.category, amountCop: amount });
      }
      return list.sort((a, b) => b.amountCop - a.amountCop);
    }),
  );

  readonly selectedFundId = signal<number | null>(null);
  readonly selectedHoldingCop = signal<number>(0);
  readonly modalError = signal<string | null>(null);

  readonly form = new FormGroup({
    amountCop: new FormControl<number | null>(null, { validators: [Validators.required, Validators.min(1)] }),
  });
  readonly amountCtrl = this.form.controls.amountCop;

  readonly hasSelection = computed(() => this.selectedFundId() !== null);

  openCancel(fundId: number, holdingCop: number): void {
    this.selectedFundId.set(fundId);
    this.selectedHoldingCop.set(holdingCop);
    this.modalError.set(null);
    this.form.reset({ amountCop: null });
  }

  closeCancel(): void {
    this.selectedFundId.set(null);
    this.selectedHoldingCop.set(0);
    this.modalError.set(null);
    this.form.reset({ amountCop: null });
  }

  confirmCancel(): void {
    const fundId = this.selectedFundId();
    if (fundId === null) return;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.modalError.set(null);
    const amount = this.amountCtrl.value ?? 0;

    this.store.cancelFromFund({ fundId, amountCop: amount }).subscribe({
      next: () => {
        this.toast.show('success', 'Cancelación realizada. Saldo actualizado.');
        this.closeCancel();
      },
      error: (e: unknown) => {
        // Una sola fuente de feedback: mostrar el error dentro del modal (no toast).
        const msg = e instanceof Error ? e.message : 'No fue posible cancelar.';
        this.modalError.set(msg);
      },
    });
  }
}
