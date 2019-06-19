import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
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

const ELEMENT_DATAS: PeriodicElement[] = [];

@Component({
  selector: 'app-modal-string-manipulation',
  templateUrl: './modal-string-manipulation.component.html',
  styleUrls: ['./modal-string-manipulation.component.scss']
})
export class ModalStringManipulationComponent implements OnInit {

  constructor(private dialogRef: MatDialogRef<ModalStringManipulationComponent>) { }

  ngOnInit() {
  }

  displayedColumns: string[] = ['position', 'name', 'weight', 'symbol', 'delete'];
  dataSource = new MatTableDataSource<PeriodicElement>(ELEMENT_DATA);
  dataSources = new MatTableDataSource<PeriodicElement>(ELEMENT_DATAS);

  selection = new SelectionModel<PeriodicElement>(true, []);

  clicked() {
    let toto: PeriodicElement;
    toto.position = 8;
    toto.name = "Henry";
    toto.symbol = "MMA";
    toto.weight = 1;

    ELEMENT_DATAS.push(toto);
  }

  delete() {

  }
}
