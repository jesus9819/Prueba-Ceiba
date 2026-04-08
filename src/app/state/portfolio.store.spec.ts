import { describe, expect, it } from 'vitest';
import { firstValueFrom, of } from 'rxjs';
import { PortfolioStore } from './portfolio.store';
import { Fund } from '../core/models/fund.model';
import { Transaction } from '../core/models/transaction.model';

class FakeApi {
  funds: Fund[] = [];
  state = {
    balanceCop: 500_000,
    holdingsByFundId: {} as Record<number, number>,
    transactions: [] as Transaction[],
  };

  getFunds() {
    return of(this.funds);
  }
  getState() {
    return of(this.state);
  }
  setState(next: typeof this.state) {
    this.state = next;
    return of(next);
  }
  reset() {
    this.state = { balanceCop: 500_000, holdingsByFundId: {}, transactions: [] };
    return of(this.state);
  }
}

describe('PortfolioStore', () => {
  it('should prevent subscription if balance is insufficient', async () => {
    const api = new FakeApi();
    api.funds = [{ id: 3, name: 'DEUDAPRIVADA', minimumAmountCop: 50_000, category: 'FIC' }];
    api.state.balanceCop = 10_000;

    const store = new PortfolioStore(api as any);

    await expect(
      firstValueFrom(store.subscribeToFund({ fundId: 3, amountCop: 50_000, notificationMethod: 'EMAIL' })),
    ).rejects.toThrow(/saldo suficiente/i);
  });

  it('should update balance and holdings on subscription', async () => {
    const api = new FakeApi();
    api.funds = [{ id: 1, name: 'FPV_BTG_PACTUAL_RECAUDADORA', minimumAmountCop: 75_000, category: 'FPV' }];
    api.state.balanceCop = 500_000;

    const store = new PortfolioStore(api as any);
    await firstValueFrom(store.subscribeToFund({ fundId: 1, amountCop: 100_000, notificationMethod: 'SMS' }));

    expect(store.holdingsAmount(1)).toBe(100_000);
    expect((store as any)._state.value.balanceCop).toBe(400_000);
    expect((store as any)._state.value.transactions[0].type).toBe('SUBSCRIPTION');
  });

  it('should update balance and holdings on cancellation', async () => {
    const api = new FakeApi();
    api.funds = [{ id: 4, name: 'FDO-ACCIONES', minimumAmountCop: 250_000, category: 'FIC' }];
    api.state.balanceCop = 250_000;
    api.state.holdingsByFundId = { 4: 250_000 };

    const store = new PortfolioStore(api as any);
    await firstValueFrom(store.cancelFromFund({ fundId: 4, amountCop: 50_000 }));

    expect(store.holdingsAmount(4)).toBe(200_000);
    expect((store as any)._state.value.balanceCop).toBe(300_000);
    expect((store as any)._state.value.transactions[0].type).toBe('CANCELLATION');
  });
});

