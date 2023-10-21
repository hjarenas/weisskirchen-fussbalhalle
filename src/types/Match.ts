export interface SimplePlayer {
  name: string;
}

export enum Team {
  RED = 'RED',
  YELLOW = 'YELLOW',
}

export enum MatchState {
  ChoosingPlayers,
  PreparingMatch,
  MatchStarted,
  MatchEnded
}

export interface Match {
  id?: string;
  date: Date;
  redTeam: SimplePlayer[];
  yellowTeam: SimplePlayer[];
  score: {
    red: number;
    yellow: number;
  };
  winner: Team;
  state: MatchState;
}
