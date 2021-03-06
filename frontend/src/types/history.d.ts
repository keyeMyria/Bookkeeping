type HistoryType = {
  year: number,
  month: number,
  day: number,
  order?: number,
  type: string,
  category?: string,
  subCategory?: string,
  balance: HistoryBalanceType,
  goal?: string,
  description?: string,
  id?: string
};

type HistoryBalanceType = {
  value: number,
  newValue?: number,
  account?: string,
  accountTo?: string,
  subAccount?: string,
  subAccountTo?: string,
  currency: string,
  newCurrency?: string,
  alternativeCurrency?: {[currncy: string]: number}
};
