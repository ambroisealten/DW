import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { ViewService } from 'src/app/services/viewService';

@Component({
  selector: 'app-chart-view',
  templateUrl: './chart-view.component.html',
  styleUrls: ['./chart-view.component.scss']
})
export class ChartViewComponent implements OnInit {

  viewService: ViewService;
  @Input() instanceNumber: number;

  constructor() {
    this.viewService = ViewService.getInstance(this.instanceNumber);
  }

  ngOnInit() {
  }

}
