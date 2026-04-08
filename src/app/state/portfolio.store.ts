import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, catchError, finalize, map, of, switchMap, tap, throwError } from 'rxjs';
import { MockApiService } from '../core/services/mock-api.service';
import { Fund } from '../core/models/fund.model';
import { NotificationMethod, Transaction } from '../core/models/transaction.model';
import { uuid } from '../core/utils/uuid';

type HoldingsByFundId = Record<number, number>;

type ViewState = {
  balanceCop: number;
  holdingsByFundId: HoldingsByFundId;
  transactions: Transaction[];
};

@Injectable({ providedIn: 'root' })
export class PortfolioStore {
  private readonly _funds = new BehaviorSubject<Fund[] | null>(null);
  readonly funds$ = this._funds.asObservable().pipe(map((v) => v ?? []));

  private readonly _state = new BehaviorSubject<ViewState>({
    balanceCop: 500_000,
    holdingsByFundId: {},
    transactions: [],
  });
  readonly state$ = this._state.asObservable();
  readonly balance$ = this.state$.pipe(map((s) => s.balanceCop));
  readonly holdingsByFundId$ = this.state$.pipe(map((s) => s.holdingsByFundId));
  readonly transactions$ = this.state$.pipe(map((s) => s.transactions));

  private readonly _loading = new BehaviorSubject<boolean>(false);
  readonly loading$ = this._loading.asObservable();

  private readonly _error = new BehaviorSubject<string | null>(null);
  readonly error$ = this._error.asObservable();

  constructor(private readonly api: MockApiService) {
    this.bootstrap();
  }

  bootstrap(): void {
    this._loading.next(true);
    this._error.next(null);

    this.api
      .getFunds()
      .pipe(
        tap((funds) => this._funds.next(funds)),
        switchMap(() => this.api.getState()),
        tap((persisted) =>
          this._state.next({
            balanceCop: persisted.balanceCop,
            holdingsByFundId: persisted.holdingsByFundId,
            transactions: persisted.transactions,
          }),
        ),
        catchError((e: unknown) => {
          this._error.next(e instanceof Error ? e.message : 'Error inesperado cargando datos');
          return of(null);
        }),
        finalize(() => this._loading.next(false)),
      )
      .subscribe();
  }

  reset(): Observable<void> {
    this._loading.next(true);
    this._error.next(null);
    return this.api.reset().pipe(
      tap((persisted) =>
        this._state.next({
          balanceCop: persisted.balanceCop,
          holdingsByFundId: persisted.holdingsByFundId,
          transactions: persisted.transactions,
        }),
      ),
      map(() => void 0),
      finalize(() => this._loading.next(false)),
    );
  }

  fundById(id: number): Fund | null {
    const funds = this._funds.value ?? [];
    return funds.find((f) => f.id === id) ?? null;
  }

  holdingsAmount(id: number): number {
    return this._state.value.holdingsByFundId[id] ?? 0;
  }

  subscribeToFund(input: {
    fundId: number;
    amountCop: number;
    notificationMethod: NotificationMethod;
  }): Observable<void> {
    const fund = this.fundById(input.fundId);
    if (!fund) return this.fail('Fondo no encontrado.');

    const amount = input.amountCop;
    if (!Number.isFinite(amount) || amount <= 0) return this.fail('El monto debe ser mayor a 0.');
    if (amount < fund.minimumAmountCop) {
      return this.fail(`El monto mínimo para este fondo es ${fund.minimumAmountCop}.`);
    }

    const current = this._state.value;
    if (current.balanceCop < amount) {
      return this.fail('No tienes saldo suficiente para realizar la suscripción.');
    }

    const tx: Transaction = {
      id: uuid(),
      type: 'SUBSCRIPTION',
      fundId: fund.id,
      fundName: fund.name,
      amountCop: amount,
      notificationMethod: input.notificationMethod,
      createdAtIso: new Date().toISOString(),
    };

    const next: ViewState = {
      balanceCop: current.balanceCop - amount,
      holdingsByFundId: {
        ...current.holdingsByFundId,
        [fund.id]: (current.holdingsByFundId[fund.id] ?? 0) + amount,
      },
      transactions: [tx, ...current.transactions],
    };

    return this.persist(next);
  }

  cancelFromFund(input: { fundId: number; amountCop: number }): Observable<void> {
    const fund = this.fundById(input.fundId);
    if (!fund) return this.fail('Fondo no encontrado.');

    const amount = input.amountCop;
    if (!Number.isFinite(amount) || amount <= 0) return this.fail('El monto debe ser mayor a 0.');

    const current = this._state.value;
    const holding = current.holdingsByFundId[fund.id] ?? 0;
    if (holding <= 0) return this.fail('No tienes saldo invertido en este fondo.');
    if (amount > holding) return this.fail('No puedes cancelar más de lo que tienes invertido.');

    const tx: Transaction = {
      id: uuid(),
      type: 'CANCELLATION',
      fundId: fund.id,
      fundName: fund.name,
      amountCop: amount,
      createdAtIso: new Date().toISOString(),
    };

    const nextHolding = holding - amount;
    const nextHoldings: HoldingsByFundId = { ...current.holdingsByFundId, [fund.id]: nextHolding };
    if (nextHolding === 0) delete nextHoldings[fund.id];

    const next: ViewState = {
      balanceCop: current.balanceCop + amount,
      holdingsByFundId: nextHoldings,
      transactions: [tx, ...current.transactions],
    };

    return this.persist(next);
  }

  private persist(next: ViewState): Observable<void> {
    this._loading.next(true);
    this._error.next(null);
    return this.api
      .setState({
        balanceCop: next.balanceCop,
        holdingsByFundId: next.holdingsByFundId,
        transactions: next.transactions,
      })
      .pipe(
        tap(() => this._state.next(next)),
        map(() => void 0),
        catchError((e: unknown) => {
          const message = e instanceof Error ? e.message : 'Error inesperado guardando cambios';
          this._error.next(message);
          return throwError(() => new Error(message));
        }),
        finalize(() => this._loading.next(false)),
      );
  }

  private fail(message: string): Observable<never> {
    this._error.next(message);
    return throwError(() => new Error(message));
  }
}

