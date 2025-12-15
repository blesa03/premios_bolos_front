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

const API_URL = '/api';

// Normaliza el usuario SIN meter hosts ni localhost
function normalizeUser(user: User): User {
  if (!user.avatar) {
    return { ...user, avatar: null };
  }

  // Si ya viene absoluta, la dejamos
  if (user.avatar.startsWith('http')) {
    return user;
  }

  // Si viene como /media/..., la dejamos tal cual
  return {
    ...user,
    avatar: user.avatar,
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
    return this.http
      .get<User[]>(`${API_URL}/users/list/`)
      .pipe(map(users => users.map(u => normalizeUser(u))));
  }
}