import { Component } from '@angular/core';
import { DataService } from './services/dataService';
import { DataScheme } from './models/dataScheme';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'DW - Lot 0';

  constructor(private dataService: DataService) { }

  datas: DataScheme[] = this.dataService.fetchDataScheme();

  onDragField(field: string) {
  }

  diviseChartsSegment() {
    const chartContainer = document.getElementById('chartContainer');
  }
}
