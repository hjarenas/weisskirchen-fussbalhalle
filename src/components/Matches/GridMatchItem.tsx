import { Grid, List, ListItem, ListItemText, Typography } from "@mui/material";
import { Match, Team } from "../../types/Match";

interface GridMatchItemProps {
  match: Match;
}

const GridMatchItem: React.FC<GridMatchItemProps> = ({ match }) => {
  return (
    <Grid item container direction="column" alignItems="center" spacing={3}>
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
    </Grid>
  );
}

export default GridMatchItem;
