// src/app/pages/premio-detalle/premio-detalle.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';

import {
  AwardsService,
  Award,
  NominationResult,
} from '../../services/awards.service';
import { UserService, User } from '../../services/user.service';

@Component({
  selector: 'app-premio-detalle',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './premio-detalle.component.html',
})
export class PremioDetalleComponent implements OnInit {
  award: Award | null = null;
  icono = '🎖️';

  loading = true;
  loadingNominations = false;

  usuarios: User[] = [];

  // ✅ UNIFICADO CON /VOTAR
  nominations: NominationResult[] = [];

  // Modal clip
  clipModalOpen = false;
  selectedClip: NominationResult | null = null;

  // Form nominación (people)
  formNominadoId: number | null = null;
  formNominadoId2: number | null = null;
  formHazana = '';
  saving = false;
  formError = '';
  formSuccess = '';
  modoNomina: 'single' | 'pair' = 'single';

  private ICONOS: Record<string, string> = {
    'Más inoperante del año': '💩',
    'Más gay del grupo': '🌈',
    'Pulmones más negros': '🚬',
    'Más alcohólico': '🍺',
    'Más mandarino': '🍊',
    'Pareja del año': '💘',
    'Más ludópata': '🎰',
    'Cliente más fiel de Bartolo': '🫡',
    'Best performance of the year': '🏆',
    'Clip del Año': '🎬',
  };

  constructor(
    private route: ActivatedRoute,
    private awardsService: AwardsService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const awardId = idParam ? Number(idParam) : null;

    if (!awardId) {
      this.loading = false;
      return;
    }

    forkJoin({
      award: this.awardsService.getAward(awardId),
      users: this.userService.getAllUsers(),
    }).subscribe({
      next: ({ award, users }) => {
        this.award = award;
        this.icono = this.ICONOS[award.titulo] || '🎖️';
        this.usuarios = users;
        this.loadNominations(awardId);
      },
      error: () => (this.loading = false),
    });
  }

  private loadNominations(awardId: number): void {
    this.loadingNominations = true;

    this.awardsService.getResults(awardId).subscribe({
      next: (noms) => {
        this.nominations = noms;
        this.loading = false;
        this.loadingNominations = false;
      },
      error: () => {
        this.loading = false;
        this.loadingNominations = false;
      },
    });
  }

  // -------- CLIP MODAL --------
  clipHasUrl(n: NominationResult): boolean {
    return !!(n.clip_url && n.clip_url.trim());
  }

  clipDisplayTitle(n: NominationResult): string {
    const t = (n.clip_title || '').trim();
    return t || n.display_name || 'Clip';
  }

  openClip(nom: NominationResult): void {
    if (!this.clipHasUrl(nom)) return;
    this.selectedClip = nom;
    this.clipModalOpen = true;
  }

  closeClip(): void {
    this.clipModalOpen = false;
    this.selectedClip = null;
  }

  // -------- FORM PEOPLE --------
  onSubmitNomination(): void {
    if (!this.award || this.award.award_type === 'clip') return;

    this.formError = '';
    this.formSuccess = '';

    if (!this.formHazana.trim()) {
      this.formError = 'Cuenta la hazaña, no seas perro.';
      return;
    }

    this.saving = true;

    this.awardsService
      .createNomination(this.award.id, {
        nominado: this.formNominadoId!,
        nominado_secundario:
          this.award.allow_pair_nominations && this.modoNomina === 'pair'
            ? this.formNominadoId2
            : null,
        hazana: this.formHazana.trim(),
      })
      .subscribe({
        next: () => {
          this.formHazana = '';
          this.formNominadoId = null;
          this.formNominadoId2 = null;
          this.modoNomina = 'single';
          this.formSuccess = 'Nominación enviada 😈';
          this.saving = false;
          this.loadNominations(this.award!.id);
        },
        error: (err) => {
          this.saving = false;
          this.formError =
            err?.error?.detail || 'No se pudo enviar la nominación.';
        },
      });
  }
}