import { Component, OnInit, Inject, Output, EventEmitter, ViewChild, Input } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSelectionList, MatSelectionListChange, MatCheckbox, MatRadioGroup } from '@angular/material';
import { Filter } from 'src/app/models/Filter';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-modal-data-manipulation',
  templateUrl: './modal-data-manipulation.component.html',
  styleUrls: ['./modal-data-manipulation.component.scss']
})
export class ModalDataManipulationComponent implements OnInit {

  //Permet de communiquer de nouveaux filtres sans fermer la modale
  @Output() public addFilter: EventEmitter<any> = new EventEmitter<any>();

  //Permet de savoir si le but est de trier ou de grouper les données 
  isTri: boolean;

  //Liste des filtres existants afin de déterminer l'unicité des filtres 
  filters: Filter[];

  //Permet de récupérer les valeurs sélectionnées/entrées par l'utilisateur 
  @ViewChild('type', { static: true }) type: MatSelectionList;
  @ViewChild('compris', { static: true }) compris: MatCheckbox;
  excludeOption: string;
  valueSolo;
  valueMin;
  valueMax;

  constructor(private dialogRef: MatDialogRef<ModalDataManipulationComponent>, @Inject(MAT_DIALOG_DATA) public data, private toastr: ToastrService) {
    //On récupère les données d'initialisation 
    this.isTri = data.bool;
    this.filters = data.filters
  }

  ngOnInit() {
    //Permet de ne garder qu'une option sélectionnée 
    this.type.selectionChange.subscribe((s: MatSelectionListChange) => {
      this.type.deselectAll();
      this.compris.checked = false;
      s.option.selected = true;
    });
  }

  /**
   * Action de click sur la checkBox Compris, permettant de déselectionner les autres checkbox
   */
  unselectOther() {
    this.type.deselectAll();
  }

  /**
   * Action de création d'un nouveau filtre,
   * Vérifie les conflits avec les filtres actifs et l'unicité de celui-ci
   */
  onSave() {
    let newFilter: Filter = new Filter();
    //Selon le type de sélection le contrôle n'est pas le même 
    if (this.type.selectedOptions.selected.length > 0 && this.valueSolo != undefined) {
      newFilter['type'] = this.type.selectedOptions.selected[0].value;
      //Si l'onglet est le tri, on ne regarde pas le conflit avec les autres filtres 
      if (!this.isTri && this.isFiltered(this.valueSolo, null, newFilter['type'])) {
        this.toastr.error("L'entité existe déjà", '', { 'positionClass': 'toast-bottom-full-width', 'closeButton': true });
        return;
      }
      newFilter['min'] = this.valueSolo;
      newFilter['name'] = this.createName(newFilter['type'], newFilter['min']);
    } else if (this.compris.checked && this.valueMin != undefined && this.valueMax != undefined) {
      newFilter['type'] = 'compris';
      //Si l'onglet est le tri, on ne regarde pas le conflit avec les autres filtres 
      if (!this.isTri && this.isFiltered(this.valueMin, this.valueMax, newFilter['type'])) {
        this.toastr.error("Le filtre existe déjà", '', { 'positionClass': 'toast-bottom-full-width', 'closeButton': true });
        return;
      }
      newFilter['min'] = this.valueMin;
      newFilter['max'] = this.valueMax;
      newFilter['name'] = '[' + this.valueMin + ',' + this.valueMax + ']';
    } else {
      //Si aucune option sélectionné on stop
      this.toastr.error("Pas de valeur sélectionné", '', { 'positionClass': 'toast-bottom-full-width', 'closeButton': true });
      return;
    }
    //On ajoute un attribut déterminant le type de traitement de la donnée en cas de tri
    if (this.isTri) {
      if (this.excludeOption == undefined) {
        this.toastr.error("L'entité existe déjà", '', { 'positionClass': 'toast-bottom-full-width', 'closeButton': true });
        return;
      }
      newFilter['excludeValue'] = this.excludeOption;
    }
    //Un filtre ajouté est considéré comme actif
    newFilter['actif'] = true;
    //On transmet le filtre à param-view
    this.addFilter.emit(newFilter);
    this.toastr.success("Filtre ajouté avec succès", '', { 'positionClass': 'toast-bottom-full-width', 'closeButton': true });
  }

  close() {
    this.dialogRef.close();
  }

  /**
   * Effectue les contrôles nécéssaires afin de vérifier l'unicité et les conflits avec des filtres actifs déjà existants 
   * @param valueMin 
   * @param valueMax 
   * @param type 
   */
  isFiltered(valueMin, valueMax, type) {
    let bool: boolean = false;
    for (let i = 0; i < this.filters.length; i++) {
      if (valueMax == null) {
        bool = (this.filters[i].min == valueMin) && (type == this.filters[i].type)
      } else {
        bool = (this.filters[i].min == valueMin) && (type == this.filters[i].type) && (this.filters[i].max == valueMax)
      }
      if (bool) {
        return bool;
      }
      if (this.filters[i].actif) {
        if (!bool) {
          switch (this.filters[i].type) {
            case ('inf. à'):
              if (type == 'inf. à' || type == 'inf. égal à') {
                bool = valueMin <= this.filters[i].min
              } else {
                bool = (valueMin < this.filters[i].min);
              }
              break;
            case ('inf. égal à'):
              bool = (valueMin <= this.filters[i].min);
              break;
            case ('sup. à'):
              if (type == 'sup. à' || type == 'sup. égal à') {
                bool = valueMin >= this.filters[i].min
              } else {
                bool = (valueMin > this.filters[i].min);
              }
              break;
            case ('sup. égal à'):
              bool = (valueMin > this.filters[i].min);
              break;
            case ('compris'):
              if (type == 'compris') {
                bool = (((valueMin >= this.filters[i].min) && (valueMin <= this.filters[i].max)) || ((valueMax >= this.filters[i].min) && (valueMax <= this.filters[i].max)));
              } else if (type == 'inf. à') {
                bool = valueMin > this.filters[i].min;
              } else if (type == 'inf. égal à') {
                bool = valueMin >= this.filters[i].min;
              } else if (type == 'sup. égal à') {
                bool = valueMin <= this.filters[i].max;
              } else if (type == 'sup. à') {
                bool = valueMin < this.filters[i].max;
              } else {
                bool = (valueMin >= this.filters[i].min) && (valueMin <= this.filters[i].max)
              }
              break;
          }
        }
        if (!bool) {
          switch (type) {
            case ('inf. à'):
              bool = (valueMin > this.filters[i].min);
              break;
            case ('inf. égal à'):
              bool = (valueMin >= this.filters[i].min);
              break;
            case ('sup. à'):
              bool = (this.filters[i].min > valueMin);
              break;
            case ('sup. égal à'):
              bool = (this.filters[i].min >= valueMin);
              break;
            case ('compris'):
              if (this.filters[i].type == 'compris') {
                bool = (((valueMin <= this.filters[i].min) && (valueMax >= this.filters[i].min)) || ((valueMin <= this.filters[i].max) && (valueMax >= this.filters[i].max)));
              } else if (type == 'inf. à') {
                bool = valueMin < this.filters[i].min;
              } else if (type == 'inf. égal à') {
                bool = valueMin <= this.filters[i].min;
              } else if (type == 'sup. égal à') {
                bool = valueMin >= this.filters[i].min;
              } else if (type == 'sup. à') {
                bool = valueMin > this.filters[i].min;
              } else {
                bool = (valueMin <= this.filters[i].min) && (valueMax >= this.filters[i].min)
              }
              break;
          }
          if (bool) {
            return bool;
          }
        }
      }
    }
    return bool;
  }

  /**
   * Permet de créer le nom du filtre en fonction du type de filtre
   * @param type 
   * @param valueMin 
   */
  createName(type, valueMin): string {
    let name = "";
    switch (type) {
      case ('inf. à'):
        name = "< " + valueMin;
        break;
      case ('inf. égal à'):
        name = "<= " + valueMin;
        break;
      case ('égal'):
        name = valueMin;
        break;
      case ('sup. à'):
        name = "> " + valueMin;
        break;
      case ('sup. égal à'):
        name = ">= " + valueMin;
        break;
    }
    return name;
  }
}
