import { Component, OnInit, Input, ChangeDetectorRef, ElementRef, ViewChild } from '@angular/core';
import { ViewService } from 'src/app/services/viewService';
import { DataSet } from 'src/app/models/dataSet';
import { Chart } from 'chart.js';

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

  allDatas: DataSet[] = [];

  @ViewChild('myCanvas', { static: false }) myCanvas: ElementRef;
  public context: CanvasRenderingContext2D;

  chart: any = [];

  tasksList = [{ "name": "Tab", "function": "test()" }, { "name": "Pie", "function": "test()" }, { "name": "Doughnut", "function": "test()" }, { "name": "Bar", "function": "test()" }, { "name": "Line", "function": "test()" }];

  isTabView: boolean = true;

  viewService: ViewService;
  @Input() instanceNumber: number;
  @Input() droppedText : string;

  constructor(private cd: ChangeDetectorRef) {
    this.viewService = ViewService.getInstance(this.instanceNumber);
    
  }

  ngOnInit() {
    this.myCanvas.nativeElement.style = "display : none";
  }

  ngAfterViewInit() {
    this.allDatas.push(this.viewService.dataSet);

    this.context = (<HTMLCanvasElement>this.myCanvas.nativeElement).getContext('2d');

    switch (document.getElementsByClassName('chartContainerDouble').length) {
      case 0:
        this.canvasFontSize = 14;
        break;
      default:
        this.canvasFontSize = 10;
        break;
    }
    this.myCanvas.nativeElement.width = (this.myCanvas.nativeElement.parentNode.parentNode.parentNode.parentNode.offsetWidth - 150).toString();
    this.myCanvas.nativeElement.height = (this.myCanvas.nativeElement.parentNode.parentNode.parentNode.parentNode.offsetHeight - 50).toString();
  }

  recheckValues() {
    this.cd.detectChanges();

    if (this.currentType != "tab") {
      this.resetChartView();

      this.myCanvas.nativeElement.width = (this.myCanvas.nativeElement.parentNode.parentNode.parentNode.parentNode.offsetWidth - 150).toString();
      this.myCanvas.nativeElement.height = (this.myCanvas.nativeElement.parentNode.parentNode.parentNode.parentNode.offsetHeight - 50).toString();
      this.modifyChartView(this.currentType);
    }
  }

  onDrop(ev){
    const data = ev.dataTransfer.getData('data');
    const colName = ev.dataTransfer.getData('colName');

    console.log(this.allDatas);

    this.allDatas.push(new DataSet(colName,data));

    console.log(this.allDatas);

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
  }

  modifyChartView(chartType: string) {
    let test = this.viewService.dataSet.toString().split(',').map(el => parseFloat(el));

    this.chart = new Chart(this.context, {
      type: chartType,
      data: {
        labels: test.map(el => el.toString()),
        datasets: [
          {
            data: test,
            borderColor: "#3cba9f",
            fill: true
          }]
      },
      options: {
        legend: {
          display: true,
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
