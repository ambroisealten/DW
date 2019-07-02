import { CdkDragStart, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild, ChangeDetectorRef, ViewChildren, ComponentFactoryResolver, ViewContainerRef } from '@angular/core';
import { Chart, ChartData } from 'chart.js';
import { Observable } from 'rxjs';
import { FilterList } from '../../models/Filter';
import { ToastrService } from 'ngx-toastr';

import 'chartjs-chart-box-and-violin-plot/build/Chart.BoxPlot.js';
import { ModalLoadSpinnerComponent } from '../modal/modal-load-spinner/modal-load-spinner.component';

@Component({
  selector: 'app-chart-view',
  templateUrl: './chart-view.component.html',
  styleUrls: ['./chart-view.component.scss']
})
export class ChartViewComponent implements OnInit, OnDestroy {

  //Data binding to Parent - Output vers AppComponent
  @Output() public toParent: EventEmitter<string> = new EventEmitter();

  //Spinning
  @ViewChild('spinningRecords',{ read: ViewContainerRef, static: true}) entrySpinningComponent: ViewContainerRef; 
  componentRef: any ; 

  //Input - Parent vers ce composant
  @Input() instanceNumber: number;
  @Input() droppedText: string;
  @Input() displayedColumns: string[];
  @Input() dataSource: any[] = [];
  @Input() tableInfo: any;

  //Observable parents - canal de communication entre ce composant et son Parent
  @Input() parentObs: Observable<any>;
  parentSub;

  //Détermine le type de réprésentation de la donnée, tableau, doughnut etc..
  currentType = "tab";

  @ViewChild('myCanvas', { static: false }) myCanvas: ElementRef;
  public context: CanvasRenderingContext2D;
  chart: any = [];
  canvasWidth = 0;
  canvasHeight = 0;
  canvasFontSize: number;
  allColors = ["blue", "red", "green", "yellow", "pink", "cyan", "orange", "white", "salmon", "grey"];

  //Liste des filtres à appliquer sur les données 
  @Input() filters: FilterList[] = [];
  tasksList = [{ 'name': 'Tab', 'function': 'test()' }, { 'name': 'Pie', 'function': 'test()' }, { 'name': 'Doughnut', 'function': 'test()' }, { 'name': 'Bar', 'function': 'test()' }, { 'name': 'Line', 'function': 'test()' }];

  //Permet de mettre ensemble les lignes qui en ont besoin 
  spans = [];

  //Donnée du Tableau
  @Input() datas: any[] = [];
  @Input() tableNames: string[] = [];

  //Ancien index lors du drag
  previousIndex: number;

  //DataSource tableau
  datasourceTable: any[] = [];

  loading = false ;

  constructor(private toastr: ToastrService,
    private componentFactoryResolver: ComponentFactoryResolver) {
  }

  ngOnInit() {
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
    this.myCanvas.nativeElement.style = 'display : none';
    this.resetCanvasHeightAndWidth();
  }

  setSpin(){
    this.entrySpinningComponent.clear() ;  
    let factory = this.componentFactoryResolver.resolveComponentFactory(ModalLoadSpinnerComponent) ; 
    this.componentRef = this.entrySpinningComponent.createComponent(factory)  ; 
  }

  /**
   * Changement des tailles du canvas et de la vue
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
    const tableName = ev.dataTransfer.getData('tableName');
    //Récupération de la colonne 
    const colName = ev.dataTransfer.getData('colName');
    if (colName != "" && this.tableInfo.name == tableName && !this.displayedColumns.includes(colName)) {
      this.toParent.emit('askForData/' + this.instanceNumber + '/' + tableName);
      //On ajoute la colonne et on ajoute le span correspondant  
      this.displayedColumns.push(colName);
      this.calculData();
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
    for (let i = 0; i < this.datasourceTable.length;) {

      //On construit la donnée elle est représentée par object[key1]+object[key2]+object[key3]+....
      let currentValue = "";
      for (let k = 0; k < accessor; k++) {
        //On transforme la donnée selon les filtres afin de convertir des données qui n'ont pas la même valeur en une même valeur afin de les "spans" ensemble
        currentValue += this.transform(this.datasourceTable[i][this.displayedColumns[k]], this.displayedColumns[k]);
      }

      let count = 1;

      // On itère sur les données restantes
      for (let j = i + 1; j < this.datasourceTable.length; j++) {

        //On construit la donnée elle est représentée par object[key1]+object[key2]+object[key3]+....
        let checkedValue = "";
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
      this.calculData();
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
    let name = "";
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
      } else if (actualFilter['filterType'] == "string") {
        for (let i = 0; i < actualFilter.filters.length; i++) {
          if (actualFilter.filters[i].actif) {
            if (actualFilter.filters[i].listElem.includes(data)) {
              name = actualFilter.filters[i]['name'];
              break;
            }
          }
        }
      } else if (actualFilter['filterType'] == "date") {
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

  allowDrop(ev) {
    ev.preventDefault();
  }

  /**
   * Change le type du chart en fonction du type renseigné (tableau ou chart issu de la librairie Chart.js)
   * @param type 
   */
  changeChartView(type: string) {
    this.resetChartView();

    this.currentType = type.toLowerCase();

    switch (this.currentType) {
      case 'pie':
      case 'doughnut':
      case 'bar':
      case 'boxplot':
      case 'line':
        this.setCanvasSettings(true);
        this.modifyChartView(this.currentType);
        break;
      default:
        this.currentType = "tab";
        this.setCanvasSettings(false);
        break;
    }
  }

  /** 
  * Définit si le canvas (template d'apparition du chart) doit apparaître ou non
  * @param display 
  */
  setCanvasSettings(display: boolean) {
    this.myCanvas.nativeElement.style = 'display : none';
    if (display) { this.myCanvas.nativeElement.style = 'display : inline-block'; }

    this.context = (<HTMLCanvasElement>this.myCanvas.nativeElement).getContext('2d');

    this.resetCanvasHeightAndWidth();
  }

  /**
   * Création du chart en fonction des données inclues et du type donné
   * @param chartType
   */
  modifyChartView(chartType: string) {
    const chartData = [];
    const data = this.datasourceTable.map(val => val[this.droppedText]);

    const labels = [];

    const frequencies = this.frequencies(data).values;
    // tslint:disable-next-line: forin
    for (const key in frequencies) {
      labels.push(key);
      chartData.push(frequencies[key]);
    }

    const test = [];
    let inter = 0;
    for (let i = 0; i < labels.length; i++) {
      if (i % this.allColors.length === 0) {
        inter = 0;
      }
      test.push(this.allColors[inter]);
      inter++;
    }

    switch (chartType) {
      case 'boxplot':
        const boxplotData = {
          // define label tree
          labels,
          datasets: [{
            label: 'Dataset 1',
            backgroundColor: 'rgba(255,0,0,0.5)',
            borderColor: 'red',
            borderWidth: 1,
            outlierColor: '#000000',
            padding: 10,
            itemRadius: 0,
            data: [
              data
            ]
          }]
        };
        this.chart = new Chart(this.context, {
          type: 'horizontalBoxplot',
          data: boxplotData as ChartData,
          options: {
            responsive: true,
            legend: {
              position: 'top',
            },
            title: {
              display: true,
              text: 'Chart.js Box Plot Chart'
            }
          }
        });

        break;
      case 'pie':
      case 'doughnut':
        this.chart = new Chart(this.context, {
          type: chartType,
          data: {
            labels,
            datasets: [
              {
                data: chartData as number[],
                backgroundColor: test,
                borderColor: '#00000',
                fill: true
              }]
          },
          options: {
            legend: {
              display: false,
              position: 'bottom',
              labels: {
                fontSize: this.canvasFontSize
              }
            },
            responsive: false,
            maintainAspectRatio: true,
            'onClick': (event, item) => this.redirectTo(item),
          }
        });
        break;
      default:
        this.chart = new Chart(this.context, {
          type: chartType,
          data: {
            labels,
            datasets: [
              {
                data: chartData as number[],
                backgroundColor: test,
                borderColor: '#00000',
                fill: true
              }]
          },
          options: {
            legend: {
              display: false,
              position: 'bottom',
              labels: {
                fontSize: this.canvasFontSize
              }
            },
            responsive: false,
            maintainAspectRatio: true,
            'onClick': (event, item) => this.redirectTo(item),
            scales: {
              yAxes: [{
                ticks: {
                  beginAtZero: true,
                  fontColor: 'white'
                },
              }],
              xAxes: [{
                ticks: {
                  fontColor: 'white'
                }
              }]
            }
          }
        });
        break;
    }
  }


  redirectTo(item) {
    if (item.length > 0) { this.toastr.info("We want to redirect to : some URL (must be defined)"); }
  }

  frequencies(array: any[]) {
    const freqs = { values: {}, sum: 0 };
    array.map(function (a) {
      if (!(a in this.values)) {
        this.values[a] = 1;
      } else {
        this.values[a] += 1;
      }
      this.sum += 1;
      return a;
    }, freqs
    );
    return freqs;
  }

  resetChartView() {
    if (this.chart instanceof Chart) { this.chart.destroy(); }
  }

  deleteChartView() {
    const allContainedFour = document.getElementsByClassName('chartContainedFour').length;
    const allContained = document.getElementsByClassName('chartContained').length;
    const allCharts = document.getElementsByClassName('charts').length;
    const allChartsFour = document.getElementsByClassName('chartsFour').length;

    const chartsLength = allContained + allCharts + allChartsFour + allContainedFour;

    const divContainer = this.myCanvas.nativeElement.parentNode.parentNode.parentNode.parentNode;

    const templateContainer = document.getElementById('templates');
    templateContainer.appendChild(divContainer.firstChild);

    divContainer.parentNode.removeChild(divContainer);

    this.toParent.emit('destroyed');

    if (chartsLength === 2) {
      const mainContainer = document.getElementById('chartContainerDouble');
      mainContainer.setAttribute('id', 'chartContainerSimple');
    }
    else if (chartsLength === 3) this.resizeContainers();
  }

  /**
   * Interprète les données reçues par le parent
   * [0] message type
   * @param data
   */
  handleData(message: string) {

    const messageSplited = message.split('/');
    switch (messageSplited[0]) {
      case 'sendData':
        this.calculData();
        break;
      case 'sendFilter':
        // Si réception d'un nouveau filtre retransforme les données
        this.calculData();
        break;
      case 'notifyDataFetched':
        if (this.tableNames.includes(messageSplited[1])) {
          this.toParent.emit('askForData/' + this.instanceNumber + '/' + messageSplited[1]);
        }
        break;
      default:
        break;
    }
  }

  resizeContainers() {
    const allContained = Array.from(document.getElementsByClassName('chartContainedFour'));

    allContained.forEach(contained => {
      contained.setAttribute('class', 'chartContained');
    });

    const allContainers = Array.from(document.getElementsByClassName('chartsFour'));

    allContainers.forEach(container => {
      container.setAttribute('class', 'charts');
    })
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
      if (this.filters[i].filterType == "date") {
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

  /**
   * Say to the parents the active child
   */
  emitActiveInstance(event) {
    if (event.target.tagName != "I") {
      this.toParent.emit("setActif/" + this.instanceNumber)
      let filtre = "filtres/" + this.instanceNumber;
      this.toParent.emit(filtre);
      let message = "actif/" + this.instanceNumber + "/";
      for (let i = 0; i < this.tableNames.length; i++) {
        message += this.tableNames[i] + "/";
      }
      this.toParent.emit(message)
    }
  }

  calculData() {
    if(this.datas.length > 0 ){
      try{
        this.componentRef.destroy() ; 
      } catch(e) {
      }
    }
    this.loading = true ; 
    this.datasourceTable = Object.assign([],[]);
    this.datasourceTable = this.datas.filter(element => this.isNotExclude(element))
    this.multipleSort();
    this.spans = [];
    for (let i = 0; i < this.displayedColumns.length; i++) {
      this.cacheSpan(this.displayedColumns[i], i + 1);
    }
  }

  row_clear(id) {
    if (this.displayedColumns.length.valueOf() == 1) {
      this.displayedColumns.splice(id, 1);
      this.resetChartView();
      this.deleteChartView();
    }
    else {
      this.displayedColumns.splice(id, 1);
      this.calculData();
    }
  }
}
