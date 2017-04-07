import { NgModule } from '@angular/core';

import { NgDatasheetComponent, NgNestedComponent } from './ngdatasheet.component';

@NgModule({
  declarations: [ NgDatasheetComponent, NgNestedComponent ],
  exports: [ NgDatasheetComponent, NgNestedComponent ],
  providers: []
})
export class NgDatasheetModule { }