import React, { useState } from 'react';
import { Button, Typography, List, ListItem, ListItemText, Grid } from '@mui/material';
import AddGoalDialog from '../../components/AddGoalDialog';
import { Match, Goal, Team, MatchState } from '../../types/Match';
import { firestoreDb } from '../../firebase';
import { doc, updateDoc } from 'firebase/firestore';

interface MatchStartedViewProps {
  initialMatch: Match;
  backToSelectTeams: (match: Match) => void;
  onMatchCompleted: () => void;
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

  return (
    <Grid container direction="column" alignItems="center" spacing={3}>
      <Grid item>
        <Typography variant="h4">Match on {new Date(match.date).toLocaleDateString()}</Typography>
      </Grid>
      <Grid item>
        <Typography variant="h2">{match.score.red} - {match.score.yellow}</Typography>
      </Grid>
      <Grid item container direction="row" justifyContent="center" spacing={3}>
        <Grid item xs={12} sm={5}>
          <Typography variant="h6" align="center">Red Team</Typography>
          <List>
            {match.goals?.filter(goal => goal.team === Team.RED).map((goal, index) => (
              <ListItem key={index}>
                <ListItemText primary={goal.scorer.name} secondary={goal.ownGoal ? "Own Goal" : `Assisted by ${goal.assister?.name}`} />
              </ListItem>
            ))}
          </List>
        </Grid>
        <Grid item xs={12} sm={5}>
          <Typography variant="h6" align="center">Yellow Team</Typography>
          <List>
            {match.goals?.filter(goal => goal.team === Team.YELLOW).map((goal, index) => (
              <ListItem key={index}>
                <ListItemText primary={goal.scorer.name} secondary={goal.ownGoal ? "Own Goal" : `Assisted by ${goal.assister?.name}`} />
              </ListItem>
            ))}
          </List>
        </Grid>
      </Grid>
      <Grid item container spacing={2} justifyContent="space-between" alignItems="center" style={{ width: '100%' }}>
        <Grid item xs="auto">
          <Button variant="contained" color="secondary" onClick={goBackToSelectTeams}>Go Back</Button>
        </Grid>
        <Grid item container spacing={2} justifyContent="flex-end" xs>
          <Grid item>
            <Button variant="contained" color="secondary" onClick={() => setDialogOpen(true)}>Add Goal</Button>
          </Grid>
          <Grid item>
            <Button variant="contained" color="primary" onClick={onMatchCompleted}>Complete Match</Button>
          </Grid>
        </Grid>
      </Grid>
      <AddGoalDialog match={match} open={dialogOpen} onClose={() => setDialogOpen(false)} handleGoalAdded={handleGoalAdded} />
    </Grid>
  );
};

export default MatchStartedView;
