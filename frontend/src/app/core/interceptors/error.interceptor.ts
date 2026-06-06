import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const snack = inject(MatSnackBar);
  const router = inject(Router);
  const auth = inject(AuthService);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      const message = err.error?.error ?? err.message ?? 'Произошла ошибка';

      if (err.status === 401 && !req.url.includes('/api/auth/')) {
        auth.logout();
      } else if (err.status === 403) {
        snack.open('Нет доступа', '', { duration: 3000 });
      } else if (err.status === 0) {
        snack.open('Сервер недоступен', '', { duration: 3000 });
      } else if (err.status >= 500) {
        snack.open('Ошибка сервера', '', { duration: 3000 });
      }

      return throwError(() => ({ status: err.status, message }));
    })
  );
};
