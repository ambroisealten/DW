import { Component, ElementRef, Input, OnInit, ViewChild, OnDestroy, Output, EventEmitter } from '@angular/core';
import { Chart } from 'chart.js';
import { DataService } from 'src/app/services/dataService';
import { DataScheme } from 'src/app/models/dataScheme';
import { CdkDragStart, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { Observable } from 'rxjs';
import { FilterList } from '../../models/Filter';

@Component({
  selector: 'app-chart-view',
  templateUrl: './chart-view.component.html',
  styleUrls: ['./chart-view.component.scss']
})
export class ChartViewComponent implements OnInit, OnDestroy {

  //Data binding to Parent - Output vers AppComponent
  @Output() public toParent: EventEmitter<string> = new EventEmitter();

  //Input - Parent vers ce composant
  @Input() instanceNumber: number;
  @Input() droppedText: string;
  @Input() displayedColumns: string[];
  @Input() dataSource: any[] = [];

  //Observable parents - canal de communication entre ce composant et son Parent
  @Input() parentObs: Observable<any>;
  parentSub;

  //Détermine le type de réprésentation de la donnée, tableau, doughnut etc..
  currentType: string = "tab";

  @ViewChild('myCanvas', { static: false }) myCanvas: ElementRef;
  public context: CanvasRenderingContext2D;
  chart: any = [];
  canvasWidth: number = 0;
  canvasHeight: number = 0;
  canvasFontSize: number;
  allColors = ["blue", "red", "green", "yellow", "pink", "cyan", "orange", "white", "salmon", "grey"];

  //Liste des filtres à appliquer sur les données 
  filters: FilterList[] = [];

  //Permet de mettre ensemble les lignes qui en ont besoin 
  spans = [];

  //Donnée du Tableau
  datas: any[] = [];

  //Ancien index lors du drag
  previousIndex: number;

  //Donnée pour les chats -- TO SUPPR MUST BE DYNAMIC 
  data: any[] = [];


  constructor() {
  }

  ngOnInit() {
    this.data.push({ "name": this.droppedText, "vls": [12, 1, 0, 78, 69, 11, 45, 32, 69] });

    //Sort le tableau pour que le spanning soit correct
    this.multipleSort();
    //Réalise le spanning
    this.spans = [];
    for (let i = 0; i < this.displayedColumns.length; i++) {
      this.cacheSpan(this.displayedColumns[i], i + 1);
    }

  }

  ngOnDestroy() {
    //Unsubscribe du canal parent 
    if (this.parentSub != undefined) {
      this.parentSub.unsubscribe();
    }
  }

  ngAfterViewInit() {
    this.context = (<HTMLCanvasElement>this.myCanvas.nativeElement).getContext('2d');
    //Set la taille du texte selon la taille 
    switch (document.getElementsByClassName('chartContainerDouble').length) {
      case 0:
        this.canvasFontSize = 14;
        break;
      default:
        this.canvasFontSize = 10;
        break;
    }
    this.myCanvas.nativeElement.style = "display : none";
    this.resetCanvasHeightAndWidth();
  }

  /**
   * 
   */
  recheckValues() {
    if (this.currentType != "tab") {
      this.resetChartView();
      this.resetCanvasHeightAndWidth();
      this.modifyChartView(this.currentType);
    }
  }

  /**
   * Initialise le canal de subscription avec le parent 
   */
  setSubscription() {
    if (this.parentSub == undefined) {
      this.parentSub = this.parentObs.subscribe(data => this.handleData(data));
    }
  }

  resetCanvasHeightAndWidth() {
    this.myCanvas.nativeElement.width = (this.myCanvas.nativeElement.parentNode.parentNode.parentNode.parentNode.offsetWidth - 150).toString();
    this.myCanvas.nativeElement.height = (this.myCanvas.nativeElement.parentNode.parentNode.parentNode.parentNode.offsetHeight - 50).toString();
  }

  /**
   * Ajout d'une colonne de donnée, reset de l'affichage
   * @param ev 
   */
  onDrop(ev) {
    //Récupération de la colonne 
    const colName = ev.dataTransfer.getData('colName');
    if(colName != ""){

      //On ajoute la colonne et on ajout le span correspondant  
      this.displayedColumns.push(colName);
      this.multipleSort();
      this.cacheSpan(this.displayedColumns[this.displayedColumns.length-1],this.displayedColumns.length) ; 
    }

    ev.preventDefault();
  }

  /**
   * Evalue et stock le row span 
   * La clé détermine la colonne affectée et l'accesseur détermine la profondeur de cette colonne dans le tableau
   * Ne fonctionne que si les données sont triées car les données similaires doivent être successives dans le tableau 
   */
  cacheSpan(key, accessor) {
    //On boucle sur les données 
    for (let i = 0; i < this.datas.length;) {

      //On construit la donnée elle est représentée par object[key1]+object[key2]+object[key3]+....
      let currentValue = "";
      for (let k = 0; k < accessor; k++) {
        //On transforme la donnée selon les filtres afin de convertir des données qui n'ont pas la même valeur en une même valeur afin de les "spans" ensemble
        currentValue += this.transform(this.datas[i][this.displayedColumns[k]], this.displayedColumns[k]);
      }

      let count = 1;

      // On itère sur les données restantes
      for (let j = i + 1; j < this.datas.length; j++) {

        //On construit la donnée elle est représentée par object[key1]+object[key2]+object[key3]+....
        let checkedValue = "";
        for (let h = 0; h < accessor; h++) {
           //On transforme la donnée selon les filtres afin de convertir des données qui n'ont pas la même valeur en une même valeur afin de les "spans" ensemble
          checkedValue += this.transform(this.datas[j][this.displayedColumns[h]], this.displayedColumns[h]);
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
   * On récupère l'index lors du début du drag 
   * @param event 
   * @param index 
   */
  dragStarted(event: CdkDragStart, index: number) {
    this.previousIndex = index;
  }

  /**
   * Echange les colonnes et redéfinie le rowSpan
   * @param event 
   * @param index 
   */
  dropListDropped(event: CdkDropList, index: number) {
    if (event && index != this.previousIndex) {
      moveItemInArray(this.displayedColumns, this.previousIndex, index);
      this.multipleSort();
      this.dataSource = this.datas;
      this.spans = [];
      for (let i = 0; i < this.displayedColumns.length; i++) {
        this.cacheSpan(this.displayedColumns[i], i + 1);
      }
    }
  }

  /**
   * Permet de sort les données jusqu'à la dernière colonne affichée 
   * C'est-à-dire qu'on cherche l'attribut le plus loin différenciant deux données 
   * Dans l'ordre de gauche à droite des colonnes affichées 
   * Les données sont transformer selon leur filtre 
   */
  multipleSort() {
    this.datas.sort((a, b) => {
      for (let i = 0; i < this.displayedColumns.length; i++) {
        if (this.transform(a[this.displayedColumns[i]], this.displayedColumns[i]) !== this.transform(b[this.displayedColumns[i]], this.displayedColumns[i])) {
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
    let actualFilter: FilterList = this.filters.find(filter => filter.filterColumn == column)
    let bool = false;
    let name = "";
    if (actualFilter != undefined) {
      if (actualFilter['filterType'] == 'number') {
        for(let i = 0 ; i < actualFilter.filters.length ; i++){
          if (actualFilter.filters[i].actif && !bool) {
            if (this.agregateNumber(data, actualFilter.filters[i])) {
              name = actualFilter.filters[i]['name'];
              break ; 
            }
          } 
        }
      } else if (actualFilter['filterType'] == "string") {
        for(let i = 0 ; i < actualFilter.filters.length ; i++){
          if (actualFilter.filters[i].actif && !bool) {
            if (actualFilter.filters[i].listElem.includes(data)) {
              name = actualFilter.filters[i]['name'];
              break ; 
            }
          } 
        }
      }
      if(name != ""){
        return name ;
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
    let bool: boolean = false;
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

  allowDrop(ev) {
    ev.preventDefault();
  }

  /**
   * 
   * @param type 
   */
  changeChartView(type: string) {
    this.resetChartView();

    this.currentType = type.toLowerCase();

    switch (this.currentType) {
      case 'pie':
      case 'doughnut':
      case 'bar':
      case 'line':
        this.setCanvasSettings(true);
        this.modifyChartView(this.currentType);
        break;
      default:
        this.currentType = "tab" ; 
        this.setCanvasSettings(false);
        break;
    }
  }

  setCanvasSettings(display: boolean) {
    this.myCanvas.nativeElement.style = "display : none";
    if (display) this.myCanvas.nativeElement.style = "display : inline-block";

    this.context = (<HTMLCanvasElement>this.myCanvas.nativeElement).getContext('2d');

    this.resetCanvasHeightAndWidth();
  }

  modifyChartView(chartType: string) {
    let testData = this.data[0].vls;

    let labels = testData.map(el => {
      return this.droppedText + " : " + el.toString();
    });


    let test = [];
    let inter = 0;
    for (let i = 0; i < labels.length; i++) {
      if (i % this.allColors.length == 0) {
        inter = 0;
      }
      test.push(this.allColors[inter]);
      inter++;
    }

    this.chart = new Chart(this.context, {
      type: chartType,
      data: {
        labels: labels,
        datasets: [
          {
            data: testData,
            backgroundColor: test,
            borderColor: "#00000",
            fill: true
          }]
      },
      options: {
        legend: {
          display: false,
          position: "bottom",
          labels: {
            fontSize: this.canvasFontSize
          }
        },
        responsive: false,
        maintainAspectRatio: true

      }
    });
  }

  resetChartView() {
    if (this.chart instanceof Chart) this.chart.destroy();
  }

  deleteChartView() {
    let allContainedFour = document.getElementsByClassName("chartContainedFour").length;
    let allContained = document.getElementsByClassName("chartContained").length;
    let allCharts = document.getElementsByClassName("charts").length;
    let allChartsFour = document.getElementsByClassName("chartsFour").length;

    let chartsLength = allContained + allCharts + allChartsFour + allContainedFour;

    if (chartsLength > 1) {
      let divContainer = this.myCanvas.nativeElement.parentNode.parentNode.parentNode.parentNode;

      let templateContainer = document.getElementById("templates");
      templateContainer.appendChild(divContainer.firstChild);

      divContainer.parentNode.removeChild(divContainer);

      if (chartsLength == 2) {
        let mainContainer = document.getElementById("chartContainerDouble");
        mainContainer.setAttribute('id', 'chartContainerSimple');
      }
    }
    else {
      console.log("You can't destroy your one and only chart !");
    }
  }

  /**
   * Interprète les données reçues par le parent
   * @param data 
   */
  handleData(data) {
    // Si réception d'un nouveau filtre retransforme les données
    this.filters = data;
    this.multipleSort();
    this.spans = [];
    for (let i = 0; i < this.displayedColumns.length; i++) {
      this.cacheSpan(this.displayedColumns[i], i + 1);
    }
  }

  /**
   * Permet de déterminer si la valeur fait partie des données exclue ou non 
   * @param data 
   * @param column 
   */
  isNotExclude(data, column) {
    return !this.filters.find(filter => filter.filterColumn == column).excludeValue.includes(data + "");
  }

}
