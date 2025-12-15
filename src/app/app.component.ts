// src/app/app.component.ts
import { Component, inject, signal, effect } from '@angular/core';
import {   
  RouterOutlet,
  Router,
  NavigationEnd,
  RouterLink,
  RouterLinkActive } 
from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { UserService, User } from './services/user.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
  ],
  templateUrl: './app.component.html',
})
export class AppComponent {
  title = 'front';

  private router = inject(Router);
  private userService = inject(UserService);

  isLoginRoute = signal(false);
  currentUser = signal<User | null>(null);
  loadingUser = signal(false);

  constructor() {
    // Detectar si estamos en /login para ocultar navbar/footer
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => {
        const isLogin = e.urlAfterRedirects.startsWith('/login');
        this.isLoginRoute.set(isLogin);

        // Si NO estamos en login, intentamos cargar el usuario
        if (!isLogin) {
          this.fetchMe();
        }
      });
  }

  private fetchMe(): void {
    this.loadingUser.set(true);
    this.userService.getMe().subscribe({
      next: (user) => {
        this.currentUser.set(user);
        this.loadingUser.set(false);
      },
      error: (err) => {
        console.error('Error cargando /me', err);
        this.currentUser.set(null);
        this.loadingUser.set(false);
      },
    });
  }
}