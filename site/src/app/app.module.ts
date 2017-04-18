import { NgModule } from '@angular/core';
import { BrowserModule }  from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { NgDatasheetModule } from 'ngdatasheet/ngdatasheet';

@NgModule({
  imports: [
    BrowserModule,
    NgDatasheetModule
  ],
  declarations: [
    AppComponent
  ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
