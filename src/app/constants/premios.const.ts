// src/app/constants/premios.const.ts

export interface PremioGanado {
  titulo: string;
  anio: number;
}

export const PREMIOS_GANADOS: Record<string, PremioGanado[]> = {
  // username: [premios]

  "tore": [
    { titulo: "Best Performance of the Year", anio: 2024 },
    { titulo: "Clip del Año", anio: 2024 },
  ],

  "huevos": [
    { titulo: "Más Inoperante del Año", anio: 2024 },
  ],

  "barto": [
    { titulo: "Más Gay del Grupo", anio: 2024 },
  ],

  "lopez": [
    { titulo: "Pulmones más negros", anio: 2024 },
  ],

  "victor": [
    { titulo: "Más alcohólico", anio: 2024 },
    { titulo: "Pareja del Año", anio: 2024 },
  ],

  "xhino": [
    { titulo: "Clip del Año", anio: 2024 },
  ],

  "paco": [
    { titulo: "Más Mandarino", anio: 2024 },
  ],

  "sorey": [
    { titulo: "Cliente más fiel de Bartolo", anio: 2024 },
  ],

  "primo": [
    { titulo: "Ludópata del Año", anio: 2024 },
    { titulo: "Pareja del Año", anio: 2024 },
  ],

  "miguel": [
    { titulo: "Rookie del Año", anio: 2024},
  ]
};