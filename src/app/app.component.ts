import { Component, Directive, ViewContainerRef, ViewChild, ComponentFactoryResolver, OnInit, ViewChildren } from '@angular/core';
import { DataService } from './services/dataService';
import { DataScheme } from './models/dataScheme';
import { ChartViewComponent } from './components/chart-view/chart-view.component';
import { ViewService } from './services/viewService';
import { DataSet } from './models/dataSet';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'DW - Lot 0';
  containerRepeat = 1;

  @ViewChild('chart1Host', { read: ViewContainerRef, static: true }) entry1: ViewContainerRef;
  @ViewChild('chart2Host', { read: ViewContainerRef, static: false }) entry2: ViewContainerRef;
  @ViewChild('chart3Host', { read: ViewContainerRef, static: false }) entry3: ViewContainerRef;
  @ViewChild('chart4Host', { read: ViewContainerRef, static: false }) entry4: ViewContainerRef;

  allComponentRefs: any[] = [];

  componentRef: any;

  constructor(
    private dataService: DataService,
    private dataDetailService: DataService,
    private componentFactoryResolver: ComponentFactoryResolver) { }

  datas: DataScheme[] = [];

  ngOnInit() {
    this.dataService.fetchDataScheme().subscribe((response: string) => {
      console.log(response);
      // TODO Make that cutest as a puppy
      const datasFetched = JSON.parse(JSON.stringify(response));
      datasFetched.forEach(element => {
        this.datas.push(element as DataScheme);
      });
    });
    this.dataDetailService.getData().subscribe((response: string) => {
      console.log(response);
      const datasFetched = JSON.parse(JSON.stringify(response));
      datasFetched.forEach(element => {
        this.datas.push(element);
      });
    });
  }

  onDragField(ev, field: string) {
    ev.dataTransfer.setData('data', this.dataService.fetchData(field));
    ev.dataTransfer.setData('colName', field);
    ev.dataTransfer.setData('colNameDetail', field);
  }



  onDrop(ev) {
    const data = ev.dataTransfer.getData('data').split(',').map( el => {
      return parseFloat(el);
    });

    const fieldName = ev.dataTransfer.getData('colName');
    console.log("FIELDNAME     :   " + fieldName);
    const target = ev.target;

    if (target.className == 'charts' || target.className == 'chartsFour') {
      const instanceNumber = parseInt(target.id, 10);

      let entryUsed;

      switch (instanceNumber) {
        case 1:
          entryUsed = this.entry1;
          break;
        case 2:
          entryUsed = this.entry2;
          break;
        case 3:
          entryUsed = this.entry3;
          break;
        case 4:
          entryUsed = this.entry4;
          break;
        default:
          entryUsed = this.entry1;
          break;
      }

      let test = this.dataDetailService.getData();

      console.log(test);

      entryUsed.clear();
      const componentFactory = this.componentFactoryResolver.resolveComponentFactory(ChartViewComponent);
      this.componentRef = entryUsed.createComponent(componentFactory);

      this.componentRef.instance.instanceNumber = instanceNumber;
      this.componentRef.instance.viewService = ViewService.getInstance(instanceNumber);
      this.componentRef.instance.droppedText = fieldName;

      this.componentRef.instance.displayedColumns = [fieldName];
      this.componentRef.instance.dataSource = test;

      this.componentRef.instance.viewService.dataSet = new DataSet(fieldName, data);

      this.componentRef.instance.recheckValues();

      this.allComponentRefs.push(this.componentRef);

      if (this.containerRepeat > 2) {
        target.setAttribute('class', 'chartContainedFour');
      }
      else {
        target.setAttribute('class', 'chartContained');
      }
    }
    ev.preventDefault();
  }

  allowDrop(ev) {
    ev.preventDefault();
  }


  diviseChartsSegment() {
    const chartContainer = document.getElementById('chartContainerSimple') == null ?
      document.getElementById('chartContainerDouble') : document.getElementById('chartContainerSimple');

    this.containerRepeat += 1;

    if (this.containerRepeat > 4) {
      this.containerRepeat = 4;
    } else if (this.containerRepeat > 2) {
      const newDivForChart = document.createElement('div');
      newDivForChart.setAttribute('class', 'chartsFour');
      newDivForChart.setAttribute('id', this.containerRepeat.toString());

      const template = document.getElementById('templates').firstChild;
      document.getElementById('templates').removeChild(template);
      newDivForChart.appendChild(template);

      chartContainer.setAttribute('id', 'chartContainerDouble');
      chartContainer.appendChild(newDivForChart);

      if (this.containerRepeat == 3) {
        this.resizeAllCharts();
      }
    }
    else {
      const newDivForChart = document.createElement('div');
      newDivForChart.setAttribute('class', 'charts');
      newDivForChart.setAttribute('id', this.containerRepeat.toString());

      const template = document.getElementById('templates').firstChild;
      document.getElementById('templates').removeChild(template);
      newDivForChart.appendChild(template);

      chartContainer.setAttribute('id', 'chartContainerDouble');
      chartContainer.appendChild(newDivForChart);

      this.resizeAllCanvas();
    }

  }

  resizeAllCharts() {
    this.resizeBlankCharts();
    this.resizeContainedCharts();
    this.resizeAllCanvas();
  }

  resizeAllCanvas() {
    if (this.containerRepeat == 2 || this.containerRepeat == 3) {
      const allCanvas = Array.from(document.getElementsByTagName('canvas'));

      allCanvas.map(canvas => {
        if (this.containerRepeat == 2) {
          this.allComponentRefs.map(componentRef => {
            componentRef.instance.recheckValues();
          });
        }
        else if (this.containerRepeat == 3) {
          this.allComponentRefs.map(componentRef => {
            componentRef.instance.recheckValues();
          });
        }
      });
    }

  }

  resizeContainedCharts() {
    const containedCharts = document.getElementsByClassName('chartContained');

    const arr = Array.from(containedCharts);

    arr.forEach(chart => {
      chart.setAttribute('class', 'chartContainedFour');
    });
  }

  resizeBlankCharts() {
    const blankCharts = document.getElementsByClassName('charts');

    const arr = Array.from(blankCharts);

    arr.forEach(chart => {
      chart.setAttribute('class', 'chartsFour');
    });
  }
}

