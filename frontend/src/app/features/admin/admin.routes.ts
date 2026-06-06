import { Routes } from '@angular/router';

export const adminRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./users/admin-users').then(m => m.AdminUsersComponent)
  },
  {
    path: 'courses',
    loadComponent: () => import('./courses/admin-courses').then(m => m.AdminCoursesComponent)
  }
];
