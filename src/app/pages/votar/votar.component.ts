// src/app/pages/votar/votar.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import {
  AwardsService,
  Award,
  NominationResult,
} from '../../services/awards.service';

@Component({
  selector: 'app-votar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './votar.component.html',
})
export class VotarComponent implements OnInit {
  // Lista de premios
  premios: Award[] = [];
  loadingAwards = true;

  // Detalle de premio
  selectedAward: Award | null = null;
  nominations: NominationResult[] = [];
  loadingNominations = false;
  voting = false;

  errorMessage = '';
  successMessage = '';

  // Para marcar en el front quién es tu voto justo después de votar
  private lastVotedNominationId: number | null = null;

  // Modal clip
  clipModalOpen = false;
  selectedClip: NominationResult | null = null;

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
    'Clip del Año': '🎬',
  };

  constructor(
    private awardsService: AwardsService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadAwards();

    this.route.paramMap.subscribe((params) => {
      const idParam = params.get('id');
      if (idParam) {
        const awardId = Number(idParam);
        if (!Number.isNaN(awardId)) {
          this.loadAwardDetail(awardId);
        }
      } else {
        this.selectedAward = null;
        this.nominations = [];
        this.errorMessage = '';
        this.successMessage = '';
        this.lastVotedNominationId = null;

        // modal
        this.clipModalOpen = false;
        this.selectedClip = null;
      }
    });
  }

  // --------- Lista de premios ---------
  private loadAwards(): void {
    this.loadingAwards = true;
    this.awardsService.getAwards().subscribe({
      next: (awards) => {
        this.premios = awards;
        this.loadingAwards = false;
      },
      error: (err) => {
        console.error(err);
        this.loadingAwards = false;
      },
    });
  }

  // --------- Detalle de premio ---------
  private loadAwardDetail(awardId: number): void {
    this.selectedAward = null;
    this.nominations = [];
    this.loadingNominations = true;
    this.errorMessage = '';
    this.successMessage = '';

    // cerrar modal al cambiar de premio
    this.clipModalOpen = false;
    this.selectedClip = null;

    this.awardsService.getAward(awardId).subscribe({
      next: (award) => {
        this.selectedAward = award;

        this.awardsService.getResults(awardId).subscribe({
          next: (noms) => {
            this.nominations = noms;

            if (this.lastVotedNominationId !== null) {
              this.nominations = this.nominations.map((n) => ({
                ...n,
                is_my_vote: n.id === this.lastVotedNominationId,
              }));
            }

            this.loadingNominations = false;
          },
          error: (err) => {
            console.error(err);
            this.loadingNominations = false;
            this.errorMessage = 'No se han podido cargar las nominaciones.';
          },
        });
      },
      error: (err) => {
        console.error(err);
        this.loadingNominations = false;
        this.errorMessage = 'Este premio no existe o no está disponible.';
      },
    });
  }

  onSelectAward(premio: Award): void {
    this.lastVotedNominationId = null;
    this.router.navigate(['/votar', premio.id]);
  }

  getIconForAward(premio: Award | null): string {
    if (!premio) return '🎖️';
    return this.ICONOS[premio.titulo] || '🎖️';
  }

  goBackToList(): void {
    this.lastVotedNominationId = null;
    this.router.navigate(['/votar']);
  }

  // --------- Helpers CLIP ---------
  get isClipAward(): boolean {
    return this.selectedAward?.award_type === 'clip';
  }

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

  // --------- Votar ---------
  onVote(nom: NominationResult): void {
    if (!this.selectedAward) return;

    if (!this.selectedAward.allow_voting) {
      this.errorMessage = 'Este premio está cerrado a votaciones.';
      return;
    }

    this.voting = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.awardsService.vote(this.selectedAward.id, nom.id).subscribe({
      next: () => {
        this.successMessage = 'Voto registrado. Eres parte del jurado boleril. 😎';
        this.voting = false;

        this.lastVotedNominationId = nom.id;

        this.loadAwardDetail(this.selectedAward!.id);
      },
      error: (err) => {
        console.error(err);
        this.voting = false;
        this.errorMessage =
          err?.error?.detail ||
          'No se ha podido registrar el voto. Prueba otra vez en un rato.';
      },
    });
  }
}