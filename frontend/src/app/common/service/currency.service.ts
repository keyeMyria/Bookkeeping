import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable,  Subject } from 'rxjs';
import { tap } from 'rxjs/internal/operators';
import { IMyDate } from 'mydatepicker';

import { HOST } from '../config/config';
import { DateUtils } from '../utils/date-utils';

@Injectable()
export class CurrencyService {
  private _todayConversions: Map<String, CurrencyHistory> = new Map();
  private _currencies: Map<string, Map<number, Map<number, CurrencyHistory[]>>> = new Map();
  private _currenciesIndicatorMap: Map<string, Map<number, Map<number, boolean>>> = new Map();
  private _currenciesUpdate$$: Subject<string> = new Subject();

  public constructor(
    private _http: HttpClient,
    @Inject(HOST) private _host: string
  ) {}

  public loadCurrenciesForMonth(request: {month: number, year: number, currencies: string[]}): Observable<CurrencyHistory[]> {
    return this._http.post<CurrencyHistory[]>('/api/currency/month-currencies', request)
      .pipe(
        tap((currencyHistories: CurrencyHistory[]) => {
          request.currencies.forEach(currency => {
            if (!this._todayConversions.has(currency)) {
              const todayConversions: CurrencyHistory = currencyHistories
                .filter(value => value.name === currency)
                .reduce((first: CurrencyHistory, second: CurrencyHistory) => first.day > second.day ? first : second);
              this._todayConversions.set(currency, todayConversions);
            }
          });}),
        tap((currencyHistories: CurrencyHistory[]) => {
          currencyHistories.forEach(currencyHistory => {
            let currencyYears: Map<number, Map<number, CurrencyHistory[]>>;
            let currency = currencyHistory.name;
            if (this._currencies.has(currency)) {
              currencyYears = this._currencies.get(currency);
            } else {
              currencyYears = new Map();
              this._currencies.set(currency, currencyYears);
            }
            let indicatorYears: Map<number, Map<number, boolean>>;
            if (this._currenciesIndicatorMap.has(currency)) {
              indicatorYears = this._currenciesIndicatorMap.get(currency);
            } else {
              indicatorYears = new Map();
              this._currenciesIndicatorMap.set(currency, indicatorYears);
            }

            let currencyMonths: Map<number, CurrencyHistory[]>;
            let year = request.year;
            if (currencyYears.has(year)) {
              currencyMonths = currencyYears.get(year);
            } else {
              currencyMonths = new Map();
              currencyYears.set(year, currencyMonths);
            }
            let indicatorMonths: Map<number, boolean>;
            if (indicatorYears.has(year)) {
              indicatorMonths = indicatorYears.get(year);
            } else {
              indicatorMonths = new Map();
              indicatorYears.set(year, indicatorMonths);
            }

            currencyMonths.set(request.month, currencyHistories);
            indicatorMonths.set(request.month, true);
          });
        }),
        tap((currencyHistories: CurrencyHistory[]) => {
          request.currencies.forEach(currency => {
            this._currenciesUpdate$$.next(currency);
          });
        })
      );
  }

  public loadAllCurrencies(): Observable<CurrencyDetail[]> {
    return this._http.get<CurrencyDetail[]>('/api/currency/default-currencies');
  }
















  public get currenciesUpdate$(): Observable<string> {
    return this._currenciesUpdate$$.asObservable();
  }

  public convertToCurrency(value: number, currentCurrency: string, convertedCurrency: CurrencyDetail, date: IMyDate = DateUtils.getDateFromUTC()): number {
    if (convertedCurrency.name === currentCurrency) {
      return value;
    }

    return this.getCurrencyHistory(currentCurrency, date).conversions[convertedCurrency.name] * value;
  }

  public getCurrencyHistory(currency: string, date: IMyDate = DateUtils.getDateFromUTC()): CurrencyHistory {
    if (!this.isCurrencyHistoryLoaded(currency, date)) {
      return this._todayConversions.get(currency);
    }

    const yearCurrencies: Map<number, CurrencyHistory[]> = this._currencies.get(currency).get(date.year);
    if (yearCurrencies && yearCurrencies.has(date.month)) {
      const monthCurrencies: CurrencyHistory[] = yearCurrencies.get(date.month);
      if (monthCurrencies && monthCurrencies.length > 0) {
        const currencyConversions: CurrencyHistory = monthCurrencies.filter((currencyHistory: CurrencyHistory) => currencyHistory.day === date.day)[0];
        if (currencyConversions) {
          return currencyConversions;
        }
      }
    }

    return this._todayConversions.get(currency);
  }

  public isCurrencyHistoryLoaded(currency: string, date: IMyDate = DateUtils.getDateFromUTC()): boolean {
    if (this._currenciesIndicatorMap.has(currency)) {
      const currencyIndicator: Map<number, Map<number, boolean>> = this._currenciesIndicatorMap.get(currency);
      if (currencyIndicator.has(date.year)) {
        const yearIndicator: Map<number, boolean> = currencyIndicator.get(date.year);
        if (yearIndicator.has(date.month)) {
          return true;
        }
      }
    }

    return false;
  }

  public getCurrencyHistoryConversions(currencyName: string, date: IMyDate): {[key: string]: number} {
    const currencyHistory: CurrencyHistory = this.getCurrencyHistory(currencyName, date);
    return currencyHistory ? currencyHistory.conversions : {};
  }
}
