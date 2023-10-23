import React, { useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import CreateNewMatchView from './views/CreateMatch';
import RecurringPlayersView from './views/RecurringPlayersView';
import PastMatchesView from './views/PastMatches';
import Home from './views/Home';
import { AppBar, CssBaseline, Drawer, Hidden, IconButton, Toolbar, Typography } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import Sidebar from './components/Sidebar/Sidebar';
import './App.css';



const App: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <BrowserRouter>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}>
        <Toolbar>
          {/* Other toolbar items */}
          <Hidden mdUp>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="end"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          </Hidden>
          <Typography variant="h6" noWrap>
            Matches Tracker
          </Typography>
        </Toolbar>
      </AppBar>
      {/* Permanent drawer for larger screens */}
      <Hidden mdDown>
        <Drawer
          variant="permanent"
          open
        >
          <div style={{ marginTop: '64px' }}>
            <Sidebar />
          </div>
        </Drawer>
      </Hidden>
      {/* Temporary drawer for smaller screens */}
      <Hidden mdUp>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
        >
          <div style={{ marginTop: '64px' }}>
            <Sidebar />

          </div>
        </Drawer>
      </Hidden>

      <main className='app-main-content'>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/recurring-players" element={<RecurringPlayersView />} />

          <Route path="/past-matches/:matchId" element={<PastMatchesView />} />
          <Route path="/past-matches" element={<PastMatchesView />} />
          <Route path="/create-new-match" element={<CreateNewMatchView />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;
