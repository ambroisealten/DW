import { Component, OnInit, Input } from '@angular/core';
import { FilterList } from 'src/app/models/Filter';

@Component({
  selector: 'app-chart-screen',
  templateUrl: './chart-screen.component.html',
  styleUrls: ['./chart-screen.component.scss']
})
export class ChartScreenComponent implements OnInit {

  @Input() type ; 
  @Input() tables ; 
  @Input() filters: FilterList[] ; 
  @Input() datas ; 

  spans: any[] ; 
  datasourceTable: any[] ; 
  displayedColumns: string[] ; 

  constructor() { }

  ngOnInit() {
  }

  setView(){
    if(this.type == "tab"){
      //Créer displayedColumns ICI ! 
      this.tables.forEach(element => {
        this.displayedColumns.push(element.column)  ;
      });
      this.calculData() ; 
    } else {
      //creation du chart  
    }
  }


  /*****************************************************************************************************************\
   *
   * 
   *                                               Méthode Tableau
   * 
   *
   \*****************************************************************************************************************/

  /**
   * Evalue et stock le row span 
   * La clé détermine la colonne affectée et l'accesseur détermine la profondeur de cette colonne dans le tableau
   * Ne fonctionne que si les données sont triées car les données similaires doivent être successives dans le tableau 
   */
  cacheSpan(key, accessor) {
    //On boucle sur les données 
    for (let i = 0; i < this.datasourceTable.length;) {

      //On construit la donnée elle est représentée par object[key1]+object[key2]+object[key3]+....
      let currentValue = '';
      for (let k = 0; k < accessor; k++) {
        //On transforme la donnée selon les filtres afin de convertir des données qui n'ont pas la même valeur en une même valeur afin de les "spans" ensemble
        currentValue += this.transform(this.datasourceTable[i][this.displayedColumns[k]], this.displayedColumns[k]);
      }

      let count = 1;

      // On itère sur les données restantes
      for (let j = i + 1; j < this.datasourceTable.length; j++) {

        //On construit la donnée elle est représentée par object[key1]+object[key2]+object[key3]+....
        let checkedValue = '';
        for (let h = 0; h < accessor; h++) {
          //On transforme la donnée selon les filtres afin de convertir des données qui n'ont pas la même valeur en une même valeur afin de les "spans" ensemble
          checkedValue += this.transform(this.datasourceTable[j][this.displayedColumns[h]], this.displayedColumns[h]);
        }
        //Si les valeurs sont différentes, on casse la boucle 
        if (currentValue != checkedValue) {
          break;
        }

        count++;
      }

      //Comme le span est un tableau vide à l'origine et que l'index du span peut être n'importe où on initialise la ligne avec un object vide
      if (!this.spans[i]) {
        this.spans[i] = {};
      }

      // On stock le nombre de similiarité trouvée (donc le span)
      // et on skip jusqu'à la prochaine ligne unique 
      this.spans[i][key] = count;
      i += count;
    }
  }

    /**
   * Permet de sort les données jusqu'à la dernière colonne affichée 
   * C'est-à-dire qu'on cherche l'attribut le plus loin différenciant deux données 
   * Dans l'ordre de gauche à droite des colonnes affichées 
   * Les données sont transformer selon leur filtre 
   */
  multipleSort() {
    this.datasourceTable.sort((a, b) => {
      for (let i = 0; i < this.displayedColumns.length; i++) {
        if (!a.hasOwnProperty(this.displayedColumns[i]) && !b.hasOwnProperty(this.displayedColumns[i])) {

        } else if (!a.hasOwnProperty(this.displayedColumns[i])) {
          return -1;
        } else if (!b.hasOwnProperty(this.displayedColumns[i])) {
          return 1;
        } else if (this.transform(a[this.displayedColumns[i]], this.displayedColumns[i]) !== this.transform(b[this.displayedColumns[i]], this.displayedColumns[i])) {
          return a[this.displayedColumns[i]] > b[this.displayedColumns[i]] ? 1 : -1;
        }
      }
    })
  }

   /**
   * Evalue si la ligne doit être skip ou affichée
   * @param col 
   * @param index 
   */
  getRowSpan(col, index) {
    return this.spans[index] && this.spans[index][col];
  }

  /**
   * Permet de transformer la donnée selon les filtres existants 
   * @param data 
   * @param column 
   */
  transform(data, column) {
    if (data == undefined) {
      return ' ';
    }
    let actualFilter: FilterList = this.filters.find(filter => filter.filterColumn == column)
    let name = '';
    if (actualFilter != undefined) {
      if (actualFilter['filterType'] == 'number') {
        for (let i = 0; i < actualFilter.filters.length; i++) {
          if (actualFilter.filters[i].actif) {
            if (this.agregateNumber(data, actualFilter.filters[i])) {
              name = actualFilter.filters[i]['name'];
              break;
            }
          }
        }
      } else if (actualFilter['filterType'] == 'string') {
        for (let i = 0; i < actualFilter.filters.length; i++) {
          if (actualFilter.filters[i].actif) {
            if (actualFilter.filters[i].listElem.includes(data)) {
              name = actualFilter.filters[i]['name'];
              break;
            }
          }
        }
      } else if (actualFilter['filterType'] == 'date') {
        for (let i = 0; i < actualFilter.filters.length; i++) {
          if (actualFilter.filters[i].actif) {
            let value = (new Date(data)).getTime()
            if (this.agregateDate(value, actualFilter.filters[i])) {
              name = actualFilter.filters[i]['name'];
              break;
            }
          }
        }
      }
      if (name != '') {
        return name;
      }
    }
    return data;
  }

   /**
   * Evalue si la valeur appartient au filtre 
   * @param value 
   * @param filter 
   */
  agregateNumber(value, filter) {
    let bool = false;
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
    return bool;
  }

  /**
  * Evalue si la valeur appartient au filtre 
  * @param value 
  * @param filter 
  */
  agregateDate(value, filter) {
    let bool = false;
    switch (filter.type) {
      case ('avant le'):
        bool = (value < filter.startDate);
        break;
      case ('jusqu\'au'):
        bool = (value <= filter.startDate);
        break;
      case ('après le'):
        bool = (value > filter.startDate);
        break;
      case ('à partir'):
        bool = (value > filter.startDate);
        break;
      case ('entre'):
        bool = ((value >= filter.startDate) && (value <= filter.endDate));
        break;
    }
    return bool;
  }

  /**
   * Permet de déterminer si la valeur fait partie des données exclues ou non 
   * @param data 
   */
  isNotExclude(data) {
    if (this.filters.length == 0) {
      return true;
    }
    let bool = false;
    for (let i = 0; i < this.filters.length; i++) {
      if (this.filters[i].filterType == 'date') {
        if (this.filters[i].excludeValue.includes((new Date(data[this.filters[i].filterColumn])).getTime() + '')) {
          bool = true;
        }
      } else {
        if (this.filters[i].excludeValue.includes(data[this.filters[i].filterColumn] + '')) {
          bool = true;
        }
      }
      if (bool) {
        return false;
      }
    }
    return true;
  }

  calculData() {
    this.datasourceTable = Object.assign([], this.datas.filter(element => this.isNotExclude(element)))
    this.multipleSort();
    this.spans = [];
    for (let i = 0; i < this.displayedColumns.length; i++) {
      this.cacheSpan(this.displayedColumns[i], i + 1);
    }
  }

}
