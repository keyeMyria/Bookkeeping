import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';

import { FocusDirective } from '../../directives/focus.directive';

@Component({
  selector: 'bk-select',
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.css']
})
export class SelectComponent implements OnInit {
  @Input()
  public width: number;
  @Input()
  public placeholder: string;
  @Input()
  public items: SelectItem[];
  @Input()
  public selectedItems: SelectItem[] = [];
  @Output()
  public selectedItemsChange: EventEmitter<SelectItem[]> = new EventEmitter();

  public searchValue: string = '';
  public opened: boolean = false;
  public displayItems: SelectItem[];
  private originalItem: SelectItem[];
  @ViewChild(FocusDirective)
  private searchInput: FocusDirective;

  public ngOnInit(): void {
    if (!this.selectedItems || this.selectedItems.length === 0) {
      this.switchToRootLevel();
    } else {
      this.originalItem = this.selectedItems;
      this.displayItems = this.items.filter((item: SelectItem) => item.title === this.selectedItems[0].title)[0].children;
    }
  }

  public chooseItem(item: SelectItem): void {
    if (item.children) {
      this.selectedItems = [item];
      this.displayItems = item.children;
      this.searchValue = '';
      return;
    }

    if (item.parent) {
      this.selectedItems = [item.parent, item];
    }  else {
      this.selectedItems[1] = item;
    }
    this.selectedItemsChange.emit(this.selectedItems);
    this.closeSelect();
    this.ngOnInit();
  }

  public openSelect(): void {
    this.searchValue = '';
    this.opened = true;
  }

  public closeSelect(): void {
    if (!this.selectedItems || this.selectedItems.length < 2) {
      this.selectedItems = this.originalItem;
    }
    this.opened = false;
    this.ngOnInit();
  }

  public isItemSelected(): boolean {
    return this.selectedItems && this.selectedItems.length > 0;
  }

  public switchToRootLevel(): void {
    this.displayItems = this.items;
    this.selectedItems = [];
    this.searchValue = '';
  }

  public focusInput(): void {
    if (this.searchInput) {
      this.searchInput.ngOnInit();
    }
  }

  public selectedItemIcon(): string {
    if (this.selectedItems.length === 0) {
      return null;
    }

    return (this.selectedItems.length === 2 && this.selectedItems[1].icon) ? this.selectedItems[1].icon : this.selectedItems[0].icon;
  }

  public search(inputValue: string): void {
    this.searchValue = inputValue;
    const value: string = inputValue.toLowerCase();
    if (value === '') {
      this.ngOnInit();
      return;
    }

    if (this.selectedItems && this.selectedItems.length > 0) {
      const parentTitle: string = this.selectedItems[0].title;
      this.displayItems = this.items
        .filter((item: SelectItem) => item.title === parentTitle)[0]
        .children.filter((item: SelectItem) => item.title.toLowerCase().startsWith(value));
    } else {
      const searchItems: SelectItem[] = [];
      this.items.forEach((item: SelectItem) => {
        if (item.title.toLowerCase().startsWith(value)) {
          searchItems.push(item);
        }
        if (item.children) {
          item.children.forEach((childItem: SelectItem) => {
            if (childItem.title.toLowerCase().startsWith(value)) {
              const iconPath: string = childItem.icon ? childItem.icon : item.icon;
              searchItems.push({title: childItem.title, parent: item, icon: iconPath});
            }
          });
        }
      });
      this.displayItems = searchItems;
    }
  }
}
