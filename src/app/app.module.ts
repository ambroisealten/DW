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
import { CdkTableModule } from '@angular/cdk/table';
import { CdkTreeModule } from '@angular/cdk/tree';
import { DragDropModule } from '@angular/cdk/drag-drop';

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
    MatTableModule,
    CdkTableModule,
    CdkTreeModule,
    DragDropModule
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
