import { Routes } from '@angular/router';
import { Signin } from './pages/signin/signin';
import { Dashboard } from './pages/dashboard/dashboard';

export const routes: Routes = [
  { path: 'admin', component: Signin },
  { path: 'dashboard', component: Dashboard },
  { path: '', pathMatch: 'full', redirectTo: '' }
];
