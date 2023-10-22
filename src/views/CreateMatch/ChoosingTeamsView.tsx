// src/components/ChoosingTeamsView.tsx

import React, { useState, useEffect } from 'react';
import { Button, Grid, List, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { Match, MatchState, SimplePlayer, Team } from '../../types/Match';
import { firestoreDb } from '../../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';

type ChoosingTeamsViewProps = {
  currentMatch: Match;
  setCurrentMatchState: (state: MatchState) => void;
};

const ChoosingTeamsView: React.FC<ChoosingTeamsViewProps> = ({ currentMatch, setCurrentMatchState }) => {
  const [redTeam, setRedTeam] = useState<SimplePlayer[]>([]);
  const [yellowTeam, setYellowTeam] = useState<SimplePlayer[]>([]);
  // Inside ChoosingTeamsView component

  useEffect(() => {
    if (!!currentMatch) {
      const shuffledPlayers = [...currentMatch.unassignedPlayers].sort(() => 0.5 - Math.random());
      const middleIndex = Math.ceil(shuffledPlayers.length / 2);
      setRedTeam(shuffledPlayers.slice(0, middleIndex));
      setYellowTeam(shuffledPlayers.slice(middleIndex));
    }
  }, [currentMatch, currentMatch.unassignedPlayers]);

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
    currentMatch.state = newState;
    const matchRef = doc(firestoreDb, 'matches', currentMatch.id!);
    await updateDoc(matchRef, {
      state: currentMatch.state
    });
    setCurrentMatchState(currentMatch.state);
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
