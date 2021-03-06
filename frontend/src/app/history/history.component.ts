import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';

import { filter, switchMap, tap } from 'rxjs/operators';

import { HistoryService } from '../common/service/history.service';
import { ProfileService } from '../common/service/profile.service';
import { ConfirmDialogService } from '../common/components/confirm-dialog/confirm-dialog.service';
import { HistoryItem } from '../common/model/history/HistoryItem';
import { AlertService } from '../common/service/alert.service';
import { AlertType } from '../common/model/alert/AlertType';
import { HistoryEditDialogComponent } from './history-edit-dialog/history-edit-dialog.component';
import { DialogService } from '../common/service/dialog.service';

@Component({
  selector: 'bk-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css']
})
export class HistoryComponent implements OnInit {
  public static readonly PAGE_LIMIT: number = 10;

  public loading: boolean = true;
  public loadingMoreIndicator: boolean = false;
  public disableMoreButton: boolean = false;

  public historyItems: HistoryType[] = [];

  public constructor(
    private _dialogService: DialogService,
    private _historyService: HistoryService,
    private _authenticationService: ProfileService,
    private _confirmDialogService: ConfirmDialogService,
    private _alertService: AlertService,
    private _dialog: MatDialog
  ) {}

  public ngOnInit(): void {
    this.init(1, HistoryComponent.PAGE_LIMIT);
  }

  public loadMoreItems(numberOfNewItems: number): void {
    this.init(1, this.historyItems.length + numberOfNewItems);
  }

  public editHistoryItem(historyItem: HistoryItem): void {
    this._dialogService.openDialog(HistoryEditDialogComponent, {
      width: '720px',
      position: {top: 'top'},
      panelClass: 'history-add-edit-dialog',
      data: {
        'historyItem': historyItem.cloneOriginalItem(),
        'editMode': true
      }
    }).afterClosed()
      .pipe(filter((result: boolean) => result === true))
      .subscribe(() => this.loadMoreItems(0));
  }

  public deleteHistoryItem(historyItem: HistoryItem): void {
    this._confirmDialogService.openConfirmDialog('Подтверждение', 'Точно удалить?')
      .afterClosed()
      .pipe(
        filter((result: boolean) => result === true),
        tap(() => this.loading = true),
        switchMap(() => this._historyService.deleteHistoryItem(historyItem.originalItem.id)),
        tap(simpleResponse => {
          if (simpleResponse.status === 'FAIL') {
            this._alertService.addAlert(AlertType.WARNING, 'Ошибка при удалении');
            this.loadMoreItems(0);
          }
        }),
        filter(simpleResponse => simpleResponse.status === 'SUCCESS')
      ).subscribe(() => {
        this._alertService.addAlert(AlertType.SUCCESS, 'Запись успешно удалена');
        this._authenticationService.quiteReloadAccounts();
        this.loadMoreItems(-1);
      });
  }

  private init(page: number, limit: number): void {
    this.loading = true;
    this._historyService.loadHistoryItems(page, limit).subscribe((historyItems: HistoryType[]) => {
      if (historyItems.length < limit) {
        this.disableMoreButton = true;
      }
      this.historyItems = historyItems;
      this.loading = false;
    });
  }
}
