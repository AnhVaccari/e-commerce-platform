import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  // Add token only to /api/* requests
  let modifiedReq = req;
  if (req.url.includes('/api/')) {
    const token = authService.getToken();
    if (token) {
      modifiedReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }
  }

  // Handle auth errors (only for authenticated routes)
  return next(modifiedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Only handle 401 for logout, let components handle other errors
      if (error.status === 401 && authService.getToken()) {
        // Token is invalid/expired, logout
        authService.logout();
      }
      // Don't redirect on 403 - let components handle it
      return throwError(() => error);
    })
  );
};
