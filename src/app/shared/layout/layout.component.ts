import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MoneyCopPipe } from '../pipes/money-cop.pipe';
import { PortfolioStore } from '../../state/portfolio.store';
import { OnboardingComponent } from '../onboarding/onboarding.component';
import { OnboardingService } from '../onboarding/onboarding.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    AsyncPipe,
    MoneyCopPipe,
    OnboardingComponent,
    MatToolbarModule,
    MatButtonModule,
    MatCardModule,
  ],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss',
})
export class LayoutComponent {
  private readonly store = inject(PortfolioStore);
  private readonly onboarding = inject(OnboardingService);

  readonly balance$ = this.store.balance$;

  openOnboarding(): void {
    this.onboarding.open();
  }
}
