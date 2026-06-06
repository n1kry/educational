import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'courses', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register').then(m => m.RegisterComponent)
  },
  {
    path: 'courses',
    loadComponent: () => import('./features/catalog/catalog').then(m => m.CatalogComponent)
  },
  {
    path: 'my-courses',
    canActivate: [authGuard],
    loadComponent: () => import('./features/student/my-courses/my-courses').then(m => m.MyCoursesComponent)
  },
  {
    path: 'learn/:courseId',
    canActivate: [authGuard],
    loadComponent: () => import('./features/student/learning/learning').then(m => m.LearningComponent)
  },
  {
    path: 'quiz/:quizId',
    canActivate: [authGuard],
    loadComponent: () => import('./features/student/quiz/quiz').then(m => m.QuizComponent)
  },
  {
    path: 'teacher',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['TEACHER', 'ADMIN'] },
    loadChildren: () => import('./features/teacher/teacher.routes').then(m => m.teacherRoutes)
  },
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN'] },
    loadChildren: () => import('./features/admin/admin.routes').then(m => m.adminRoutes)
  },

  { path: '**', redirectTo: 'courses' }
];
