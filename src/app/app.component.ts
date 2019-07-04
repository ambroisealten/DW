import { Component, ComponentFactoryResolver, OnInit, QueryList, ViewChild, ViewChildren, ViewContainerRef } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Observable, of, Subject, Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ChartViewComponent } from './components/chart-view/chart-view.component';
import { ParamViewComponent } from './components/param-view/param-view.component';
import { DataTable } from './models/data';
import { DataScheme } from './models/dataScheme';
import { DataService } from './services/dataService';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  constructor(){
  }

  ngOnInit(){
  }
}

