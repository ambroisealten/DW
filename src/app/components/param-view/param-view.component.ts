import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialogConfig, MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ModalDataManipulationComponent } from '../modal/modal-data-manipulation/modal-data-manipulation.component';
import { ModalStringManipulationComponent } from '../modal/modal-string-manipulation/modal-string-manipulation.component';
import { FilterList } from 'src/app/models/Filter';
import { Observable } from 'rxjs';
import { ModalDateManipulationComponent } from '../modal/modal-date-manipulation/modal-date-manipulation.component';
import {ToastrService } from 'ngx-toastr';


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

  @Input() parentObs: Observable<any> ; 
  parentSub ; 

  @Output() messageEvent = new EventEmitter<any>();

  booleanString: boolean;

  displayedColumns: string[] = ['select', 'name'];
  columns: string[] = ['position', 'name', 'weight', 'symbol'];
  column;

  filterList: FilterList[] = [
    { filterColumn: "name", filterType: "string", excludeValue: ["Hydrogen"], filters: [] },
    { filterColumn: "weight", filterType: "number", excludeValue: ["4.0026"], filters: [] },
  ];

  selectedIndex: string;

  //Groupement 
  selectionGpmt = new SelectionModel<any>(true, []);
  dataSourceGpmt = new MatTableDataSource<any>();

  //Tri
  dataSource = new MatTableDataSource<any>(ELEMENT_DATA);
  selectionTri = new SelectionModel<any>(true, []);

  constructor(private dialog: MatDialog, private toastr: ToastrService) { }

  ngOnInit() {
    this.toggleFilter();
    this.dataSource.data.sort((e1, e2) => e1[this.displayedColumns[1]] > e2[this.displayedColumns[1]] ? 1 : -1);
    this.parentSub = this.parentObs.subscribe(dataParent => this.handleDataFromParent(dataParent)) ; 
  }

  ngOnDestroy() {
    this.dialog.closeAll();
    if(this.parentSub != undefined){
      this.parentSub.unsubscribe() ; 
    }
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
      this.dataSourceGpmt.data.forEach(row => {
        this.selectionGpmt.select(row)
        this.filterList.find(filter => filter.filterColumn == this.displayedColumns[1]).filters.forEach(filter => filter.actif = true)
      });
    }
  }

  toggleFilterGpmt() {
    this.dataSourceGpmt.data.forEach(row => {
      if (row['actif']) {
        this.selectionGpmt.select(row)
      } else {
        this.selectionGpmt.deselect(row);
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
    if (!row['actif']) {
      if (this.filterList.find(filter => filter.filterColumn == this.displayedColumns[1]).filterType == "number") {
        this.checkConflictGpmtNumber(row.min, row.type);
        this.checkConflictGpmtNumber(row.max, row.type);
      } else {
        this.checkConflictGpmtString(row.listElem) ; 
      }
    }
    row['actif'] = !row['actif'];
    this.toggleFilterGpmt();
  }

  setDatasourceGpmt() {
    this.dataSourceGpmt = new MatTableDataSource<any>(this.filterList.find(filter => filter.filterColumn == this.displayedColumns[1]).filters)
  }

  checkConflictGpmtNumber(value, type) {
    this.filterList.find(filter => filter.filterColumn == this.displayedColumns[1]).filters.forEach(filter => {
      let bool = false;
      if (!bool) {
        switch (filter.type) {
          case ('inf. à'):
            bool = (value < filter.min);
            break;
          case ('inf. égal à'):
            bool = (value <= filter.min);
            break;
          case ('égal'):
            bool = (value == filter.min);
            break;
          case ('sup. à'):
            bool = (value > filter.min);
            break;
          case ('sup. égal à'):
            bool = (value > filter.min);
            break;
          case ('compris'):
            bool = ((value >= filter.min) && (value <= filter.max));
            break;
        }
      }
      if (!bool) {
        switch (type) {
          case ('inf. à'):
            bool = (value > filter.min);
            break;
          case ('inf. égal à'):
            bool = (value >= filter.min);
            break;
          case ('égal'):
            bool = (value == filter.min);
            break;
          case ('sup. à'):
            bool = (filter.min > value);
            break;
          case ('sup. égal à'):
            bool = (filter.min >= value);
            break;
        }
      }
      if (bool)
        filter['actif'] = false;
    })
  }

  checkConflictGpmtString(listElem) {
    this.filterList.find(filter => filter.filterColumn == this.displayedColumns[1]).filters.forEach(filtre => {
      let bool = false ; 
      listElem.forEach(element => {
        if(filtre.listElem.includes(element)){
          bool = true ; 
          return ;  
        }
      })
      if(bool){
        filtre.actif = false ; 
      } 
    })
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
      } else {
        this.selectionTri.deselect(row);
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
  *                                        SELECTION TRI
  * 
  \**************************************************************************************************/


  /**************************************************************************************************\
  * 
  *                                        MODAL
  * 
  \**************************************************************************************************/

  whichDialog() {
    let dataType = typeof (this.dataSource.data[0][this.displayedColumns[1]]);
    switch (dataType) {
      case ('number'):
        this.AddFilter(this.isTri());
        break;
      case ('string'):
        this.AddFilterString(this.isTri());
        break;
      case ('symbol'):
        this.AddFilterDate(this.isTri())
    }

  }

  isTri(): boolean {
    return this.selectedIndex == "1";
  }

  AddFilter(istri) {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = false;
    dialogConfig.autoFocus = true;
    dialogConfig.hasBackdrop = true;
    dialogConfig.direction = 'ltr';
    dialogConfig.closeOnNavigation = true;

    dialogConfig.data = {
      bool: istri,
      filters: this.filterList.find(filter => filter.filterColumn == this.displayedColumns[1]).filters
    }

    let dialogRef = this.dialog.open(ModalDataManipulationComponent, dialogConfig);
    const sub = dialogRef.componentInstance.addFilter.subscribe(newFilter => {
      console.log(newFilter)
      if (newFilter.hasOwnProperty('excludeValue') && this.isTri()) {
        this.excludeOrIncludeFromFilter(newFilter);
      } else {
        this.filterList.find(filter => filter.filterColumn == this.displayedColumns[1]).filters.push(newFilter);
        this.dataSourceGpmt = new MatTableDataSource(this.filterList.find(filter => filter.filterColumn == this.displayedColumns[1]).filters);
        this.toggleFilterGpmt();
      }
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
      data: this.filteredDataSource(),
      displayedColumns: [this.displayedColumns[1]]
    }

    let dialogRef = this.dialog.open(ModalStringManipulationComponent, dialogConfig);
    const sub = dialogRef.componentInstance.addFilter.subscribe(newFilter => {
      if (newFilter.hasOwnProperty('excludeValue') && this.isTri()) {
        this.excludeOrIncludeFromFilterString(newFilter);
      } else {
        this.filterList.find(filter => filter.filterColumn == this.displayedColumns[1]).filters.push(newFilter);
        this.dataSourceGpmt = new MatTableDataSource(this.filterList.find(filter => filter.filterColumn == this.displayedColumns[1]).filters);
        this.toggleFilterGpmt();
      }
    });

    dialogRef.afterClosed().subscribe(() => {
      sub.unsubscribe();
    });

  }

  AddFilterDate(istri) {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = false;
    dialogConfig.autoFocus = true;
    dialogConfig.hasBackdrop = true;
    dialogConfig.direction = 'ltr';
    dialogConfig.closeOnNavigation = true;

    dialogConfig.data = {
      bool: istri,
      data: this.filteredDataSource(),
      displayedColumns: [this.displayedColumns[1]]
    }

    let dialogRef = this.dialog.open(ModalDateManipulationComponent, dialogConfig);
    

  }

  excludeOrIncludeFromFilter(filter) {
    if (filter['excludeValue'] == 'exclure') {
      this.dataSource.data.forEach(element => {
        if (this.isFiltered(element[this.displayedColumns[1]], filter['type'], filter['min'], filter['max']) && this.filterList.find(filter => filter.filterColumn == this.displayedColumns[1]).excludeValue.indexOf(element[this.displayedColumns[1]] + "") == -1) {
          this.filterList.find(filter => filter.filterColumn == this.displayedColumns[1]).excludeValue.push(element[this.displayedColumns[1]] + "");
        }
      });
    } else if (filter['excludeValue'] == 'inclure') {
      this.dataSource.data.forEach(element => {
        if (this.isFiltered(element[this.displayedColumns[1]], filter['type'], filter['min'], filter['max'])) {
          let index = this.filterList.find(filter => filter.filterColumn == this.displayedColumns[1]).excludeValue.indexOf("" + element[this.displayedColumns[1]]);
          if (index != -1) {
            this.filterList.find(filter => filter.filterColumn == this.displayedColumns[1]).excludeValue.splice(index, 1);
          }
        }
      });
    } else if (filter['excludeValue'] == "n'inclure que") {
      this.dataSource.data.forEach(element => {
        if (this.isFiltered(+element[this.displayedColumns[1]], filter['type'], filter['min'], filter['max'])) {
          let index = this.filterList.find(filter => filter.filterColumn == this.displayedColumns[1]).excludeValue.indexOf("" + element[this.displayedColumns[1]]);
          if (index != -1) {
            this.filterList.find(filter => filter.filterColumn == this.displayedColumns[1]).excludeValue.splice(index, 1);
          }
        } else if (this.filterList.find(filter => filter.filterColumn == this.displayedColumns[1]).excludeValue.indexOf(element[this.displayedColumns[1]] + "") == -1) {
          this.filterList.find(filter => filter.filterColumn == this.displayedColumns[1]).excludeValue.push(element[this.displayedColumns[1]] + "");
        }
      });
    }
    console.log(this.filterList.find(filter => filter.filterColumn == this.displayedColumns[1]).excludeValue)
    this.toggleFilter();
  }

  isFiltered(value, type, comparatorMin, comparatorMax) {
    let bool: boolean = false;
    switch (type) {
      case ('inf. à'):
        bool = (value < comparatorMin);
        break;
      case ('inf. égal à'):
        bool = (value <= comparatorMin);
        break;
      case ('égal'):
        bool = (value == comparatorMin);
        break;
      case ('sup. à'):
        bool = (value > comparatorMin);
        break;
      case ('sup. égal à'):
        bool = (value >= comparatorMin);
        break;
      case ('compris'):
        bool = ((value >= comparatorMin) && (value <= comparatorMax));
        break;
    }
    return bool;
  }

  excludeOrIncludeFromFilterString(filter) {
    if (filter['excludeValue'] == 'exclure') {
      this.dataSource.data.forEach(element => {
        if (this.filterList.find(filter => filter.filterColumn == this.displayedColumns[1]).excludeValue.indexOf(element[this.displayedColumns[1]] + "") == -1 && filter['listElem'].includes(element[this.displayedColumns[1]])) {
          this.filterList.find(filter => filter.filterColumn == this.displayedColumns[1]).excludeValue.push(element[this.displayedColumns[1]]);
        }
      });
    } else if (filter['excludeValue'] == 'inclure') {
      this.dataSource.data.forEach(element => {
        if (filter['listElem'].includes(element[this.displayedColumns[1]])) {
          let index = this.filterList.find(filter => filter.filterColumn == this.displayedColumns[1]).excludeValue.indexOf(element[this.displayedColumns[1]]);
          if (index != -1) {
            this.filterList.find(filter => filter.filterColumn == this.displayedColumns[1]).excludeValue.splice(index, 1);
          }
        }
      });
    } else if (filter['excludeValue'] == "n'inclure que") {
      this.dataSource.data.forEach(element => {
        if (filter['listElem'].includes(element[this.displayedColumns[1]])) {
          let index = this.filterList.find(filter => filter.filterColumn == this.displayedColumns[1]).excludeValue.indexOf(element[this.displayedColumns[1]]);
          if (index != -1) {
            this.filterList.find(filter => filter.filterColumn == this.displayedColumns[1]).excludeValue.splice(index, 1);
          }
        } else if (this.filterList.find(filter => filter.filterColumn == this.displayedColumns[1]).excludeValue.indexOf(element[this.displayedColumns[1]] + "") == -1) {
          this.filterList.find(filter => filter.filterColumn == this.displayedColumns[1]).excludeValue.push(element[this.displayedColumns[1]]);
        }
      });
    }
    this.toggleFilter();
  }

  filteredDataSource() {
    if (this.isTri() || this.filterList.find(filter => filter.filterColumn == this.displayedColumns[1]).filters.length == 0) {
      return this.dataSource;
    }
    let dialogDataSource = new MatTableDataSource();
    let excludes: any[] = [] ; 
    this.dataSource.data.forEach(data => {
      this.filterList.find(filter => filter.filterColumn == this.displayedColumns[1]).filters.forEach(filter => {
        if (filter.actif && filter.listElem.includes(data[this.displayedColumns[1]])) {
          excludes.push(data) ; 
        } 
      })
    })
    this.dataSource.data.forEach(data => {
      if(!excludes.includes(data)){
        dialogDataSource.data.push(data) ; 
      }
    })
    return dialogDataSource;
  }

  /**************************************************************************************************\
  * 
  *                                        Data Exchange
  * 
  \**************************************************************************************************/

  handleDataFromParent(data){
    console.log(data) ; 
  }
}
