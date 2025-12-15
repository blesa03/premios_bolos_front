// src/app/interceptors/auth.interceptor.ts
import {
  HttpInterceptorFn,
  HttpErrorResponse,
} from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);
  const router = inject(Router);

  // Solo en navegador tenemos localStorage
  if (isPlatformBrowser(platformId)) {
    const token = localStorage.getItem('access');

    if (token) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
    }
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Si el token ha caducado o el backend responde 401 → limpiamos y mandamos a /login
      if (isPlatformBrowser(platformId) && error.status === 401) {
        // Opcional: evitar liarla en la propia llamada de login
        const isLoginCall =
          req.url.includes('/api/users/login/') ||
          req.url.includes('/api/users/login');

        if (!isLoginCall) {
          localStorage.removeItem('access');
          localStorage.removeItem('refresh');
          // redirigimos al login
          router.navigate(['/login']);
        }
      }

      return throwError(() => error);
    })
  );
};