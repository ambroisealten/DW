import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponent } from './app.component';
import { ChartViewComponent } from './components/chart-view/chart-view.component';
import { DataService } from './services/dataService';
import { ViewService } from './services/viewService';

@NgModule({
  declarations: [
    AppComponent,
    ChartViewComponent
  ],
  imports: [
    HttpClientModule,
    MatExpansionModule,
    BrowserModule,
    BrowserAnimationsModule,
    MatButtonModule
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
