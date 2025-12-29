export interface AnnualRate {
  year: number;
  rate: number;
}

export interface CalculationResult {
  year: number;
  startDate: string;
  endDate: string;
  days: number;
  daysInYear: number;
  rate: number;
  principal: number;
  interest: number;
}

export interface Summary {
  totalInterest: number;
  totalAmount: number;
  totalDays: number;
}

export enum View {
  HOME = 'INICIO',
  SETTINGS = 'INTERESES'
}