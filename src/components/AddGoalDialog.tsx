import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  RadioGroup,
  FormControlLabel,
  Radio,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
} from '@mui/material';
import { Goal, Match, SimplePlayer, Team } from '../types/Match';
import React from 'react';

interface AddGoalDialogProps {
  match: Match;
  open: boolean;
  onClose: () => void;
  handleGoalAdded: (goal: Goal) => void; // Define a Goal type
}

const AddGoalDialog: React.FC<AddGoalDialogProps> = ({ match, open, onClose, handleGoalAdded }) => {
  const [selectedTeam, setSelectedTeam] = React.useState<Team | null>(null);
  const [scorer, setScorer] = React.useState<SimplePlayer | null>(null);
  const [assister, setAssister] = React.useState<SimplePlayer | null>(null);
  const [ownGoal, setOwnGoal] = React.useState(false);

  const handleAddGoal = async () => {
    if (selectedTeam && scorer) {
      const goal: Goal = {
        team: selectedTeam,
        scorer: scorer,
        assister: assister ?? undefined,
        ownGoal,
      };
      handleGoalAdded(goal);
    }
  };

  const handleScorerChanged = (id: string): void => {
    const player = availablePlayers().find(p => p.id === id);
    if (player)
      setScorer(player);
  }

  const handleAssisterChanged = (id: string): void => {
    const player = availablePlayers().find(p => p.id === id);
    if (player)
      setAssister(player);
  }

  const availablePlayers = (): SimplePlayer[] => {
    if (!ownGoal)
      return selectedTeam === Team.RED ? match.redTeam : match.yellowTeam;
    else
      return selectedTeam === Team.RED ? match.yellowTeam : match.redTeam;
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Add Goal</DialogTitle>
      <DialogContent>
        <FormControl component="fieldset">
          <RadioGroup
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value as Team)}
          >
            <FormControlLabel value={Team.RED} control={<Radio />} label="Red Team" />
            <FormControlLabel value={Team.YELLOW} control={<Radio />} label="Yellow Team" />
          </RadioGroup>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel>Scorer</InputLabel>
          <Select
            value={scorer?.id}
            onChange={(e) => handleScorerChanged(e.target.value as string)}
          >
            {availablePlayers().map((player) => (
              <MenuItem key={player.id} value={player.id}>
                {player.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {!ownGoal && (
          <FormControl fullWidth>
            <InputLabel>Assister</InputLabel>
            <Select
              value={assister?.id}
              onChange={(e) => handleAssisterChanged(e.target.value as string)}
            >
              {availablePlayers().map((player) => (
                <MenuItem key={player.id} value={player.id}>
                  {player.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        <FormControlLabel
          control={<Checkbox checked={ownGoal} onChange={(e) => setOwnGoal(e.target.checked)} />}
          label="Own Goal"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button onClick={handleAddGoal} color="primary">
          Add
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddGoalDialog;
