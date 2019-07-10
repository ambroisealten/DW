import { Component, OnInit, ViewChildren, ViewContainerRef, QueryList, ComponentFactoryResolver } from '@angular/core';
import { LoadEcranService } from '../../services/load-ecran.service';
import { ChartScreenComponent } from '../chart-screen/chart-screen.component';
import { DataColumn } from '../../models/DataColumn';
import { DataService } from '../../services/data.service';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { WebworkerService } from '../../workers/webworker.service';
import { DATA_TRANSFORM_TO_OBJECT } from '../../workers/data.script';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss']
})
export class ViewComponent implements OnInit {

  templatesTab = new Array(environment.maxTemplates);
  allTemplates: number;
  containerRepeat = 1;
  data: DataColumn[] = [];

  displayedName: string;
  id: number;

  private routeSub: Subscription;

  //Tableau des refs vers les childs
  allComponentRefs: any[] = [];

  // Liste des entries pour les templates
  @ViewChildren('chartHost', { read: ViewContainerRef }) entries: QueryList<ViewContainerRef>;

  constructor(
    private loadEcranService: LoadEcranService,
    private componentFactoryResolver: ComponentFactoryResolver,
    private dataService: DataService,
    private route: ActivatedRoute,
    private workerService: WebworkerService
  ) { }

  ngOnInit() {
    this.routeSub = this.route.params.subscribe(params => {
      this.displayedName = params.name;
      this.id = params.id;
    });

    this.loadEcranService.loadEcran(this.id, this.displayedName).subscribe((data: any) => {
      let chartConfig = JSON.parse(data.chart_saved).charts;
      this.allTemplates = chartConfig.length;

      chartConfig.forEach(chartConf => {
        chartConf.table.column.forEach(column => {
          this.data.push(new DataColumn(chartConf.table.name, column, []));
        });
      });

      //this.fillTemplates();

      // Fetch data from all column stored
      for (const column of this.data) {
        this.dataService.fetchData(column.tableName, column.columnName).subscribe((dataFetched: any[]) => {
          column.values = dataFetched;
          const indexOf = this.data.indexOf(column);

          const input = {
            body: {
              data: this.data
            }
          };
          this.workerService.run(DATA_TRANSFORM_TO_OBJECT, input).then(
            (result) => {
              this.allComponentRefs[indexOf].instance.datas = result;
              this.allComponentRefs[indexOf].instance.setView();
            }
          ).catch(console.error);

          document.getElementById((indexOf + 1).toString()).setAttribute('class', 'chartContained');
        });
      }

      this.createDOMContainer();
      this.setDataChild(chartConfig);
    });

  }
  ngOnDestroy() {
    this.routeSub.unsubscribe();
  }

  createDOMContainer() {
    while (this.containerRepeat != this.allTemplates) {
      this.diviseChartsSegment();
    }
  }

  fillTemplates() {
    let container = document.getElementById('templates');
    let acc = container.childNodes.length;
    while (acc < this.allTemplates - 1) {
      let template = document.createElement('template');
      template.setAttribute('id', (container.childNodes.length + 102).toString());
      container.appendChild(template);
      acc++;
    }
  }

  setDataChild(data) {
    for (let i = 0; i < data.length; i++) {

      //On récupère l'entries de l'enfant
      const entryUsed = this.entries.toArray()[i];

      //On crée le composant enfant
      const componentFactory = this.componentFactoryResolver.resolveComponentFactory(ChartScreenComponent);
      let componentRef = entryUsed.createComponent(componentFactory);

      componentRef.instance.type = data[i].type;
      componentRef.instance.filters = data[i].filters;
      componentRef.instance.tables = data[i].table;
      componentRef.instance.datas = [];

      this.allComponentRefs.push(componentRef);
    }
  }

  /**
 * Parcourt le div contenant les templates disponibles, et retourne la première contenue dans ce div
 */
  parseTemplateDiv() {
    let container = document.getElementById('templates');
    let test = container.firstChild;
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
