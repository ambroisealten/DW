import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router'
import { AppComponent } from './app.component';

const appRoutes: Routes = [
  { path:'', component: AppComponent },
  { path:'ecran', loadChildren: ';/view/view.module#ViewModule' }
];

@NgModule({
  imports: [ RouterModule.forRoot(appRoutes, { enableTracing: false } )],
  exports: [RouterModule]
})
export class AppRoutingModule { }
