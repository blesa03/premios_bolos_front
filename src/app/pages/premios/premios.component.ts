// src/app/pages/premios/premios.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AwardsService, Award } from '../../services/awards.service';

@Component({
  selector: 'app-premios',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './premios.component.html',
})
export class PremiosComponent implements OnInit {
  premios: (Award & { icono?: string })[] = [];
  loading = true;

  // Iconos por premio
  ICONOS: Record<string, string> = {
    'Más inoperante del año': '💩',
    'Más gay del grupo': '🌈',
    'Pulmones más negros': '🚬',
    'Más alcohólico': '🍺',
    'Más mandarino': '🍊',
    'Pareja del año': '💘',
    'Más ludópata': '🎰',
    'Cliente más fiel de Bartolo': '🫡',
    'Best performance of the year': '🏆',
  };

  constructor(private awardsService: AwardsService) {}

  ngOnInit(): void {
    this.awardsService.getAwards().subscribe({
      next: (data) => {
        this.premios = data.map((p) => ({
          ...p,
          icono: this.ICONOS[p.titulo] || '🎖️',
        }));
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      },
    });
  }
}