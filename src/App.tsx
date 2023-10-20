import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import CreateNewMatch from './views/CreateNewMatch';
import RecurringPlayers from './views/RecurringPlayers';
import PastMatches from './views/PastMatches';
import Home from './views/Home';

const App: React.FC = () => {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/recurring-players" element={<RecurringPlayers />} />
        <Route path="/past-matches" element={<PastMatches />} />
        <Route path="/create-new-match" element={<CreateNewMatch />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
