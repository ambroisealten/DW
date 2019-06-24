import { Component, Directive, ViewContainerRef, ViewChild, ComponentFactoryResolver, OnInit, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { DataService } from './services/dataService';
import { DataScheme } from './models/dataScheme';
import { ChartViewComponent } from './components/chart-view/chart-view.component';
import { ViewService } from './services/viewService';
import {environment} from 'src/environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'DW - Lot 0';
  containerRepeat = 1;

  allTemplates = new Array(environment.maxTemplates);

  @ViewChildren('chartHost', { read: ViewContainerRef }) entries: QueryList<ViewContainerRef>;
  @ViewChildren('chartHost') templates : QueryList<ElementRef>;

  @ViewChild('chart1Host', { read: ViewContainerRef, static: true }) entry1: ViewContainerRef;
  @ViewChild('chart2Host', { read: ViewContainerRef, static: false }) entry2: ViewContainerRef;
  @ViewChild('chart3Host', { read: ViewContainerRef, static: false }) entry3: ViewContainerRef;
  @ViewChild('chart4Host', { read: ViewContainerRef, static: false }) entry4: ViewContainerRef;

  allComponentRefs: any[] = [];

  componentRef: any;

  constructor(
    private dataService: DataService,
    private componentFactoryResolver: ComponentFactoryResolver) { }

  datas: DataScheme[] = [];

  ngOnInit() {
    this.dataService.fetchDataScheme().subscribe((response: string) => {
      // TODO Make that cutest as a puppy
      const datasFetched = JSON.parse(JSON.stringify(response));
      datasFetched.forEach(element => {
        this.datas.push(element as DataScheme);
      });
    });
  }


  onDragField(ev, field: string) {
    ev.dataTransfer.setData('data', this.dataService.fetchData(field));
    ev.dataTransfer.setData('colName', field);
  }

  onDrop(ev) {

    const fieldName = ev.dataTransfer.getData('colName');
    const target = ev.target;

    if (target.className == 'charts' || target.className == 'chartsFour') {
      const instanceNumber = parseInt(target.id, 10);

      let entryUsed = this.entries.toArray()[target.id - 1];

      const componentFactory = this.componentFactoryResolver.resolveComponentFactory(ChartViewComponent);
      this.componentRef = entryUsed.createComponent(componentFactory);

      this.componentRef.instance.instanceNumber = instanceNumber;
      this.componentRef.instance.viewService = ViewService.getInstance(instanceNumber);
      this.componentRef.instance.droppedText = fieldName;

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

  parseTemplateDiv(idNumber : string){
    let container = document.getElementById('templates');
    let test = container.firstChild;
    while(test.nodeName != "TEMPLATE" && test.id != idNumber){
      test = test.nextSibling;
    }
    return test;
  }
  
  diviseChartsSegment() {
    const chartContainer = document.getElementById('chartContainerSimple') == null ?
      document.getElementById('chartContainerDouble') : document.getElementById('chartContainerSimple');

      this.containerRepeat += 1;

    if (this.containerRepeat > 2) {
      const newDivForChart = document.createElement('div');
      newDivForChart.setAttribute('class', 'chartsFour');
      newDivForChart.setAttribute('id', this.containerRepeat.toString());

      
      const template = this.parseTemplateDiv(this.containerRepeat.toString());
      newDivForChart.appendChild(template);

      chartContainer.setAttribute('id', 'chartContainerDouble');
      chartContainer.appendChild(newDivForChart);

      this.resizeAllCharts();
    }
    else {
      const newDivForChart = document.createElement('div');
      newDivForChart.setAttribute('class', 'charts');
      newDivForChart.setAttribute('id', this.containerRepeat.toString());

      const template = this.parseTemplateDiv(this.containerRepeat.toString());
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

