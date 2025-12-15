// src/app/services/user.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';

export interface User {
  id: number;
  username: string;
  nickname: string | null;
  short_bio: string | null;
  long_bio: string | null;
  avatar: string | null;
}

const API_BASE = 'http://localhost:8000';
const API_URL = `${API_BASE}/api`;

// Función auxiliar para que el avatar SIEMPRE tenga una URL bien formada
function normalizeUser(user: User): User {
  if (user.avatar) {
    // Si viene ya con http, lo dejamos tal cual
    if (user.avatar.startsWith('http')) {
      return user;
    }
    // Si viene como ruta relativa (/media/...), le ponemos el host delante
    return {
      ...user,
      avatar: `${API_BASE}${user.avatar}`,
    };
  }
  return {
    ...user,
    avatar: null,
  };
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private http: HttpClient) {}

  getMe(): Observable<User> {
    return this.http
      .get<User>(`${API_URL}/users/me/`)
      .pipe(map((user) => normalizeUser(user)));
  }

  updateMe(data: FormData): Observable<User> {
    return this.http
      .put<User>(`${API_URL}/users/me/`, data)
      .pipe(map((user) => normalizeUser(user)));
  }

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${API_URL}/users/list/`)
        .pipe(map(users => users.map(u => normalizeUser(u))));
  }

}