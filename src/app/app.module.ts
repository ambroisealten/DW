import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { DataService } from './services/dataService';
import { ViewService } from './services/viewService';
import { ChartViewComponent } from './components/chart-view/chart-view.component';
import { ModalDataManipulationComponent } from './components/modal/modal-data-manipulation/modal-data-manipulation.component';
import { ParamViewComponent } from './components/param-view/param-view.component';
import { MatTableModule, MatFormFieldModule, MatSlideToggleModule, MatCheckboxModule, MatTabsModule, MatDialogModule, MatSelectModule, MatSliderModule, MatListModule } from '@angular/material';
import { MatIconModule } from '@angular/material/icon';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ModalStringManipulationComponent } from './components/modal/modal-string-manipulation/modal-string-manipulation.component';


@NgModule({
  declarations: [
    AppComponent,
    ChartViewComponent,
    ModalDataManipulationComponent,
    ParamViewComponent,
    ModalStringManipulationComponent,
  ],
  imports: [
    BrowserModule,
    MatTableModule,
    MatCheckboxModule,
    MatTabsModule,
    BrowserAnimationsModule,
    MatDialogModule,
    MatSelectModule,
    MatListModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatFormFieldModule,
    MatIconModule
  ],
  providers: [
    DataService,
    ViewService
  ],
  entryComponents: [
    ChartViewComponent,
    ModalDataManipulationComponent,
    ModalStringManipulationComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
