import React, { useEffect, useState } from 'react';
import ChoosingPlayersView from './ChoosingPlayersView';
import ChoosingTeamsView from './ChoosingTeamsView';
import MatchStartedView from './MatchStartedView';
import { firestoreDb } from '../../firebase';
import { collection, deleteDoc, doc, getDocs, query, where } from 'firebase/firestore';
import { Match, MatchState } from '../../types/Match';
import { Button, List, ListItem } from '@mui/material';
import CreateMatchView from './CreateMatchView';
import { fromFirestoreMatch } from '../../utils/firestoreUtils';
import ExistingMatchCardView from './ExistingMatchCardView';
import { useNavigate } from 'react-router-dom';



const CreateMatch: React.FC = () => {
  const [currentMatchId, setCurrentMatchId] = useState<string | null>(null);
  const [currentMatchState, setCurrentMatchState] = useState<MatchState | null>(null);
  const [forceCreateMatch, setForceCreateMatch] = useState(false);
  const [existingMatches, setExistingMatches] = useState<Match[]>([]); // Replace any with your match type

  useEffect(() => {
    const fetchMatches = async () => {
      const matchesRef = collection(firestoreDb, 'matches');
      const noMatchQuery = query(matchesRef, where('state', '!=', MatchState.MatchEnded));
      const querySnapshot = await getDocs(noMatchQuery);

      const matches: Match[] = []; // Replace any with your match type
      querySnapshot.forEach((doc) => {
        const match = fromFirestoreMatch(doc);
        matches.push(match);
      });

      setExistingMatches(matches);
    };
    fetchMatches();
  }, []);

  const navigate = useNavigate();
  const deleteMatch = async (match: Match) => {
    const matchRef = doc(collection(firestoreDb, 'matches'), match.id!);
    await deleteDoc(matchRef);
    setExistingMatches(prevMatches => prevMatches.filter(m => m.id !== match.id));
  }

  const handleMatchChosen = (match: Match): void => {
    setCurrentMatchId(match.id!);
    setCurrentMatchState(match.state);
    setForceCreateMatch(false);
  }

  const handleMatchCompleted = (match: Match): void => {
    navigate(`/past-matches/${match.id}`);
  }

  if (!currentMatchId && !forceCreateMatch && existingMatches?.length > 0) {
    return (
      <div>
        <h2>Select an existing match</h2>
        <List>
          {existingMatches.map((match) => (
            <ListItem key={match.id}>
              <ExistingMatchCardView match={match} selectMatch={handleMatchChosen} deleteMatch={deleteMatch} />
            </ListItem>
          ))}
        </List>
        <h2>Or</h2>
        <Button color="primary" variant="contained" onClick={() => setForceCreateMatch(true)}>Create a new match</Button>
      </div>
    );
  }
  else if (!currentMatchId || forceCreateMatch) {
    return <CreateMatchView setMatch={handleMatchChosen} />;
  }

  switch (currentMatchState) {
    case MatchState.ChoosingPlayers:
      return <ChoosingPlayersView currentMatchId={currentMatchId!} setCurrentMatchState={setCurrentMatchState} />;
    case MatchState.ChoosingTeams:
      return <ChoosingTeamsView currentMatchId={currentMatchId!} setCurrentMatchState={setCurrentMatchState} />;
    case MatchState.MatchStarted:
      return <MatchStartedView initialMatchId={currentMatchId!} backToSelectTeams={setCurrentMatchState} onMatchCompleted={handleMatchCompleted} />;
    default:
      return <div>Invalid state</div>;
  }
};

export default CreateMatch;
