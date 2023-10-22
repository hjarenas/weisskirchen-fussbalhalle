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
import { firestoreDb } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { debug } from 'console';

interface AddGoalDialogProps {
  match: Match;
  open: boolean;
  onClose: () => void;
  onGoalAdded: () => void; // Define a Goal type
}

const AddGoalDialog: React.FC<AddGoalDialogProps> = ({ match, open, onClose, onGoalAdded }) => {
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

      match.goals.push(goal);
      match.score[selectedTeam] += 1;


      const matchRef = doc(firestoreDb, 'matches', match.id!);
      await updateDoc(matchRef, {
        goals: match.goals,
        score: match.score
      });

      onGoalAdded();
    }
  };

  const availablePlayers = (): SimplePlayer[] => {
    debugger;
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
            value={scorer}
            onChange={(e) => setScorer(e.target.value as SimplePlayer)}
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
              value={assister}
              onChange={(e) => setAssister(e.target.value as SimplePlayer)}
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
