import { useEffect, useState } from "react";
import { Match, MatchState, SimplePlayer } from "../../types/Match";
import { Player } from "../../types/Player";
import { collection, doc, getDocs, updateDoc } from "firebase/firestore";
import { firestoreDb } from "../../firebase";
import { Button, Container, Grid, List, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';
import AddPlayerDialog from "../../components/AddPlayerDialog";



interface Props {
  currentMatch: Match;
  setCurrentMatchState: (state: MatchState) => void;
}
const ChoosingPlayersView: React.FC<Props> = ({ currentMatch, setCurrentMatchState }) => {
  const [availablePlayers, setAvailablePlayers] = useState<Player[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([]);
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    const fetchPlayers = async () => {
      const playersRef = collection(firestoreDb, 'players');
      const querySnapshot = await getDocs(playersRef);
      const fetchedPlayers: Player[] = [];
      querySnapshot.forEach((doc) => {
        const player = { id: doc.id, ...doc.data() } as Player;
        fetchedPlayers.push(player);
      });
      const currentYear = new Date().getFullYear().toString();
      fetchedPlayers.sort((a, b) => {
        const aMatches = a.stats?.[currentYear]?.matchesPlayed ?? 0;
        const bMatches = b.stats?.[currentYear]?.matchesPlayed ?? 0;
        return bMatches - aMatches;
      });
      setAvailablePlayers(fetchedPlayers);
    };

    fetchPlayers();
  }, []);

  const handlePlayerToggle = (player: Player) => {
    if (selectedPlayers.includes(player)) {
      setSelectedPlayers(prev => prev.filter(p => p.id !== player.id));
      setAvailablePlayers(prev => [...prev, player]);
    } else {
      setSelectedPlayers(prev => [...prev, player]);
      setAvailablePlayers(prev => prev.filter(p => p.id !== player.id));
    }
  };

  const handleConfirmSelection = async () => {
    currentMatch.unassignedPlayers = selectedPlayers.map(p => p as SimplePlayer);
    currentMatch.state = MatchState.ChoosingTeams;
    const matchRef = doc(firestoreDb, 'matches', currentMatch.id!);
    await updateDoc(matchRef, {
      unassignedPlayers: selectedPlayers,
      state: MatchState.ChoosingTeams
    });
    setCurrentMatchState(currentMatch.state);
  };

  function handlePlayerAdded(newPlayer: Player): void {
    selectedPlayers.push(newPlayer);
  }

  return (
    <Container>
      <AddPlayerDialog open={showDialog} onClose={() => setShowDialog(false)} onPlayerAdded={handlePlayerAdded} />
      {/* First Row: Buttons */}
      <Grid container spacing={3} justifyContent="space-between">
        <Grid item>
          <Button variant="contained" color="secondary" onClick={() => setShowDialog(true)}>
            Add Player
          </Button>
        </Grid>
        <Grid item>
          <Button variant="contained" color="primary" onClick={handleConfirmSelection}>
            Confirm Selection
          </Button>
        </Grid>
      </Grid>

      {/* Second Row: Lists */}
      <Grid container spacing={3} style={{ marginTop: '20px' }}>
        {/* Left List */}
        <Grid item xs={12} md={6}>
          <h2>Available Players</h2>
          <List>
            {availablePlayers.map(player => (
              <ListItemButton
                key={player.id}
                onClick={() => handlePlayerToggle(player)}
                selected={selectedPlayers.includes(player)}
              >
                <ListItemText primary={player.name} />
                <ListItemIcon>
                  <ArrowRightIcon />
                </ListItemIcon>
              </ListItemButton>
            ))}
          </List>
        </Grid>

        {/* Right List */}
        <Grid item xs={12} md={6}>
          <h2>Selected Players</h2>
          <List>
            {selectedPlayers.map(player => (
              <ListItemButton
                key={player.id}
                onClick={() => handlePlayerToggle(player)}
                selected={selectedPlayers.includes(player)}
              >
                <ListItemIcon>
                  <ArrowLeftIcon />
                </ListItemIcon>
                <ListItemText primary={player.name} />
              </ListItemButton>
            ))}
          </List>
        </Grid>
      </Grid>
    </Container>
  );

}

export default ChoosingPlayersView;
