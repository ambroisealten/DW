import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponent } from './app.component';
import { ChartViewComponent } from './components/chart-view/chart-view.component';
import { DataService } from './services/dataService';

import { ModalDataManipulationComponent } from './components/modal/modal-data-manipulation/modal-data-manipulation.component';
import { ParamViewComponent } from './components/param-view/param-view.component';
import {
  MAT_DATE_LOCALE, MatTableModule, MatNativeDateModule, MatDatepickerModule, MatRadioModule,
  MatFormFieldModule, MatSlideToggleModule, MatCheckboxModule, MatTabsModule, MatDialogModule,
  MatSelectModule, MatSliderModule, MatListModule, MatInputModule
} from '@angular/material';
import { MatIconModule } from '@angular/material/icon';
import { ModalStringManipulationComponent } from './components/modal/modal-string-manipulation/modal-string-manipulation.component';
import { FormsModule } from '@angular/forms';
import { CdkTableModule } from '@angular/cdk/table';
import { CdkTreeModule } from '@angular/cdk/tree';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ModalDateManipulationComponent } from './components/modal/modal-date-manipulation/modal-date-manipulation.component';
import { ToastrModule } from 'ngx-toastr';

import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';



@NgModule({
  declarations: [
    AppComponent,
    ChartViewComponent,
    ModalDataManipulationComponent,
    ParamViewComponent,
    ModalStringManipulationComponent,
    ModalDateManipulationComponent,
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
    MatIconModule,
    MatRadioModule,
    MatInputModule,
    FormsModule,
    HttpClientModule,
    MatExpansionModule,
    BrowserModule,
    MatButtonModule,
    BrowserAnimationsModule,
    MatTableModule,
    CdkTableModule,
    CdkTreeModule,
    DragDropModule,
    MatDatepickerModule,
    MatNativeDateModule,
    ToastrModule.forRoot({
      positionClass: 'toast-bottom-full-width',
      closeButton: true,
      preventDuplicates: true
    }),
    MatProgressSpinnerModule,
  ],
  providers: [
    DataService,
    { provide: MAT_DATE_LOCALE, useValue: 'fr-FR' },
  ],
  entryComponents: [
    ChartViewComponent,
    ModalDataManipulationComponent,
    ModalStringManipulationComponent,
    ModalDateManipulationComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
