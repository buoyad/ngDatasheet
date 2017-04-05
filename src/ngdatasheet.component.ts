import { Component, OnInit, Input, Output } from '@angular/core';

@Component({
  selector: 'ng-datasheet',
  template: `Hello, {{ greeting }}!`
}) 
export class NgDatasheetComponent {
  private greeting: string = "world";
}