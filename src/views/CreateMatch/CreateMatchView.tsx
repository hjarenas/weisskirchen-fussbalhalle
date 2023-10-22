import { useState } from "react";
import { Button, Grid } from '@mui/material';
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { Match, MatchState, Team } from '../../types/Match';
import { firestoreDb } from "../../firebase";
import { addDoc, collection } from "firebase/firestore";


const getNextTuesday = (): Dayjs => {
  let today = dayjs();
  return today.day() <= 2 ? today.day(2) : today.add(1, 'week').day(2);
};

type CreateMatchFormProps = {
  setMatch: (match: Match) => void;
};

const CreateMatchView: React.FC<CreateMatchFormProps> = ({ setMatch }) => {
  const [matchDate, setMatchDate] = useState<Dayjs | null>(getNextTuesday());
  const handleSubmit = async () => {
    // Logic to create the match in Firestore or wherever you're storing it
    const newMatch: Omit<Match, 'id'> = {
      date: matchDate?.toDate() ?? new Date(),
      redTeam: [],
      yellowTeam: [],
      unassignedPlayers: [],
      score: {
        red: 0,
        yellow: 0,
      },
      winner: Team.RED, // You can set a default or leave it out if it's optional
      state: MatchState.ChoosingPlayers,
    };
    // Add to Firestore
    const matchesRef = collection(firestoreDb, 'matches');
    const docRef = await addDoc(matchesRef, newMatch);

    const createdMatch = { id: docRef.id, ...newMatch } as Match;

    // Update the parent component's state
    setMatch(createdMatch);
  };
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Grid container spacing={3} direction="column">
        <Grid item>
          <DatePicker
            label="Match Date"
            value={matchDate}
            onChange={(newValue) => setMatchDate(newValue)}
          />
        </Grid>
        <Grid item>
          <Button variant="contained" color="primary" onClick={handleSubmit}>
            Create Match
          </Button>
        </Grid>
      </Grid>
    </LocalizationProvider>

  );
}


export default CreateMatchView;
