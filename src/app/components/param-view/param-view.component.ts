import { Component, OnInit, OnDestroy } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialogConfig, MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ModalDataManipulationComponent } from '../modal/modal-data-manipulation/modal-data-manipulation.component';
import { ModalStringManipulationComponent } from '../modal/modal-string-manipulation/modal-string-manipulation.component';
import { FilterList } from 'src/app/models/Filter';

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
  selector: 'app-param-view',
  templateUrl: './param-view.component.html',
  styleUrls: ['./param-view.component.scss']
})
export class ParamViewComponent implements OnInit, OnDestroy {

  booleanString: boolean;

  displayedColumns: string[] = ['select', 'name'];
  columns: string[] = ['position', 'name', 'weight', 'symbol'];
  column;

  filterList: FilterList[] = [
    { filterColumn: "name", filterType: "string", excludeValue: ["Hydrogen"], filters: [] },
    { filterColumn: "weight", filterType: "number", excludeValue: ["4.0026"], filters: [] },
  ];

  selectedIndex: string ; 

  //Groupement 
  selectionGpmt = new SelectionModel<any>(true, []);
  dataSourceGpmt = new MatTableDataSource<any>();

  //Tri
  dataSource = new MatTableDataSource<any>(ELEMENT_DATA);
  selectionTri = new SelectionModel<any>(true, []);

  constructor(private dialog: MatDialog) { }

  ngOnInit() {
    this.toggleFilter();
  }

  ngOnDestroy() {
    this.dialog.closeAll();
  }

  changeColumn() {
    this.displayedColumns = ['select', this.column];
    this.selectionTri.clear();
    this.toggleFilter();
    this.setDatasourceGpmt();
    this.selectionGpmt.clear();
    this.toggleFilterGpmt();
  }

  /**************************************************************************************************\
  * 
  *                                        SELECTION GROUPEMENT
  * 
  \**************************************************************************************************/
  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelectedGpmt() {
    const numSelected = this.selectionGpmt.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  masterToggleGpmt() {
    if (this.isAllSelectedGpmt()) {
      this.selectionGpmt.clear()
      this.filterList.find(filter => filter.filterColumn == this.displayedColumns[1]).filters.forEach(filter => filter.actif = false)
    } else {
      this.dataSource.data.forEach(row => {
        this.selectionGpmt.select(row)
        this.filterList.find(filter => filter.filterColumn == this.displayedColumns[1]).filters.forEach(filter => filter.actif = true)
      });
    }
  }

  toggleFilterGpmt() {
    this.dataSource.data.forEach(row => {
      if (row['actif']) {
        this.selectionTri.select(row)
      }
    });
  }

  /** The label for the checkbox on the passed row */
  checkboxLabelGpmt(row?: any): string {
    if (!row) {
      return `${this.isAllSelectedGpmt() ? 'select' : 'deselect'} all`;
    }
    return `${this.selectionGpmt.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }

  setActifInactif(row) {
    row['actif'] = !row['actif'];
    this.selectionGpmt.toggle(row);
  }

  setDatasourceGpmt() {
    this.dataSourceGpmt = new MatTableDataSource<any>(this.filterList.find(filter => filter.filterColumn == this.displayedColumns[1]).filters)
  }


  /**************************************************************************************************\
  * 
  *                                        SELECTION TRI
  * 
  \**************************************************************************************************/
  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selectionTri.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selectionTri. */
  masterToggle() {
    if (this.isAllSelected()) {
      this.selectionTri.clear();
      this.dataSource.data.forEach(row => {
        this.filterList.find(filter => filter.filterColumn == this.displayedColumns[1]).excludeValue.push(row[this.displayedColumns[1]]);
      })
    } else {
      this.dataSource.data.forEach(row => {
        this.selectionTri.select(row)
        this.filterList.find(filter => filter.filterColumn == this.displayedColumns[1]).excludeValue = [];
      });
    }
  }

  toggleFilter() {
    this.dataSource.data.forEach(row => {
      if (!this.isExclude(row)) {
        this.selectionTri.select(row)
      }
    });
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selectionTri.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }

  isExclude(row) {
    return this.filterList.find(filter => filter.filterColumn == this.displayedColumns[1]).excludeValue.includes(row[this.displayedColumns[1]] + "")
  }

  excludeOrInclude(row) {
    let newFilter = row[this.displayedColumns[1]] + ""
    let index = this.filterList.find(filter => filter.filterColumn == this.displayedColumns[1]).excludeValue.indexOf(newFilter);
    if (index == -1) {
      this.filterList.find(filter => filter.filterColumn == this.displayedColumns[1]).excludeValue.push(newFilter)
    } else {
      this.filterList.find(filter => filter.filterColumn == this.displayedColumns[1]).excludeValue.splice(index, 1);
    }
    this.selectionTri.toggle(row);
  }

  /**************************************************************************************************\
  * 
  *                                        MODAL
  * 
  \**************************************************************************************************/

  whichDialog(){
    let dataType = typeof(this.dataSource[this.displayedColumns[1]]) ; 
    switch(dataType){
      case('number'): 
        this.AddFilter(this.isTri()) ; 
        break; 
      case('string'):
        this.AddFilterString(this.isTri()); 
        break;
    }

  }

  isTri():boolean{
    return this.selectedIndex === "Tri" ; 
  }

  AddFilter(istri) {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = false;
    dialogConfig.autoFocus = true;
    dialogConfig.hasBackdrop = true;
    dialogConfig.direction = 'ltr';
    dialogConfig.closeOnNavigation = true;

    dialogConfig.data = {
      bool: istri
    }

    let dialogRef = this.dialog.open(ModalDataManipulationComponent, dialogConfig);
    const sub = dialogRef.componentInstance.addFilter.subscribe(data => {
      this.newFilter(data);
    });
    dialogRef.afterClosed().subscribe(() => {
      sub.unsubscribe();
    });
  }

  AddFilterString(istri) {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = false;
    dialogConfig.autoFocus = true;
    dialogConfig.hasBackdrop = true;
    dialogConfig.direction = 'ltr';
    dialogConfig.closeOnNavigation = true;

    dialogConfig.data = {
      bool: istri, 
      data: this.dataSource
    }

    let dialogRef = this.dialog.open(ModalStringManipulationComponent, dialogConfig);
    const sub = dialogRef.componentInstance.addFilter.subscribe(data => {

    }); 

    dialogRef.afterClosed().subscribe(() => {
      sub.unsubscribe() ; 
    });

  }

  openDialogSoftSkill() {

  }

}
