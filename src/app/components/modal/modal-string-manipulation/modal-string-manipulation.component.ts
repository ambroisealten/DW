import { Component, OnInit, Inject, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource, MatIconModule } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';

export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
}

@Component({
  selector: 'app-modal-string-manipulation',
  templateUrl: './modal-string-manipulation.component.html',
  styleUrls: ['./modal-string-manipulation.component.scss']
})
export class ModalStringManipulationComponent implements OnInit {

  displayedColumns: string[] = [];
  displayedColumnsright: string[] = [];
  dataSource = new MatTableDataSource<any>();
  dataSources = new MatTableDataSource<any>([]);

  isString;
  @Output() public addFilter = new EventEmitter();

  constructor(private dialogRef: MatDialogRef<ModalStringManipulationComponent>,
    @Inject(MAT_DIALOG_DATA) public data, private changeDetectorRefs: ChangeDetectorRef) {
    this.isString = data.bool;
    this.dataSource = data.data;
    this.displayedColumns = data.displayedColumns;
    this.displayedColumnsright = Object.assign([],this.displayedColumns);
    this.displayedColumnsright.push('delete')
  }

  ngOnInit() {
  }

  clicked(element) {
    this.dataSources.data.push(element)
    this.dataSources.data.sort((e1, e2) => e1 > e2 ? 1:-1);
    this.dataSources = new MatTableDataSource<any>(this.dataSources.data)
    let index = this.dataSource.data.indexOf(element) ; 
    this.dataSource.data.splice(index,1) ;
    this.dataSource = new MatTableDataSource<any>(this.dataSource.data)
    this.changeDetectorRefs.detectChanges();
  }
  
  onSave() {
    this.addFilter.emit();
  }

  delete(element) {
    this.dataSource.data.push(element);
    this.dataSource.data.sort((e1, e2) => e1 > e2 ? 1:-1);
    this.dataSource = new MatTableDataSource<any>(this.dataSource.data)
    let index = this.dataSources.data.indexOf(element); 
    this.dataSources.data.splice(index,1) ;
    this.dataSources = new MatTableDataSource<any>(this.dataSources.data)
    this.changeDetectorRefs.detectChanges();
  }

  close() {
    this.dialogRef.close();
  }
}
