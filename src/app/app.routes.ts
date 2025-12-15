// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'premios',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/premios/premios.component').then((m) => m.PremiosComponent),
  },
  {
    path: 'premios/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/premio-detalle/premio-detalle.component').then(
        (m) => m.PremioDetalleComponent
      ),
  },
  {
    path: 'sugerir',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/sugerir-premio/sugerir-premio.component').then(
        (m) => m.SugerirPremioComponent
      ),
  },
  {
    path: 'votar',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/votar/votar.component').then(m => m.VotarComponent),
  },
  {
    path: 'votar/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/votar/votar.component').then(m => m.VotarComponent),
  },
  {
    path: 'integrantes',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/integrantes/integrantes.component').then(
        (m) => m.IntegrantesComponent
      ),
  },
  {
    path: 'perfil',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/perfil/perfil.component').then((m) => m.PerfilComponent),
  },
  { path: '**', redirectTo: '' },
];