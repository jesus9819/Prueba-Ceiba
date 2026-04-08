import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterLink } from '@angular/router';
import { MoneyCopPipe } from '../../shared/pipes/money-cop.pipe';
import { PortfolioStore } from '../../state/portfolio.store';

@Component({
  selector: 'app-fund-list-page',
  standalone: true,
  imports: [
    AsyncPipe,
    RouterLink,
    MoneyCopPipe,
    MatCardModule,
    MatChipsModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './fund-list.page.html',
  styleUrl: './fund-list.page.scss',
})
export class FundListPage {
  private readonly store = inject(PortfolioStore);
  readonly funds$ = this.store.funds$;
  readonly holdings$ = this.store.holdingsByFundId$;
  readonly loading$ = this.store.loading$;
  readonly error$ = this.store.error$;

  trackById = (_: number, f: { id: number }) => f.id;
}
