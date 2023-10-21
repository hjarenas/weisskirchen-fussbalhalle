import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Table, TableBody, TableCell, TableHead, TableRow, TextField } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import React from 'react';
import { collection, getDocs, query, orderBy, addDoc } from 'firebase/firestore';
import { Player } from '../types/Player';
import { firestoreDb } from '../firebase';
import styles from './RecurringPlayersView.module.css';

const RecurringPlayersView: React.FC = () => {
  const [players, setPlayers] = React.useState<Player[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [open, setOpen] = React.useState(false);
  const [playerName, setPlayerName] = React.useState('');
  const currentYear = new Date().getFullYear();

  React.useEffect(() => {
    const fetchData = async () => {
      const data = await fetchPlayersForCurrentYear();
      setPlayers(data);
      setLoading(false);
    };

    fetchData();
  }, []);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const fetchPlayersForCurrentYear = async (): Promise<Player[]> => {
    const currentYear = new Date().getFullYear().toString();
    const playersRef = collection(firestoreDb, 'players');
    const q = query(playersRef, orderBy(`stats.${currentYear}.matchesPlayed`, 'desc'));
    debugger;
    const querySnapshot = await getDocs(q);

    const players: Player[] = [];
    querySnapshot.forEach((doc) => {
      const playerData = doc.data() as Player; // Type assertion
      players.push(playerData);
    });

    return players;
  };
  const handleAddPlayer = async () => {
    const playersRef = collection(firestoreDb, 'players');
    await addDoc(playersRef, {
      name: playerName,
      stats: {} // Initial empty stats
    });

    setPlayerName(''); // Reset the input field
    handleClose(); // Close the modal
    // Optionally, refresh the player list or add the new player to the local state
  };

  return (
    <>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <Button
            variant="contained"
            color="primary"
            onClick={handleOpen}
            className={styles.addButton}
            startIcon={<AddIcon />}>
            Add New Player
          </Button>
          <Dialog open={open} onClose={handleClose}>
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
              <Button onClick={handleClose} color="primary">
                Cancel
              </Button>
              <Button onClick={handleAddPlayer} color="primary">
                Add
              </Button>
            </DialogActions>
          </Dialog>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Goals</TableCell>
                <TableCell>Assists</TableCell>
                <TableCell>Matches Played</TableCell>
                <TableCell>Own Goals</TableCell>
                <TableCell>Wins</TableCell>
                <TableCell>Losses</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {players.map((player) => {
                const stats = player.stats[currentYear];
                return (
                  <TableRow key={player.name}>
                    <TableCell>{player.name}</TableCell>
                    <TableCell>{stats?.goals ?? "N/A"}</TableCell>
                    <TableCell>{stats?.assists ?? "N/A"}</TableCell>
                    <TableCell>{stats?.matchesPlayed ?? "N/A"}</TableCell>
                    <TableCell>{stats?.ownGoals ?? "N/A"}</TableCell>
                    <TableCell>{stats?.wins ?? "N/A"}</TableCell>
                    <TableCell>{stats?.losses ?? "N/A"}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </>
      )}
    </>
  );

};

export default RecurringPlayersView;
