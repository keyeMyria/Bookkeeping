export class HistoryItem {
  public constructor(
    public order: number,
    public type: string,
    public category: string,
    public subCategory: string,
    public icon: string,
    public description: string,
    public goal: HistoryGoal,
    public balance: HistoryBalanceType
  ) {}

  public isExpense(): boolean {
    return 'expense' === this.type;
  }
}