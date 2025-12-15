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

  usuarios: User[] = [];

  // 👉 MISMO MODELO QUE /votar
  nominations: NominationResult[] = [];

  // 👉 CLIP
  clipCandidates: NominationResult[] = [];

  // Modal clip
  clipModalOpen = false;
  selectedClip: NominationResult | null = null;

  // Form nominación (people / pareja)
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

    this.loading = true;

    forkJoin({
      award: this.awardsService.getAward(awardId),
      users: this.userService.getAllUsers(),
    }).subscribe({
      next: ({ award, users }) => {
        this.award = award;
        this.icono = this.ICONOS[award.titulo] || '🎖️';
        this.usuarios = users;

        // 👉 USAMOS SIEMPRE RESULTS (igual que /votar)
        this.awardsService.getResults(awardId).subscribe({
          next: (results) => {
            if (award.award_type === 'clip') {
              this.clipCandidates = results;
            } else {
              this.nominations = results;
            }
            this.loading = false;
          },
          error: (err) => {
            console.error(err);
            this.loading = false;
          },
        });
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      },
    });
  }

  // =====================
  // Helpers
  // =====================
  get isPairAward(): boolean {
    return !!this.award?.allow_pair_nominations;
  }

  get isClipAward(): boolean {
    return this.award?.award_type === 'clip';
  }

  recargarNominaciones(): void {
    if (!this.award) return;

    this.awardsService.getResults(this.award.id).subscribe({
      next: (results) => {
        if (this.award!.award_type === 'clip') {
          this.clipCandidates = results;
        } else {
          this.nominations = results;
        }
      },
      error: (err) => console.error(err),
    });
  }

  // =====================
  // Modal clip
  // =====================
  openClip(nom: NominationResult): void {
    if (!this.clipHasUrl(nom)) return;
    this.selectedClip = nom;
    this.clipModalOpen = true;
  }

  closeClip(): void {
    this.clipModalOpen = false;
    this.selectedClip = null;
  }

  // =====================
  // Form submit (solo people)
  // =====================
  onSubmitNomination(): void {
    if (!this.award) return;
    if (this.award.award_type === 'clip') return;

    this.formError = '';
    this.formSuccess = '';

    if (!this.formHazana.trim()) {
      this.formError =
        'Cuéntanos la hazaña, no vale nominar “porque sí”.';
      return;
    }

    // ---- PAREJA ----
    if (this.isPairAward && this.modoNomina === 'pair') {
      if (!this.formNominadoId || !this.formNominadoId2) {
        this.formError = 'Elige a los dos integrantes de la pareja.';
        return;
      }

      if (this.formNominadoId === this.formNominadoId2) {
        this.formError = 'No puedes nominar a la misma persona dos veces.';
        return;
      }

      this.saving = true;

      this.awardsService
        .createNomination(this.award.id, {
          nominado: this.formNominadoId,
          nominado_secundario: this.formNominadoId2,
          hazana: this.formHazana.trim(),
        })
        .subscribe({
          next: () => {
            this.resetForm();
            this.formSuccess =
              'Nominación de pareja enviada 💘';
            this.recargarNominaciones();
          },
          error: (err) => {
            console.error(err);
            this.saving = false;
            this.formError =
              err?.error?.detail ||
              'No se ha podido registrar la nominación.';
          },
        });

      return;
    }

    // ---- SINGLE ----
    if (!this.formNominadoId) {
      this.formError = 'Elige a quién quieres nominar.';
      return;
    }

    this.saving = true;

    this.awardsService
      .createNomination(this.award.id, {
        nominado: this.formNominadoId,
        hazana: this.formHazana.trim(),
      })
      .subscribe({
        next: () => {
          this.resetForm();
          this.formSuccess = 'Nominación enviada 😈';
          this.recargarNominaciones();
        },
        error: (err) => {
          console.error(err);
          this.saving = false;
          this.formError =
            err?.error?.detail ||
            'No se ha podido registrar la nominación.';
        },
      });
  }

  private resetForm(): void {
    this.saving = false;
    this.formHazana = '';
    this.formNominadoId = null;
    this.formNominadoId2 = null;
    this.modoNomina = 'single';
  }

  // =====================
  // Helpers UI (clip)
  // =====================
  clipDisplayTitle(n: NominationResult): string {
    const t = (n.clip_title || '').trim();
    return t || n.display_name || 'Clip';
  }

  clipHasUrl(n: NominationResult): boolean {
    return !!(n.clip_url && n.clip_url.trim());
  }

  participantsLabel(n: NominationResult): string {
    const names = (n.participants || [])
      .map((p) => (p.nickname || p.username).trim())
      .filter(Boolean);

    if (names.length === 0) return '';
    if (names.length === 1) return names[0];
    if (names.length === 2) return `${names[0]} & ${names[1]}`;
    return `${names.slice(0, -1).join(', ')} & ${names[names.length - 1]}`;
  }
}