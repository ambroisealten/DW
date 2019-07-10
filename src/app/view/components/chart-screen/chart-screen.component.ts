import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import * as Chart from 'chart.js';
import { ChartData } from 'chart.js';
import { ToastrService } from 'ngx-toastr';
import { throwError } from 'rxjs';
import { FilterList } from 'src/app/models/Filter';
import { DATA_CALC_FREQUENCIES } from '../../workers/data.script';
import { WebworkerService } from '../../workers/webworker.service';

@Component({
  selector: 'app-chart-screen',
  templateUrl: './chart-screen.component.html',
  styleUrls: ['./chart-screen.component.scss']
})
export class ChartScreenComponent implements OnInit {

  @Input() type;
  @Input() tables;
  @Input() filters: FilterList[];
  @Input() datas;

  spans: any[];
  datasourceTable: any[];
  displayedColumns: string[] = [];

  chart: Chart;
  @ViewChild('myCanvas', { static: false }) myCanvas: ElementRef;
  canvasFontSize: number;

  constructor(
    private workerService: WebworkerService,
    private toastr: ToastrService) { }

  ngOnInit() {
    // Set la taille du texte selon la taille
    switch (document.getElementsByClassName('chartContainerDouble').length) {
      case 0:
        this.canvasFontSize = 14;
        break;
      default:
        this.canvasFontSize = 10;
        break;
    }
  }

  setView() {
    this.tables.column.forEach(element => {
      this.displayedColumns.push(element);
    });
    if (this.type == "tab") {
      //Créer displayedColumns ICI ! 
      this.calculData();
    } else {
      this.createChart();
      this.resetCanvasHeightAndWidth();
    }
  }

  resetCanvasHeightAndWidth() {
    this.myCanvas.nativeElement.width = (this.myCanvas.nativeElement.parentNode.parentNode.offsetWidth - 150).toString();
    this.myCanvas.nativeElement.height = (this.myCanvas.nativeElement.parentNode.parentNode.offsetHeight - 50).toString();
    this.myCanvas.nativeElement.setAttribute('style','');
  }

  /*****************************************************************************************************************\
   *
   * 
   *                                               Méthode Chart
   * 
   *
   \*****************************************************************************************************************/
  createChart() {
    const ctx = (<HTMLCanvasElement>this.myCanvas.nativeElement).getContext('2d');
    this.chart = new Chart(ctx, {});
    const labels: (string | string[])[] = [];
    let input;

    const dataTransformed = this.datas
      .filter(element => this.isNotExclude(element))
      .map(val => val[this.displayedColumns[0]])
      .map(val => this.transform(val, this.displayedColumns[0]));

    // Calculate labels and data for each graph type
    switch (this.type) {
      case 'pie':
        input = {
          body: {
            values: dataTransformed
          }
        };
        this.workerService.run(DATA_CALC_FREQUENCIES, input).then(
          (result) => {

            const data = result as unknown as any;
            const dataCalc = [];

            // tslint:disable-next-line: forin
            for (const key in data.values) {
              labels.push(key);
              dataCalc.push(data.values[key]);
            }
            this.chart = new Chart(ctx, {
              type: 'pie',
              data: {
                labels,
                datasets: [
                  {
                    data: dataCalc as number[],
                    backgroundColor: this.randomColorList(dataCalc.length),
                    borderColor: '#00000',
                    fill: true
                  }]
              },
              options: {
                title:{
                  display : true,
                  text : this.displayedColumns[0],
                  fontColor : "#ffffff"
                },
                legend: {
                  display: false,
                  position: 'bottom',
                  labels: {
                    fontSize: this.canvasFontSize
                  }
                },
                responsive: false,
                maintainAspectRatio: true,
                'onClick': (event, item) => this.redirectTo(item),
              }
            });
          }
        ).catch(console.error);
        break;
      case 'doughnut':
        input = {
          body: {
            values: dataTransformed
          }
        };
        this.workerService.run(DATA_CALC_FREQUENCIES, input).then(
          (result) => {
            const data = result as unknown as {};
            const dataCalc = [];
            for (const key in data) {
              if (data.hasOwnProperty(key)) {
                labels.push(key);
                dataCalc.push(result[key]);
              }
            }
            this.chart = new Chart(ctx, {
              type: 'doughnut',
              data: {
                labels,
                datasets: [
                  {
                    data: dataCalc as number[],
                    backgroundColor: this.randomColorList(dataCalc.length),
                    borderColor: '#00000',
                    fill: true
                  }]
              },
              options: {
                title:{
                  display : true,
                  text : this.displayedColumns[0],
                  fontColor : "#ffffff"
                },
                legend: {
                  display: false,
                  position: 'bottom',
                  labels: {
                    fontSize: this.canvasFontSize
                  }
                },
                responsive: false,
                maintainAspectRatio: true,
                'onClick': (event, item) => this.redirectTo(item),
              }
            });
          }
        ).catch(console.error);
        break;
      case 'bar':
        this.chart = new Chart(ctx, {
          type: 'bar',
          data: {
            labels,
            datasets: [
              {
                data: dataTransformed as number[],
                backgroundColor: this.randomColorList(dataTransformed.length),
                borderColor: '#00000',
                fill: true
              }]
          },
          options: {
            title:{
              display : true,
              text : this.displayedColumns[0],
              fontColor : "#ffffff"
            },
            legend: {
              display: false,
              position: 'bottom',
              labels: {
                fontSize: this.canvasFontSize
              }
            },
            responsive: false,
            maintainAspectRatio: true,
            'onClick': (event, item) => this.redirectTo(item),
            scales: {
              yAxes: [{
                ticks: {
                  beginAtZero: true,
                  fontColor: 'white'
                },
              }],
              xAxes: [{
                ticks: {
                  fontColor: 'white'
                }
              }]
            }
          }
        });
        break;
      case 'boxplot':
        const boxplotData = {
          // define label tree
          labels,
          datasets: [{
            label: 'Dataset 1',
            backgroundColor: this.randomColorList(1),
            borderColor: 'red',
            borderWidth: 1,
            outlierColor: '#000000',
            padding: 10,
            itemRadius: 0,
            data: [
              dataTransformed
            ]
          }]
        };
        this.chart = new Chart(ctx, {
          type: 'horizontalBoxplot',
          data: boxplotData as ChartData,
          options: {
            responsive: true,
            legend: {
              position: 'top',
            },
            title:{
              display : true,
              text : "Chart.Js Boxplot chart",
              fontColor : "#ffffff"
            },
          }
        });
        break;
      case 'line':
        this.chart = new Chart(ctx, {
          type: 'line',
          data: {
            labels,
            datasets: [
              {
                data: dataTransformed as number[],
                backgroundColor: this.randomColorList(dataTransformed.length),
                borderColor: '#00000',
                fill: true
              }]
          },
          options: {
            title:{
              display : true,
              text : this.displayedColumns[0],
              fontColor : "#ffffff"
            },
            legend: {
              display: false,
              position: 'bottom',
              labels: {
                fontSize: this.canvasFontSize
              }
            },
            responsive: false,
            maintainAspectRatio: true,
            'onClick': (event, item) => this.redirectTo(item),
            scales: {
              yAxes: [{
                ticks: {
                  beginAtZero: true,
                  fontColor: 'white'
                },
              }],
              xAxes: [{
                ticks: {
                  fontColor: 'white'
                }
              }]
            }
          }
        });
        break;
      default:
        throwError('Chart type << ' + this.type + ' >> unimplemented. Change to tab type');
        this.type = 'tab';
        this.setView();
        return;
    }
    this.addGeneralOptionToChart();
  }

  randomColorList(length: number) {
    const result = [];
    for (let index = 0; index < length; index++) {
      result.push('rgb('
        + Math.floor(Math.random() * 255)
        + ',' + Math.floor(Math.random() * 255)
        + ',' + Math.floor(Math.random() * 255)
        + ')');
    }
    return result;
  }

  addGeneralOptionToChart() {
    this.chart.config.type = this.type;
    this.chart.config.options.responsive = false;
    this.chart.config.options.maintainAspectRatio = true;
    this.chart.update();
  }

  redirectTo(item) {
    const clickedItemLabel = item[0]._view.label;
    const dataChart = item[0]._chart.config.data;
    const itemRank = dataChart.labels.indexOf(clickedItemLabel);
    if (item.length > 0) {
      this.toastr.info('We want to redirect to some URL. Column name : '
        + this.displayedColumns[0]
        + ' , clicked item :' + clickedItemLabel
        + ', value : ' + dataChart.datasets[0].data[itemRank]);
    }
  }

  /*****************************************************************************************************************\
   *
   * 
   *                                               Méthode Tableau
   * 
   *
   \*****************************************************************************************************************/

  /**
   * Evalue et stock le row span 
   * La clé détermine la colonne affectée et l'accesseur détermine la profondeur de cette colonne dans le tableau
   * Ne fonctionne que si les données sont triées car les données similaires doivent être successives dans le tableau 
   */
  cacheSpan(key, accessor) {
    //On boucle sur les données 
    for (let i = 0; i < this.datasourceTable.length;) {

      //On construit la donnée elle est représentée par object[key1]+object[key2]+object[key3]+....
      let currentValue = '';
      for (let k = 0; k < accessor; k++) {
        //On transforme la donnée selon les filtres afin de convertir des données qui n'ont pas la même valeur en une même valeur afin de les "spans" ensemble
        currentValue += this.transform(this.datasourceTable[i][this.displayedColumns[k]], this.displayedColumns[k]);
      }

      let count = 1;

      // On itère sur les données restantes
      for (let j = i + 1; j < this.datasourceTable.length; j++) {

        //On construit la donnée elle est représentée par object[key1]+object[key2]+object[key3]+....
        let checkedValue = '';
        for (let h = 0; h < accessor; h++) {
          //On transforme la donnée selon les filtres afin de convertir des données qui n'ont pas la même valeur en une même valeur afin de les "spans" ensemble
          checkedValue += this.transform(this.datasourceTable[j][this.displayedColumns[h]], this.displayedColumns[h]);
        }
        //Si les valeurs sont différentes, on casse la boucle 
        if (currentValue != checkedValue) {
          break;
        }

        count++;
      }

      //Comme le span est un tableau vide à l'origine et que l'index du span peut être n'importe où on initialise la ligne avec un object vide
      if (!this.spans[i]) {
        this.spans[i] = {};
      }

      // On stock le nombre de similiarité trouvée (donc le span)
      // et on skip jusqu'à la prochaine ligne unique 
      this.spans[i][key] = count;
      i += count;
    }
  }

  /**
  * Permet de sort les données jusqu'à la dernière colonne affichée 
  * C'est-à-dire qu'on cherche l'attribut le plus loin différenciant deux données 
  * Dans l'ordre de gauche à droite des colonnes affichées 
  * Les données sont transformer selon leur filtre 
  */
  multipleSort() {
    this.datasourceTable.sort((a, b) => {
      for (let i = 0; i < this.displayedColumns.length; i++) {
        if (!a.hasOwnProperty(this.displayedColumns[i]) && !b.hasOwnProperty(this.displayedColumns[i])) {

        } else if (!a.hasOwnProperty(this.displayedColumns[i])) {
          return -1;
        } else if (!b.hasOwnProperty(this.displayedColumns[i])) {
          return 1;
        } else if (this.transform(a[this.displayedColumns[i]], this.displayedColumns[i]) !== this.transform(b[this.displayedColumns[i]], this.displayedColumns[i])) {
          return a[this.displayedColumns[i]] > b[this.displayedColumns[i]] ? 1 : -1;
        }
      }
    });
  }

  /**
  * Evalue si la ligne doit être skip ou affichée
  * @param col 
  * @param index 
  */
  getRowSpan(col, index) {
    return this.spans[index] && this.spans[index][col];
  }

  /**
   * Permet de transformer la donnée selon les filtres existants 
   * @param data 
   * @param column 
   */
  transform(data, column) {
    if (data == undefined) {
      return ' ';
    }
    let actualFilter: FilterList = this.filters.find(filter => filter.filterColumn == column)
    let name = '';
    if (actualFilter != undefined) {
      if (actualFilter['filterType'] == 'number') {
        for (let i = 0; i < actualFilter.filters.length; i++) {
          if (actualFilter.filters[i].actif) {
            if (this.agregateNumber(data, actualFilter.filters[i])) {
              name = actualFilter.filters[i]['name'];
              break;
            }
          }
        }
      } else if (actualFilter['filterType'] == 'string') {
        for (let i = 0; i < actualFilter.filters.length; i++) {
          if (actualFilter.filters[i].actif) {
            if (actualFilter.filters[i].listElem.includes(data)) {
              name = actualFilter.filters[i]['name'];
              break;
            }
          }
        }
      } else if (actualFilter['filterType'] == 'date') {
        for (let i = 0; i < actualFilter.filters.length; i++) {
          if (actualFilter.filters[i].actif) {
            let value = (new Date(data)).getTime()
            if (this.agregateDate(value, actualFilter.filters[i])) {
              name = actualFilter.filters[i]['name'];
              break;
            }
          }
        }
      }
      if (name != '') {
        return name;
      }
    }
    return data;
  }

  /**
  * Evalue si la valeur appartient au filtre 
  * @param value 
  * @param filter 
  */
  agregateNumber(value, filter) {
    let bool = false;
    switch (filter.type) {
      case ('inf. à'):
        bool = (value < filter.min);
        break;
      case ('inf. égal à'):
        bool = (value <= filter.min);
        break;
      case ('égal'):
        bool = (value == filter.min);
        break;
      case ('sup. à'):
        bool = (value > filter.min);
        break;
      case ('sup. égal à'):
        bool = (value > filter.min);
        break;
      case ('compris'):
        bool = ((value >= filter.min) && (value <= filter.max));
        break;
    }
    return bool;
  }

  /**
  * Evalue si la valeur appartient au filtre 
  * @param value 
  * @param filter 
  */
  agregateDate(value, filter) {
    let bool = false;
    switch (filter.type) {
      case ('avant le'):
        bool = (value < filter.startDate);
        break;
      case ('jusqu\'au'):
        bool = (value <= filter.startDate);
        break;
      case ('après le'):
        bool = (value > filter.startDate);
        break;
      case ('à partir'):
        bool = (value > filter.startDate);
        break;
      case ('entre'):
        bool = ((value >= filter.startDate) && (value <= filter.endDate));
        break;
    }
    return bool;
  }

  /**
   * Permet de déterminer si la valeur fait partie des données exclues ou non 
   * @param data 
   */
  isNotExclude(data) {
    if (this.filters.length == 0) {
      return true;
    }
    let bool = false;
    for (let i = 0; i < this.filters.length; i++) {
      if (this.filters[i].filterType == 'date') {
        if (this.filters[i].excludeValue.includes((new Date(data[this.filters[i].filterColumn])).getTime() + '')) {
          bool = true;
        }
      } else {
        if (this.filters[i].excludeValue.includes(data[this.filters[i].filterColumn] + '')) {
          bool = true;
        }
      }
      if (bool) {
        return false;
      }
    }
    return true;
  }

  calculData() {
    this.datasourceTable = Object.assign([], this.datas.filter(element => this.isNotExclude(element)))
    this.multipleSort();
    this.spans = [];
    for (let i = 0; i < this.displayedColumns.length; i++) {
      this.cacheSpan(this.displayedColumns[i], i + 1);
    }
  }

}
