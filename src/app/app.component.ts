import { Component } from '@angular/core';
import { Data } from './models';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'dw';

  datas: Data[] = [
    new Data('nomTable1', ['champ1', 'champ2', 'champ3', 'champ4']),
    new Data('nomTable2', ['champ1', 'champ2', 'champ3']),
    new Data('nomTable3', ['champ1', 'champ2', 'champ3', 'champ4', 'champ5'])
  ];
}
