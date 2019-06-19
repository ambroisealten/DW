import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
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

  allColors = ["blue","red","green","yellow","pink","cyan","orange","marroon","salmon","grey"];

  data: any[] = [];

  @ViewChild('myCanvas', { static: false }) myCanvas: ElementRef;
  public context: CanvasRenderingContext2D;

  chart: any = [];

  tasksList = [{ "name": "Tab", "function": "test()" }, { "name": "Pie", "function": "test()" }, { "name": "Doughnut", "function": "test()" }, { "name": "Bar", "function": "test()" }, { "name": "Line", "function": "test()" }];

  isTabView: boolean = true;

  @Input() instanceNumber: number;
  @Input() droppedText: string;

  constructor() {
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
    for(let i =0; i <labels.length; i++){
      if(i%this.allColors.length == 0){
        inter = 0;
      }
      test.push(this.allColors[inter]);
      inter++;
    }

    console.log(test);

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
          display: true,
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

}
