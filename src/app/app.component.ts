import { Component } from '@angular/core';
import { Data } from './models/data';
import { DataService } from './services/dataService';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'dw';

  constructor(private dataService: DataService) { }

  datas: Data[] = this.dataService.fetchDataScheme();

  onDragField(field: string) {
    console.log(field);
  }
}
