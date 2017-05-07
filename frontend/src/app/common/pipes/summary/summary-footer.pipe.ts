import { Pipe, PipeTransform } from '@angular/core';

import {Category} from '../../model/summary/Category';
import {BalanceItem} from '../../model/summary/BalanceItem';
import {BaseSummaryPipe} from './baseSummaryPipe';

@Pipe({
  name: 'summaryFooter'
})
export class SummaryFooterPipe extends BaseSummaryPipe implements PipeTransform {

  public transform(categories: Category[], currency: Currency): BalanceItem[] {
    const balanceMap: Map<string, number> = new Map();

    categories.forEach((category: Category) => {
      this.populateBalanceMap(category, balanceMap);
    });

    return this.calculateBalance(balanceMap, currency);
  }
}
