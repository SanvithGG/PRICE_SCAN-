import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AuthComponent } from './auth/auth.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: AuthComponent, data: { mode: 'login' } },
  { path: 'signup', component: AuthComponent, data: { mode: 'signup' } },
  { path: '**', redirectTo: '' }
];
