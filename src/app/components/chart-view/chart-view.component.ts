import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { ViewService } from 'src/app/services/viewService';
import { DataSet } from 'src/app/models/dataSet';

@Component({
  selector: 'app-chart-view',
  templateUrl: './chart-view.component.html',
  styleUrls: ['./chart-view.component.scss']
})
export class ChartViewComponent implements OnInit {

  viewService : ViewService;
  @Input() instanceNumber : number;

  constructor(private cd: ChangeDetectorRef) {
    this.viewService = ViewService.getInstance(this.instanceNumber);
  }

  recheckValues(){
    this.cd.detectChanges();
  }

  ngOnInit() {
  }

}
