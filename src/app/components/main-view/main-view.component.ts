import { Component, ComponentFactoryResolver, OnInit, QueryList, ViewChild, ViewChildren, ViewContainerRef } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Observable, of, Subject, Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ChartViewComponent } from '../../components/chart-view/chart-view.component';
import { ParamViewComponent } from '../../components/param-view/param-view.component';
import { DataTable } from '../../models/data';
import { DataScheme } from '../../models/dataScheme';
import { DataService } from '../../services/dataService';
import { SaveChart, SaveChartTable, ChartsScreen } from 'src/app/models/saveCharts';
import { SaveJsonCharts } from 'src/app/services/saveJsonChart';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-main-view',
  templateUrl: './main-view.component.html',
  styleUrls: ['./main-view.component.scss']
})
export class MainViewComponent implements OnInit {

  //Titre de l'application
  title = 'DW - Lot 1';
  percentageOfPreloadEnded = 0;

  //Variable d'environnement pour la création des templates
  containerRepeat = 1;


  //Nombre de templates
  allTemplates = new Array(environment.maxTemplates);

  //Liste des entries pour les templates
  @ViewChildren('chartHost', { read: ViewContainerRef }) entries: QueryList<ViewContainerRef>;

  //Communication vers le panel droit c-à-d gestion des groupements & tris
  @ViewChild(ParamViewComponent, { static: true }) paramView;

  //Tableau des refs vers les childs
  allComponentRefs: any[] = [];

  componentRef: any;

  //Information sur les tables & champs
  datas: DataScheme[] = [];
  dataTable: DataTable[] = [];
  tableStored: string[] = [];
  activeTable = [];
  allInstance: boolean[] = [];
  allDivs: number[] = [1];

  //Instance active
  activeInstance: number;

  //spinner 
  loading = false;

  //paramètres de récupération d'une configuration (existante ou non)
  private routeSub: Subscription;
  idConfig: number;
  chartsConfig: any;

  constructor(
    private dataService: DataService,
    private saveChartService: SaveJsonCharts,
    private componentFactoryResolver: ComponentFactoryResolver,
    private toastr: ToastrService,
    private route: ActivatedRoute) {
  }


  ngOnInit() {
    for (let i = 0; i < environment.maxTemplates; i++) {
      this.allInstance.push(false);
    }
    //Récupération des données sur les tables et les champs
    this.dataService.fetchDataScheme().subscribe(response => {

      (response as any[]).forEach(element => {
        const fields = [];
        Object.keys(element.fields).forEach(field => {
          fields.push({ name: field, type: element.fields[field] });
        });
        fields.sort((e1, e2) => e1.name > e2.name ? 1 : -1);
        this.datas.push({ name: element.name, fields: fields });
        this.activeTable.push({ name: element.name, fields: fields });
      });
      setTimeout(() => {
        for (const table of this.datas) {
          this.dataTable.push(new DataTable(table.name, []));
          this.loadDataAsync(0, table.name, 0, this.dataTable, this.allComponentRefs);
        }
      }, 30);
    });
  }

  ngAfterViewInit() {
    this.routeSub = this.route.params.subscribe(params => {
      if (params.id != undefined) {
        this.idConfig = params.id;
        this.dataService.getConfiguration(this.idConfig).subscribe((response: any) => {
          this.chartsConfig = JSON.parse(response.chart_saved);
          this.configRecuperation();
        });
      }
    });
  }

  loadDataAsync(count: number, tableName: string, i: number, dataTable: DataTable[], allComponentsRefs) {
    const charge = window.performance['memory']['usedJSHeapSize'] / 1000000;
    this.percentageOfPreloadEnded = charge / environment.maxLoadDataCharge * 100;
    if (i === 0) {
      this.tableStored.push(tableName);
    }
    if (charge < environment.maxLoadDataCharge) {
      this.dataService.getData(tableName, i * environment.maxSizePacket, environment.maxSizePacket)
        .subscribe((datasFetched: any[]) => {
          if (datasFetched.length === 0) {
            return;
          }
          Array.prototype.push.apply(dataTable.find(data => data.tableName === tableName).values, datasFetched);
          i += 1;
          allComponentsRefs.forEach(componentRef => {
            componentRef.instance.askForData(tableName)
          });
          this.loadDataAsync(0, tableName, i, dataTable, allComponentsRefs);
        });
    } else {
      if (count < 3) {
        setTimeout(() => { this.loadDataAsync(count + 1, tableName, i, dataTable, allComponentsRefs); }, 2000);
      } else {
        return;
      }
    }

  }

  getData(tableName: string) {
    if (this.tableStored.includes(tableName)) {
      return of(this.dataTable.find(data => data.tableName === tableName).values);
    } else {
      const req = this.dataService.getData(tableName, 0, 10000);
      req.subscribe((dataFetched: any[]) => {
        this.dataTable.push(new DataTable(tableName, dataFetched));
      });
      return req;
    }
  }

  /**************************************************************************************************\
  * 
  *                                        GESTION DU DRAG DES ELEMENTS
  * 
  \**************************************************************************************************/

  /**
   * Permet d'initialiser les données que l'on souhaite envoyer par rapport à ce qui a été drag
   * @param ev 
   * @param field 
   * @param name 

   */
  onDragField(ev, field: string, name) {
    ev.dataTransfer.setData('colName', field);
    ev.dataTransfer.setData('colNameDetail', field);
    ev.dataTransfer.setData('tableName', name);
  }



  /**
   * Une fois la donnée drop, on créé un nouveau fils 
   * @param ev 
   */
  onDrop(ev) {
    const target = ev.target;
    this.loading = true;

    //On vérifie que l'élément drag est bien celui qui initialise les données de l'enfant
    if (target.className == 'charts' || target.className == 'chartsFour') {
      //On récupère les données du drag
      const fieldName = ev.dataTransfer.getData('colName');
      const tableName = ev.dataTransfer.getData('tableName');
      this.createNewChild(fieldName, tableName, target.id,false);

      const allChartChilds = document.getElementsByTagName('nav')[0].nextSibling.childNodes.length;

      //Changement de l'attribut selon le nombre de graphe présent
      if (allChartChilds > 3) {
        target.setAttribute('class', 'chartContainedFour');
      } else {
        target.setAttribute('class', 'chartContained');
      }
    }
    ev.preventDefault();
  }

  /**
   * Initialise le tableau enfant avec les données et met en place le réseau de communication
   * @param fieldName 
   * @param tableName 
   * @param targetId 
   */
  createNewChild(fieldName, tableName, targetId,hasFilter) {
    const tableInfo = this.datas.find(data => data.name == tableName);

    //On détermine l'id de l'enfant 
    let instanceNumber = targetId;

    //On récupère l'entries de l'enfant
    let entryUsed = this.entries.toArray()[targetId - 1];
    entryUsed.clear();
    //On crée le composant enfant
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(ChartViewComponent);
    this.componentRef = entryUsed.createComponent(componentFactory);

    this.componentRef.instance.setSpin();


    //"Sauvegarde" de la ref
    this.allComponentRefs[instanceNumber - 1] = this.componentRef;

    //On Initialise les variables 
    this.componentRef.instance.tableInfo = tableInfo;
    this.componentRef.instance.instanceNumber = instanceNumber;
    this.activeInstance = instanceNumber;
    this.allInstance[instanceNumber - 1] = true;

    //!\ INUTILE TO SUPPR 
    this.componentRef.instance.droppedText = fieldName;


    this.componentRef.instance.displayedColumns = [fieldName];
    this.componentRef.instance.tableNames.push(tableName);
    this.getData(tableName).subscribe(dataFetched => {
      this.componentRef.instance.datas = dataFetched;
      this.componentRef.instance.calculData();
      this.paramView.data = dataFetched;
      this.paramView.tableInfo = tableInfo;
      this.paramView.actif = instanceNumber;
      //On initialise les données à destination de param view
      if(!hasFilter) this.paramView.setColonnesAndFilters();
      this.paramView.filterList = this.componentRef.instance.filters;
    });

    this.activeTable = [];
    this.activeTable.push(this.datas.find(element => element.name === tableName));

    //Initialisation de la communication Parent enfant
    //Enfant vers Parent
    const subChild: Subscription = this.componentRef.instance.toParent.subscribe(message => this.handleMessageFromChild(message));
    this.componentRef.onDestroy(() => subChild.unsubscribe());


    //Remove the border of the (potentially) latest active child
    let latestActive = document.getElementsByClassName('containerActive')[0];
    if (latestActive != null) {
      let latestActiveClass = latestActive.getAttribute('class').split('containerActive')[1];
      latestActive.setAttribute('class', latestActiveClass);
    }

    //On ré-initialise les tailles de l'instance créée
    this.componentRef.instance.recheckValues();

    //Set border of the active one
    let activeOne = document.getElementById(instanceNumber.toString());
    activeOne.setAttribute('class', 'containerActive ' + activeOne.getAttribute('class'));
  }


  /**
   * [0] message type
   * [1] instance
   * @param message
   */
  handleMessageFromChild(message: string) {
    const messageSplited = message.split('/');
    const instance: number = +messageSplited[1];
    switch (messageSplited[0]) {
      case 'askForData':
        this.getData(messageSplited[2]).subscribe(dataFetched => {
          this.allComponentRefs[instance - 1].instance.datas = dataFetched;
          this.allComponentRefs[instance - 1].instance.calculData();
          this.allComponentRefs[instance - 1].instance.refreshDataChart();
          this.paramView.changeColumn();
          this.loading = false;
        });
        break;
      case 'actif':
        let latestActive = document.getElementsByClassName('containerActive')[0];
        if (latestActive != null) {
          let latestActiveClass = latestActive.getAttribute('class').split('containerActive')[1];
          latestActive.setAttribute('class', latestActiveClass);
        }

        let testContainer = document.getElementById(instance.toString());
        testContainer.setAttribute('class', 'containerActive ' + testContainer.getAttribute('class'));
        if (messageSplited.length > 3) {
          this.setActiveTable(messageSplited);
        }
        break;
      case 'filtres':
        this.paramView.filterList = this.allComponentRefs[instance - 1].instance.filters;
        this.paramView.setDataSourceFilter();
        break;
      case 'destroyed':
        this.loading = false;
        this.activeTable = this.datas;
        this.allInstance[instance - 1] = false;
        this.allDivs.splice(this.allDivs.indexOf(instance), 1);
        if (document.getElementsByTagName('nav')[0].nextSibling.childNodes.length === 1) this.diviseChartsSegment();
        break;
      case 'setActif':
        this.activeInstance = instance;
        this.paramView.actif = instance;
        break;
      default:
        break;
    }
  }

  setActiveTable(message) {
    this.activeTable = [];
    for (let i = 2; i < message.length - 1; i++) {
      this.activeTable.push(this.datas.find(element => message[i] == element.name));
    }
    this.getData(this.activeTable[0].name).subscribe(dataFetched => {
      this.paramView.data = dataFetched;
      this.paramView.tableInfo = this.activeTable[0];
      this.paramView.setColonnes()
    });
  }

  resetActiveTable(event) {
    if (+event['srcElement']['id'] + "" != "NaN" && event['srcElement']['id'] != "" && !this.allInstance[+event['srcElement']['id'] - 1]) {
      this.activeTable = this.datas
      this.paramView.reset();
    }
  }

  /**
   * Reception des messages venus du panel de droite
   */
  messageReceiveFromRightPanel(filtreInfo) {
    //Envoi des filtres vers l'enfant
    this.allComponentRefs[filtreInfo.actif - 1].instance.filters = filtreInfo.filter;
    this.allComponentRefs[filtreInfo.actif - 1].instance.calculData();
    this.allComponentRefs[filtreInfo.actif - 1].instance.refreshDataChart();
  }

  /**
   * Permet d'activer le drop
   */
  allowDrop(ev) {
    ev.preventDefault();
  }

  /**
   * Permet de re-créer l'environnement de création de la sauvegarde précédemment effectuée
   */
  configRecuperation() {
    let acc = 0;
    let allLength = this.chartsConfig.charts.length;
    this.chartsConfig.charts.forEach(chartConfig => {
      acc++;
      if (acc > 1) this.diviseChartsSegment();

      let tableName = chartConfig.table.name;
      let i = 0;
      chartConfig.table.column.forEach(columnName => {
        i++;
        if (i <= 1) {
          
          this.createNewChild(columnName, tableName, acc,true);
          let lastChild = <HTMLElement>document.getElementsByTagName('nav')[0].nextSibling.lastChild;
          if(allLength > 2) {
            lastChild.setAttribute("class","chartContainedFour");
          }
          else{
            lastChild.setAttribute("class","chartContained");
          }
        }
        else {
          this.allComponentRefs[acc - 1].instance.addColumn(tableName, columnName);
        }
        this.paramView.filterList = chartConfig.filters;
        this.allComponentRefs[acc - 1].instance.filters = chartConfig.filters;
        this.allComponentRefs[acc - 1].instance.emitFiltersAndActive();
      });
      setTimeout(() => {
        this.modifyChartTypeChildren(this.chartsConfig.charts.indexOf(chartConfig),chartConfig.type);
      },100);
      
    });
  }

  modifyChartTypeChildren(idChildren,chartType){
    this.allComponentRefs[idChildren].instance.changeChartView(chartType);
  }

  /**
   * Parcourt le div contenant les templates disponibles, et retourne la première contenue dans ce div
   * @param idNumber 
   */
  parseTemplateDiv(idNumber: string) {
    let container = document.getElementById('templates');
    let test = container.firstChild;
    for (let i = 0; i < container.children.length; i++) {
      if (container.children[i].id == idNumber) {
        test = container.children[i];
      }
    }
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
    let indice = this.allInstance.indexOf(false) + 1;
    while (document.getElementById(indice.toString()) != null) {
      indice++;
    }
    this.allDivs.push(indice);
    newDivForChart.setAttribute('id', indice.toString());
    const template = this.parseTemplateDiv((100 + indice).toString());
    newDivForChart.appendChild(template);
    newDivForChart.addEventListener('click', (event) => this.resetActiveTable(event));
    if (allChartChilds < 2) chartContainer.setAttribute('id', 'chartContainerSimple');
    else chartContainer.setAttribute('id', 'chartContainerDouble');

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
    let latestActive = document.getElementsByClassName('containerActive')[0];
    if (latestActive != null) {
      let latestActiveClass = latestActive.getAttribute('class').split('containerActive')[1];
      latestActive.setAttribute('class', latestActiveClass);
    }

    this.activeTable = this.datas;
    this.paramView.reset();
  }

  /**
   * Appelle les méthodes de redimensionnement 
   */
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
        } else if (this.containerRepeat == 3) {
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

  saveChartsTable() {
    let screenJSON: ChartsScreen = new ChartsScreen();
    screenJSON.charts = [];
    let wasDuo = false;
    for (let i = 0; i < this.allDivs.length; i++) {
      if (this.allInstance[this.allDivs[i] - 1]) {
        let chart = new SaveChart();
        chart.type = this.allComponentRefs[this.allDivs[i] - 1].instance.currentType;
        chart.filters = this.allComponentRefs[this.allDivs[i] - 1].instance.filters;
        let tmpSaveChartTable = new SaveChartTable();
        tmpSaveChartTable.name = this.allComponentRefs[this.allDivs[i] - 1].instance.tableInfo.name;
        tmpSaveChartTable.column = this.allComponentRefs[this.allDivs[i] - 1].instance.displayedColumns;
        chart.table = tmpSaveChartTable;
        if (!wasDuo && i == this.allDivs.length - 1) {
          chart.display = "solo";
        } else if (wasDuo && i == this.allDivs.length - 1) {
          chart.display = "duo"
        } else if (!wasDuo && this.allInstance[this.allDivs[i + 1] - 1]) {
          chart.display = "duo";
          wasDuo = true;
        } else if (!this.allInstance[this.allDivs[i + 1] - 1]) {
          chart.display = "solo"
          wasDuo = false;
        } else if (wasDuo) {
          chart.display = "duo";
          wasDuo = false;
        }
        screenJSON.charts.push(chart);
      }
    }

    //appel web service sauvegarde JSON ; 
    this.saveChartService.saveChartConfig(screenJSON).subscribe(httpResponse => {
      const resultParams = httpResponse.link;
      let id = resultParams.split(':')[0];
      let displayedName = resultParams.split(':')[1];
      this.toastr.info("You can see your charts via this link : localhost:4200/ecran/" + displayedName + "/" + id);
    });
  }
}
