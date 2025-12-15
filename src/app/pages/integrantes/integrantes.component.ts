import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService, User } from '../../services/user.service';
import { PREMIOS_GANADOS } from '../../constants/premios.const';

@Component({
  standalone: true,
  selector: 'app-integrantes',
  imports: [CommonModule],
  templateUrl: './integrantes.component.html',
})
export class IntegrantesComponent implements OnInit {
  integrantes: (User & { premios?: any[] })[] = [];
  loading = true;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.integrantes = users.map(u => ({
          ...u,
          premios: PREMIOS_GANADOS[u.username] || [],
        }));
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }
}