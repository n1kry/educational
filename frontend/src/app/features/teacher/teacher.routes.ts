import { Routes } from '@angular/router';

export const teacherRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./my-courses/teacher-courses').then(m => m.TeacherCoursesComponent)
  },
  {
    path: 'create',
    loadComponent: () => import('./create-course/create-course').then(m => m.CreateCourseComponent)
  },
  {
    path: 'edit/:id',
    loadComponent: () => import('./edit-course/edit-course').then(m => m.EditCourseComponent)
  }
];
