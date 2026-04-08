import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'moneyCop',
  standalone: true,
})
export class MoneyCopPipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    const amount = typeof value === 'number' && Number.isFinite(value) ? value : 0;
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(amount);
  }
}

