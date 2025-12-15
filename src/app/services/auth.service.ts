// src/app/services/auth.service.ts
import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import type { User } from './user.service';

const API_BASE = 'http://localhost:8001';
const API_URL = `${API_BASE}/api`;

interface LoginResponse {
  refresh: string;
  access: string;
  user: User;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);

  private readonly ACCESS_KEY = 'access';
  private readonly REFRESH_KEY = 'refresh';

  login(username: string, password: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${API_URL}/users/login/`, { username, password })
      .pipe(
        tap((res) => {
          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem(this.ACCESS_KEY, res.access);
            localStorage.setItem(this.REFRESH_KEY, res.refresh);
          }
        })
      );
  }

  getAccessToken(): string | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    return localStorage.getItem(this.ACCESS_KEY);
  }

  logout(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    localStorage.removeItem(this.ACCESS_KEY);
    localStorage.removeItem(this.REFRESH_KEY);
  }

  isLoggedIn(): boolean {
    return !!this.getAccessToken();
  }
}