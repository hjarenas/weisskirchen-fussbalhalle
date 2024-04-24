import { collection, doc, getDoc, getDocs, orderBy, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { firestoreDb } from '../firebase';
import { Goal, Match, MatchState, SimplePlayer } from '../types/Match';
import { fromFirestoreMatch } from '../utils/firestoreUtils';
import { Grid, Paper, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import GridMatchItem from '../components/Matches/GridMatchItem';

type RouteParams = {
  matchId: string;
};

const PastMatchesView: React.FC = () => {
  const [match, setMatch] = useState<Match | null>(null);
  const [matchesList, setMatchesList] = useState<Match[]>([]); // Replace any with your match type
  const params = useParams<RouteParams>();
  const matchId = params.matchId;

  useEffect(() => {
    const fetchMatchData = async () => {
      if (matchId) {
        const matchRef = doc(firestoreDb, 'matches', matchId ?? '');
        const matchSnapshot = await getDoc(matchRef);

        if (matchSnapshot.exists()) {
          const match = fromFirestoreMatch(matchSnapshot);
          setMatch(match);
        } else {
          console.error('Match not found');
        }
      }
    };

    fetchMatchData();
  }, [matchId]);

  useEffect(() => {
    const fetchMatches = async () => {
      if (!matchId) {
        const matchesQuery = query(
          collection(firestoreDb, 'matches'),
          where('state', '==', MatchState.MatchEnded),
          orderBy('date', 'desc')
        );
        const querySnapshot = await getDocs(matchesQuery);

        const matches: Match[] = []; // Replace any with your match type
        querySnapshot.forEach((doc) => {
          const match = fromFirestoreMatch(doc);
          matches.push(match);
        });

        setMatchesList(matches);

      }
    };
    fetchMatches();
  }, [matchId]);


  const getTopScorer = (goals: Goal[]): SimplePlayer | null => {
    const scorerCounts: { [key: string]: number } = {};

    goals.forEach(goal => {
      const id = goal.scorer.id;
      scorerCounts[id] = (scorerCounts[id] || 0) + 1;
    });

    const topScorerId = Object.keys(scorerCounts).reduce((a, b) => scorerCounts[a] > scorerCounts[b] ? a : b, "");
    return goals.find(goal => goal.scorer.id === topScorerId)?.scorer || null;
  };


  if (!match)
    return (
      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Score</TableCell>
              <TableCell>Top Scorer</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {matchesList.map((match) => (
              <TableRow key={match.id}>
                <TableCell>{new Date(match.date).toLocaleDateString()}</TableCell>
                <TableCell>{match.score.red} - {match.score.yellow}</TableCell>
                <TableCell>{getTopScorer(match.goals)?.name || 'N/A'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    );

  return (
    <div>
      {match ? (
        <Grid container direction="column" alignItems="center" spacing={3}>
          <GridMatchItem match={match} />
        </Grid>
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );

};

export default PastMatchesView;
