import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { ViewComponent } from './components/view/view.component';
import { LoadEcranService } from './services/load-ecran.service';
import { ViewRoutingModule } from './view-routing.module';



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
export class ViewModule {}
