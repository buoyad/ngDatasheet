import { Component } from '@angular/core';
import { Cell } from 'ngdatasheet/ngdatasheet';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  public data: any[][] = [
    ['Item',               'Unit price', 'Quantity', 'Price'],
    ['Joy Division shirt',          25,           4,     100],
    ['Cutoff jeans',                30,          24,     720],
    ['Peeps',                     1.25,         100,     125],
    ['Subtotal',                      ,            ,     945],
    ['Tax',                           , '3.0%', +((.03*945).toFixed(2))],
    ['Total',                         ,       , 945 + .03*945]
  ]

  public dataReadOnly: Cell[][] = new Array<Array<Cell>>();

  ngOnInit() {
    for (let i = 0; i < 5; i++) {
      this.dataReadOnly[i] = new Array<Cell>(2);
    }
    this.dataReadOnly[0] = [
      {readOnly: true, value: 'Movie'},
      {readOnly: true, value: 'Stars'}
    ]
    let movies = ["Up", "The Iron Giant", "Lawrence of Arabia", "Finding Nemo"]
    for (let i = 1; i < 5; i++) {
      this.dataReadOnly[i] = [{value: movies[i - 1], readOnly: true}];
    }
  }
}
