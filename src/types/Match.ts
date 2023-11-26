import { Timestamp } from "firebase/firestore";

export interface SimplePlayer {
  id: string;
  name: string;
}

export enum Team {
  RED = 'red',
  YELLOW = 'yellow',
}

export enum MatchState {
  ChoosingPlayers,
  ChoosingTeams,
  MatchStarted,
  MatchEnded
}

export interface Goal {
  team: Team;
  scorer: SimplePlayer;
  ownGoal: boolean;
  assister?: SimplePlayer;
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
  goals: Goal[];
  state: MatchState;
}
export interface Match extends BaseMatch {
  date: Date;
}

export interface FirestoreMatch extends BaseMatch {
  date: Timestamp;
}
