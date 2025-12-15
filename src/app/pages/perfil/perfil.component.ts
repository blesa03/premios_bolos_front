// src/app/pages/perfil/perfil.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { User, UserService } from '../../services/user.service';

@Component({
  standalone: true,
  selector: 'app-perfil',
  imports: [CommonModule, FormsModule],
  templateUrl: './perfil.component.html',
})
export class PerfilComponent implements OnInit {
  user: User | null = null;

  nickname = '';
  short_bio = '';
  long_bio = '';

  avatarPreview: string | null = null;
  avatarFile: File | null = null;

  loading = false;
  errorMessage = '';
  successMessage = '';

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.cargarPerfil();
  }

  private cargarPerfil(): void {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.userService.getMe().subscribe({
      next: (user) => {
        this.user = user;
        this.nickname = user.nickname ?? '';
        this.short_bio = user.short_bio ?? '';
        this.long_bio = user.long_bio ?? '';
        this.avatarPreview = user.avatar;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'No se ha podido cargar tu ficha boleril 😔';
        this.loading = false;
      },
    });
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    this.avatarFile = file;

    // Preview de la imagen
    const reader = new FileReader();
    reader.onload = () => {
      this.avatarPreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  guardarPerfil(): void {
    this.errorMessage = '';
    this.successMessage = '';

    const formData = new FormData();
    formData.append('nickname', this.nickname);
    formData.append('short_bio', this.short_bio);
    formData.append('long_bio', this.long_bio);

    if (this.avatarFile) {
      formData.append('avatar', this.avatarFile);
    }

    this.loading = true;

    this.userService.updateMe(formData).subscribe({
      next: (user) => {
        this.user = user;
        this.avatarFile = null;
        this.loading = false;
        this.successMessage = 'Perfil actualizado. Ahora sí estás presentable para la gala 😎';
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
        this.errorMessage = 'No se ha podido guardar el perfil. Vuelve a intentarlo en un rato.';
      },
    });
  }
}