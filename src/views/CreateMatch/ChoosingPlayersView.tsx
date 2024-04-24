import { useEffect, useState } from "react";
import { Match, MatchState, SimplePlayer } from "../../types/Match";
import { Player } from "../../types/Player";
import { collection, doc, getDocs, onSnapshot, updateDoc } from "firebase/firestore";
import { firestoreDb } from "../../firebase";
import { Button, Container, Grid, List, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';
import AddPlayerDialog from "../../components/AddPlayerDialog";
import { fromFirestoreMatch } from "../../utils/firestoreUtils";



interface Props {
  currentMatchId: string;
  setCurrentMatchState: (matchState: MatchState) => void;
}
const ChoosingPlayersView: React.FC<Props> = ({ currentMatchId, setCurrentMatchState }) => {
  const [availablePlayers, setAvailablePlayers] = useState<SimplePlayer[]>([]);
  const [fetchedPlayers, setFetchedPlayers] = useState<SimplePlayer[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<SimplePlayer[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [currentMatch, setCurrentMatch] = useState<Match | null>(null);

  useEffect(() => {
    const matchRef = doc(firestoreDb, 'matches', currentMatchId);

    const unsubscribe = onSnapshot(matchRef, (doc) => {
      if (doc.exists()) {
        const match = fromFirestoreMatch(doc);
        setCurrentMatch(match);
      } else {
        console.log("No such document!");
      }
    });

    // Clean up the listener when the component unmounts
    return () => unsubscribe();
  }, [currentMatchId]);

  useEffect(() => {
    if (!currentMatch) {
      return;
    }
    setSelectedPlayers([...currentMatch.unassignedPlayers, ...currentMatch.redTeam, ...currentMatch.yellowTeam]);
  }, [currentMatch]);

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

      const unassignedPlayers = fetchedPlayers
        .map(p => p as SimplePlayer)
      setFetchedPlayers(unassignedPlayers);
    };

    fetchPlayers();
  }, [currentMatch]);

  useEffect(() => {
    const temp = fetchedPlayers.filter(p => !selectedPlayers.some(ap => ap.id === p.id));
    setAvailablePlayers(temp);
  }, [fetchedPlayers, selectedPlayers]);

  useEffect(() => {
    if (!!currentMatch) {
      const unassignedPlayers = currentMatch.unassignedPlayers;
      const redTeam = currentMatch.redTeam;
      const yellowTeam = currentMatch.yellowTeam;
      const newSelectedPlayers = [...unassignedPlayers, ...redTeam, ...yellowTeam];
      setSelectedPlayers(newSelectedPlayers);
    }
  }, [currentMatch]);

  const handlePlayerToggle = (player: SimplePlayer) => {
    if (selectedPlayers.includes(player)) {
      setSelectedPlayers(prev => prev.filter(p => p.id !== player.id));
      setAvailablePlayers(prev => [...prev, player]);
    } else {
      setSelectedPlayers(prev => [...prev, player]);
      setAvailablePlayers(prev => prev.filter(p => p.id !== player.id));
    }
  };

  const handleConfirmSelection = async () => {
    const updates = {
      unassignedPlayers: selectedPlayers.map(p => p as SimplePlayer),
      yellowTeam: [],
      redTeam: [],
      state: MatchState.ChoosingTeams
    }
    const updatedMatchGeneric = {
      ...currentMatch,
      ...updates
    };
    currentMatch!.unassignedPlayers = selectedPlayers.map(p => p as SimplePlayer);
    currentMatch!.state = MatchState.ChoosingTeams;
    const matchRef = doc(firestoreDb, 'matches', currentMatchId);
    await updateDoc(matchRef, updates);
    const updatedMatch = updatedMatchGeneric as Match;
    setCurrentMatch(updatedMatch);
    setCurrentMatchState(updatedMatch.state);
  };

  function handlePlayerAdded(newPlayer: Player): void {
    selectedPlayers.push(newPlayer as SimplePlayer);
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
          <Button variant="contained" color="primary" onClick={handleConfirmSelection} disabled={!currentMatch}>
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
