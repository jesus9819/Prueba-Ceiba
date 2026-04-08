import { Injectable, signal } from '@angular/core';
import { APP_BUILD_STAMP, APP_PACKAGE_VERSION } from '../../core/build-stamp.generated';

/**
 * Identificador único por compilación / arranque (versión + sello de tiempo).
 * Si cambia respecto a lo guardado en localStorage, el tour se muestra otra vez.
 */
function currentOnboardingRelease(): string {
  return `${APP_PACKAGE_VERSION}@${APP_BUILD_STAMP}`;
}

const STORAGE_KEY_RELEASE = 'btg_onboarding_release_v2';

/**
 * Controla si el usuario ya vio el tour para **esta** compilación y la visibilidad del panel.
 * Tras cada `npm start` o `npm run build` se regenera el sello → el tour puede volver a abrirse solo.
 */
@Injectable({ providedIn: 'root' })
export class OnboardingService {
  /** Panel visible (tour o ayuda). */
  readonly visible = signal(false);

  constructor() {
    if (!this.hasCompletedForCurrentBuild()) {
      this.visible.set(true);
    }
  }

  /** `true` si ya cerró el tour para la compilación actual (misma versión + mismo build stamp). */
  hasCompletedForCurrentBuild(): boolean {
    try {
      return localStorage.getItem(STORAGE_KEY_RELEASE) === currentOnboardingRelease();
    } catch {
      return false;
    }
  }

  /** Compatibilidad con código que llamaba `hasCompleted()`. */
  hasCompleted(): boolean {
    return this.hasCompletedForCurrentBuild();
  }

  /** Marca el tour como visto para esta compilación y cierra. */
  markCompletedAndClose(): void {
    try {
      localStorage.setItem(STORAGE_KEY_RELEASE, currentOnboardingRelease());
    } catch {
      /* sin persistencia, el tour podría volver al recargar */
    }
    this.visible.set(false);
  }

  open(): void {
    this.visible.set(true);
  }

  closeWithoutCompleting(): void {
    this.visible.set(false);
  }
}
