import { CommonModule } from '@angular/common';
import { Injector, NgModule } from '@angular/core';
import { ViewComponent } from './components/view/view.component';
import { ViewRoutingModule } from './view-routing.module';
import { HttpClientModule } from '@angular/common/http';
import { LoadEcranService } from './services/load-ecran.service';


export let InjectorInstance: Injector;

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
export class ViewModule {
    constructor(private injector: Injector) {
      InjectorInstance = this.injector;
    }
}
