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

  constructor(private dataService: DataService) { }

  datas: Data[] = this.dataService.fetchDataScheme();

  onDragField(field: string) {
  }

  diviseChartsSegment() {
    const chartContainer = document.getElementById('chartContainer');
  }
}
