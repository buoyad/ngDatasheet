import { Component, OnInit, Input, Output, Inject, forwardRef, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs/Rx';


const TAB_KEY = 9;
const ENTER_KEY = 13;
const RIGHT_KEY = 39;
const LEFT_KEY = 37;
const UP_KEY = 38;
const DOWN_KEY = 40;
const DELETE_KEY = 46;
const CTRL_KEY = 22;

export enum HEADERS {
  top,
  side,
  both
}

export class CoordinateMap {
  [propName: number]: Array<number>;
  public empty: boolean = true;

  public add(i: number, j: number): void {
    if (!this.contains(i, j)) {
      if (!this[i]) this[i] = new Array<number>();
      this[i].push(j);
      this.empty = false;
    }
  }

  public contains(i: number, j: number): boolean {
    return this[i] && this[i].indexOf(j) !== -1;
  }

  public clear(): void {
    for (let x of Object.keys(this)) {
      if (typeof this[<any>x] === 'object') delete this[<any>x];
      this.empty = true;
    }
  }
}

@Component({
  selector: 'ng-datasheet',
  template: `
  <table>
  <tr>
    <th></th>
    <ds-header *ngFor="let index of _w" [top]="true" [index]="index+1"></ds-header>
  </tr>  
  <tr *ngFor="let index of _h; let i = index;">
    <ds-header [side]="true" [index]="index+1"></ds-header>
    <td *ngFor="let j of _w" 
        (mouseover)="onHover($event, i, j)" 
        (mousedown)="beginSelect($event, i, j)" 
        [ngStyle]="{'text-align': alignment(_data[i][j])}"
        [ngClass]="{'selected': isSelected(i, j)}"
        (dblclick)="this.editCell(true, i, j)">
          <input *ngIf="isEditMode(i, j); else display" 
                 [id]="'input' + i + '_' + j"
                 [(ngModel)]="_data[i][j]"/>
          <ng-template #display>
            <span style="display: block">
              {{ _data[i][j] }}
            </span>
          </ng-template>
      </td>
  </tr>
</table>
`,
  styles: [`
    table {
      border-collapse: collapse;
      table-layout: fixed;
      font-family: sans-serif;
      cursor: cell;
    }

    table td.selected, >>> th.selected {
      border: 1px solid #446CB3;
      border-style: double;
      box-shadow: inset 0 -100px 0 rgba(33,133,208,.15);
    } 

    table, td, ds-header {      
      border: 1px solid #ececec;
    }

    td, ds-header {
      display: table-cell;
      width: 100px;
      max-width: 100px;
      height: 17px;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      font-size: 12px;
    }

    ds-header, th {
      background: #f5f5f5;
      color: #999;
    }

    input {
      width: 100%;
      box-sizing: border-box;
      height: 100%;
      font-size: 12px;
      padding: 1px;
      border-width: 0px;
      outline: 1px solid blue;
    }

    input:focus {
      outline-offset: 0;
    }
  `]
})
export class NgDatasheetComponent implements OnInit {

  @Input() public set nameMap(nm: Map<number, string | number>) {
    this.nm = nm;
  }

  public en: boolean = true;
  @Input() private set enumerated(en: boolean) {
    this.en = en;
    if (!this.en && !this.nm) {
      throw new Error('Cannot set datasheet to non-enumerated without supplying nameMap!')
    }
  }

  private _w: number[];
  @Input() public width: number;

  private _h: number[];
  @Input() public height: number;

  public _data: any[][];
  @Input() set data(data: any[][]) {
    this._data = data;

    if (!this.width) {
      let w = 0;
      for (let i = 0; i < data.length; i++) {
        if (data[i].length > w) w = data[i].length;
      }
      this.width = w;
    }

    this.height = this.height | data.length;
  }

  @Output() dataChange: EventEmitter<any> = new EventEmitter<any>();

  public _headers: string = 'both'
  @Input() set headers(value: string) {
    // if (!HEADERS[<any>value]) {
    //   throw new Error('Valid')
    // }
  }

  public nm: Map<number, string | number>;

  public selected: CoordinateMap = new CoordinateMap();

  private _isSelecting: boolean = false;
  private _startX: number; 
  private _startY: number;
  private _isEditing: boolean = false;
  private _editCells: any;

  ngOnInit(): void {
    this._w = Array(this.width).fill(null).map((x, i) => i);
    this._h = Array(this.height).fill(null).map((x, i) => i);

    document.addEventListener('keydown', ($event) => {
      if (!this.selected.empty) {
        if (!this._isEditing && this.isAlphanumeric($event.keyCode)) {
          this.editCell(true, this._startX, this._startY, String.fromCharCode($event.keyCode));
        }
      }
    });    

    document.addEventListener('keydown', ($event: KeyboardEvent) => {
      if (this.isSelected) {
        switch ($event.keyCode) {
          case UP_KEY:
            if (this._startX > 0) this._startX--
            break;
          case DOWN_KEY:
            if (this._startX < this.height - 1) this._startX++
            break;
          case RIGHT_KEY:
            if (this._startY < this.width - 1) this._startY++;
            break;
          case LEFT_KEY:
            if (this._startY > 0) this._startY--;
            break;            
        }
        this.selected.clear();
        this.selected.add(this._startX, this._startY);
      }
    });

  }

  public editCell(setting: boolean, i?: number, j?: number, init?: string) {
    this.dataChange.emit(this._data);
    if (setting) {
      this._isEditing = true;
      this._editCells = [i, j];
      setTimeout(() => {
        let input: HTMLInputElement = 
                  <HTMLInputElement>document
                  .getElementById('input' + i + '_' + j);
        input.focus();
        if (init) input.value = init;
        else input.select();
      }, 1);
    } else {
      this._isEditing = false;
      this._editCells = undefined;
    }
  }

  private isEditMode(i: number, j: number) {
    return (this._editCells && this._editCells[0] === i && this._editCells[1] === j);
  }

  private isAlphanumeric(code: number): boolean {
    let inp = String.fromCharCode(code);
    return (/[a-zA-Z0-9-_ ]/.test(inp))
  }

  public fillSelection(x1: number, y1: number, x2: number, y2: number) {
    this.selected.clear();
    if (x1 > x2) {
      [x1, x2] = [x2, x1];
    }
    if (y1 > y2) {
      [y1, y2] = [y2, y1];
    }
    for (let i = x1; i <= x2; i++) {
      for (let j = y1; j <= y2; j++) {
        this.selected.add(i, j);
      }
    }
  }

  private alignment(value: number | string) {
    if (typeof value === "number") return 'right';
    else return 'left';
  }

  private beginSelect(event: MouseEvent, i: number, j: number) {
    if (this.isEditMode(i, j)) return;
    else if (this._isEditing) this.editCell(false);
    event.preventDefault();
    if (event.ctrlKey) {
      this.selected.clear();
      return;
    }
    this.selected.clear();
    this._isSelecting = true;
    this.selected.add(i, j);
    this._startX = i;
    this._startY = j;
    document.addEventListener('mouseup', () => {
      this._isSelecting = false;
      document.removeEventListener('mouseup');
    })
  }

  private onHover(event: MouseEvent, i: number, j: number) {
    if (this._isSelecting) {
      this.fillSelection(this._startX, this._startY, i, j);
    }
  }

  private isSelected(i: number, j: number) {
    return this.selected.contains(i, j);
  }
}

@Component({
  selector: 'ds-header',
  template: `
    <th *ngIf="top; else sideBlock">{{ letters }}</th>
    <ng-template #sideBlock><th>{{ index }}</th></ng-template>
  `,
  styles: [`
th {
  width: 100%;
  display: block
}  
  `]
})
export class HeaderCellComponent implements OnInit {
  @Input() top: boolean;
  @Input() side: boolean;
  @Input() index: number;
  public letters: string;

  ngOnInit() {
    if (this.top) {
      this.letters = this.toLetters(this.index)
    }
  }

  public toLetters(num: number): string {
    var mod = num % 26,
      pow = num / 26 | 0,
      out = mod ? String.fromCharCode(64 + mod) : (--pow, 'Z');
    return pow ? this.toLetters(pow) + out : out;
  }

  public fromLetters(str: string): number {
    var out = 0, len = str.length, pos = len;
    while (--pos > -1) {
      out += (str.charCodeAt(pos) - 64) * Math.pow(26, len - 1 - pos);
    }
    return out;
  }

}