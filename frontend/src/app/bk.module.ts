import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { MatDialogModule, MatProgressSpinnerModule } from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { PopoverModule } from 'ngx-popover';

import { BookkeepingRootComponent } from './bk.component';
import { BOOKKEEPING_ROUTES } from './routes';
import { AuthenticationComponent } from './authentication/authentication.component';
import { InputComponent } from './authentication/input/input.component';
import { ProfileService } from './common/service/profile.service';
import { LoadingService } from './common/service/loading.service';
import { environment } from '../environments/environment';
import { HOST } from './common/config/config';
import { BookkeepingComponent } from './bookkeeping/bookkeeping.component';
import { HeaderComponent } from './bookkeeping/header/header.component';
import { HistoryComponent } from './bookkeeping/history/history.component';
import { BudgetComponent } from './bookkeeping/budget/budget.component';
import { SettingsComponent } from './bookkeeping/settings/settings.component';
import { SummaryComponent } from './bookkeeping/summary/summary.component';
import { SpinnerComponent } from './common/components/spinner/spinner.component';
import { CurrencyService } from './common/service/currency.service';
import { CurrencyConversionComponent } from './bookkeeping/summary/currency-conversion/currency-conversion.component';
import { SummaryBodyComponent } from './bookkeeping/summary/summary-body/summary-body.component';
import { SummaryFooterComponent } from './bookkeeping/summary/summary-footer/summary-footer.component';
import { SummaryFooterPipe } from './common/pipes/summary/summary-footer.pipe';
import { CurrencySymbolComponent } from './common/components/currency-symbol/currency-symbol.component';
import { SummaryBalanceOrderingPipe } from './common/pipes/summary/summary-balance-ordering.pipe';
import { CurrencyValuePipe } from './common/pipes/currency-value.pipe';
import { SummaryBodyAccountPipe } from './common/pipes/summary/summary-body-account.pipe';
import { SummaryBodySubAccountPipe } from './common/pipes/summary/summary-body-subaccount.pipe';
import { HistoryService } from './common/service/history.service';
import { HistoryPageActionsComponent } from './bookkeeping/history/history-page-actions/history-page-actions.component';
import { HistoryGroupPipe } from './common/pipes/history-group.pipe';
import { HistoryEditDialogComponent } from './bookkeeping/history/history-edit-dialog/history-edit-dialog.component';
import { ConfirmDialogComponent } from './common/components/confirm-dialog/confirm-dialog.component';
import { ConfirmDialogService } from './common/components/confirm-dialog/confirm-dialog.service';
import { AlertService } from './common/service/alert.service';
import { MyDatePickerModule } from 'mydatepicker';
import { GoalsContainerComponent } from './bookkeeping/history/history-edit-dialog/goals-container/goals-container.component';
import { CurrencyValueDirective } from './common/directives/currency-value.directive';
import { SelectComponent } from './common/components/select/select.component';
import { FocusDirective } from './common/directives/focus.directive';
import { ClickOutsideDirective } from './common/directives/click-outside.directive';
import { AssetImagePipe } from './common/pipes/asset-image.pipe';
import { LoadingDialogComponent } from './common/components/loading-dialog/loading-dialog.component';
import { MapKeysPipe } from './common/pipes/map-keys.pipe';
import { InputGroupComponent } from './bookkeeping/history/history-edit-dialog/input-group/input-group.component';
import { AlternativeCurrenciesDialogComponent } from './bookkeeping/history/history-edit-dialog/input-group/alternative-currencies-dialog/alternative-currencies-dialog.component';
import { BudgetService } from './common/service/budget.service';
import { GoalBudgetCategoryComponent } from './bookkeeping/history/history-edit-dialog/goals-container/goal-budget-category/goal-budget-category.component';
import { TemplateVariableComponent } from './common/components/template-variable/template-variable.component';
import { GoalFilterPipe } from './common/pipes/goal-filter.pipe';
import { GoalSortPipe } from './common/pipes/goal-sort.pipe';
import { CurrenciesComponent } from './bookkeeping/settings/currencies/currencies.component';
import { AccountsComponent } from './bookkeeping/settings/accounts/accounts.component';
import { CategoriesComponent } from './bookkeeping/settings/categories/categories.component';
import { ProfileComponent } from './bookkeeping/settings/profile/profile.component';

@NgModule({
  declarations: [
    BookkeepingRootComponent,
    AuthenticationComponent,
    InputComponent,
    BookkeepingComponent,
    HeaderComponent,
    HistoryComponent,
    BudgetComponent,
    SettingsComponent,
    SummaryComponent,
    SpinnerComponent,
    CurrencyConversionComponent,
    SummaryBodyComponent,
    SummaryFooterComponent,
    SummaryFooterPipe,
    CurrencySymbolComponent,
    SummaryBalanceOrderingPipe,
    CurrencyValuePipe,
    SummaryBodyAccountPipe,
    SummaryBodySubAccountPipe,
    HistoryPageActionsComponent,
    HistoryGroupPipe,
    HistoryEditDialogComponent,
    ConfirmDialogComponent,
    GoalsContainerComponent,
    CurrencyValueDirective,
    SelectComponent,
    FocusDirective,
    ClickOutsideDirective,
    AssetImagePipe,
    LoadingDialogComponent,
    AlternativeCurrenciesDialogComponent,
    MapKeysPipe,
    InputGroupComponent,
    GoalBudgetCategoryComponent,
    TemplateVariableComponent,
    GoalFilterPipe,
    GoalSortPipe,
    CurrenciesComponent,
    AccountsComponent,
    CategoriesComponent,
    ProfileComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    PopoverModule,
    MyDatePickerModule,
    RouterModule.forRoot(BOOKKEEPING_ROUTES),
  ],
  entryComponents: [
    ConfirmDialogComponent,
    HistoryEditDialogComponent,
    LoadingDialogComponent,
    AlternativeCurrenciesDialogComponent
  ],
  providers: [
    CurrencyValuePipe,
    AssetImagePipe,
    ProfileService,
    LoadingService,
    CurrencyService,
    HistoryService,
    ConfirmDialogService,
    BudgetService,
    AlertService,
    {
      provide: HOST,
      useValue: environment.backendHost,
    }
  ],
  bootstrap: [BookkeepingRootComponent]
})
export class BookkeepingModule { }
