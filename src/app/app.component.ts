import { Component, ComponentFactoryResolver, OnInit, QueryList, ViewChildren, ViewContainerRef } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Observable, Subject, Subscription, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ChartViewComponent } from './components/chart-view/chart-view.component';
import { DataTable } from './models/data';
import { DataScheme } from './models/dataScheme';
import { DataService } from './services/dataService';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  //Titre de l'application
  title = 'DW - Lot 0';

  //Variable d'environnement pour la création des templates
  containerRepeat = 1;


  //Nombre de templates
  allTemplates = new Array(environment.maxTemplates);

  //Liste des entries pour les templates
  @ViewChildren('chartHost', { read: ViewContainerRef }) entries: QueryList<ViewContainerRef>;

  //Communication vers le panel droit c-à-d gestion des groupements & tris
  subjectRightPanel: Subject<any>;
  obsRightPanel: Observable<any>;

  //Tableau des sujets liées aux child pour communiquer
  allComponentsObs: Subject<any>[] = [];

  //Tableau des refs vers les childs
  allComponentRefs: any[] = [];

  componentRef: any;

  //Information sur les tables & champs
  datas: DataScheme[] = [];
  dataTable: DataTable[] = [];
  tableStored: string[] = [];
  i: number;
  charge = 0;
  value: any;
  elaspedTime: number;
  count: number;
  activeTable = [];
  allInstance: boolean[] = [];

  //Instance active
  activeInstance: number;


  constructor(
    private dataService: DataService,
    private componentFactoryResolver: ComponentFactoryResolver,
    private toastr: ToastrService) {
    //Initialisation du canal entre paramView et AppComponent
    this.subjectRightPanel = new Subject<any>();
    this.obsRightPanel = this.subjectRightPanel.asObservable();
  }


  ngOnInit() {
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
          this.loadDataAsync(0, table.name, 0, this.dataTable, this.allComponentsObs);
        }
      }, 30);
    });
  }

  loadDataAsync(count: number, tableName: string, i: number, dataTable: DataTable[], allComponentsObs) {
    const charge = window.performance['memory']['usedJSHeapSize'] / 1000000;
    if (i === 0) {
    }
    if (this.charge < environment.maxLoadDataCharge) {
      this.dataService.getData(tableName, i * environment.maxSizePacket, environment.maxSizePacket)
        .subscribe((datasFetched: any[]) => {
          if (datasFetched.length === 0) {
            this.allComponentsObs.forEach(component => {
              component.next('notifyDataFetched/' + tableName);
            });
            return;
          }
          Array.prototype.push.apply(dataTable.find(data => data.tableName === tableName).values, datasFetched);
          i += 1;
          this.loadDataAsync(0, tableName, i, dataTable, allComponentsObs);
        });
    } else {
      if (count < 3) {
        setTimeout(() => { this.loadDataAsync(count + 1, tableName, i, dataTable, allComponentsObs); }, 2000);
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
    //INUTILE
    ev.dataTransfer.setData('data', JSON.stringify(this.getData(name)));
  }



  /**
   * Une fois la donnée drop, on initialise le tableau enfant avec les données et met en place le réseau de communication
   * @param ev 
   */
  onDrop(ev) {
    const target = ev.target;

    //On vérifie que l'élément drag est bien celui qui initialise les données de l'enfant
    if (target.className == 'charts' || target.className == 'chartsFour') {

      //On récupère les données du drag
      const fieldName = ev.dataTransfer.getData('colName');
      const tableName = ev.dataTransfer.getData('tableName');

      //On détermine l'id de l'enfant 
      const instanceNumber = parseInt(target.id, 10);

      //On récupère l'entries de l'enfant
      const entryUsed = this.entries.toArray()[target.id - 1];

      //On crée le composant enfant
      const componentFactory = this.componentFactoryResolver.resolveComponentFactory(ChartViewComponent);
      this.componentRef = entryUsed.createComponent(componentFactory);

      //On Initialise les variables 
      this.componentRef.instance.instanceNumber = instanceNumber;
      this.activeInstance = instanceNumber;
      this.allInstance[instanceNumber - 1] = true;

      //!\ INUTILE TO SUPPR 
      this.componentRef.instance.droppedText = fieldName;

      this.componentRef.instance.displayedColumns = [fieldName];
      this.componentRef.instance.tableNames.push(tableName);
      this.getData(tableName).subscribe(dataFetched => {
        this.componentRef.instance.datas = dataFetched;
        this.componentRef.instance.change();
        //On initialise les données à destination de param view
        this.subjectRightPanel.next("datas/" + JSON.stringify(dataFetched));
        this.subjectRightPanel.next("setColonnes/" + JSON.stringify(this.datas.find(data => data.name == tableName)));
      });

      this.activeTable = [];
      this.activeTable.push(this.datas.find(element => element.name === tableName));

      //Initialisation de la communication Parent enfant
      //Enfant vers Parent
      const subChild: Subscription = this.componentRef.instance.toParent.subscribe(message => this.handleMessageFromChild(message));
      this.componentRef.onDestroy(() => subChild.unsubscribe());

      //Observable Parent vers Enfant
      let sub = new Subject<any>();
      this.componentRef.instance.parentObs = sub.asObservable();
      this.componentRef.instance.setSubscription();
      this.allComponentsObs[instanceNumber - 1] = sub;


      //Remove the border of the (potentially) latest active child
      let latestActive = document.getElementsByClassName('containerActive')[0];
      if (latestActive != null) {
        let latestActiveClass = latestActive.getAttribute('class').split('containerActive')[1];
        latestActive.setAttribute('class', latestActiveClass);
      }

      //On ré-initialise les tailles de l'instance créée
      this.componentRef.instance.recheckValues();

      //"Sauvegarde" de la ref
      this.allComponentRefs.push(this.componentRef);

      const allChartChilds = document.getElementsByTagName('nav')[0].nextSibling.childNodes.length;

      //Changement de l'attribut selon le nombre de graphe présent
      if (allChartChilds > 3) {
        target.setAttribute('class', 'chartContainedFour');
      } else {
        target.setAttribute('class', 'chartContained');
      }

      //Set border of the active one
      let activeOne = document.getElementById(instanceNumber.toString());
      activeOne.setAttribute('class', 'containerActive ' + activeOne.getAttribute('class'));

    }
    ev.preventDefault();
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
        this.activeInstance = instance;
        this.getData(messageSplited[2]).subscribe(dataFetched => {
          this.allComponentsObs[this.activeInstance - 1].next('sendData/' + JSON.stringify(dataFetched) + '/' + messageSplited[2]);
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
        this.subjectRightPanel.next('filtres/' + messageSplited[1]);
        break;
      case 'destroyed':
        this.activeTable = this.datas;
        if (document.getElementsByTagName('nav')[0].nextSibling.childNodes.length === 1) this.diviseChartsSegment();
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
      this.subjectRightPanel.next("colonnes/" + JSON.stringify(this.activeTable[0].fields));
      this.subjectRightPanel.next("datas/" + JSON.stringify(dataFetched))
    });
  }

  resetActiveTable(event) {
    if (+event['srcElement']['id'] + "" != "NaN" && !this.allInstance[+event['srcElement']['id'] - 1]) {
      this.activeTable = this.datas
      this.subjectRightPanel.next("reset")
    }
  }

  /**
   * Reception des messages venus du panel de droite
   */
  messageReceiveFromRightPanel($event) {
    //Envoi des filtres vers l'enfant
    this.allComponentsObs[this.activeInstance - 1].next('sendFilter/' + JSON.stringify($event));
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
    const template = this.parseTemplateDiv(this.containerRepeat.toString());
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
    this.subjectRightPanel.next("reset")
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

}

