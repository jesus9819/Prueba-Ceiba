import { Injectable } from '@angular/core';
import { Observable, delay, of, throwError } from 'rxjs';
import { Fund } from '../models/fund.model';
import { Transaction } from '../models/transaction.model';

type PersistedState = {
  balanceCop: number;
  holdingsByFundId: Record<number, number>;
  transactions: Transaction[];
};

const STORAGE_KEY = 'btg_funds_state_v1';
const INITIAL_BALANCE_COP = 500_000;

const FUNDS: Fund[] = [
  { id: 1, name: 'FPV_BTG_PACTUAL_RECAUDADORA', minimumAmountCop: 75_000, category: 'FPV' },
  { id: 2, name: 'FPV_BTG_PACTUAL_ECOPETROL', minimumAmountCop: 125_000, category: 'FPV' },
  { id: 3, name: 'DEUDAPRIVADA', minimumAmountCop: 50_000, category: 'FIC' },
  { id: 4, name: 'FDO-ACCIONES', minimumAmountCop: 250_000, category: 'FIC' },
  { id: 5, name: 'FPV_BTG_PACTUAL_DINAMICA', minimumAmountCop: 100_000, category: 'FPV' },
];

@Injectable({ providedIn: 'root' })
export class MockApiService {
  getFunds(): Observable<Fund[]> {
    return of(FUNDS).pipe(delay(350));
  }

  getState(): Observable<PersistedState> {
    return of(this.readState()).pipe(delay(200));
  }

  setState(next: PersistedState): Observable<PersistedState> {
    this.writeState(next);
    return of(next).pipe(delay(150));
  }

  reset(): Observable<PersistedState> {
    const next: PersistedState = {
      balanceCop: INITIAL_BALANCE_COP,
      holdingsByFundId: {},
      transactions: [],
    };
    this.writeState(next);
    return of(next).pipe(delay(150));
  }

  private readState(): PersistedState {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return {
          balanceCop: INITIAL_BALANCE_COP,
          holdingsByFundId: {},
          transactions: [],
        };
      }
      const parsed = JSON.parse(raw) as PersistedState;
      return {
        balanceCop: typeof parsed.balanceCop === 'number' ? parsed.balanceCop : INITIAL_BALANCE_COP,
        holdingsByFundId: parsed.holdingsByFundId ?? {},
        transactions: parsed.transactions ?? [],
      };
    } catch {
      // si el storage está corrupto, volvemos al estado inicial
      return {
        balanceCop: INITIAL_BALANCE_COP,
        holdingsByFundId: {},
        transactions: [],
      };
    }
  }

  private writeState(state: PersistedState): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      // sin persistencia, el estado no sobreviverá reload
      // pero seguimos operando en memoria
      // eslint-disable-next-line no-console
      console.warn('No fue posible persistir en localStorage', e);
    }
  }

  error(message: string): Observable<never> {
    return throwError(() => new Error(message));
  }
}

