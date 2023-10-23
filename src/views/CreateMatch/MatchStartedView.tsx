import React, { useState } from 'react';
import { Button, Grid } from '@mui/material';
import AddGoalDialog from '../../components/Matches/AddGoalDialog';
import { Match, Goal, Team, MatchState } from '../../types/Match';
import { firestoreDb } from '../../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import GridMatchItem from '../../components/Matches/GridMatchItem';

interface MatchStartedViewProps {
  initialMatch: Match;
  backToSelectTeams: (match: Match) => void;
  onMatchCompleted: (match: Match) => void;
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
    const updates = {
      state: MatchState.MatchEnded
    };

    const updatedMatch = {
      ...match,
      ...updates
    };

    const matchRef = doc(firestoreDb, 'matches', match.id!);
    await updateDoc(matchRef, updates);

    onMatchCompleted(updatedMatch);
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
