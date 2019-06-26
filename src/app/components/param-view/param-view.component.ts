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

@Component({
  selector: 'app-param-view',
  templateUrl: './param-view.component.html',
  styleUrls: ['./param-view.component.scss']
})
export class ParamViewComponent implements OnInit, OnDestroy {


  //Canal de communication enfant vers Parent 
  @Output() messageEvent = new EventEmitter<any>();

  //Canal de communication Parent vers Enfant
  @Input() parentObs: Observable<any>;
  parentSub;

  //Colonne de l'onglet 
  displayedColumns: string[] = [];

  //Information du DropDown
  columns: string[] = [];
  column;

  //Filtres 
  filterList: FilterList[] = [];

  //Information concernant l'onglet actuel de l'utilisateur 
  selectedIndex: string;

  //Données groupement 
  selectionGpmt = new SelectionModel<any>(true, []);
  dataSourceGpmt = new MatTableDataSource<any>();

  //Données tri 
  dataSource = new MatTableDataSource<any>();
  selectionTri = new SelectionModel<any>(true, []);

  constructor(private dialog: MatDialog, private toastr: ToastrService) { }

  ngOnInit() {
    //Création du canal Parent-Enfant 
    this.parentSub = this.parentObs.subscribe(dataParent => this.handleDataFromParent(dataParent));
  }

  ngOnDestroy() {
    this.dialog.closeAll();
    //Unsubscribe au canal
    if (this.parentSub != undefined) {
      this.parentSub.unsubscribe();
    }
  }

  //Lors d'un changement de colonne reset les sélections et les données affichées
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

  /**
   * Du fait des conflits, impossible de tout sélectionner les filtres
   */
  masterToggleGpmt() {
    this.selectionGpmt.clear()
    this.filterList.find(filter => filter.filterColumn == this.displayedColumns[1]).filters.forEach(filter => filter.actif = false)
    this.sendFilterList();
  }

  /**
   * Selectionne toutes les filtres actifs 
   */
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

  /**
   * Lors d'un click sur une donnée, active ou désactive le filtre selon son précédent état
   * Si on le rend actif, on désactive les filtres conflictuelles 
   * @param row 
   */
  setActifInactif(row) {
    //En laissant le filtre inactif on évite de tester le filtre avec lui-même 
    if (!row['actif']) {
      if (this.filterList.find(filter => filter.filterColumn == this.displayedColumns[1]).filterType == "number") {
        this.checkConflictGpmtNumber(row.min, row.max, row.type);
      } else {
        this.checkConflictGpmtString(row.listElem);
      }
    }
    row['actif'] = !row['actif'];
    this.toggleFilterGpmt();
    this.sendFilterList();
  }

  /**
   * Initialise les données du tableau de l'onglet groupement 
   */
  setDatasourceGpmt() {
    this.dataSourceGpmt = new MatTableDataSource<any>(this.filterList.find(filter => filter.filterColumn == this.displayedColumns[1]).filters)
  }

  /**
   * Désactive les filtres en conflit dans le cas ou le type est 'number'
   * @param valueMin 
   * @param valueMax 
   * @param type 
   */
  checkConflictGpmtNumber(valueMin, valueMax, type) {
    this.filterList.find(filter => filter.filterColumn == this.displayedColumns[1]).filters.forEach(filter => {
      let bool = false;
      if (filter.actif) {
        if (!bool) {
          switch (filter.type) {
            case ('inf. à'):
              if (type == 'inf. à' || type == 'inf. égal à') {
                bool = valueMin <= filter.min
              } else {
                bool = (valueMin < filter.min);
              }
              break;
            case ('inf. égal à'):
              bool = (valueMin <= filter.min);
              break;
            case ('sup. à'):
              if (type == 'sup. à' || type == 'sup. égal à') {
                bool = valueMin >= filter.min
              } else {
                bool = (valueMin > filter.min);
              }
              break;
            case ('sup. égal à'):
              bool = (valueMin > filter.min);
              break;
            case ('compris'):
              if (type == 'compris') {
                bool = (((valueMin >= filter.min) && (valueMin <= filter.max)) || ((valueMax >= filter.min) && (valueMax <= filter.max)));
              } else if (type == 'inf. à') {
                bool = valueMin > filter.min;
              } else if (type == 'inf. égal à') {
                bool = valueMin >= filter.min;
              } else if (type == 'sup. égal à') {
                bool = valueMin <= filter.max;
              } else if (type == 'sup. à') {
                bool = valueMin < filter.max;
              } else {
                bool = (valueMin >= filter.min) && (valueMin <= filter.max)
              }
              break;
          }
        }
        if (!bool) {
          switch (type) {
            case ('inf. à'):
              bool = (valueMin > filter.min);
              break;
            case ('inf. égal à'):
              bool = (valueMin >= filter.min);
              break;
            case ('sup. à'):
              bool = (filter.min > valueMin);
              break;
            case ('sup. égal à'):
              bool = (filter.min >= valueMin);
              break;
            case ('compris'):
              if (filter.type == 'compris') {
                bool = (((valueMin <= filter.min) && (valueMax >= filter.min)) || ((valueMin <= filter.max) && (valueMax >= filter.max)));
              } else if (type == 'inf. à') {
                bool = valueMin < filter.min;
              } else if (type == 'inf. égal à') {
                bool = valueMin <= filter.min;
              } else if (type == 'sup. égal à') {
                bool = valueMin >= filter.min;
              } else if (type == 'sup. à') {
                bool = valueMin > filter.min;
              } else {
                bool = (valueMin <= filter.min) && (valueMax >= filter.min)
              }
              break;
          }
        }
      }
      if (bool)
        filter['actif'] = false;
    })
  } s

  /**
   * Désactive les filtres en conflit dans le cas ou le type est 'string'
   * @param listElem 
   */
  checkConflictGpmtString(listElem) {
    this.filterList.find(filter => filter.filterColumn == this.displayedColumns[1]).filters.forEach(filtre => {
      let bool = false;
      listElem.forEach(element => {
        if (filtre.listElem.includes(element)) {
          bool = true;
          return;
        }
      })
      if (bool) {
        filtre.actif = false;
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

  /** Selects all rows if they are not all selected; otherwise clear selectionTri. 
   * Inclut ou exclut toutes les valeurs 
  */
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
    this.sendFilterList();
  }

  /**
   * Sélectionne les valeurs qui ne sont pas exclues, le cas contraire les déselectionne
   */
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

  /**
   * Permet de déterminer si la donnée est exclue ou non 
   * @param row 
   */
  isExclude(row) {
    return this.filterList.find(filter => filter.filterColumn == this.displayedColumns[1]).excludeValue.includes(row[this.displayedColumns[1]] + "")
  }

  /**
   * Inclut ou Exclut la valeur 
   * Si la valeur était exclut, l'enlève de liste des valeurs exclues du filtre
   * Sinon l'ajoute 
   * @param row 
   */
  excludeOrInclude(row) {
    let newFilter = row[this.displayedColumns[1]] + ""
    let index = this.filterList.find(filter => filter.filterColumn == this.displayedColumns[1]).excludeValue.indexOf(newFilter);
    if (index == -1) {
      this.filterList.find(filter => filter.filterColumn == this.displayedColumns[1]).excludeValue.push(newFilter)
    } else {
      this.filterList.find(filter => filter.filterColumn == this.displayedColumns[1]).excludeValue.splice(index, 1);
    }
    this.selectionTri.toggle(row);
    this.sendFilterList();
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

  /**
   * Permet de déterminer quel modale ouvrir selon le type de la donnée 
   */
  whichDialog() {
    switch (this.filterList.find(filter => filter.filterColumn == this.displayedColumns[1]).filterType) {
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

  /**
   * Permet de déterminer si l'onglet est tri ou groupement 
   */
  isTri(): boolean {
    return this.selectedIndex == "1";
  }

  /**
   * Ouvre la modale de filtre sur les nombres 
   * @param isTri
   */
  AddFilter(istri) {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = false;
    dialogConfig.autoFocus = true;
    dialogConfig.hasBackdrop = true;
    dialogConfig.direction = 'ltr';
    dialogConfig.closeOnNavigation = true;

    //Initialise les données 
    dialogConfig.data = {
      bool: istri,
      filters: this.filterList.find(filter => filter.filterColumn == this.displayedColumns[1]).filters
    }

    let dialogRef = this.dialog.open(ModalDataManipulationComponent, dialogConfig);

    //Souscrit à l'ajout de nouveaux filtres 
    const sub = dialogRef.componentInstance.addFilter.subscribe(newFilter => {
      if (newFilter.hasOwnProperty('excludeValue') && this.isTri()) {
        this.excludeOrIncludeFromFilter(newFilter);
      } else {
        this.filterList.find(filter => filter.filterColumn == this.displayedColumns[1]).filters.push(newFilter);
        this.dataSourceGpmt = new MatTableDataSource(this.filterList.find(filter => filter.filterColumn == this.displayedColumns[1]).filters);
        this.toggleFilterGpmt();
      }
      this.sendFilterList();
    });

    //Unsubscribe on close 
    dialogRef.afterClosed().subscribe(() => {
      sub.unsubscribe();
    });
  }

  /**
   * Ouvre la modale de filtre sur les strings 
   * @param istri 
   */
  AddFilterString(istri) {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = false;
    dialogConfig.autoFocus = true;
    dialogConfig.hasBackdrop = true;
    dialogConfig.direction = 'ltr';
    dialogConfig.closeOnNavigation = true;

    //Initialise les données envoyées à la modale 
    dialogConfig.data = {
      bool: istri,
      data: this.filteredDataSource(),
      filters: this.filterList.find(filter => filter.filterColumn == this.displayedColumns[1]).filters,
      displayedColumns: [this.displayedColumns[1]]
    }

    let dialogRef = this.dialog.open(ModalStringManipulationComponent, dialogConfig);

    //Souscrit à l'ajout de nouveau filtres 
    const sub = dialogRef.componentInstance.addFilter.subscribe(newFilter => {
      if (newFilter.hasOwnProperty('excludeValue') && this.isTri()) {
        this.excludeOrIncludeFromFilterString(newFilter);
      } else {
        this.filterList.find(filter => filter.filterColumn == this.displayedColumns[1]).filters.push(newFilter);
        this.dataSourceGpmt = new MatTableDataSource(this.filterList.find(filter => filter.filterColumn == this.displayedColumns[1]).filters);
        this.toggleFilterGpmt();
      }
      this.sendFilterList();
    });

    //Unsubscribe on close
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

  /**
   * Dans le cas de tri, permet de traiter la donnée selon si le but est d'exclure ou d'inclure les valeurs de type number 
   * @param filter 
   */
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
    this.toggleFilter();
  }

  /**
   * Permet de déterminer si la valeur est filtrée (type number)
   * @param value 
   * @param type 
   * @param comparatorMin 
   * @param comparatorMax 
   */
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

  /**
   * Dans le cas de tri, permet de traiter la donnée selon si le but est d'exclure ou d'inclure les valeurs de type string 
   * @param filter 
   */
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

  /**
   * Permet de n'envoyer à la modale de string que les valeurs qui ne sont pas conflictuelles avec des filtres actifs 
   */
  filteredDataSource() {
    if (this.isTri() || this.filterList.find(filter => filter.filterColumn == this.displayedColumns[1]).filters.length == 0) {
      return this.dataSource;
    }
    let dialogDataSource = new MatTableDataSource();
    let excludes: any[] = [];
    this.dataSource.data.forEach(data => {
      this.filterList.find(filter => filter.filterColumn == this.displayedColumns[1]).filters.forEach(filter => {
        if (filter.actif && filter.listElem.includes(data[this.displayedColumns[1]])) {
          excludes.push(data);
        }
      })
    })
    this.dataSource.data.forEach(data => {
      if (!excludes.includes(data)) {
        dialogDataSource.data.push(data);
      }
    })
    return dialogDataSource;
  }

  /**************************************************************************************************\
  * 
  *                                        Data Exchange
  * 
  \**************************************************************************************************/

  /**
   * Permet gérer la donnée reçu du Parent 
   * @param data Donnée envoyée par le parent
   */
  handleDataFromParent(data) {
    //Initialise les filtres 
    this.columns = [];
    this.filterList = [];
    this.dataSource = new MatTableDataSource();
    data.fields.forEach(element => {
      this.columns.push(element.name);
      let filter = new FilterList();
      filter.filterColumn = element.name;
      filter.excludeValue = [];
      filter.filters = [];
      if (this.isNumber(element.type)) {
        filter.filterType = "number"
      } else if (element.type == "String") {
        filter.filterType = "string"
      } else {
        filter.filterType = element.type;
      }
      this.filterList.push(filter);
    });
    this.column = this.filterList[0].filterColumn;
    this.changeColumn();
    this.sendFilterList();
  }

  /**
   * Permet de déterminer si le type sauvegarder en BDD est un number 
   */
  isNumber(type): boolean {
    let numberElement = ["Long", "Double", "Integer"]
    return numberElement.includes(type);
  }

  /**
   * Envoie vers le Parent la liste des filtres 
   */
  sendFilterList() {
    this.messageEvent.emit(this.filterList);
  }
}
