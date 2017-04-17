import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app works!';
  public data: any[][] = [
    ['Item',               'Unit price', 'Quantity', 'Price'],
    ['Joy Division shirt',          25,           4,     100],
    ['Cutoff jeans',                30,          24,     720],
    ['Peeps',                     1.25,         100,     125],
    ['Subtotal',                      ,            ,     945],
    ['Tax',                           , '3.0%', +((.03*945).toFixed(2))],
    ['Total',                         ,       , 945 + .03*945]
  ]
}
