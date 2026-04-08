import { NgStyle } from '@angular/common';
import { Component, computed, DestroyRef, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { fromEvent } from 'rxjs';
import { OnboardingService } from './onboarding.service';

type Step = {
  title: string;
  body: string;
  /** `id` del elemento en el DOM (p. ej. en `layout.component.html`). */
  anchorId: string;
  hint?: string;
};

const CARD_EST_HEIGHT = 420;
const CARD_EST_WIDTH = 440;

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [NgStyle],
  templateUrl: './onboarding.component.html',
  styleUrl: './onboarding.component.scss',
})
export class OnboardingComponent {
  private readonly onboarding = inject(OnboardingService);
  private readonly destroyRef = inject(DestroyRef);

  readonly steps: Step[] = [
    {
      title: 'Bienvenida',
      anchorId: 'onboarding-target-saldo',
      body:
        'Esta demo simula la gestión de fondos FPV/FIC para un único usuario. Aquí ves tu saldo disponible en pesos colombianos.',
      hint: 'El saldo baja al suscribirte y sube al cancelar participación.',
    },
    {
      title: 'Fondos y suscripción',
      anchorId: 'onboarding-target-nav-fondos',
      body:
        'Al pulsar Fondos, la lista aparece en el área principal (debajo del menú). Verás categoría, monto mínimo e invertido. Entra a un fondo para suscribirte.',
      hint: 'El monto debe ser ≥ al mínimo y no puedes superar tu saldo. Puedes elegir notificación por correo o SMS.',
    },
    {
      title: 'Portafolio y cancelaciones',
      anchorId: 'onboarding-target-nav-portafolio',
      body:
        'Aquí solo ves fondos en los que tienes dinero invertido. Puedes cancelar parte o todo el monto; el saldo del header se actualiza al confirmar.',
    },
    {
      title: 'Historial',
      anchorId: 'onboarding-target-nav-historial',
      body:
        'Registro de suscripciones y cancelaciones: fecha, fondo, monto y método de notificación cuando aplica.',
      hint: 'Los datos se guardan en tu navegador (localStorage) para simular un backend.',
    },
  ];

  readonly stepIndex = signal(0);
  readonly isLast = computed(() => this.stepIndex() >= this.steps.length - 1);
  readonly isFirst = computed(() => this.stepIndex() <= 0);
  readonly current = computed(() => this.steps[this.stepIndex()]);

  readonly visible = this.onboarding.visible;

  /** Rectángulo resaltado (viewport, px). */
  readonly spotlightRect = signal<{
    top: number;
    left: number;
    width: number;
    height: number;
  } | null>(null);

  /** Posición fija del panel del tour. */
  readonly panelStyle = signal<Record<string, string>>({
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
  });

  constructor() {
    effect(() => {
      if (!this.visible()) {
        this.spotlightRect.set(null);
        return;
      }
      this.stepIndex();
      queueMicrotask(() => this.syncAnchorLayout());
    });

    fromEvent(window, 'resize')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        if (this.visible()) this.syncAnchorLayout();
      });

    fromEvent(window, 'scroll', { capture: true })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        if (this.visible()) this.syncAnchorLayout();
      });
  }

  private syncAnchorLayout(): void {
    if (!this.visible()) return;

    const step = this.steps[this.stepIndex()];
    const el = document.getElementById(step.anchorId);
    if (!el) {
      this.spotlightRect.set(null);
      this.panelStyle.set({
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      });
      return;
    }

    const pad = 10;
    const r = el.getBoundingClientRect();
    const top = r.top - pad;
    const left = r.left - pad;
    const width = r.width + pad * 2;
    const height = r.height + pad * 2;

    this.spotlightRect.set({ top, left, width, height });

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const cardW = Math.min(CARD_EST_WIDTH, vw - 32);

    let panelTop = r.bottom + 16;
    let panelLeft = r.left + r.width / 2 - cardW / 2;
    panelLeft = Math.max(16, Math.min(panelLeft, vw - cardW - 16));

    if (panelTop + CARD_EST_HEIGHT > vh - 16) {
      panelTop = top - CARD_EST_HEIGHT - 16;
    }
    if (panelTop < 16) {
      panelTop = 16;
    }

    this.panelStyle.set({
      top: `${panelTop}px`,
      left: `${panelLeft}px`,
      transform: 'none',
      width: `${cardW}px`,
    });
  }

  next(): void {
    if (this.isLast()) {
      this.finish();
    } else {
      this.stepIndex.update((i) => i + 1);
    }
  }

  prev(): void {
    this.stepIndex.update((i) => Math.max(0, i - 1));
  }

  skip(): void {
    this.onboarding.markCompletedAndClose();
    this.stepIndex.set(0);
  }

  finish(): void {
    this.onboarding.markCompletedAndClose();
    this.stepIndex.set(0);
  }

  dismissOverlay(): void {
    if (this.onboarding.hasCompleted()) {
      this.onboarding.closeWithoutCompleting();
    } else {
      this.onboarding.markCompletedAndClose();
    }
    this.stepIndex.set(0);
  }
}
