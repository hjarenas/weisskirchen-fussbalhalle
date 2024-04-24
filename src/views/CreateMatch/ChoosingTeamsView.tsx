// src/components/ChoosingTeamsView.tsx

import React, { useState, useEffect } from 'react';
import { Button, Grid, List, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { Match, MatchState, SimplePlayer, Team } from '../../types/Match';
import { firestoreDb } from '../../firebase';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';
import { fromFirestoreMatch } from '../../utils/firestoreUtils';

type ChoosingTeamsViewProps = {
  currentMatchId: string;
  setCurrentMatchState: (currentMatchState: MatchState) => void;
};

const ChoosingTeamsView: React.FC<ChoosingTeamsViewProps> = ({ currentMatchId, setCurrentMatchState }) => {
  const [currentMatch, setCurrentMatch] = useState<Match | null>(null);
  const [redTeam, setRedTeam] = useState<SimplePlayer[]>([]);
  const [yellowTeam, setYellowTeam] = useState<SimplePlayer[]>([]);
  // Inside ChoosingTeamsView component

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
    if (!!currentMatch) {
      // Start with the original teams
      let newRedTeam = [...currentMatch.redTeam];
      let newYellowTeam = [...currentMatch.yellowTeam];

      // Get the remaining unassigned players and shuffle them
      const remainingPlayers = currentMatch.unassignedPlayers.filter(
        player => !newRedTeam.includes(player) && !newYellowTeam.includes(player)
      ).sort(() => 0.5 - Math.random());

      // Distribute the remaining players between the two teams
      remainingPlayers.forEach((player, index) => {
        if (newRedTeam.length <= newYellowTeam.length) {
          newRedTeam.push(player);
        } else {
          newYellowTeam.push(player);
        }
      });

      setRedTeam(newRedTeam);
      setYellowTeam(newYellowTeam);
    }
  }, [currentMatch, currentMatch?.unassignedPlayers]);

  const handleMovePlayer = (player: SimplePlayer, fromTeam: Team) => {
    if (fromTeam === Team.RED) {
      setRedTeam(prev => prev.filter(p => p.id !== player.id));
      setYellowTeam(prev => [...prev, player]);
    } else {
      setYellowTeam(prev => prev.filter(p => p.id !== player.id));
      setRedTeam(prev => [...prev, player]);
    }
  };

  async function updateStateAndInformParent(newState: MatchState): Promise<void> {
    const updates = {
      state: newState,
      redTeam: redTeam,
      yellowTeam: yellowTeam,
      unassignedPlayers: [],
    };
    const updatedMatch = {
      ...currentMatch,
      ...updates
    };
    const matchRef = doc(firestoreDb, 'matches', currentMatchId);
    await updateDoc(matchRef, updates);
    setCurrentMatchState(updatedMatch.state);
  }

  async function onStartMatch(): Promise<void> {
    await updateStateAndInformParent(MatchState.MatchStarted);
  }

  async function onGoBack(): Promise<void> {
    await updateStateAndInformParent(MatchState.ChoosingPlayers);
  }

  return (
    <Grid container direction="column" spacing={3}>
      {/* Top buttons */}
      <Grid container item justifyContent="space-between">
        <Grid item>
          <Button variant='contained' color='secondary' onClick={onGoBack}>Go Back</Button>
        </Grid>
        <Grid item>
          <Button variant='contained' color='primary' onClick={onStartMatch}>Start Match</Button>
        </Grid>
      </Grid>

      {/* Team Lists */}
      <Grid container item spacing={2}>
        {/* Red Team List */}
        <Grid item xs={12} md={6}>
          <h2>Red Team</h2>
          <List>
            {redTeam.map(player => (
              <ListItemButton key={player.id} onClick={() => handleMovePlayer(player, Team.RED)}>
                <ListItemText primary={player.name} />
                <ListItemIcon>
                  <ArrowRightIcon />
                </ListItemIcon>
              </ListItemButton>
            ))}
          </List>
        </Grid>

        {/* Yellow Team List */}
        <Grid item xs={12} md={6}>
          <h2>Yellow Team</h2>
          <List>
            {yellowTeam.map(player => (
              <ListItemButton key={player.id} onClick={() => handleMovePlayer(player, Team.YELLOW)}>
                <ListItemIcon>
                  <ArrowLeftIcon />
                </ListItemIcon>
                <ListItemText primary={player.name} />
              </ListItemButton>
            ))}
          </List>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default ChoosingTeamsView;
