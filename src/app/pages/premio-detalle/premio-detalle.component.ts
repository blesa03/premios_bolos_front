// src/app/pages/premio-detalle/premio-detalle.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { forkJoin, of } from 'rxjs';

import {
  AwardsService,
  Award,
  Nomination,
  NominationResult,
  Participant,
} from '../../services/awards.service';
import { UserService, User } from '../../services/user.service';

interface NominadoConHazanas {
  user1: User;
  user2?: User | null;
  hazanas: string[];
  total: number;
}

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
  nominados: NominadoConHazanas[] = [];

  // 👇 CLIP: lista de candidatos (cada clip = 1 card)
  clipCandidates: NominationResult[] = [];

  // Modal clip
  clipModalOpen = false;
  selectedClip: NominationResult | null = null;

  // Form nominación (solo people / pareja)
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
      // 👇 cargamos nominations por defecto (people), pero si luego es clip no las usaremos
      nominations: this.awardsService.getAwardNominations(awardId),
    }).subscribe({
      next: ({ award, users, nominations }) => {
        this.award = award;
        this.icono = this.ICONOS[award.titulo] || '🎖️';
        this.usuarios = users;

        // Si es CLIP, pintamos candidates desde /results/
        if (award.award_type === 'clip') {
          this.loadClipCandidates(awardId);
        } else {
          // PEOPLE
          this.procesarNominaciones(nominations, users);
          this.loading = false;
        }
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      },
    });
  }

  get isPairAward(): boolean {
    return !!this.award?.allow_pair_nominations;
  }

  get isClipAward(): boolean {
    return this.award?.award_type === 'clip';
  }

  private loadClipCandidates(awardId: number): void {
    this.awardsService.getResults(awardId).subscribe({
      next: (results) => {
        // aquí cada resultado YA es un clip con participants[]
        this.clipCandidates = results;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      },
    });
  }

  private procesarNominaciones(noms: Nomination[], users: User[]): void {
    const usersById = new Map<number, User>();
    users.forEach((u) => usersById.set(u.id, u));

    const grouped = new Map<
      string,
      { user1: User; user2?: User | null; hazanas: Set<string> }
    >();

    const isPairAward = this.isPairAward;

    for (const n of noms) {
      const u1 = usersById.get(n.nominado);
      if (!u1) continue;

      const secondaryId = n.nominado_secundario ?? null;
      const u2 = secondaryId ? usersById.get(secondaryId) ?? null : null;

      let key: string;

      if (isPairAward && secondaryId && u2) {
        const [a, b] = [n.nominado, secondaryId].sort((x, y) => x - y);
        key = `pair-${a}-${b}`;
      } else {
        key = `single-${n.nominado}`;
      }

      if (!grouped.has(key)) {
        grouped.set(key, {
          user1: u1,
          user2: u2,
          hazanas: new Set<string>(),
        });
      }

      grouped.get(key)!.hazanas.add(n.hazana);
    }

    this.nominados = Array.from(grouped.values())
      .map((g) => ({
        user1: g.user1,
        user2: g.user2 ?? null,
        hazanas: Array.from(g.hazanas),
        total: g.hazanas.size,
      }))
      .sort((a, b) => b.total - a.total);
  }

  recargarNominaciones(): void {
    if (!this.award) return;

    if (this.award.award_type === 'clip') {
      this.loadClipCandidates(this.award.id);
      return;
    }

    forkJoin({
      nominations: this.awardsService.getAwardNominations(this.award.id),
      users: this.userService.getAllUsers(),
    }).subscribe({
      next: ({ nominations, users }) => {
        this.usuarios = users;
        this.procesarNominaciones(nominations, users);
      },
      error: (err) => console.error(err),
    });
  }

  // ---- Modal clip ----
  openClip(nom: NominationResult): void {
    this.selectedClip = nom;
    this.clipModalOpen = true;
  }

  closeClip(): void {
    this.clipModalOpen = false;
    this.selectedClip = null;
  }

  // ---- Form submit (solo people) ----
  onSubmitNomination(): void {
    if (!this.award) return;

    // Si es clip, aquí no se nomina nunca
    if (this.award.award_type === 'clip') return;

    this.formError = '';
    this.formSuccess = '';

    const isPairAward = this.isPairAward;

    if (!this.formHazana.trim()) {
      this.formError =
        'Cuéntanos la hazaña, no vale nominar “porque sí”. Eso se banea.';
      return;
    }

    if (isPairAward && this.modoNomina === 'pair') {
      if (!this.formNominadoId || !this.formNominadoId2) {
        this.formError = 'Elige a los dos integrantes de la pareja, mi rey.';
        return;
      }

      if (this.formNominadoId === this.formNominadoId2) {
        this.formError =
          'Para nominar a una pareja tienen que ser dos personas distintas, máquina.';
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
            this.saving = false;
            this.formHazana = '';
            this.formNominadoId = null;
            this.formNominadoId2 = null;
            this.modoNomina = 'single';
            this.formSuccess =
              'Nominación de pareja enviada. El amor boleril está en el aire 💘';
            this.recargarNominaciones();
          },
          error: (err) => {
            console.error(err);
            this.saving = false;

            const detail =
              err?.error?.detail ||
              (Array.isArray(err?.error?.non_field_errors)
                ? err.error.non_field_errors[0]
                : null);

            this.formError =
              detail ||
              'No se ha podido registrar la nominación. Inténtalo de nuevo en un ratito.';
          },
        });

      return;
    }

    if (!this.formNominadoId) {
      this.formError = 'Elige a quién quieres nominar, mi rey.';
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
          this.saving = false;
          this.formHazana = '';
          this.formNominadoId = null;
          this.formNominadoId2 = null;
          this.modoNomina = 'single';
          this.formSuccess = 'Nominación enviada. Eres parte del problema 😈';
          this.recargarNominaciones();
        },
        error: (err) => {
          console.error(err);
          this.saving = false;

          const detail =
            err?.error?.detail ||
            (Array.isArray(err?.error?.non_field_errors)
              ? err.error.non_field_errors[0]
              : null);

          this.formError =
            detail ||
            'No se ha podido registrar la nominación. Inténtalo de nuevo en un ratito.';
        },
      });
  }

  // helpers UI (clip)
  clipDisplayTitle(n: NominationResult): string {
    const t = (n.clip_title || '').trim();
    return t || n.display_name || 'Clip';
  }

  clipHasUrl(n: NominationResult): boolean {
    return !!(n.clip_url && n.clip_url.trim());
  }

  participantsLabel(n: NominationResult): string {
    const names = (n.participants || []).map((p) => (p.nickname || p.username).trim()).filter(Boolean);
    if (names.length === 0) return '';
    if (names.length === 1) return names[0];
    if (names.length === 2) return `${names[0]} & ${names[1]}`;
    return `${names.slice(0, -1).join(', ')} & ${names[names.length - 1]}`;
  }
}