import { Button, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import React from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { Player } from '../types/Player';
import { firestoreDb } from '../firebase';
import styles from './RecurringPlayersView.module.css';
import AddPlayerDialog from '../components/AddPlayerDialog';

const RecurringPlayersView: React.FC = () => {
  const [players, setPlayers] = React.useState<Player[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showDialog, setShowDialog] = React.useState(false);
  const currentYear = new Date().getFullYear();

  React.useEffect(() => {
    const fetchData = async () => {
      const data = await fetchPlayersForCurrentYear();
      setPlayers(data);
      setLoading(false);
    };

    fetchData();
  }, []);

  const handleShowDialog = () => {
    setShowDialog(true);
  };

  const closeDialog = () => {
    setShowDialog(false);
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
  const handlePlayerAdded = async () => {
    const data = await fetchPlayersForCurrentYear();
    setPlayers(data);
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
            onClick={handleShowDialog}
            className={styles.addButton}
            startIcon={<AddIcon />}>
            Add New Player
          </Button>
          <AddPlayerDialog open={showDialog} onClose={closeDialog} onPlayerAdded={handlePlayerAdded} />
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
