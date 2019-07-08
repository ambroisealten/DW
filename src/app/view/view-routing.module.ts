import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ViewComponent } from './components/view/view.component';

const compRoutes: Routes = [
    {path: '', component: ViewComponent}
];

@NgModule({
  imports: [RouterModule.forChild(compRoutes)],
  exports: [RouterModule]
})
export class ViewRoutingModule { }
