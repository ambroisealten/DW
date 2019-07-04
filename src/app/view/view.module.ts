import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ViewComponent } from './components/view/view.component';
import { ViewRoutingModule } from './view-routing.module';
import { HttpClientModule } from '@angular/common/http';
import { LoadEcranService } from './services/load-ecran.service';

@NgModule({
  declarations: [
    ViewComponent,
  ],
  imports: [
    CommonModule,
    ViewRoutingModule,
    HttpClientModule
  ],
  providers: [
    LoadEcranService
  ],
  entryComponents: [],
})
export class ViewModule { }
