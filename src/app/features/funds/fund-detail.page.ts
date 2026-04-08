import { AsyncPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators, type ValidatorFn } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { MoneyCopPipe } from '../../shared/pipes/money-cop.pipe';
import { ToastService } from '../../shared/toast/toast.service';
import { PortfolioStore } from '../../state/portfolio.store';
import { NotificationMethod } from '../../core/models/transaction.model';

@Component({
  selector: 'app-fund-detail-page',
  standalone: true,
  imports: [
    AsyncPipe,
    RouterLink,
    ReactiveFormsModule,
    MoneyCopPipe,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatRadioModule,
    MatButtonModule,
  ],
  templateUrl: './fund-detail.page.html',
  styleUrl: './fund-detail.page.scss',
})
export class FundDetailPage {
  private readonly route = inject(ActivatedRoute);
  private readonly store = inject(PortfolioStore);
  private readonly toast = inject(ToastService);

  readonly fundId$ = this.route.paramMap.pipe(map((p) => Number(p.get('id'))));

  readonly fund$ = this.fundId$.pipe(map((id) => this.store.fundById(id)));
  readonly balance$ = this.store.balance$;
  readonly loading$ = this.store.loading$;
  readonly error$ = this.store.error$;

  readonly submitting = signal(false);
  readonly submitError = signal<string | null>(null);
  private readonly balanceCop = signal(0);

  readonly form = new FormGroup({
    amountCop: new FormControl<number | null>(null, {
      nonNullable: false,
      validators: [Validators.required, Validators.min(1)],
    }),
    notificationMethod: new FormControl<NotificationMethod>('EMAIL', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  readonly amountCtrl = this.form.controls.amountCop;
  readonly notificationCtrl = this.form.controls.notificationMethod;

  readonly amountLabel = computed(() => 'Monto a suscribir (COP)');

  constructor() {
    const insufficientBalanceValidator: ValidatorFn = (control) => {
      const raw = control.value;
      const amount = typeof raw === 'number' ? raw : Number(raw);
      if (!Number.isFinite(amount)) return null;
      if (amount <= 0) return null;
      return amount > this.balanceCop() ? { insufficientBalance: true } : null;
    };

    this.balance$.pipe(takeUntilDestroyed()).subscribe((b) => {
      this.balanceCop.set(b ?? 0);
      this.amountCtrl.updateValueAndValidity({ emitEvent: false });
    });

    this.fund$.pipe(takeUntilDestroyed()).subscribe((fund) => {
      const min = fund?.minimumAmountCop ?? 1;
      this.amountCtrl.setValidators([Validators.required, Validators.min(min), insufficientBalanceValidator]);
      this.amountCtrl.updateValueAndValidity({ emitEvent: false });
    });
  }

  submit(fundId: number): void {
    this.submitError.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const amount = this.amountCtrl.value ?? 0;
    const notificationMethod = this.notificationCtrl.value;

    this.submitting.set(true);
    this.store
      .subscribeToFund({ fundId, amountCop: amount, notificationMethod })
      .subscribe({
        next: () => {
          this.toast.show('success', 'Suscripción realizada con éxito.');
          this.form.reset({ amountCop: null, notificationMethod: notificationMethod ?? 'EMAIL' });
        },
        error: (e: unknown) => {
          const msg = e instanceof Error ? e.message : 'No fue posible suscribirse.';
          this.submitError.set(msg);
          this.toast.show('error', msg);
        },
      })
      .add(() => this.submitting.set(false));
  }
}
