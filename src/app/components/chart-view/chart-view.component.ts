import { Component, OnInit, Input, ChangeDetectorRef, ElementRef, ViewChild } from '@angular/core';
import { ViewService } from 'src/app/services/viewService';
import { DataSet } from 'src/app/models/dataSet';
import { Chart } from 'chart.js';
import { DataService } from 'src/app/services/dataService';
import { DataScheme } from 'src/app/models/dataScheme';
import { CdkDragStart, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-chart-view',
  templateUrl: './chart-view.component.html',
  styleUrls: ['./chart-view.component.scss']
})
export class ChartViewComponent implements OnInit {

  canvasWidth: number = 0;
  canvasHeight: number = 0;
  canvasFontSize: number;

  currentType: string = "tab";

  data: any[] = [];
  
  @ViewChild('myCanvas', { static: false }) myCanvas: ElementRef;
  public context: CanvasRenderingContext2D;

  chart: any = [];

  tasksList = [{ "name": "Tab", "function": "test()" }, { "name": "Pie", "function": "test()" }, { "name": "Doughnut", "function": "test()" }, { "name": "Bar", "function": "test()" }, { "name": "Line", "function": "test()" }];

  isTabView: boolean = true;

  spans = [];

  viewService: ViewService;
  @Input() instanceNumber: number;
  @Input() droppedText: string;
  @Input() displayedColumns : string[];
  @Input() dataSource: any[] = [];

  columns: any[] = [];
  datas: DataScheme[] = [];

  previousIndex: number;

  filter: any[] = [];

  constructor(private dataService: DataService) {
    this.viewService = ViewService.getInstance(this.instanceNumber);

  }

  ngOnInit() {
    this.data.push({ "name": this.droppedText, "vls": [12, 1, 0, 78, 69, 11, 45, 32, 69] });

    this.setDisplayedColumns();
    this.multipleSort();
    this.dataSource = this.datas;
    this.spans = [];
    for (let i = 0; i < this.displayedColumns.length; i++) {
      this.cacheSpan(this.displayedColumns[i], i + 1);
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
    this.resetCanvasHeightAndWidth();
  }

  recheckValues() {
    if (this.currentType != "tab") {
      this.resetChartView();

      this.resetCanvasHeightAndWidth();
      this.modifyChartView(this.currentType);
    }
  }

  resetCanvasHeightAndWidth(){
    this.myCanvas.nativeElement.width = (this.myCanvas.nativeElement.parentNode.parentNode.parentNode.parentNode.offsetWidth - 150).toString();
    this.myCanvas.nativeElement.height = (this.myCanvas.nativeElement.parentNode.parentNode.parentNode.parentNode.offsetHeight - 50).toString();
  }

  onDrop(ev) {
    const data = ev.dataTransfer.getData('data');
    const colName = ev.dataTransfer.getData('colName');

    this.displayedColumns.push(colName);
    
    console.log("DATAS §§§§§§§§§§§§§§     ");
    console.log(this.dataSource);
    
    this.setDisplayedColumns();
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
    console.log("PREVIOUS INDEX §§§§§§§§§§     " + this.previousIndex);
    console.log("INDEX §§§§§§§§§§     " + index);
    this.previousIndex = index;
  }

  dropListDropped(event: CdkDropList, index: number) {
    if (event) {
      moveItemInArray(this.columns, this.previousIndex, index);
      this.setDisplayedColumns();
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
        if (this.transform(a[this.displayedColumns[i]],this.displayedColumns[i]) !== this.transform(b[this.displayedColumns[i]],this.displayedColumns[i])) {
          return a[this.displayedColumns[i]] > b[this.displayedColumns[i]] ? 1 : -1;
        }
      }
    })
  }

  getRowSpan(col, index) {
    return this.spans[index] && this.spans[index][col];
  }

  setDisplayedColumns() {
    this.columns.forEach((colunm, index) => {
      colunm.index = index;
      this.displayedColumns[index] = colunm.name;
    });
  }

  transform(data, column) {
    this.filter.forEach(filter => {
      if (column === filter.filterColumn) {
        if (data >= filter.min && data <= filter.max) {
          data = '[' + filter.min + '-' + filter.max + ']';
        }
      }
    })
    return data;
  }

  allowDrop(ev) {
    ev.preventDefault();
  }

  changeChartView(args) {
    this.resetChartView();

    this.currentType = args.target.textContent.toLowerCase();

    switch (args.target.textContent) {
      case "Pie":
      case "Doughnut":
      case "Bar":
      case "Line":
        this.isTabView = false;

        this.setCanvasSettings(true);
        this.modifyChartView(args.target.textContent.toLowerCase());
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

    this.chart = new Chart(this.context, {
      type: chartType,
      data: {
        labels: labels,
        datasets: [
          {
            data: testData,
            backgroundColor: "#3cba9f",
            borderColor: "#00000",
            fill: true
          }]
      },
      options: {
        legend: {
          display: false,
          position: "right",
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

}
