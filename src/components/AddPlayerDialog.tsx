// AddPlayerDialog.tsx

import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';
import React from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { firestoreDb } from '../firebase';
import { Player } from '../types/Player';

type AddPlayerDialogProps = {
  open: boolean;
  onClose: () => void;
  onPlayerAdded: (newPlayer: Player) => void;
};

const AddPlayerDialog: React.FC<AddPlayerDialogProps> = ({ open, onClose, onPlayerAdded }) => {
  const [playerName, setPlayerName] = React.useState('');

  const handleAddPlayer = async () => {
    const playersRef = collection(firestoreDb, 'players');
    const newPlayerData: Omit<Player, 'id'> = {
      name: playerName,
      stats: {}
    };
    const docRef = await addDoc(playersRef, newPlayerData);

    const newPlayer: Player = {
      id: docRef.id,
      ...newPlayerData
    };
    setPlayerName(''); // Reset the input field
    onClose(); // Close the modal
    onPlayerAdded(newPlayer); // Notify parent component
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Add New Player</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Player Name"
          type="text"
          fullWidth
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button onClick={handleAddPlayer} color="primary">
          Add
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddPlayerDialog;
