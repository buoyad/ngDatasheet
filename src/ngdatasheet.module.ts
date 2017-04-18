import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgDatasheetComponent, HeaderCellComponent } from './ngdatasheet.component';

@NgModule({
  imports: [ CommonModule, FormsModule ],
  declarations: [ HeaderCellComponent, NgDatasheetComponent ],
  exports: [ NgDatasheetComponent ],
  providers: []
})
export class NgDatasheetModule { }