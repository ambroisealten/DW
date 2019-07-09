import { Component, OnInit, ViewChildren, ViewContainerRef, QueryList, ComponentFactoryResolver } from '@angular/core';
import { LoadEcranService } from '../../services/load-ecran.service';
import { ChartScreenComponent } from '../chart-screen/chart-screen.component';
import { DataColumn } from '../../models/DataColumn';
import { DataService } from '../../services/data.service';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss']
})
export class ViewComponent implements OnInit {

  allTemplates: number;
  containerRepeat = 1;
  data: DataColumn[] = [];

  displayedName: string;
  id: number;

  private routeSub: Subscription;

  // Liste des entries pour les templates
  @ViewChildren('chartHost', { read: ViewContainerRef }) entries: QueryList<ViewContainerRef>;

  constructor(
    private loadEcranService: LoadEcranService,
    private componentFactoryResolver: ComponentFactoryResolver,
    private dataService: DataService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.routeSub = this.route.params.subscribe(params => {
      this.displayedName = params.name;
      this.id = params.id;
    });

    this.loadEcranService.loadEcran(this.id,this.displayedName).subscribe((data: any) => {

      console.log(JSON.parse(data.chart_saved).charts);
      let chartConfig = JSON.parse(data.chart_saved).charts;
      this.allTemplates = chartConfig.length; 

      this.fillTemplates();

      this.createDOMContainer(); 
      this.setDataChild(chartConfig);      
    });
    // Fetch data from all column stored
    for (const column of this.data) {
      this.dataService.fetchData(column.tableName, column.columnName).subscribe((dataFetched: any[]) => {
        column.values = dataFetched;
      });
    } 
  }
  ngOnDestroy(){
    this.routeSub.unsubscribe();
  }

  createDOMContainer(){
    while(this.containerRepeat != this.allTemplates){
      this.diviseChartsSegment() ; 
    }
  }

  fillTemplates(){
    let container = document.getElementById('templates');
    console.log("Avant l'usage d'Anaca 3 : "+container.childNodes.length);
    let acc = container.childNodes.length;
    console.log(this.allTemplates-1);
    console.log(acc);
    while(acc < this.allTemplates-1){
      let template = document.createElement('template');
      template.setAttribute('id',(container.childNodes.length+2).toString());
      container.appendChild(template);
      acc++;
    }
    console.log("Après une petite phalange dans le ionf : "+container.childNodes.length);
  }

  setDataChild(data){
    for(let i = 0 ; i < data.length ; i++){

      //On récupère l'entries de l'enfant
      const entryUsed = this.entries.toArray()[i];

      //On crée le composant enfant
      const componentFactory = this.componentFactoryResolver.resolveComponentFactory(ChartScreenComponent);
      let componentRef = entryUsed.createComponent(componentFactory);

      console.log(data[i]);

      componentRef.instance.type = data[i].type ; 
      componentRef.instance.filters = data[i].filters ; 
      componentRef.instance.tables = data[i].table ; 

      componentRef.instance.setView() ; 

    }
  }

  /**
 * Parcourt le div contenant les templates disponibles, et retourne la première contenue dans ce div
 */
  parseTemplateDiv() {
    let container = document.getElementById('templates');
    console.log(container);
    let childNodes = container.childNodes;
    console.log(childNodes);
    console.log(childNodes.length);
    childNodes.forEach( el => {
      console.log(el);
    });
    let test = container.firstChild;
    console.log(test);
    console.log(test.nodeName);
    while (test.nodeName != "TEMPLATE") {
      test = test.nextSibling;
    }
    return test;
  }

  /**
   * Permet d'ajouter les charts au DOM et de le dimensionner différemment selon le nombre de chart
   */
  diviseChartsSegment() {
    const chartContainer = document.getElementById('chartContainerSimple') == null ?
      document.getElementById('chartContainerDouble') : document.getElementById('chartContainerSimple');

    const allChartChilds = chartContainer.childNodes.length;

    this.containerRepeat += 1;
    const newDivForChart = document.createElement('div');
    newDivForChart.setAttribute('id', this.containerRepeat.toString());
    const template = this.parseTemplateDiv();
    newDivForChart.appendChild(template);
    if (allChartChilds < 2) chartContainer.setAttribute('id', 'chartContainerSimple');
    else chartContainer.setAttribute('id', 'chartContainerDouble');

    if (allChartChilds > 2) {
      newDivForChart.setAttribute('class', 'chartsFour');
      chartContainer.appendChild(newDivForChart);

    }
    else {
      newDivForChart.setAttribute('class', 'charts');

      chartContainer.appendChild(newDivForChart);
    }

  }

}
