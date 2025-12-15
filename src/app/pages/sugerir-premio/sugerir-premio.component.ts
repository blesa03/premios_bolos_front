// src/app/pages/sugerir-premio/sugerir-premio.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  AwardsService,
  AwardSuggestion,
  AwardType,
  NominationMode,
} from '../../services/awards.service';

@Component({
  standalone: true,
  selector: 'app-sugerir-premio',
  imports: [CommonModule, FormsModule],
  templateUrl: './sugerir-premio.component.html',
})
export class SugerirPremioComponent implements OnInit {
  titulo = '';
  resumen = '';
  descripcion = '';

  // NUEVO
  awardType: AwardType = 'people';
  nominationMode: NominationMode = 'single';
  maxParticipants: number | null = null; // solo si 'multi'

  loading = false;
  errorMessage = '';
  successMessage = '';

  misSugerencias: AwardSuggestion[] = [];
  loadingSuggestions = true;

  constructor(private awardsService: AwardsService) {}

  ngOnInit(): void {
    this.cargarMisSugerencias();
  }

  private cargarMisSugerencias(): void {
    this.loadingSuggestions = true;
    this.awardsService.getMySuggestions().subscribe({
      next: (data) => {
        this.misSugerencias = data;
        this.loadingSuggestions = false;
      },
      error: (err) => {
        console.error(err);
        this.loadingSuggestions = false;
      },
    });
  }

  onNominationModeChange(): void {
    if (this.nominationMode !== 'multi') {
      this.maxParticipants = null;
    } else if (!this.maxParticipants || this.maxParticipants < 3) {
      this.maxParticipants = 4; // default razonable
    }
  }

  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.titulo.trim() || !this.resumen.trim() || !this.descripcion.trim()) {
      this.errorMessage = 'Rellena título, resumen y descripción, máquina.';
      return;
    }

    if (this.nominationMode === 'multi') {
      const n = Number(this.maxParticipants);
      if (!Number.isFinite(n) || n < 3) {
        this.errorMessage = 'Si eliges "varios", pon un máximo de 3 o más.';
        return;
      }
    }

    this.loading = true;

    this.awardsService
      .createSuggestion({
        titulo: this.titulo.trim(),
        resumen: this.resumen.trim(),
        descripcion: this.descripcion.trim(),

        award_type: this.awardType,
        nomination_mode: this.nominationMode,
        max_participants: this.nominationMode === 'multi' ? this.maxParticipants : null,
      })
      .subscribe({
        next: (sug) => {
          this.loading = false;
          this.successMessage = 'Sugerencia enviada. El jurado boleril tomará nota 👀';

          this.titulo = '';
          this.resumen = '';
          this.descripcion = '';
          this.awardType = 'people';
          this.nominationMode = 'single';
          this.maxParticipants = null;

          this.misSugerencias = [sug, ...this.misSugerencias];
        },
        error: (err) => {
          console.error(err);
          this.loading = false;
          this.errorMessage = 'No se ha podido enviar la sugerencia. Prueba en un rato.';
        },
      });
  }

  getEstadoLabel(s: AwardSuggestion): string {
    if (!s.is_reviewed) return 'Pendiente de revisión';
    if (s.is_reviewed && s.is_accepted) return 'Aprobado para la gala';
    if (s.is_reviewed && !s.is_accepted) return 'Rechazado (el jurado no lo vio claro)';
    return 'Estado desconocido';
  }

  getEstadoClass(s: AwardSuggestion): string {
    if (!s.is_reviewed) return 'text-amber-400';
    if (s.is_reviewed && s.is_accepted) return 'text-emerald-400';
    if (s.is_reviewed && !s.is_accepted) return 'text-rose-400';
    return 'text-slate-400';
  }

  getTipoLabel(s: AwardSuggestion): string {
    return s.award_type === 'clip' ? 'Clip / vídeo' : 'Personas';
  }

  getModoLabel(s: AwardSuggestion): string {
    if (s.nomination_mode === 'single') return '1 participante';
    if (s.nomination_mode === 'pair') return '2 participantes';
    return `Varios (máx ${s.max_participants ?? 4})`;
  }
}