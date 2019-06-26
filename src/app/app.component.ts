import { Component, Directive, ViewContainerRef, ViewChild, ComponentFactoryResolver, OnInit, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { DataService } from './services/dataService';
import { DataScheme } from './models/dataScheme';
import { ChartViewComponent } from './components/chart-view/chart-view.component';
import { Subject, Subscription, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'DW - Lot 0';

  //Variables d'environnement pour la création des templates
  containerRepeat = 1;
  allTemplates = new Array(environment.maxTemplates);

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
      this.activeInstance = this.allComponentsObs.length+1;

      //!\ INUTILE TO SUPPR 
      this.componentRef.instance.droppedText = fieldName;

      this.componentRef.instance.displayedColumns = [fieldName];
      this.componentRef.instance.datas = this.datasDetails;

      //Initialisation de la communication Parent enfant
      //Enfant vers Parent
      const subChild: Subscription = this.componentRef.instance.toParent.subscribe(message => this.handleMessageFromChild(message));
      this.componentRef.onDestroy(() => subChild.unsubscribe());

      //Observable Parent vers Enfant
      let sub = new Subject<any>();
      this.componentRef.instance.parentObs = sub.asObservable();
      this.componentRef.instance.setSubscription();
      this.allComponentsObs.push(sub);

      //On initialise les données à destination de param view
      this.subjectRightPanel.next(this.datas.find(data => data.name == ev.dataTransfer.getData('tableName')));

      //On ré-initialise les tailles de l'instance créée
      this.componentRef.instance.recheckValues();

      this.allComponentRefs.push(this.componentRef);

      const allChartChilds = document.getElementsByTagName('nav')[0].nextSibling.childNodes.length;

      //Changement de l'attribut selon le nombre de graphe présent
      if (allChartChilds > 3) {
        target.setAttribute('class', 'chartContainedFour');
      }
      else {
        target.setAttribute('class', 'chartContained');
      }

    }
    ev.preventDefault();
  }

  /**
   * 
   * @param message 
   */
  handleMessageFromChild(message) {
    
  }

  /**
   * Reception des messages venus du panel de droite
   */
  messageReceiveFromRightPanel($event) {
    //Envoi des filtres vers l'enfant
    this.allComponentsObs[this.activeInstance - 1].next($event);
  }

  /**
   * Permet d'activer le drop
   */
  allowDrop(ev) {
    ev.preventDefault();
  }

  /**
   * Parcourt le div contenant les templates disponibles, et retourne la première contenue dans ce div
   * @param idNumber 
   */
  parseTemplateDiv(idNumber: string) {
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

    const allChartChilds = document.getElementsByTagName('nav')[0].nextSibling.childNodes.length;

    this.containerRepeat += 1;
    const newDivForChart = document.createElement('div');
    newDivForChart.setAttribute('id', this.containerRepeat.toString());
    const template = this.parseTemplateDiv(this.containerRepeat.toString());
    newDivForChart.appendChild(template);
    chartContainer.setAttribute('id', 'chartContainerDouble');

    if (allChartChilds > 2) { 
      newDivForChart.setAttribute('class', 'chartsFour');
      chartContainer.appendChild(newDivForChart);

      this.resizeAllCharts();
    }
    else {
      newDivForChart.setAttribute('class', 'charts');

      chartContainer.appendChild(newDivForChart);

      this.resizeAllCanvas();
    }
    
  }

  resizeAllCharts() {
    this.resizeBlankCharts();
    this.resizeContainedCharts();
    this.resizeAllCanvas();
  }

  /**
   * Permet de redimmensionner tous les canvas/tableaux lors d'un changement
   */
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

  /**
   * Permet de redimmensionner le container des charts (avec un fils) lors d'un changement
   */
  resizeContainedCharts() {
    const containedCharts = document.getElementsByClassName('chartContained');

    const arr = Array.from(containedCharts);

    arr.forEach(chart => {
      chart.setAttribute('class', 'chartContainedFour');
    });
  }

  /**
   * Permet de redimensionner le container des charts (sans fils) lors d'un changement
   */
  resizeBlankCharts() {
    const blankCharts = document.getElementsByClassName('charts');

    const arr = Array.from(blankCharts);

    arr.forEach(chart => {
      chart.setAttribute('class', 'chartsFour');
    });
  }
}

