// src/types/Player.ts

export interface PlayerStats {
  goals?: number;
  assists?: number;
  matchesPlayed?: number;
  ownGoals?: number;
  wins?: number;
  losses?: number;
}

export interface Player {
  name: string;
  stats: {
    [year: string]: PlayerStats;
  };
}
