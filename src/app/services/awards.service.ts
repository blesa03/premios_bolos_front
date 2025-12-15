// src/app/services/awards.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API_BASE = 'http://localhost:8000/api';

export type AwardType = 'people' | 'clip';
export type NominationMode = 'single' | 'pair' | 'multi';

export interface Award {
  id: number;
  titulo: string;
  resumen: string;
  descripcion: string;
  activo: boolean;

  allow_nominations: boolean;
  allow_voting: boolean;
  show_results: boolean;

  allow_pair_nominations?: boolean;
  award_type: AwardType;
}

export interface AwardSuggestion {
  id: number;
  titulo: string;
  resumen: string;
  descripcion: string;

  // NUEVO
  award_type: AwardType;
  nomination_mode: NominationMode;
  max_participants: number | null;

  created_at: string;
  is_reviewed: boolean;
  is_accepted: boolean;
}

export interface Nomination {
  id: number;
  award: number;
  nominado: number;
  nominado_secundario: number | null;
  nominado_por: number;
  hazana: string;
  is_active: boolean;
  created_at: string;
}

export interface Participant {
  id: number;
  username: string;
  nickname: string;
  avatar: string | null;
}

export interface NominationResult {
  id: number;
  award: number;
  participants: Participant[];
  display_name: string;
  clip_title?: string;
  clip_url?: string;
  hazanas: string[];
  votos: number;
  is_my_vote: boolean;
}

@Injectable({ providedIn: 'root' })
export class AwardsService {
  constructor(private http: HttpClient) {}

  getAwards(): Observable<Award[]> {
    return this.http.get<Award[]>(`${API_BASE}/awards/list/`);
  }

  getAward(id: number): Observable<Award> {
    return this.http.get<Award>(`${API_BASE}/awards/${id}/`);
  }

  getAwardNominations(awardId: number): Observable<Nomination[]> {
    return this.http.get<Nomination[]>(`${API_BASE}/awards/${awardId}/nominations/`);
  }

  createNomination(
    awardId: number,
    data: { nominado: number; hazana: string; nominado_secundario?: number | null }
  ): Observable<Nomination> {
    return this.http.post<Nomination>(`${API_BASE}/awards/${awardId}/nominations/`, {
      award: awardId,
      ...data,
    });
  }

  createSuggestion(payload: {
    titulo: string;
    resumen: string;
    descripcion: string;

    // NUEVO
    award_type: AwardType;
    nomination_mode: NominationMode;
    max_participants?: number | null;
  }): Observable<AwardSuggestion> {
    return this.http.post<AwardSuggestion>(`${API_BASE}/awards/suggestions/`, payload);
  }

  getMySuggestions(): Observable<AwardSuggestion[]> {
    return this.http.get<AwardSuggestion[]>(`${API_BASE}/awards/suggestions/`);
  }

  getResults(awardId: number): Observable<NominationResult[]> {
    return this.http.get<NominationResult[]>(`${API_BASE}/awards/${awardId}/results/`);
  }

  vote(awardId: number, nominationId: number): Observable<any> {
    return this.http.post(`${API_BASE}/awards/${awardId}/vote/`, { nomination: nominationId });
  }
}