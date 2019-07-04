import { CommonModule } from '@angular/common';
import { Injector, NgModule } from '@angular/core';
import { ViewComponent } from './components/view/view.component';


export let InjectorInstance: Injector;

@NgModule({
  declarations: [ViewComponent],
  imports: [
    CommonModule
  ]
})
export class ViewModule {
    constructor(private injector: Injector) {
      InjectorInstance = this.injector;
    }
}
