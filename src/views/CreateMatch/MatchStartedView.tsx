import React, { useState } from 'react';
import { Button, Typography, List, ListItem, ListItemText, Grid } from '@mui/material';
import AddGoalDialog from '../../components/AddGoalDialog';
import { Match, Goal, Team } from '../../types/Match';

interface MatchStartedViewProps {
  match: Match;
  onMatchCompleted: () => void;
}

const MatchStartedView: React.FC<MatchStartedViewProps> = ({ match, onMatchCompleted }) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleGoalAdded = () => {
    // Refresh the match data or update the local state if necessary
    setDialogOpen(false);
  };

  return (
    <Grid container direction="column" alignItems="center" spacing={3}>
      <Grid item>
        <Typography variant="h2">{match.score.red} - {match.score.yellow}</Typography>
      </Grid>
      <Grid item container direction="row" justifyContent="space-between" spacing={3}>
        <Grid item xs={12} sm={6}>
          <Typography variant="h6">Red Team</Typography>
          <List>
            {match.goals?.filter(goal => goal.team === Team.RED).map((goal, index) => (
              <ListItem key={index}>
                <ListItemText primary={goal.scorer.name} secondary={goal.ownGoal ? "Own Goal" : `Assisted by ${goal.assister?.name}`} />
              </ListItem>
            ))}
          </List>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="h6">Yellow Team</Typography>
          <List>
            {match.goals?.filter(goal => goal.team === Team.YELLOW).map((goal, index) => (
              <ListItem key={index}>
                <ListItemText primary={goal.scorer.name} secondary={goal.ownGoal ? "Own Goal" : `Assisted by ${goal.assister?.name}`} />
              </ListItem>
            ))}
          </List>
        </Grid>
      </Grid>
      <Grid item>
        <Button variant="contained" color="primary" onClick={() => setDialogOpen(true)}>Add Goal</Button>
        <Button variant="contained" color="secondary" onClick={onMatchCompleted}>Complete Match</Button>
      </Grid>
      <AddGoalDialog match={match} open={dialogOpen} onClose={() => setDialogOpen(false)} onGoalAdded={handleGoalAdded} />
    </Grid>
  );
};

export default MatchStartedView;
