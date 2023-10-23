import React, { useEffect, useState } from 'react';
import ChoosingPlayersView from './ChoosingPlayersView';
import ChoosingTeamsView from './ChoosingTeamsView';
import MatchStartedView from './MatchStartedView';
import { firestoreDb } from '../../firebase';
import { collection, deleteDoc, doc, getDocs, query, where } from 'firebase/firestore';
import { FirestoreMatch, Match, MatchState } from '../../types/Match';
import { Button, List, ListItem } from '@mui/material';
import CreateMatchView from './CreateMatchView';
import { fromFirestoreMatch } from '../../utils/firestoreUtils';
import ExistingMatchCardView from './ExistingMatchCardView';
import { useNavigate } from 'react-router-dom';



const CreateMatch: React.FC = () => {
  const [currentMatch, setCurrentMatch] = useState<Match | null>(null);
  const [forceCreateMatch, setForceCreateMatch] = useState(false);
  const [existingMatches, setExistingMatches] = useState<Match[]>([]); // Replace any with your match type

  useEffect(() => {
    const fetchMatches = async () => {
      const matchesRef = collection(firestoreDb, 'matches');
      const noMatchQuery = query(matchesRef, where('state', '!=', MatchState.MatchEnded));
      const querySnapshot = await getDocs(noMatchQuery);

      const matches: Match[] = []; // Replace any with your match type
      querySnapshot.forEach((doc) => {
        const firestoreMatch = doc.data() as FirestoreMatch;
        const match = fromFirestoreMatch(firestoreMatch);
        match.id = doc.id;
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
    setCurrentMatch(match);
    setForceCreateMatch(false);
  }

  const handleMatchCompleted = (match: Match): void => {
    navigate(`/past-matches/${match.id}`);
  }

  if (!currentMatch && !forceCreateMatch && existingMatches?.length > 0) {
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
  else if (!currentMatch || forceCreateMatch) {
    return <CreateMatchView setMatch={handleMatchChosen} />;
  }

  switch (currentMatch.state) {
    case MatchState.ChoosingPlayers:
      return <ChoosingPlayersView currentMatch={currentMatch} setCurrentMatch={setCurrentMatch} />;
    case MatchState.ChoosingTeams:
      return <ChoosingTeamsView currentMatch={currentMatch} setCurrentMatch={setCurrentMatch} />;
    case MatchState.MatchStarted:
      return <MatchStartedView initialMatch={currentMatch} backToSelectTeams={setCurrentMatch} onMatchCompleted={handleMatchCompleted} />;
    default:
      return <div>Invalid state</div>;
  }
};

export default CreateMatch;
