import { Component, OnInit, Input, ChangeDetectorRef, ElementRef, ViewChild } from '@angular/core';
import { ViewService } from 'src/app/services/viewService';
import { DataSet } from 'src/app/models/dataSet';
import { Chart } from 'chart.js';
import { DataService } from 'src/app/services/dataService';
import { DataScheme } from 'src/app/models/dataScheme';

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

  viewService: ViewService;
  @Input() instanceNumber: number;
  @Input() droppedText: string;
  @Input() displayedColumns : string[];
  @Input() dataSource: any[];

  constructor(private dataService: DataService) {
    this.viewService = ViewService.getInstance(this.instanceNumber);
  }

  ngOnInit() {
     this.data.push({ "name": this.droppedText, "vls": [12, 1, 0, 78, 69, 11, 45, 32, 69] });
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

    ev.preventDefault();
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
