# NgDatasheet [alpha.1]

Datasheet component for Angular 2 that allows user interaction and prettified display alike.

## Notice

This component is still under development. Breaking changes are subject to release with no notice.

## Installation

`npm install --save ngdatasheet`

## Usage

Import NgDatasheetModule into your NgModule:

```typescript
  ...
  import { NgModule }      from '@angular/core';
  import { NgDatasheetModule } from 'ngdatasheet/ngdatasheet';
  ...

  ...
  @NgModule({
    imports:      [ NgDatasheetModule ]
    ...
```

In your component define a 2-D data array:

```typescript
public data: any[][] = [
    ['Item',               'Unit price', 'Quantity',       'Price'],
    ['Joy Division shirt',          25,           4,           100],
    ['Cutoff jeans',                30,          24,           720],
    ['Peeps',                     1.25,         100,           125],
    ['Subtotal',                      ,            ,           945],
    ['Tax',                           ,      '3.0%',       .03*945],
    ['Total',                         ,            , 945 + .03*945]
  ]
```

And bind to it in your template: 

```html
<ng-datasheet [data]="data"></ng-datasheet>
```
Output:

<div style="text-align: center"><img src="https://raw.githubusercontent.com/buoyad/ngDatasheet/master/example.png"></img></div>

## Planned Features

* Interactivity  
* Inline expression evaluation  
* `data` property: 
  * Support for relative expressioning via array member property  
  * Support for defining cells as read-only
