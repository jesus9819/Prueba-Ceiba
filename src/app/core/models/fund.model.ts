export type FundCategory = 'FPV' | 'FIC';

export interface Fund {
  id: number;
  name: string;
  minimumAmountCop: number;
  category: FundCategory;
}

