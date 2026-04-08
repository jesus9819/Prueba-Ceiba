import { AsyncPipe, DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MoneyCopPipe } from '../../shared/pipes/money-cop.pipe';
import { PortfolioStore } from '../../state/portfolio.store';

@Component({
  selector: 'app-transactions-page',
  standalone: true,
  imports: [
    AsyncPipe,
    MoneyCopPipe,
    DatePipe,
    MatTableModule,
    MatCardModule,
    MatChipsModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './transactions.page.html',
  styleUrl: './transactions.page.scss',
})
export class TransactionsPage {
  private readonly store = inject(PortfolioStore);
  readonly transactions$ = this.store.transactions$;
  readonly loading$ = this.store.loading$;
  readonly error$ = this.store.error$;

  readonly displayedColumns: string[] = ['fecha', 'tipo', 'fondo', 'monto', 'notificacion'];

  typeLabel(type: string): string {
    return type === 'SUBSCRIPTION' ? 'Suscripción' : 'Cancelación';
  }
}
