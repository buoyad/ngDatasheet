import { Component, OnInit, OnDestroy, Input, Output, Inject, Renderer2, forwardRef, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs/Rx';


const TAB_KEY = 9;
const ENTER_KEY = 13;
const RIGHT_KEY = 39;
const LEFT_KEY = 37;
const UP_KEY = 38;
const DOWN_KEY = 40;
const DELETE_KEY = 46;
const CTRL_KEY = 22;
const SHIFT_KEY = 16;

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

  array(): Array<[number, number]> {
    let resArray: Array<[number, number]> = new Array<[number, number]>();
    for (let x of Object.keys(this)) if (!isNaN(<any>x)) for (let y of this[+x]) resArray.push([+x, y]);
    return resArray;
  }
}

export interface Cell {
  value: string | number;
  readOnly?: boolean;
  selector?: string; // NYI
}

@Component({
  selector: 'ng-datasheet',
  template: `
  <table>
  <tr>
    <th></th>
    <ds-header class="readonly" *ngFor="let index of _w" [top]="true" [index]="index+1"></ds-header>
  </tr>  
  <tr *ngFor="let index of _h; let i = index;">
    <ds-header class="readonly" [side]="true" [index]="index+1"></ds-header>
    <ng-template ngFor let-j [ngForOf]="_w">
      <ng-template [ngIf]="!isCell(_data[i][j])"> <!-- Not a complexly defined cell -->          
        <td (mouseover)="onHover($event, i, j)" 
            (mousedown)="beginSelect($event, i, j)"
            [ngStyle]="{'text-align': alignment(_data[i][j])}"
            [ngClass]="{'selected': isSelected(i, j)}"
            (dblclick)="this.editCell(i, j)">
            <input *ngIf="isEditMode(i, j)" 
                  [id]="'input' + i + '_' + j"
                  [(ngModel)]="_data[i][j]"/>
            <ng-template [ngIf]="!isEditMode(i, j)">
              <span>
                {{ _data[i][j] }}
              </span>
            </ng-template>
        </td>
      </ng-template>
      <ng-template [ngIf]="isCell(_data[i][j])"> <!-- Is a complexly defined cell -->
        <!--<ng-content select="[transclusion]"> </ng-content>-->
        <td (mouseover)="onHover($event, i, j)"
            (mousedown)="beginSelect($event, i, j)"
            [ngStyle]="{'text-align': alignment(_data[i][j].value)}"
            [ngClass]="{'selected': isSelected(i, j), 'readonly': _data[i][j].readOnly}">
            <span>
              {{ _data[i][j].value }}
            </span>
        </td>
      </ng-template>
    </ng-template>
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

    table, td, .readonly {      
      border: 1px solid #ececec;
    }

    td, .readonly {
      display: table-cell;
      width: 100px;
      max-width: 100px;
      height: 17px;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      font-size: 12px;
    }

    .readonly, th {
      background: #f5f5f5;
    }

    .readonly {      
      color: #999;
    }

    ds-header {
      vertical-align: middle;
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
export class NgDatasheetComponent implements OnInit, OnDestroy {

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
  @Input() set data(data: (string | number | Cell)[][]) {
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

  public get isEditing(): boolean {
    return this._isEditing;
  }

  public get editedCell(): [number, number] {
    return this._editCell;
  }

  private _isSelecting: boolean = false; // Flag if user is actively selecting cells (mouse down, hovering on cells)            
  private _start: [number, number];         // Holder for cell that user started selection over
  private _isEditing: boolean = false;   // Flag for if user is actively editing a cell (consider deprecating, refactor to use _editCell)
  private _editCell: [number, number];      // Holder for cell that user is editing
  public selected: CoordinateMap = new CoordinateMap();

  /* Listeners */
  private moveListener: () => void;
  private editListener: () => void;
  private clickListener: () => void;

  constructor(private renderer: Renderer2) { }

  ngOnInit(): void {
    this._w = Array(this.width).fill(null).map((x, i) => i);
    this._h = Array(this.height).fill(null).map((x, i) => i);
    if (this.height > this._data.length) {
      for (let i = this._data.length; i < this.height; i++) {
        this._data[i] = new Array();
      }
      this.dataChange.emit(this._data);
    }

    this.registerHandlers();
  }

  ngOnDestroy(): void {
    this.deRegisterHandlers();
  }

  private isEditable(cell: Cell | number | string): boolean {
    if (this.isCell(cell)) {
      return !cell.readOnly;
    } else return true;
  }

  private registerHandlers() {
    this.clickListener = this.renderer.listen('window', 'mousedown', ($event) => {
      setTimeout(() => {
        if (!this._isSelecting) this.selected.clear();
      }, 0)
    })
    this.editListener = this.renderer.listen('document', 'keypress', ($event) => {
      if (!this.selected.empty && this.isEditable(this._data[this._start[0]][this._start[1]])) {
        if (!this._isEditing && this.isAlphanumeric($event.keyCode) && !this.selected.empty) {
          this.editCell(this._start[0], this._start[1], String.fromCharCode($event.keyCode));
          this.selected.clear();
          this.dataChange.emit(this._data);
        }
      }
    });
    this.moveListener = this.renderer.listen('document', 'keydown', ($event) => {
      if (!this.selected.empty || this._isEditing) {
        let moved: boolean = false;
        switch ($event.keyCode) {
          case UP_KEY:
            $event.preventDefault();
            if (this._isEditing) this.onEditComplete();
            if (this._start[0] > 0) this._start[0]--;
            moved = true;
            break;
          case DOWN_KEY:
            $event.preventDefault();
            if (this._isEditing) this.onEditComplete();
            if (this._start[0] < this.height - 1) this._start[0]++;
            moved = true;
            break;
          case RIGHT_KEY:
            $event.preventDefault();
            if (this._isEditing) this.onEditComplete();
            if (this._start[1] < this.width - 1) this._start[1]++;
            moved = true;
            break;
          case LEFT_KEY:
            $event.preventDefault();
            if (this._isEditing) this.onEditComplete();
            if (this._start[1] > 0) this._start[1]--;
            moved = true;
            break;
          case CTRL_KEY:
            return;
          case ENTER_KEY:
            if (this._isEditing) this.onEditComplete();
            if (this._start) this.fillSelection(this._start[0], this._start[1], this._start[0], this._start[1]);
            break;
          case DELETE_KEY:
            this.clearSelection();
            break;
        }
        if (moved) {
          this.selected.clear();
          this.selected.add(this._start[0], this._start[1]);
        }
      }
    })
  }
  
  private isCell(obj: any): obj is Cell {
    let res: boolean = obj != null && obj != undefined && typeof obj !== 'string' && typeof obj !== 'number';
    // if (res) { // (add later)
    //   if (!res.value && !res.selector)
    //     throw new Error('Either a primitive value or a template selector must be defined!');
    // }
    return res;
  }

  private deRegisterHandlers(): void {
    this.moveListener();
    this.editListener();
    this.clickListener();
  }

  public editCell(i: number, j: number, init?: string) {
    this._isEditing = true;
    this._editCell = [i, j];
    setTimeout(() => {                                         // Wait for input to be rendered
      let input: HTMLInputElement =
        <HTMLInputElement>document
          .getElementById('input' + i + '_' + j);
      input.focus();
      if (init) {
        this._data[i][j] = init;
        this.dataChange.emit(this._data);
      }
      else input.select();
    }, 1);
  }

  private onEditComplete() {
    /* Check if value is a number */
    let [i, j] = this._editCell;
    let val = this._data[i][j];
    // If so, convert to number
    if (!isNaN(val)) this._data[i][j] = +val;

    // Empty out variables and emit new data
    this._isEditing = false;
    this._editCell = null;
    this.dataChange.emit(this._data);

    // console.log(isNaN(<any>val))
    // if (!isNaN(<any>val)) {
    //   this._data[i][j] = <number> val;
    // } 
    // console.log(this._data[i][j], typeof this._data[i][j])
  }

  public clearSelection() {
    if (!this.selected.empty) {
      for (let val of this.selected.array()) this.deleteCell(val[0], val[1]);
      this.dataChange.emit(this._data);
    }
  }

  private deleteCell(i: number, j: number): boolean {
    let cell = this._data[i][j];
    if (this.isCell(cell)) {
      if (cell.readOnly) return false;
      else cell.value = undefined;
      this.dataChange.emit(this._data);
      return true;
    } else {
      this._data[i][j] = undefined;
      this.dataChange.emit(this._data);
      return true;
    }
  }

  private isEditMode(i: number, j: number) {
    return (this._editCell && this._editCell[0] === i && this._editCell[1] === j);
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
    else if (this._isEditing) this.onEditComplete();
    event.preventDefault();
    if (event.ctrlKey) {
      this.selected.clear();
      return;
    }
    this.selected.clear();
    this._isSelecting = true;
    this.selected.add(i, j);
    this._start = [i, j];
    let mouseUpListener = this.renderer.listen(document, 'mouseup', () => {
      this._isSelecting = false;
      mouseUpListener();
    })
  }

  private onHover(event: MouseEvent, i: number, j: number) {
    if (this._isSelecting) {
      this.fillSelection(this._start[0], this._start[1], i, j);
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