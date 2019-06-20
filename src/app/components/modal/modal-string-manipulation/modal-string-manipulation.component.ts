import { Component, OnInit, Inject, Output, EventEmitter } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource, MatIconModule } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';

export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
}

const ELEMENT_DATA: PeriodicElement[] = [
  { position: 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H' },
  { position: 2, name: 'Helium', weight: 4.0026, symbol: 'He' },
  { position: 3, name: 'Lithium', weight: 6.941, symbol: 'Li' },
  { position: 4, name: 'Beryllium', weight: 9.0122, symbol: 'Be' },
  { position: 5, name: 'Boron', weight: 10.811, symbol: 'B' },
  { position: 6, name: 'Carbon', weight: 12.0107, symbol: 'C' },
  { position: 7, name: 'Nitrogen', weight: 14.0067, symbol: 'N' },
  { position: 8, name: 'Oxygen', weight: 15.9994, symbol: 'O' },
  { position: 9, name: 'Fluorine', weight: 18.9984, symbol: 'F' },
  { position: 10, name: 'Neon', weight: 20.1797, symbol: 'Ne' },
];

const ELEMENT_DATAS: PeriodicElement[] = [
  { position: 1, name: 'Non', weight: 1.0079, symbol: 'H' },
];

@Component({
  selector: 'app-modal-string-manipulation',
  templateUrl: './modal-string-manipulation.component.html',
  styleUrls: ['./modal-string-manipulation.component.scss']
})
export class ModalStringManipulationComponent implements OnInit {

  displayedColumns: string[] = ['position', 'name', 'weight', 'symbol'];
  displayedColumnsright: string[] = ['position', 'name', 'weight', 'symbol', 'delete'];
  dataSource = new MatTableDataSource<PeriodicElement>(ELEMENT_DATA);
  dataSources = new MatTableDataSource<PeriodicElement>(ELEMENT_DATAS);
  selection = new SelectionModel<PeriodicElement>(true, []);
  
  isString ; 
  @Output() public addFilter = new EventEmitter() ; 

  constructor(private dialogRef: MatDialogRef<ModalStringManipulationComponent>, @Inject(MAT_DIALOG_DATA) public data) { 
    this.isString = data.bool ; 
    this.dataSources = data.data ; 
  }

  ngOnInit() {
  }

  clicked() {
    let toto: PeriodicElement;
    //toto.position = 8;
    toto.name = "Henry";
    toto.symbol = "MMA";
    toto.weight = 1;

    ELEMENT_DATAS.push(toto);
  }

   /** Whether the number of selected elements matches the total number of rows. */
   isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
        this.selection.clear() :
        this.dataSource.data.forEach(row => this.selection.select(row));
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: PeriodicElement): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }
  delete() {

  }
}
