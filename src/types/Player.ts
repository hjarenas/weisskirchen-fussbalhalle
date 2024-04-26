// src/types/Player.ts

export interface PlayerStats {
  goals?: number;
  assists?: number;
  matchesPlayed?: number;
  ownGoals?: number;
  wins?: number;
  losses?: number;
  ties?: number;
  points?: number;
}

export interface Player {
  id?: string;
  name: string;
  stats: {
    [year: string]: PlayerStats;
  };
}
