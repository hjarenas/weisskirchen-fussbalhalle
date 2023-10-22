import { Card, CardContent, Grid, IconButton, Typography } from "@mui/material";
import { Match, MatchState } from "../../types/Match";
import DoneIcon from '@mui/icons-material/Done';
import DeleteIcon from '@mui/icons-material/Delete';

type ExistingMatchCardViewProps = {
  match: Match;
  selectMatch: (match: Match) => void;
  deleteMatch: (match: Match) => void;
};

const ExistingMatchCardView: React.FC<ExistingMatchCardViewProps> = ({ match, selectMatch, deleteMatch }) => {
  return (
    <Card variant="outlined" style={{ width: '95%' }}>
      <CardContent>
        <Grid container justifyContent="space-between" alignItems="center">
          <Grid item>
            <Typography variant="h6" component="div" >
              Match on: {match.date.toLocaleDateString()}
            </Typography>
            <Typography color="textSecondary">
              State: {MatchState[match.state]}
            </Typography>
          </Grid>
          <Grid item>
            <IconButton onClick={() => selectMatch(match)}>
              <DoneIcon />
            </IconButton>
            <IconButton onClick={() => deleteMatch(match)}>
              <DeleteIcon />
            </IconButton>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}

export default ExistingMatchCardView;
