import { Component, Directive, ViewContainerRef, ViewChild, ComponentFactoryResolver, OnInit, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { DataService } from './services/dataService';
import { DataScheme } from './models/dataScheme';
import { ChartViewComponent } from './components/chart-view/chart-view.component';
import { Subject, Subscription, Observable } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  //Titre de l'application
  title = 'DW - Lot 0';

  //
  containerRepeat = 1;

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

  //Données 
  datasDetails: DataScheme[] = [];

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
        let fields = [];
        //Nom champ = attribut récupération de l'information
        Object.keys(element.fields).forEach(field => {
          fields.push({ name: field, type: element.fields[field] });
        })
        //Sort pour que ce soit plus propre
        fields.sort((e1, e2) => e1.name > e2.name ? 1 : -1);
        this.datas.push({ name: element.name, fields: fields });
      });
    });

    //Récupérations des données 
    this.dataService.getData().subscribe((response: any[]) => {
      const datasFetched = response;
      datasFetched.forEach(element => {
        this.datasDetails.push(element);
      });
    }); 
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
   * Une fois la donnée drop, on initialise le tableau enfant avec les données et met en place le réseau de communication
   * @param ev 
   */
  onDrop(ev) {
    const target = ev.target;

    //On vérifie que l'élément drag est bien celui qui initialise les données de l'enfant
    if (target.className == 'charts' || target.className == 'chartsFour') {

      //On récupère les données du drag
      const fieldName = ev.dataTransfer.getData('colName');

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

      // ??? To determine
      this.componentRef.instance.recheckValues();

      //"Sauvegarde" de la ref
      this.allComponentRefs.push(this.componentRef);

      //Changement de l'attribut selon le nombre de graphe présent
      if (this.containerRepeat > 2) {
        target.setAttribute('class', 'chartContainedFour');
      } else {
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
   * Reception des messages venus du panel de droit 
   */
  messageReceiveFromRightPanel($event) {
    //Envoi des filtres vers l'enfant
    this.allComponentsObs[this.activeInstance - 1].next($event);
  }

  /**
   * 
   */
  allowDrop(ev) {
    ev.preventDefault();
  }

  /**
   * 
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

  /**
   * Appelle les méthodes de redimensionnement 
   */
  resizeAllCharts() {
    this.resizeBlankCharts();
    this.resizeContainedCharts();
    this.resizeAllCanvas();
  }

  /**
   * 
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
   * 
   */
  resizeContainedCharts() {
    const containedCharts = document.getElementsByClassName('chartContained');

    const arr = Array.from(containedCharts);

    arr.forEach(chart => {
      chart.setAttribute('class', 'chartContainedFour');
    });
  }

  /**
   * 
   */
  resizeBlankCharts() {
    const blankCharts = document.getElementsByClassName('charts');

    const arr = Array.from(blankCharts);

    arr.forEach(chart => {
      chart.setAttribute('class', 'chartsFour');
    });
  }

}

