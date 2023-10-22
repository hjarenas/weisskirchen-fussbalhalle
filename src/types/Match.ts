import { Timestamp } from "firebase/firestore";

export interface SimplePlayer {
  id: string;
  name: string;
}

export enum Team {
  RED = 'RED',
  YELLOW = 'YELLOW',
}

export enum MatchState {
  ChoosingPlayers,
  ChoosingTeams,
  MatchStarted,
  MatchEnded
}

interface BaseMatch {
  id?: string;
  redTeam: SimplePlayer[];
  yellowTeam: SimplePlayer[];
  unassignedPlayers: SimplePlayer[];
  score: {
    red: number;
    yellow: number;
  };
  winner: Team;
  state: MatchState;
}
export interface Match extends BaseMatch {

  date: Date;
}

export interface FirestoreMatch extends BaseMatch {
  date: Timestamp;
}
