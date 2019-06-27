import { Component, OnInit, Inject, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource, MatIconModule } from '@angular/material';
import { Filter } from 'src/app/models/Filter';
import { Toast, ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-modal-string-manipulation',
  templateUrl: './modal-string-manipulation.component.html',
  styleUrls: ['./modal-string-manipulation.component.scss']
})
export class ModalStringManipulationComponent implements OnInit {

  //Canal de communication avec le parent afin d'envoyer l'ajout de nouveau filtre sans fermer la modale
  @Output() public addFilter = new EventEmitter();

  //Donnée du tableau de gauche 
  dataSource = new MatTableDataSource<any>();
  displayedColumns: string[] = [];

  //Donnée du tableau de droite 
  dataSources = new MatTableDataSource<any>([]);
  displayedColumnsright: string[] = [];

  //Option d'exclusion
  excludeOption: string;

  //Filtres déjà existants 
  filters: Filter[] = [];

  //Permet de savoir si le but est de grouper ou d'excluse
  isTri: boolean;

  constructor(private dialogRef: MatDialogRef<ModalStringManipulationComponent>,
    @Inject(MAT_DIALOG_DATA) public data, private changeDetectorRefs: ChangeDetectorRef,
    private toastr: ToastrService) {
    //Initialisation des données envoyées par param view
    this.isTri = data.bool;
    //On assign un nouvel espace mémoire pour éviter de modifier le tableau de donnée 
    this.dataSource = new MatTableDataSource(Object.assign([], data.data.data));
    this.displayedColumns = data.displayedColumns;
    this.dataSources = new MatTableDataSource();
    //On assigne un nouvel espace mémoire pour éviter les conflits d'adressage 
    this.displayedColumnsright = Object.assign([], this.displayedColumns);
    this.displayedColumnsright.push('delete');
    this.filters = data.filters;
  }

  ngOnInit() {

  }

  /**
   * Lors du click sur le tableau de gauche on pousse cet élément dans celui de droite 
   * @param element 
   */
  clicked(element) {
    //Ajout de l'élement dans le tableau de droite avec un sort 
    this.dataSources.data.push(element);
    this.dataSources.data.sort((e1, e2) => e1[this.displayedColumns[0]] > e2[this.displayedColumns[0]] ? 1 : -1);
    this.dataSources = new MatTableDataSource<any>(this.dataSources.data)

    //Suppression de l'élément dans le tableau de gauche 
    let index = this.dataSource.data.indexOf(element);
    this.dataSource.data.splice(index, 1);
    this.dataSource = new MatTableDataSource<any>(this.dataSource.data)
    this.changeDetectorRefs.detectChanges();
  }

  /**
   * Permet de créer un nouveau filtre, vérifie l'unicité et le conflit n'est pas possible ici car les données envoyées 
   * sont seulement les données non conflictuelles avec des filtres actifs existants 
   */
  onSave() {
    if (this.dataSources.data.length == 0) {
      this.toastr.error("Aucune donnée sélectionné", '');
      return;
    }

    let newFilter: Filter = new Filter();
    newFilter['listElem'] = [];
    this.dataSources.data.forEach(element => {
      newFilter['listElem'].push(element[this.displayedColumnsright[0]]);
    })

    //Vérifie l'unicité
    let taille = newFilter.listElem.length;
    for (let i = 0; i < this.filters.length; i++) {
      let count = 0;
      for (let j = 0; j < taille; j++) {
        if (this.filters[i].listElem.includes(newFilter.listElem[j])) {
          count++;
        }
      }
      if (count == taille && this.filters[i].listElem.length == taille) {
        this.toastr.error("Le filtre existe déjà : " + this.filters[i].name, '');
        return;
      }
    }

    newFilter['name'] = this.createName(newFilter['listElem']);
    newFilter.actif = true;
    //Ajout d'un attribut désignant la politique de tri en cas de tri 
    if (this.isTri) {
      if (this.excludeOption == undefined) {
        this.toastr.error("Sélectionnez une option de tri", '');
        return;
      }
      newFilter['excludeValue'] = this.excludeOption;
    } else {
      this.dataSources = new MatTableDataSource();
    }
    //Envoi du filtre au parent - param-view
    this.addFilter.emit(newFilter);
    this.toastr.success("Filtre ajouté avec succès", '');
  }

  /**
   * Crée le nom en fonction des éléments 
   * @param listElem 
   */
  createName(listElem: string[]): string {
    let name = "[";
    for (let i = 0; i < listElem.length - 1; i++) {
      name += listElem[i] + ", "
    }
    name += listElem[listElem.length - 1] + "]";
    return name;
  }

  /**
   * Transfère un élément du tableau de droite vers celui de gauche 
   * @param element 
   */
  delete(element) {
    //Ajout de l'élément dans le tableau de gauche + un sort 
    this.dataSource.data.push(element);
    this.dataSource.data.sort((e1, e2) => e1[this.displayedColumns[0]] > e2[this.displayedColumns[0]] ? 1 : -1);
    this.dataSource = new MatTableDataSource<any>(this.dataSource.data)

    //Suprression de l'élément dans le tableau de droite
    let index = this.dataSources.data.indexOf(element);
    this.dataSources.data.splice(index, 1);
    this.dataSources = new MatTableDataSource<any>(this.dataSources.data)
    this.changeDetectorRefs.detectChanges();
  }

  close() {
    this.dialogRef.close();
  }
}
