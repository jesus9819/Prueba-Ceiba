export type NotificationMethod = 'EMAIL' | 'SMS';

export type TransactionType = 'SUBSCRIPTION' | 'CANCELLATION';

export interface Transaction {
  id: string;
  type: TransactionType;
  fundId: number;
  fundName: string;
  amountCop: number;
  notificationMethod?: NotificationMethod;
  createdAtIso: string;
}

