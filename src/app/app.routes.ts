import { Routes } from '@angular/router';
import { RefreshGuard } from './core/guards/refresh.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadComponent: () =>
      import('./features/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'explore',
    canActivate: [RefreshGuard],
    loadComponent: () =>
      import('./features/explore/explore.component').then(m => m.ExploreComponent)
  },
  {
    path: 'movie/:id',
    canActivate: [RefreshGuard],
    loadComponent: () =>
      import('./features/detail/detail.component').then(m => m.DetailComponent)
  },
  {
    path: 'dashboard',
    canActivate: [RefreshGuard],
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'wishlist',
    canActivate: [RefreshGuard],
    loadComponent: () =>
      import('./features/wishlist/wishlist.component').then(m => m.WishlistComponent)
  },
  {
    path: '**',
    redirectTo: 'home',
    pathMatch: 'full'
  }
];