import { Component, OnInit, Inject, Output, EventEmitter } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource, MatSelectionList, MatSelectionListChange, MatCheckbox } from '@angular/material';
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

@Component({
  selector: 'app-modal-data-manipulation',
  templateUrl: './modal-data-manipulation.component.html',
  styleUrls: ['./modal-data-manipulation.component.scss']
})
export class ModalDataManipulationComponent implements OnInit {

  @Output() public addFilter = new EventEmitter();
  isString: boolean;

  @ViewChild('type', { static: true }) type: MatSelectionList;
  @ViewChild('compris',{ static: true}) compris: MatCheckbox ;
  
  constructor(private dialogRef: MatDialogRef<ModalDataManipulationComponent>, @Inject(MAT_DIALOG_DATA) public data) {
    this.isString = data.bool;
  }

  ngOnInit() {
    this.type.selectionChange.subscribe((s: MatSelectionListChange) => {
      this.type.deselectAll();
      this.compris.checked = false ;
      s.option.selected = true;
    });
  }

  unselectOther(){
    this.type.deselectAll() ;
  }

  close() {
    this.dialogRef.close();
  }
}
