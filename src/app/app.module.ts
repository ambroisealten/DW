import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { DataService } from './services/dataService';
import { ViewService } from './services/viewService';
import { ChartViewComponent } from './components/chart-view/chart-view.component';
import { HttpClientModule } from '@angular/common/http';
import { MatExpansionModule } from '@angular/material/expansion';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { MatTableModule } from '@angular/material';

@NgModule({
  declarations: [
    AppComponent,
    ChartViewComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    MatExpansionModule,
    BrowserAnimationsModule,
    MatTableModule
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
