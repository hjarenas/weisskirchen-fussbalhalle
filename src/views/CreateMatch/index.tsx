import React, { useEffect, useState } from 'react';
import ChoosingPlayersView from './ChoosingPlayersView';
import ChoosingTeamsView from './ChoosingTeamsView';
import MatchStartedView from './MatchStartedView';
import { firestoreDb } from '../../firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { Match, MatchState } from '../../types/Match';
import { List, ListItemText, ListItemButton } from '@mui/material';
import CreateMatchView from './CreateMatchView';


enum MatchesState {
  ExistingMatches,
  NoMatch,
  MatchChosen
}


const CreateMatch: React.FC = () => {
  const [currentMatchState, setCurrentMatchState] = useState(MatchesState.NoMatch);
  const [currentMatch, setCurrentMatch] = useState<Match | null>(null);
  const [existingMatches, setExistingMatches] = useState<Match[]>([]); // Replace any with your match type

  useEffect(() => {
    const fetchMatches = async () => {
      const matchesRef = collection(firestoreDb, 'matches');
      const noMatchQuery = query(matchesRef, where('state', '==', 'NoMatch'));
      const querySnapshot = await getDocs(noMatchQuery);

      const matches: Match[] = []; // Replace any with your match type
      querySnapshot.forEach((doc) => {
        matches.push(doc.data() as Match);
      });

      if (matches.length > 1) {
        setExistingMatches(matches);
        setCurrentMatchState(MatchesState.ExistingMatches);
      }
    };

    fetchMatches();
  }, []);

  const navigateToMatch = (match: Match) => {
    // Here, I'm assuming you'll navigate to a route with the match date as a parameter.
    // You can adjust this based on your routing setup.
    setCurrentMatch(match);
    setCurrentMatchState(MatchesState.MatchChosen);
  };

  if (currentMatchState === MatchesState.ExistingMatches) {
    return (
      <div>
        <h2>Select an existing match</h2>
        <List>
          {existingMatches.map((match) => (
            <ListItemButton key={match.date.toISOString()} onClick={() => navigateToMatch(match)}>
              <ListItemText
                primary={`Match on ${match.date.toLocaleDateString()}`}
                secondary={`Score: ${match.score.red} - ${match.score.yellow}`}
              />
            </ListItemButton>
          ))}
        </List>
      </div>
    );
  }

  else if (currentMatchState === MatchesState.NoMatch) {
    return <CreateMatchView setMatch={setCurrentMatch} />;
  }

  debugger;
  switch (currentMatch?.state) {
    case MatchState.ChoosingPlayers:
      return <ChoosingPlayersView currentMatch={currentMatch} />;
    case MatchState.PreparingMatch:
      return <ChoosingTeamsView currentMatch={currentMatch} />;
    case MatchState.MatchStarted:
      return <MatchStartedView onEndMatch={() => setCurrentMatchState(MatchesState.NoMatch)} />;

    default:
      return <div>Invalid state</div>;
  }
};

export default CreateMatch;
