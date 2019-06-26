import { Component, Directive, ViewContainerRef, ViewChild, ComponentFactoryResolver, OnInit, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { DataService } from './services/dataService';
import { DataScheme } from './models/dataScheme';
import { ChartViewComponent } from './components/chart-view/chart-view.component';
import { ViewService } from './services/viewService';
import { SelectionModel } from '@angular/cdk/collections';
import { MatTableDataSource } from '@angular/material/table';
import { environment } from 'src/environments/environment';
import { DataSet } from './models/dataSet';
import { Subject, Subscription, Observable } from 'rxjs';
import { DataTable } from './models/data';

export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
}

const ELEMENT_DATA: PeriodicElement[] = [
  { position: 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H' },
  { position: 2, name: 'Helium', weight: 4.0026, symbol: 'He' },
  { position: 3, name: 'Lithium', weight: 6.941, symbol: 'Li' },
  { position: 4, name: 'Beryllium', weight: 9.0122, symbol: 'Be' },
  { position: 5, name: 'Boron', weight: 10.811, symbol: 'B' },
  { position: 6, name: 'Carbon', weight: 12.0107, symbol: 'C' },
  { position: 7, name: 'Nitrogen', weight: 14.0067, symbol: 'N' },
  { position: 8, name: 'Oxygen', weight: 15.9994, symbol: 'O' },
  { position: 9, name: 'Fluorine', weight: 18.9984, symbol: 'F' },
  { position: 10, name: 'Neon', weight: 20.1797, symbol: 'Ne' },
];

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
  @ViewChildren('chartHost') templates: QueryList<ElementRef>;

  @ViewChild('chart1Host', { read: ViewContainerRef, static: true }) entry1: ViewContainerRef;
  @ViewChild('chart2Host', { read: ViewContainerRef, static: false }) entry2: ViewContainerRef;
  @ViewChild('chart3Host', { read: ViewContainerRef, static: false }) entry3: ViewContainerRef;
  @ViewChild('chart4Host', { read: ViewContainerRef, static: false }) entry4: ViewContainerRef;

  subjectRightPanel: Subject<any>;
  obsRightPanel: Observable<any>;

  allComponentsObs: Subject<any>[] = [];
  allComponentRefs: any[] = [];

  componentRef: any;
  datas: DataScheme[] = [];
  dataTable: DataTable[] = [];
  tableStored: string[] = [];
  i: number;
  charge = 0;
  value: any;
  elaspedTime: number;
  count: number;

  activeInstance: number;

  constructor(
    private dataService: DataService,
    private componentFactoryResolver: ComponentFactoryResolver) {
    this.subjectRightPanel = new Subject<any>();
    this.obsRightPanel = this.subjectRightPanel.asObservable();
  }

  ngOnInit() {
    this.i = 0;
    this.dataService.fetchDataScheme().subscribe(response => {
      (response as any[]).forEach(element => {
        const fields = [];
        Object.keys(element.fields).forEach(field => {
          fields.push({ name: field, type: element.fields[field] });
        });
        fields.sort((e1, e2) => e1.name > e2.name ? 1 : -1);
        this.datas.push({ name: element.name, fields: fields });
      });
    });
  }

  getData(tableName: string) {
    if (this.tableStored.includes(tableName)) {
      return this.dataTable.find(data => data.tableName === tableName);
    } else {
      return this.loadDataAsync(tableName);
    }
  }

  loadDataAsync(tableName: string) {
    this.charge = window.performance['memory']['usedJSHeapSize'] / 1000000;
    if (this.i === 0) {
      console.log('Start data loading');
    }
    if (this.charge < 1000) {
      this.dataService.getData(tableName, this.i * environment.maxSizePacket, environment.maxSizePacket).subscribe((response: any[]) => {
        if (response.length === 0) {
          this.i = 0;
          console.log('DATA LOADED - Final charge : ' + this.charge);
          return this.dataTable.find(data => data.tableName === tableName);
        }
        const datasFetched = response;
        this.dataTable.push(new DataTable(tableName, datasFetched));
        this.tableStored.push(tableName);
        this.loadDataAsync(tableName);
      });
      this.i += 1;
    } else {
      console.log('DATA LOADED - Final charge : ' + this.charge);
      return this.dataTable.find(data => data.tableName === tableName);
    }
  }

  onDragField(ev, field: string, name) {
    ev.dataTransfer.setData('colName', field);
    ev.dataTransfer.setData('colNameDetail', field);
    ev.dataTransfer.setData('tableName', name);
    ev.dataTransfer.setData('data', JSON.stringify(this.getData(name)));
  }



  onDrop(ev) {

    const fieldName = ev.dataTransfer.getData('colName');
    const target = ev.target;

    if (target.className == 'charts' || target.className == 'chartsFour') {
      const instanceNumber = parseInt(target.id, 10);

      const entryUsed = this.entries.toArray()[target.id - 1];

      const componentFactory = this.componentFactoryResolver.resolveComponentFactory(ChartViewComponent);
      this.componentRef = entryUsed.createComponent(componentFactory);

      this.componentRef.instance.instanceNumber = instanceNumber;
      this.activeInstance = instanceNumber;
      this.componentRef.instance.viewService = ViewService.getInstance(instanceNumber);
      this.componentRef.instance.droppedText = fieldName;

      this.componentRef.instance.displayedColumns = [fieldName];
      this.componentRef.instance.tableNames.push(ev.dataTransfer.getData('tableName'));
      const data = this.getData(ev.dataTransfer.getData('tableName'));
      this.componentRef.instance.data.push(data);

      //Child Event emit
      const subChild: Subscription = this.componentRef.instance.toParent.subscribe(message => this.handleMessageFromChild(message));
      this.componentRef.onDestroy(() => subChild.unsubscribe());

      //Observable
      const sub = new Subject<any>();
      this.componentRef.instance.parentObs = sub.asObservable();
      this.componentRef.instance.setSubscription();
      this.allComponentsObs.push(sub);

      this.subjectRightPanel.next(this.datas.find(data => data.name === ev.dataTransfer.getData('tableName')));

      this.componentRef.instance.recheckValues();

      this.allComponentRefs.push(this.componentRef);

      if (this.containerRepeat > 2) {
        target.setAttribute('class', 'chartContainedFour');
      } else {
        target.setAttribute('class', 'chartContained');
      }

    }
    ev.preventDefault();
  }

  handleMessageFromChild(message) {
  }

  messageReceiveFromRightPanel($event) {
    this.allComponentsObs[this.activeInstance - 1].next($event);
  }

  allowDrop(ev) {
    ev.preventDefault();
  }

  parseTemplateDiv(idNumber: string) {
    const container = document.getElementById('templates');
    let test = container.firstChild;
    while (test.nodeName != 'TEMPLATE') {
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
        } else if (this.containerRepeat == 3) {
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

