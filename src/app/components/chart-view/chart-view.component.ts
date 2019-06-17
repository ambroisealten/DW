import { Component, OnInit, Input } from '@angular/core';
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

  constructor() {
    console.log(this.instanceNumber);
    this.viewService = ViewService.getInstance(this.instanceNumber);
    console.log(this.viewService);
  }

  // @Input()
  // set type(type: string) {
  //   this.viewService.type = type || '<no type set>';
  // }
  // get type(): string { return this.viewService.type; }

  // @Input()
  // set dataSet(dataSet: DataSet) {
  //   this.viewService.dataSet = dataSet || DataSet.empty();
  // }
  // get dataSet(): DataSet { return this.viewService.dataSet; }

  // @Input()
  // set options(options: string[]) {
  //   this.viewService.options = options || ['<no options set>'];
  // }
  // get options(): string[] { return this.viewService.options; }

  ngOnInit() {
  }

}
