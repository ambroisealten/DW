import { Component } from '@angular/core';
import { DataService } from './services/dataService';
import { Data } from './models/data';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'DW - Lot 0';
  containerRepeat : number = 1;


  constructor(private dataService: DataService) { }

  datas: Data[] = this.dataService.fetchDataScheme();

  onDragField(field: string) {
  }


  diviseChartsSegment(){
    console.log("On veut diviser ici");

    
    let chartContainer = document.getElementById('chartContainerSimple') == null ? document.getElementById('chartContainerDouble') : document.getElementById('chartContainerSimple');

    this.containerRepeat += 1;

    if(this.containerRepeat > 4){
      this.containerRepeat = 4;
    }
    else if(this.containerRepeat > 2){
      if(this.containerRepeat == 3){
        this.resizeAllCharts();
      }
      let newDivForChart = document.createElement('div');
      newDivForChart.setAttribute('class',"chartsFour");

      chartContainer.setAttribute('id','chartContainerDouble');
      chartContainer.appendChild(newDivForChart);
    }
    else{
      let newDivForChart = document.createElement('div');
      newDivForChart.setAttribute('class',"charts");
  
      chartContainer.setAttribute('id','chartContainerDouble');
      chartContainer.appendChild(newDivForChart);
    }


    
  }

  resizeAllCharts(){
    let allCharts = document.getElementsByClassName('charts');

    let arr = Array.from(allCharts);

    arr.forEach( chart => {
      chart.setAttribute("class","chartsFour");
    })
  }
}
