import React from 'react';
import { useParams } from 'react-router-dom';


const PastMatchesView: React.FC = () => {
  const params = useParams();
  const matchId = params.matchId;
  return <div>Past Matches Page</div>;
};

export default PastMatchesView;
