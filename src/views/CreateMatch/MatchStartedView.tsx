import React, { useState } from 'react';
import { Button, Grid } from '@mui/material';
import AddGoalDialog from '../../components/Matches/AddGoalDialog';
import { Match, Goal, MatchState, Team, SimplePlayer } from '../../types/Match';
import { firestoreDb } from '../../firebase';
import { doc, getDoc, increment, updateDoc, writeBatch } from 'firebase/firestore';
import GridMatchItem from '../../components/Matches/GridMatchItem';
import { Player, PlayerStats } from '../../types/Player';

interface MatchStartedViewProps {
  initialMatch: Match;
  backToSelectTeams: (match: Match) => void;
  onMatchCompleted: (match: Match) => void;
}

enum MatchOutcome {
  RedWon,
  YellowWon,
  Tie
}

enum MatchOutcomeForPlayer {
  Win,
  Loss,
  Tie
}

const MatchStartedView: React.FC<MatchStartedViewProps> = ({ initialMatch, backToSelectTeams, onMatchCompleted }) => {
  const [match, setMatch] = useState<Match>(initialMatch);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleGoalAdded = async (goal: Goal) => {
    setDialogOpen(false);
    // Refresh the match data or update the local state if necessary
    const updates = {
      goals: [...match.goals, goal],
      score: {
        ...match.score,
        [goal.team]: match.score[goal.team] + 1
      }
    };

    const updatedMatch = {
      ...match,
      ...updates
    };

    const matchRef = doc(firestoreDb, 'matches', match.id!);
    await updateDoc(matchRef, updates);

    setMatch(updatedMatch);
  };

  const goBackToSelectTeams = async () => {
    const updates = {
      state: MatchState.ChoosingTeams
    };

    const updatedMatch = {
      ...match,
      ...updates
    };

    const matchRef = doc(firestoreDb, 'matches', match.id!);
    await updateDoc(matchRef, updates);

    setMatch(updatedMatch);
    backToSelectTeams(updatedMatch);
  }

  const handleCompleteMatch = async () => {
    // Start a batch
    const batch = writeBatch(firestoreDb);

    const updatePlayerStats = async (simplePlayer: SimplePlayer, matchOutcome: MatchOutcomeForPlayer) => {
      const playerRef = doc(firestoreDb, 'players', simplePlayer.id);
      const currentYear = new Date().getFullYear().toString();
      const player = (await getDoc(playerRef)).data() as Player;
      const currentStats: PlayerStats = player.stats[currentYear] || {};

      // Update stats based on match outcome
      currentStats.matchesPlayed = (currentStats.matchesPlayed ?? 0) + 1;
      if (matchOutcome === MatchOutcomeForPlayer.Win) {
        currentStats.wins = (currentStats.wins ?? 0) + 1;
      } else if (matchOutcome === MatchOutcomeForPlayer.Loss) {
        currentStats.losses = (currentStats.losses ?? 0) + 1;
      }
      else {
        currentStats.ties = (currentStats.ties ?? 0) + 1;
      }

      // Update the player stats in the batch
      batch.update(playerRef, { [`stats.${currentYear}`]: currentStats });
    };
    let matchOutcome = determineMatchOutcome();
    // Update stats for each player
    await Promise.all(match.redTeam.map(player => updatePlayerStats(player, convertMatchOutcomeToPlayerOutcome(matchOutcome, Team.RED))));
    await Promise.all(match.yellowTeam.map(player => updatePlayerStats(player, convertMatchOutcomeToPlayerOutcome(matchOutcome, Team.YELLOW))));

    // Update the match state
    const updates = { state: MatchState.MatchEnded };
    const matchRef = doc(firestoreDb, 'matches', match.id!);
    batch.update(matchRef, updates);

    // Commit the batch
    await batch.commit();
    const updatedMatch = {
      ...match,
      ...updates
    };
    onMatchCompleted(updatedMatch);
  }

  const determineMatchOutcome = (): MatchOutcome => {
    if (match.score.red > match.score.yellow) {
      return MatchOutcome.RedWon;
    } else if (match.score.red < match.score.yellow) {
      return MatchOutcome.YellowWon;
    } else {
      return MatchOutcome.Tie;
    }
  }
  const convertMatchOutcomeToPlayerOutcome = (matchOutcome: MatchOutcome, team: Team): MatchOutcomeForPlayer => {
    if (matchOutcome === MatchOutcome.RedWon && team === Team.RED) {
      return MatchOutcomeForPlayer.Win;
    } else if (matchOutcome === MatchOutcome.YellowWon && team === Team.YELLOW) {
      return MatchOutcomeForPlayer.Win;
    } else if (matchOutcome === MatchOutcome.Tie) {
      return MatchOutcomeForPlayer.Tie;
    }
    return MatchOutcomeForPlayer.Loss;
  }
  return (
    <Grid container direction="column" alignItems="center" spacing={3}>
      <GridMatchItem match={match} />
      <Grid item container spacing={2} justifyContent="space-between" alignItems="center" style={{ width: '100%' }}>
        <Grid item xs="auto">
          <Button variant="contained" color="secondary" onClick={goBackToSelectTeams}>Go Back</Button>
        </Grid>
        <Grid item container spacing={2} justifyContent="flex-end" xs>
          <Grid item>
            <Button variant="contained" color="secondary" onClick={() => setDialogOpen(true)}>Add Goal</Button>
          </Grid>
          <Grid item>
            <Button variant="contained" color="primary" onClick={handleCompleteMatch}>Complete Match</Button>
          </Grid>
        </Grid>
      </Grid>
      <AddGoalDialog match={match} open={dialogOpen} onClose={() => setDialogOpen(false)} handleGoalAdded={handleGoalAdded} />
    </Grid>
  );
};

export default MatchStartedView;
