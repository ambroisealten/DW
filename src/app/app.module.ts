import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { DataService } from './services/dataService';
import { ViewService } from './services/viewService';
import { ChartViewComponent } from './components/chart-view/chart-view.component';

@NgModule({
  declarations: [
    AppComponent,
    ChartViewComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [
    DataService,
    ViewService
  ],
  entryComponents: [
    ChartViewComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
