import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import CreateNewMatchView from './views/CreateNewMatchView';
import RecurringPlayersView from './views/RecurringPlayersView';
import PastMatches from './views/PastMatches';
import Home from './views/Home';
import { AppBar, CssBaseline, Drawer, Toolbar, Typography } from '@mui/material';
import Sidebar from './components/Sidebar/Sidebar';

const App: React.FC = () => {

  return (
    <BrowserRouter>
      <CssBaseline />
      <AppBar position="fixed" style={{ zIndex: 1301 }}>
        <Toolbar>
          <Typography variant="h6" noWrap>
            Matches Tracker
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        style={{ width: 240 }}
        sx={{
          width: 240,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: 240, boxSizing: 'border-box' },
        }}
      >
        <Toolbar />
        <Sidebar />
      </Drawer>
      <main style={{ marginLeft: 240 }}>
        <Toolbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/recurring-players" element={<RecurringPlayersView />} />
          <Route path="/past-matches" element={<PastMatches />} />
          <Route path="/create-new-match" element={<CreateNewMatchView />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;
