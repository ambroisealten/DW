import { Component, ElementRef, Input, OnInit, ViewChild, OnDestroy, Output, EventEmitter } from '@angular/core';
import { Chart } from 'chart.js';
import { DataService } from 'src/app/services/dataService';
import { DataScheme } from 'src/app/models/dataScheme';
import { CdkDragStart, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { Observable } from 'rxjs';
import { FilterList } from './filterClass';
import { filter } from 'minimatch';

@Component({
  selector: 'app-chart-view',
  templateUrl: './chart-view.component.html',
  styleUrls: ['./chart-view.component.scss']
})
export class ChartViewComponent implements OnInit, OnDestroy {

  //Data binding to Parent
  @Output() public toParent: EventEmitter<string> = new EventEmitter();

  canvasWidth: number = 0;
  canvasHeight: number = 0;
  canvasFontSize: number;

  currentType: string = "tab";

  allColors = ["blue", "red", "green", "yellow", "pink", "cyan", "orange", "white", "salmon", "grey"];

  data: any[] = [];

  @ViewChild('myCanvas', { static: false }) myCanvas: ElementRef;
  public context: CanvasRenderingContext2D;

  chart: any = [];

  tasksList = [{ "name": "Tab", "function": "test()" }, { "name": "Pie", "function": "test()" }, { "name": "Doughnut", "function": "test()" }, { "name": "Bar", "function": "test()" }, { "name": "Line", "function": "test()" }];

  isTabView: boolean = true;

  spans = [];
  filters: FilterList[] = [];

  @Input() instanceNumber: number;
  @Input() droppedText: string;
  @Input() displayedColumns: string[];
  @Input() dataSource: any[] = [];

  datas: DataScheme[] = [];

  previousIndex: number;

  //Observable parents
  @Input() parentObs: Observable<any>;
  parentSub;

  constructor() {
  }

  ngOnInit() {
    this.data.push({ "name": this.droppedText, "vls": [12, 1, 0, 78, 69, 11, 45, 32, 69] });

    this.multipleSort();
    this.dataSource = this.datas;
    this.spans = [];
    for (let i = 0; i < this.displayedColumns.length; i++) {
      this.cacheSpan(this.displayedColumns[i], i + 1);
    }
  }

  ngOnDestroy() {
    if (this.parentSub != undefined) {
      this.parentSub.unsubscribe();
    }
  }

  ngAfterViewInit() {
    this.context = (<HTMLCanvasElement>this.myCanvas.nativeElement).getContext('2d');

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

  recheckValues() {

    if (this.currentType != "tab") {
      this.resetChartView();
      this.resetCanvasHeightAndWidth();
      this.modifyChartView(this.currentType);
    }
  }

  setSubscription() {
    if (this.parentSub == undefined) {
      this.parentSub = this.parentObs.subscribe(data => this.handleData(data));
    }
  }

  resetCanvasHeightAndWidth() {
    this.myCanvas.nativeElement.width = (this.myCanvas.nativeElement.parentNode.parentNode.parentNode.parentNode.offsetWidth - 150).toString();
    this.myCanvas.nativeElement.height = (this.myCanvas.nativeElement.parentNode.parentNode.parentNode.parentNode.offsetHeight - 50).toString();
  }

  onDrop(ev) {
    const data = ev.dataTransfer.getData('data');
    const colName = ev.dataTransfer.getData('colName');

    this.displayedColumns.push(colName);

    // this.setDisplayedColumns();
    this.multipleSort();
    this.dataSource = this.datas;
    this.spans = [];
    for (let i = 0; i < this.displayedColumns.length; i++) {
      this.cacheSpan(this.displayedColumns[i], i + 1);
    }

    ev.preventDefault();
  }

  /**
   * Evaluated and store an evaluation of the rowspan for each row.
   * The key determines the column it affects, and the accessor determines the
   * value that should be checked for spanning.
   */
  cacheSpan(key, accessor) {
    for (let i = 0; i < this.datas.length;) {
      let currentValue = "";
      for (let k = 0; k < accessor; k++) {
        currentValue += this.transform(this.datas[i][this.displayedColumns[k]], this.displayedColumns[k]);
      }
      let count = 1;

      // Iterate through the remaining rows to see how many match
      // the current value as retrieved through the accessor.
      for (let j = i + 1; j < this.datas.length; j++) {
        let checkedValue = "";
        for (let h = 0; h < accessor; h++) {
          checkedValue += this.transform(this.datas[j][this.displayedColumns[h]], this.displayedColumns[h]);
        }
        if (currentValue != checkedValue) {
          break;
        }

        count++;
      }

      if (!this.spans[i]) {
        this.spans[i] = {};
      }

      // Store the number of similar values that were found (the span)
      // and skip i to the next unique row.
      this.spans[i][key] = count;
      i += count;
    }
  }

  dragStarted(event: CdkDragStart, index: number) {
    this.previousIndex = index;
  }

  dropListDropped(event: CdkDropList, index: number) {
    if (event) {
      moveItemInArray(this.displayedColumns, this.previousIndex, index);
      this.multipleSort();
      this.dataSource = this.datas;
      this.spans = [];
      for (let i = 0; i < this.displayedColumns.length; i++) {
        this.cacheSpan(this.displayedColumns[i], i + 1);
      }
    }
  }

  multipleSort() {
    this.datas.sort((a, b) => {
      for (let i = 0; i < this.displayedColumns.length; i++) {
        if (this.transform(a[this.displayedColumns[i]], this.displayedColumns[i]) !== this.transform(b[this.displayedColumns[i]], this.displayedColumns[i])) {
          return a[this.displayedColumns[i]] > b[this.displayedColumns[i]] ? 1 : -1;
        }
      }
    })
  }

  getRowSpan(col, index) {
    return this.spans[index] && this.spans[index][col];
  }

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

  changeChartView(type: string) {
    this.resetChartView();

    this.currentType = type.toLowerCase();

    switch (this.currentType) {
      case 'pie':
      case 'doughnut':
      case 'bar':
      case 'line':
        this.isTabView = false;

        this.setCanvasSettings(true);
        this.modifyChartView(this.currentType);
        break;
      default:
        this.isTabView = true;

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

  handleData(data) {
    this.filters = data;
    this.multipleSort();
    this.dataSource = this.datas;
    this.spans = [];
    for (let i = 0; i < this.displayedColumns.length; i++) {
      this.cacheSpan(this.displayedColumns[i], i + 1);
    }
  }

  isNotExclude(data, column) {
    return !this.filters.find(filter => filter.filterColumn == column).excludeValue.includes(data + "");
  }

}
