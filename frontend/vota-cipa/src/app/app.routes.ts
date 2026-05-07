import { Routes } from '@angular/router';
import { authGuard, adminGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent) },
  {
    path: 'electoral-periods',
    loadComponent: () => import('./pages/electoral-periods/electoral-periods.component').then(m => m.ElectoralPeriodsComponent),
    canActivate: [authGuard, adminGuard]
  },
  {
    path: 'candidates',
    loadComponent: () => import('./pages/candidates/candidates.component').then(m => m.CandidatesComponent),
    canActivate: [authGuard, adminGuard]
  },
  {
    path: 'voting',
    loadComponent: () => import('./pages/voting/voting.component').then(m => m.VotingComponent),
    canActivate: [authGuard]
  },
  {
    path: 'counting',
    loadComponent: () => import('./pages/counting/counting.component').then(m => m.CountingComponent),
    canActivate: [authGuard, adminGuard]
  },
  {
    path: 'users',
    loadComponent: () => import('./pages/users/users.component').then(m => m.UsersComponent),
    canActivate: [authGuard, adminGuard]
  },
  { path: '**', redirectTo: '/login' }
];
