import { WebworkerService } from '../../workers/webworker.service';
import { DATA_IMPORT } from '../../workers/data.script';
import { Component, OnInit, ViewChildren, ViewContainerRef, QueryList, ComponentFactoryResolver } from '@angular/core';
import { LoadEcranService } from '../../services/load-ecran.service';
import { DataColumn } from '../../models/DataColumn';
import { HttpClient } from '@angular/common/http';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss']
})
export class ViewComponent implements OnInit {

  allTemplates = 0;
  containerRepeat = 1;
  data: DataColumn[] = [];

  // Liste des entries pour les templates
  @ViewChildren('chartHost', { read: ViewContainerRef }) entries: QueryList<ViewContainerRef>;

  constructor(
    private workerService: WebworkerService,
    private loadEcranService: LoadEcranService,
    private componentFactoryResolver: ComponentFactoryResolver,
    private dataService: DataService
  ) { }

  ngOnInit() {
    this.loadEcranService.loadEcran().subscribe((data: any[]) => {
      this.allTemplates = data.length;
    });
    // Fetch data from all column stored
    for (const column of this.data) {
      this.dataService.fetchData(column.tableName, column.columnName).subscribe((dataFetched: any[]) => {
        column.values = dataFetched;
      });
    }
  }

  /**
   * delegue la récupération des données à un web worker
   */
  delegateFetchData() {
    const input = {
      context: window,
      body: {
        tableName: 'Serie',
        columnName: 'ID'
      }
    };
    console.log(input);
    this.workerService.run(DATA_IMPORT, input).then(
      (result) => {
        const res = result as unknown as DataColumn;
        this.data.push(new DataColumn(res.tableName, res.columnName, res.values));
        console.log(this.data);
      }
    ).catch(console.error);
  }

  /**
 * Parcourt le div contenant les templates disponibles, et retourne la première contenue dans ce div
 * @param idNumber 
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

    const allChartChilds = document.getElementsByTagName('nav')[0].nextSibling.childNodes.length;

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
    let latestActive = document.getElementsByClassName('containerActive')[0];
    if (latestActive != null) {
      let latestActiveClass = latestActive.getAttribute('class').split('containerActive')[1];
      latestActive.setAttribute('class', latestActiveClass);
    }
  }

}
