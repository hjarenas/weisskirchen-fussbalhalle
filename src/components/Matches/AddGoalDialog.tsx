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
  Box,
} from '@mui/material';
import { Goal, Match, SimplePlayer, Team } from '../../types/Match';
import React, { useEffect } from 'react';

interface AddGoalDialogProps {
  match: Match;
  open: boolean;
  onClose: () => void;
  handleGoalAdded: (goal: Goal) => void; // Define a Goal type
}

const AddGoalDialog: React.FC<AddGoalDialogProps> = ({ match, open, onClose, handleGoalAdded }) => {
  const [selectedTeam, setSelectedTeam] = React.useState<Team>(Team.RED);
  const [scorer, setScorer] = React.useState<SimplePlayer | null>(null);
  const [assister, setAssister] = React.useState<SimplePlayer | null>(null);
  const [isOwnGoal, setIsOwnGoal] = React.useState(false);
  const [hasAssister, setHasAssister] = React.useState(true);
  const [availablePlayers, setAvailablePlayers] = React.useState<SimplePlayer[]>([]);
  const [availableAssisters, setAvailableAssisters] = React.useState<SimplePlayer[]>([]);

  // Available players
  useEffect(() => {
    let players: SimplePlayer[] = [];
    if (!isOwnGoal) {
      players = selectedTeam === Team.RED ? match.redTeam : match.yellowTeam;
    }
    else {
      players = selectedTeam === Team.RED ? match.yellowTeam : match.redTeam;
    }
    // set available players sorted by name
    players = players.sort((a, b) => a.name.localeCompare(b.name));
    setAvailablePlayers(players);

  }, [isOwnGoal, selectedTeam, match, match.redTeam, match.yellowTeam]);

  // Scorer
  useEffect(() => {
    // Reset the values when the team changes
    const scorer = availablePlayers?.length > 0 ? availablePlayers[0] : null;
    setScorer(scorer);
  }, [availablePlayers, selectedTeam]);

  useEffect(() => {
    const possibleAssisters = availablePlayers.filter((player) => player.id !== scorer?.id);
    setAvailableAssisters(possibleAssisters);
  }, [scorer, availablePlayers]);

  // Assists
  useEffect(() => {
    setHasAssister(!isOwnGoal);
  }, [isOwnGoal]);

  useEffect(() => {
    if (!hasAssister) {
      setAssister(null);
    } else {
      const assister = availableAssisters?.length > 1 ? availableAssisters[0] : null;
      setAssister(assister);
    }
  }, [availableAssisters, hasAssister]);


  const handleAddGoal = async () => {
    if (selectedTeam && scorer) {
      const goal: Goal = {
        team: selectedTeam,
        scorer: scorer,
        assister: assister,
        ownGoal: isOwnGoal,
      };
      handleGoalAdded(goal);
    }
  };

  const handleScorerChanged = (id: string): void => {
    const player = availablePlayers.find(p => p.id === id);
    if (player)
      setScorer(player);
  }

  const handleAssisterChanged = (id: string): void => {
    const player = availablePlayers.find(p => p.id === id);
    if (player)
      setAssister(player);
  }

  const markOwnGoal = (checked: boolean): void => {
    setIsOwnGoal(checked);
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Add Goal</DialogTitle>
      <DialogContent>
        <Box mb={2}>
          <FormControl component="fieldset">
            <RadioGroup
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value as Team)}
            >
              <FormControlLabel value={Team.RED} control={<Radio />} label="Red Team" />
              <FormControlLabel value={Team.YELLOW} control={<Radio />} label="Yellow Team" />
            </RadioGroup>
          </FormControl>
        </Box>

        <Box mb={2}>
          <FormControl fullWidth>
            <InputLabel>Scorer</InputLabel>
            <Select
              value={scorer?.id ?? ''}
              onChange={(e) => handleScorerChanged(e.target.value)}
            >
              {availablePlayers.map((player) => (
                <MenuItem key={player.id} value={player.id}>
                  {player.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {hasAssister && (
          <Box mb={2}>
            <FormControl fullWidth>
              <InputLabel>Assister</InputLabel>
              <Select
                value={assister?.id ?? ''}
                onChange={(e) => handleAssisterChanged(e.target.value)}
              >
                {availableAssisters.map((player) => (
                  <MenuItem key={player.id} value={player.id}>
                    {player.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        )}

        <Box mb={2}>
          <FormControlLabel
            control={<Checkbox checked={hasAssister} onChange={(e) => setHasAssister(e.target.checked)} />}
            label="Has Assister"
          />
        </Box>

        <FormControlLabel
          control={<Checkbox checked={isOwnGoal} onChange={(e) => markOwnGoal(e.target.checked)} />}
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
