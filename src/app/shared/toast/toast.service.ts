import { inject, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

export type ToastKind = 'success' | 'error' | 'info';

/**
 * Notificaciones con Angular Material SnackBar (sustituye el toast visual custom).
 */
@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly snackBar = inject(MatSnackBar);

  show(kind: ToastKind, message: string): void {
    const panelClass = kind === 'error' ? 'toast-error' : kind === 'success' ? 'toast-success' : 'toast-info';
    this.snackBar.open(message, 'Cerrar', {
      duration: 4000,
      horizontalPosition: 'end',
      verticalPosition: 'bottom',
      panelClass: [panelClass],
    });
  }

  clear(): void {
    this.snackBar.dismiss();
  }
}
