import { Component, EventEmitter, Inject, OnInit, Output, ViewChild } from '@angular/core';
import { MatCheckbox, MatDialogRef, MatSelectionList, MatSelectionListChange, MAT_DIALOG_DATA } from '@angular/material';
import { ToastrService } from 'ngx-toastr';
import { Filter } from 'src/app/models/Filter';

@Component({
  selector: 'app-modal-date-manipulation',
  templateUrl: './modal-date-manipulation.component.html',
  styleUrls: ['./modal-date-manipulation.component.scss']
})
export class ModalDateManipulationComponent implements OnInit {

  //Canal de communication avec le parent afin d'envoyer l'ajout de nouveau filtre sans fermer la modale
  @Output() public addFilter = new EventEmitter();

  //Permet de savoir si le but est de trier ou de grouper les données 
  isTri: boolean;

  //Liste des filtres existants afin de déterminer l'unicité des filtres 
  filters: Filter[];

  //Permet de récupérer les valeurs sélectionnées/entrées par l'utilisateur 
  @ViewChild('type', { static: true }) type: MatSelectionList;
  @ViewChild('compris', { static: true }) compris: MatCheckbox;
  startDate: Date;
  endDate: Date;
  dateSolo: Date;
  currentDate: Date;
  excludeOption: string;

  constructor(
    private dialogRef: MatDialogRef<ModalDateManipulationComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
    private toastr: ToastrService) {
    this.isTri = data.isTri;
    this.filters = data.filters;
  }

  ngOnInit() {
    this.type.selectionChange.subscribe((s: MatSelectionListChange) => {
      this.type.deselectAll();
      this.compris.checked = false;
      s.option.selected = true;
    });
  }

  getTitle() {
    return this.isTri ? 'Filtrage' : 'Groupement';
  }

  unselectOther() {
    this.type.deselectAll();
  }

  onSave() {

    if (this.type.selectedOptions.selected.length == 0 && !this.compris) {
      this.toastr.error("Erreur lors de l'ajout du filtre", "Veuillez selectionnez le type du filtre a ajouté !");
      return;
    }

    if (this.isTri && this.excludeOption == undefined) {
      return;
    }

    let newFilter: Filter = new Filter();
    if (this.type.selectedOptions.selected.length > 0 && this.dateSolo != undefined) {

      newFilter['type'] = this.type.selectedOptions.selected[0].value;
      if(newFilter['type'] == 'après le'){
        newFilter['startDate'] = this.dateSolo.getTime() + 86400000 ;
      } else if (newFilter['type'] == 'jusqu\'au') {
        newFilter['startDate'] = this.dateSolo.getTime() + 86399999 ;
      } else { 
        newFilter['startDate'] = this.dateSolo.getTime();
      }
      newFilter['name'] = this.createName(newFilter['type'], this.dateSolo);
      //Si l'onglet est le tri, on ne regarde pas le conflit avec les autres filtres 
      if (!this.isTri && this.isFiltered(newFilter['startDate'], null, newFilter['type'], newFilter['name'])) {
        return;
      }
    } else if (this.compris.checked && this.startDate != undefined && this.endDate != undefined) {
      newFilter['type'] = 'entre';
      newFilter['name'] = 'Entre le ' + this.convertTimestamp(this.startDate) + ' et le ' + this.convertTimestamp(this.endDate);
      newFilter['startDate'] = this.startDate.getTime();
      newFilter['endDate'] = this.endDate.getTime() + 86400000 ;
      //Si l'onglet est le tri, on ne regarde pas le conflit avec les autres filtres 
      if (!this.isTri && this.isFiltered(newFilter['startDate'], newFilter['endDate'], newFilter['type'], newFilter['name'])) {
        return;
      }
    } else {
      //Si aucune option sélectionné on stop
      return;
    }

    //On ajoute un attribut déterminant le type de traitement de la donnée en cas de tri
    if (this.isTri) {
      newFilter['excludeValue'] = this.excludeOption;
    }

    //Un filtre ajouté est considéré comme actif
    newFilter['actif'] = true;

    //On transmet le filtre à param-view
    this.addFilter.emit(newFilter);
    this.toastr.success("Filtre ajouté avec succès", '');
  }

  isFiltered(startDate, endDate, type, name): boolean {
    let bool = false;
    for (let i = 0; i < this.filters.length; i++) {
      if (this.filters[i].name == name) {
        this.toastr.error("Le filtre existe déjà : " + this.filters[i].name, '');
        return true;
      }
      if (this.filters[i].actif) {
        switch (this.filters[i].type) {
          case ('avant le'):
            if (type == 'avant le') {
              bool = startDate <= this.filters[i].startDate;
            } else {
              bool = startDate < this.filters[i].startDate;
            }
            break;
          case ('jusqu\'au'):
            bool = startDate <= this.filters[i].startDate;
            break;
          case ('après le'):
            if (type == 'après le') {
              bool = startDate >= this.filters[i].startDate;
            } else if (type == "entre") {
              bool = endDate > this.filters[i].startDate;
            } else {
              bool = startDate > this.filters[i].startDate;
            }
            break;
          case ('à partir'):
            if (type == "entre") {
              bool = endDate >= this.filters[i].startDate;
            } else {
              bool = startDate >= this.filters[i].startDate;
            }
            break;
          case ('entre'):
            if (type == 'entre') {
              bool = ((startDate >= this.filters[i].startDate) && (startDate <= this.filters[i].endDate)) || ((endDate >= this.filters[i].startDate) && (endDate <= this.filters[i].endDate))
            } else if (type == 'avant le') {
              bool = startDate > this.filters[i].startDate;
            } else if (type == 'jusqu\'au') {
              bool = startDate >= this.filters[i].startDate;
            } else if (type == 'après le') {
              bool = startDate < this.filters[i].endDate;
            } else if (type == 'à partir') {
              bool = startDate <= this.filters[i].endDate
            }
            break;
        }
        if (!bool) {
          switch (type) {
            case ('avant le'):
              if (this.filters[i].type == 'avant le') {
                bool = startDate >= this.filters[i].startDate;
              } else {
                bool = startDate > this.filters[i].startDate;
              }
              break;
            case ('jusqu\'au'):
              bool = startDate >= this.filters[i].startDate;
              break;
            case ('après le'):
              if (this.filters[i].type == 'après le') {
                bool = startDate <= this.filters[i].startDate;
              } else if (this.filters[i].type == 'entre') {
                bool = startDate < this.filters[i].endDate;
              } else {
                bool = startDate < this.filters[i].startDate;
              }
              break;
            case ('à partir'):
              if (this.filters[i].type == 'entre') {
                bool = startDate <= this.filters[i].endDate;
              } else {
                bool = startDate <= this.filters[i].startDate;
              }
              break;
            case ('entre'):
              if (this.filters[i].type == 'entre') {
                bool = ((startDate <= this.filters[i].startDate) && (endDate >= this.filters[i].startDate)) || ((startDate <= this.filters[i].endDate) && (endDate >= this.filters[i].endDate))
              } else if (this.filters[i].type == 'avant le') {
                bool = startDate < this.filters[i].startDate;
              } else if (this.filters[i].type == 'jusqu\'au') {
                bool = startDate <= this.filters[i].startDate;
              } else if (this.filters[i].type == 'après le') {
                bool = endDate > this.filters[i].startDate;
              } else if (this.filters[i].type == 'à partir') {
                bool = endDate >= this.filters[i].startDate;
              }
              break;
          }
        }
        if (bool) {
          this.toastr.error("Le filtre est en conflit avec : " + this.filters[i].name, '');
          return bool;
        }
      }
    }
    return bool;
  }

  createName(type, startDate) {
    let date = this.convertTimestamp(startDate);
    let name = ""
    switch (type) {
      case ('avant le'):
        name = "Avant le " + date;
        break;
      case ('jusqu\'au'):
        name = "Jusqu'au " + date;
        break;
      case ('après le'):
        name = "Après le " + date;
        break;
      case ('à partir'):
        name = "A partir du " + date;
        break;
    }
    return name;
  }

  convertTimestamp(timestamp) {
    let date = new Date(timestamp);
    return (date + "").slice(8, 10) + "/" + ("0" + (date.getMonth() + 1)).slice(-2) + '/' + date.getFullYear()
  }

  myFilter() {
    this.startDate;
  }

  close() {
    this.dialogRef.close();
  }
}
