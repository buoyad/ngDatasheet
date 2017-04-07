import { Component, OnInit, Input, Output, Inject, forwardRef } from '@angular/core';

const TAB_KEY = 9;
const ENTER_KEY = 13;
const RIGHT_KEY = 39;
const LEFT_KEY = 37;
const UP_KEY = 38;
const DOWN_KEY = 40;
const DELETE_KEY = 46;

@Component({
  selector: 'ng-datasheet',
  template: `<ng-content></ng-content>`
}) 
export class NgDatasheetComponent {
  
  @Input() public set nameMap(nm: Map<number, string | number>) {
    this.nm = nm;
  }

  @Input() private set enumerated(en: boolean) {
    this.en = en;
    if (!this.en && !this.nm) {
      throw new Error('Cannot set datasheet to non-enumerated without supplying nameMap!')
    }
  }

  public en: boolean = true;
  
  public nm: Map<number, string | number>;

  public greeting: string = "world";
}

@Component({
  selector: 'ng-nested',
  template: `
    <ul>
      <li>I'm in!</li>
    </ul>
  `
})
export class NgNestedComponent {
  constructor(@Inject(forwardRef(() => NgDatasheetComponent)) private parent: NgDatasheetComponent) {
    
  }

}