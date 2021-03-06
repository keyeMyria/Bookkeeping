import { Component, OnInit } from '@angular/core';

import { DateUtils } from '../common/utils/date-utils';
import { BudgetService } from '../common/service/budget.service';
import { DialogService } from '../common/service/dialog.service';
import { PlanBudgetDialogComponent } from './plan-budget-dialog/plan-budget-dialog.component';

@Component({
  selector: 'bk-budget',
  templateUrl: './budget.component.html',
  styleUrls: ['./budget.component.css']
})
export class BudgetComponent implements OnInit {
  public months: string[] = DateUtils.MONTHS;
  public loading: boolean;
  public selectedMonth: number;
  public selectedYear: number;
  public budget: Budget;
  public monthProgress: MonthProgress;

  public constructor(
    private _budgetService: BudgetService,
    private _dialogService: DialogService
  ) {}

  public ngOnInit(): void {
    const now: Date = new Date();
    this.selectedYear = now.getFullYear();
    this.selectedMonth = now.getMonth();
    this.loadBudget();
  }

  public getSelectedMonth(): string {
    return this.months[this.selectedMonth];
  }

  public chooseMonth(monthIndex: number): void {
    if (this.selectedMonth !== monthIndex) {
      this.selectedMonth = monthIndex;
      this.loadBudget();
    }
  }

  public decreaseYear(): void {
    if (!this.loading) {
      this.selectedYear--;
      this.selectedMonth = 11;
      this.loadBudget();
    }
  }

  public increaseMonth(): void {
    if (!this.loading) {
      this.selectedYear++;
      this.selectedMonth = 0;
      this.loadBudget();
    }
  }

  public openPlanDialog(): void {
    if (!this.loading) {
      this._dialogService.openDialog(PlanBudgetDialogComponent, {
        width: '400px',
        position: {top: 'top'},
        data: {
          'editMode': false,
          'type': 'category'
        }
      }).afterClosed()
        .subscribe(() => {
          this.loading = false;
        });
    }
  }

  private loadBudget(): void {
    this.loading = true;
    this.updateMonthProgress();
    this._budgetService.loadBudget(this.selectedYear, this.selectedMonth + 1).subscribe((budget: Budget) => {
      this.budget = budget;
      this.loading = false;
    });
  }

  private updateMonthProgress(): void {
    const now: Date = new Date();
    const currentMonth: boolean = now.getFullYear() === this.selectedYear && now.getMonth() === this.selectedMonth;
    const monthPercent: number = currentMonth ? Math.round(now.getDate() / DateUtils.daysInMonth(this.selectedYear, this.selectedMonth) * 100) : 0;
    this.monthProgress = {'currentMonth': currentMonth, 'monthPercent': monthPercent};
  }
}
