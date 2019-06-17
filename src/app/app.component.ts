import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'DW - Lot 0';

  diviseChartsSegment(){
    console.log("On veut diviser ici");
    let chartContainer = document.getElementById('chartContainer');
  }
}
