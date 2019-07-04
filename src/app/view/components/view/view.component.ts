import { Component, OnInit } from '@angular/core';
import { WebworkerService } from '../../workers/webworker.service';
import { DATA_IMPORT } from '../../workers/data.script';

@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss']
})
export class ViewComponent implements OnInit {

  constructor(private workerService: WebworkerService) { }

  ngOnInit() {
    const input = {
      body: {
        tableName: 'Serie',
        columnName: 'ID'
      }
    }
    this.workerService.run(DATA_IMPORT, input).then(
      (result) => {
        console.log(result);
      }
    ).catch(console.error);
  }

}
