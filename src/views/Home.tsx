import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardActionArea, CardContent, Typography } from '@mui/material';

const Home: React.FC = () => {
  return (
    <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
      <Card component={Link} to="/recurring-players" style={{ textDecoration: 'none' }}>
        <CardActionArea>
          <CardContent>
            <Typography variant="h5">Recurring Players</Typography>
          </CardContent>
        </CardActionArea>
      </Card>

      <Card component={Link} to="/past-matches" style={{ textDecoration: 'none' }}>
        <CardActionArea>
          <CardContent>
            <Typography variant="h5">Past Matches</Typography>
          </CardContent>
        </CardActionArea>
      </Card>

      <Card component={Link} to="/create-new-match" style={{ textDecoration: 'none' }}>
        <CardActionArea>
          <CardContent>
            <Typography variant="h5">Create New Match</Typography>
          </CardContent>
        </CardActionArea>
      </Card>
    </div>
  );
}

export default Home;
