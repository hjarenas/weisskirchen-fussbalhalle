import React, { useEffect, useState } from 'react';
import { Button, Grid } from '@mui/material';
import AddGoalDialog from '../../components/Matches/AddGoalDialog';
import { Match, Goal, MatchState, Team } from '../../types/Match';
import { firestoreDb } from '../../firebase';
import { doc, getDoc, onSnapshot, updateDoc, writeBatch } from 'firebase/firestore';
import GridMatchItem from '../../components/Matches/GridMatchItem';
import { Player, PlayerStats } from '../../types/Player';
import { fromFirestoreMatch } from '../../utils/firestoreUtils';

interface MatchStartedViewProps {
  initialMatchId: string;
  backToSelectTeams: (match: MatchState) => void;
  onMatchCompleted: (match: Match) => void;
}

enum MatchOutcome {
  RedWon,
  YellowWon,
  Tie
}

const MatchStartedView: React.FC<MatchStartedViewProps> = ({ initialMatchId, backToSelectTeams, onMatchCompleted }) => {
  const [match, setMatch] = useState<Match | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const matchRef = doc(firestoreDb, 'matches', initialMatchId);

    const unsubscribe = onSnapshot(matchRef, (doc) => {
      if (doc.exists()) {
        const match = fromFirestoreMatch(doc);
        setMatch(match);
      } else {
        console.log("No such document!");
      }
    });

    // Clean up the listener when the component unmounts
    return () => unsubscribe();
  }, [initialMatchId]);

  const handleGoalAdded = async (goal: Goal) => {
    setDialogOpen(false);
    if (!match) {
      console.log('Match not found');
      return;
    }
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
    if (!match) {
      console.log('Match not found');
      return;
    }

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
    backToSelectTeams(updatedMatch.state);
  }

  const handleCompleteMatch = async () => {
    if (!match) {
      console.log('Match not found');
      return;
    }
    // Start a batch
    const batch = writeBatch(firestoreDb);

    // Initialize an object to track player stats updates
    const playerUpdates: { [playerId: string]: PlayerStats } = {};

    // Function to accumulate player stats updates
    const accumulatePlayerStats = (playerId: string, updates: Partial<PlayerStats>) => {
      if (!playerUpdates[playerId]) {
        playerUpdates[playerId] = { goals: 0, assists: 0, ownGoals: 0, matchesPlayed: 0, wins: 0, losses: 0, ties: 0 };
      }
      Object.keys(updates).forEach((key: string) => {
        const statsKey = key as keyof PlayerStats;
        playerUpdates[playerId][statsKey] = (playerUpdates[playerId][statsKey] ?? 0) + (updates[statsKey] ?? 0);
      });
    };

    // Process goals, assists, and own goals
    match.goals.forEach(goal => {
      if (!goal.ownGoal) {
        accumulatePlayerStats(goal.scorer.id, { goals: 1 });
      }
      else if (goal.ownGoal) {
        accumulatePlayerStats(goal.scorer.id, { ownGoals: 1 });
      }

      if (goal.assister) {
        accumulatePlayerStats(goal.assister.id, { assists: 1 });
      }
    });

    // Determine match outcome and update player stats
    let matchOutcome = determineMatchOutcome(match);
    match.redTeam.forEach(player => accumulatePlayerStats(player.id, getWinsLossesOrTieObject(matchOutcome, Team.RED)));
    match.yellowTeam.forEach(player => accumulatePlayerStats(player.id, getWinsLossesOrTieObject(matchOutcome, Team.YELLOW)));

    // Apply the accumulated updates to each player
    const currentYear = new Date().getFullYear().toString();
    await Promise.all(Object.entries(playerUpdates).map(async ([playerId, updates]) => {
      const playerRef = doc(firestoreDb, 'players', playerId);
      const playerSnap = await getDoc(playerRef);
      const player: Player = playerSnap.data() as Player;
      const currentStats: PlayerStats = player.stats[currentYear] || {};
      // Merge updates with current stats
      Object.keys(updates).forEach((key: string) => {
        const statsKey = key as keyof PlayerStats;
        currentStats[statsKey] = (currentStats[statsKey] ?? 0) + (updates[statsKey] ?? 0);
      });

      // Write updated stats back to Firestore
      batch.update(playerRef, { [`stats.${currentYear}`]: currentStats });
    }));

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
  };

  const determineMatchOutcome = (finalMatch: Match): MatchOutcome => {
    if (finalMatch.score.red > finalMatch.score.yellow) {
      return MatchOutcome.RedWon;
    } else if (finalMatch.score.red < finalMatch.score.yellow) {
      return MatchOutcome.YellowWon;
    } else {
      return MatchOutcome.Tie;
    }
  }
  const getWinsLossesOrTieObject = (matchOutcome: MatchOutcome, team: Team): Partial<PlayerStats> => {
    if (matchOutcome === MatchOutcome.RedWon && team === Team.RED) {
      return { matchesPlayed: 1, wins: 1 };
    } else if (matchOutcome === MatchOutcome.YellowWon && team === Team.YELLOW) {
      return { matchesPlayed: 1, wins: 1 };
    } else if (matchOutcome === MatchOutcome.Tie) {
      return { matchesPlayed: 1, ties: 1 };
    }
    return { matchesPlayed: 1, losses: 1 };
  }

  return (
    <>
      {!!match ? (
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
        ): <p>Loading...</p>}
    </>
  );
};

export default MatchStartedView;
