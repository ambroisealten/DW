import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainViewComponent } from './components/main-view/main-view.component';

const appRoutes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: MainViewComponent },
  { path: 'ecran/:name/:id', loadChildren: './view/view.module#ViewModule' }
];

@NgModule({
  imports: [RouterModule.forRoot(appRoutes, { enableTracing: false })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
