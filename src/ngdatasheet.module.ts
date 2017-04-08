import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgDatasheetComponent, HeaderCellComponent } from './ngdatasheet.component';

@NgModule({
  imports: [ CommonModule ],
  declarations: [ NgDatasheetComponent, HeaderCellComponent ],
  exports: [ NgDatasheetComponent ],
  providers: []
})
export class NgDatasheetModule { }