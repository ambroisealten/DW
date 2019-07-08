import { Component, OnInit, Input } from '@angular/core';
import { FilterList } from 'src/app/models/Filter';

@Component({
  selector: 'app-chart-screen',
  templateUrl: './chart-screen.component.html',
  styleUrls: ['./chart-screen.component.scss']
})
export class ChartScreenComponent implements OnInit {

  @Input() type ; 
  @Input() data ; 
  @Input() tables ; 
  @Input() filters: FilterList[] ; 

  constructor() { }

  ngOnInit() {
  }

}
