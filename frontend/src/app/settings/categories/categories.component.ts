import { Component, OnInit } from '@angular/core';

import { filter, switchMap, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { of } from 'rxjs/index';

import { ProfileService } from '../../common/service/profile.service';
import { AlertService } from '../../common/service/alert.service';
import { AlertType } from '../../common/model/alert/AlertType';
import { ConfirmDialogService } from '../../common/components/confirm-dialog/confirm-dialog.service';
import { AccountCategoryDialogComponent } from '../account-category-dialog/account-category-dialog.component';
import { DialogService } from '../../common/service/dialog.service';

@Component({
  selector: 'bk-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css']
})
export class CategoriesComponent implements OnInit {
  public loading: boolean = false;
  public profile: Profile;

  public constructor(
    private _dialogService: DialogService,
    private _profileService: ProfileService,
    private _alertService: AlertService,
    private _confirmDialogService: ConfirmDialogService
  ) {}

  public ngOnInit(): void {
    this.profile = this._profileService.authenticatedProfile;
    this.profile.categories.forEach((category: Category) => category.opened = false);
  }

  public addCategory(): void {
    this.openCategoryDialog({
      'type': 'category',
      'editMode': false
    });
  }

  public editCategory(editCategory: Category): void {
    this.openCategoryDialog({
      'type': 'category',
      'editMode': true,
      'title': editCategory.title,
      'icon': editCategory.icon
    });
  }

  public deleteCategory(deleteCategory: Category): void {
    let removeCallback = () => this._profileService.deleteCategory(deleteCategory.title);
    this.deleteCategoryOrSubCategory(removeCallback, 'При удалении категории все ее подкатегории а так же существующие операции с этими подкатегориями будут удалены. Продолжить?');
  }

  public moveCategoryUp(category: Category): void {
    this.loading = true;
    this.moveCategoryOrSubCategory(this._profileService.moveCategoryUp(category.title));
  }

  public moveCategoryDown(category: Category): void {
    this.loading = true;
    this.moveCategoryOrSubCategory(this._profileService.moveCategoryDown(category.title));
  }

  public addSubCategory(category: Category): void {
    this.openCategoryDialog({
      'type': 'subCategory',
      'editMode': false,
      'parentTitle': category.title
    });
  }

  public editSubCategory(category: Category, subCategory: SubCategory): void {
    this.openCategoryDialog({
      'type': 'subCategory',
      'editMode': true,
      'parentTitle': category.title,
      'title': subCategory.title,
      'subCategoryType': subCategory.type
    });
  }

  public deleteSubCategory(category: Category, subCategory: SubCategory): void {
    let removeCallback = () => this._profileService.deleteSubCategory(category.title, subCategory.title, subCategory.type);
    this.deleteCategoryOrSubCategory(removeCallback, 'При удалении подкатегории все существующие операции с этой подкатегорией будут удалены. Продолжить?');
  }

  public moveSubCategoryUp(category: Category, subCategory: SubCategory): void {
    this.loading = true;
    this.moveCategoryOrSubCategory(this._profileService.moveSubCategoryUp(category.title, subCategory.title, subCategory.type));
  }

  public moveSubCategoryDown(category: Category, subCategory: SubCategory): void {
    this.loading = true;
    this.moveCategoryOrSubCategory(this._profileService.moveSubCategoryDown(category.title, subCategory.title, subCategory.type));
  }

  public hasSubcategories(category: Category): boolean {
    return category.subCategories && category.subCategories.length > 0;
  }

  private deleteCategoryOrSubCategory(removeCallback: () => Observable<SimpleResponse>, message: string): void {
    const dialogResult: Observable<boolean> = this._confirmDialogService
      .openConfirmDialog('Подтверждение', message)
      .afterClosed()
      .pipe(
        filter((result: boolean) => result === true),
        tap(() => this.loading = true),
        switchMap(removeCallback),
        tap(simpleResponse => {
          if (simpleResponse.status === 'FAIL') {
            this._alertService.addAlert(AlertType.WARNING, 'Во время удаления произошла ошибка');
          }
        }),
        switchMap(simpleResponse => simpleResponse.status === 'SUCCESS' ? of(true) : of(false))
      );
    this.processCategoryDialogResult(dialogResult);
  }

  private moveCategoryOrSubCategory(result: Observable<SimpleResponse>): void {
    const moveResult: Observable<boolean> = result
      .pipe(
        tap(simpleResponse => {
          if (simpleResponse.status === 'FAIL') {
            this._alertService.addAlert(AlertType.WARNING, 'Во время перемещения произошла ошибка');
          }
        }),
        switchMap(simpleResponse => simpleResponse.status === 'SUCCESS' ? of(true) : of(false))
      );
    this.processCategoryDialogResult(moveResult);
  }

  private openCategoryDialog(dialogData: {}): void {
    const dialogResult: Observable<boolean> = this._dialogService.openDialog(AccountCategoryDialogComponent, {
      width: '550px',
      position: {top: 'top'},
      data: dialogData
    }).afterClosed();
    this.processCategoryDialogResult(dialogResult);
  }

  private processCategoryDialogResult(dialogResult: Observable<boolean>): void {
    dialogResult
      .pipe(
        filter((result: boolean) => result === true),
        tap((result: boolean) => {
          this._alertService.addAlert(AlertType.SUCCESS, 'Операция успешно выполнена');
          this.loading = true;
        }),
        switchMap(() =>this._profileService.reloadCategoriesInProfile())
      ).subscribe(() => {
      this.loading = false;
    });
  }
}
