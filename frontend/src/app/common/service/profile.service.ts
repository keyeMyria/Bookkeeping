import { Inject, Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Http, Response } from '@angular/http';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';

import { Subject } from 'rxjs/Subject';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { Observable } from 'rxjs/Observable';
import { Md5 } from 'ts-md5/dist/md5';
import { isNullOrUndefined } from 'util';

import { LoadingService } from 'app/common/service/loading.service';
import { HOST } from '../config/config';
import { AssetImagePipe } from '../pipes/asset-image.pipe';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/delay';

@Injectable()
export class ProfileService implements CanActivate {
  private _authenticationLoading: Subject<boolean>;
  private _authenticatedProfile: Profile;
  private _userCurrencies: Map<String, CurrencyDetail> = new Map();
  private _categoryIcon: Map<string, string> = new Map();
  private _accountIcon: Map<string, string> = new Map();
  private _accounts$$: Subject<FinAccount[]> = new ReplaySubject(1);

  public constructor(
    private _router: Router,
    private _formBuilder: FormBuilder,
    private _loadingService: LoadingService,
    private _assetImagePipe: AssetImagePipe,
    private _http: Http,
    @Inject(HOST) private _host: string
  ) {
    this._authenticationLoading = _loadingService.authentication$$;
  }

  public canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (!isNullOrUndefined(this._authenticatedProfile)) {
      return true;
    }

    this._router.navigate(['/authentication']);
    return false;
  }

  public initAuthenticationForm(): FormGroup {
    return this._formBuilder.group({
      email: ['', [Validators.required, Validators.email, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  public getProfileByEmail(email: string): Observable<Profile> {
    this._authenticationLoading.next(true);
    return this._http.get(`${this._host}/profiles?email=${email}`)
      .delay(1500)
      .map((response: Response) => {
        this._authenticationLoading.next(false);
        return response.json()[0];
      });
  }

  public authenticate(profile: Profile, password: string): boolean {
    if (Md5.hashStr(password) !== profile.password) {
      return false;
    }

    profile.currencies.sort((first: CurrencyDetail, second: CurrencyDetail) => first.order - second.order);
    profile.currencies.forEach((currency: CurrencyDetail) => this._userCurrencies.set(currency.name, currency));
    profile.categories.forEach((category: Category) => this._categoryIcon.set(category.title, category.icon));
    profile.accounts.forEach((account: FinAccount) => {
      account.subAccounts.forEach((subAccount: SubAccount) => this._accountIcon.set(`${account.title}-${subAccount.title}`, subAccount.icon));
    });
    this._accounts$$.next(profile.accounts);
    this._authenticatedProfile = profile;
    return true;
  }

  public exit(): void {
    this._authenticatedProfile = null;
  }

  public get authenticatedProfile(): Profile {
    return this._authenticatedProfile;
  }

  public getCurrencyDetails(currency: string): CurrencyDetail {
    return this._userCurrencies.get(currency);
  }

  public getProfileCurrencies(): string[] {
    return this.authenticatedProfile.currencies.map((currency: CurrencyDetail) => currency.name);
  }

  public get defaultCurrency(): CurrencyDetail {
    let defaultCurrency: CurrencyDetail = null;
    this._authenticatedProfile.currencies.forEach((currency: CurrencyDetail) => {
      if (currency.default) {
        defaultCurrency = currency;
        return;
      }
    });

    return defaultCurrency || this._authenticatedProfile.currencies.values().next().value;
  }

  public getCategoryIcon(categoryTitle: string): string {
    return this._categoryIcon.get(categoryTitle);
  }

  public transformCategories(categories: Category[], type: string): SelectItem[] {
    const result: SelectItem[] = [];
    categories.forEach((category: Category) => {
      const subSelectItems: SelectItem[] = [];
      category.subCategories.forEach((subCategory: SubCategory) => {
        if (!type || type === subCategory.type) {
          subSelectItems.push({title: subCategory.title});
        }
      });
      if (subSelectItems.length > 0) {
        const iconPath: string = category.icon ? this._assetImagePipe.transform(category.icon, 'category') : null;
        result.push({title: category.title, children: subSelectItems, icon: iconPath});
      }
    });

    return result;
  }

  public reloadAccounts(): void {
    this._loadingService.accounts$$.next(true);
    this._http.get(`${this._host}/profiles/${this.authenticatedProfile.id}/accounts`)
      .delay(1500)
      .do(() => this._loadingService.accounts$$.next(false))
      .subscribe((response: Response) => {
        const accounts: FinAccount[] = response.json();
        this._accountIcon.clear();
        accounts.forEach((account: FinAccount) => {
          account.subAccounts.forEach((subAccount: SubAccount) => this._accountIcon.set(`${account.title}-${subAccount.title}`, subAccount.icon));
        });
        this._accounts$$.next(accounts);
      });
  }

  public getAccountIcon(account: string, subAccount: string): string {
    return this._accountIcon.get(`${account}-${subAccount}`);
  }

  public get accounts$(): Observable<FinAccount[]> {
    return this._accounts$$;
  }

  public transformAccounts(accounts: FinAccount[]): SelectItem[] {
    const result: SelectItem[] = [];
    accounts.forEach((account: FinAccount) => {
      const subSelectItems: SelectItem[] = [];
      account.subAccounts.forEach((subAccount: SubAccount) => {
        const iconPath: string = subAccount.icon ? this._assetImagePipe.transform(subAccount.icon, 'account') : null;
        subSelectItems.push({title: subAccount.title, icon: iconPath});
      });
      result.push({title: account.title, children: subSelectItems});
    });

    return result;
  }

  public static chooseSelectedItem(items: SelectItem[], firstLevel: string, secondLevel: string): SelectItem[] {
    const selectedItem: SelectItem[] = [];
    items.forEach((item: SelectItem) => {
      if (item.title === firstLevel) {
        selectedItem.push(item);
        item.children.forEach((subItem: SelectItem) => {
          if (subItem.title === secondLevel) {
            selectedItem.push(subItem);
          }
        });
      }
    });

    return selectedItem;
  }
}
