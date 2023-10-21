// Sidebar.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { List, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import HistoryIcon from '@mui/icons-material/History';
import RepeatIcon from '@mui/icons-material/Repeat';

const Sidebar: React.FC = () => {
  return (
    <List>
      <ListItemButton component={Link} to="/">
        <ListItemIcon>
          <HomeIcon />
        </ListItemIcon>
        <ListItemText primary="Home" />
      </ListItemButton>

      <ListItemButton component={Link} to="/create-new-match">
        <ListItemIcon>
          <AddCircleIcon />
        </ListItemIcon>
        <ListItemText primary="Create New Match" />
      </ListItemButton>

      <ListItemButton component={Link} to="/past-matches">
        <ListItemIcon>
          <HistoryIcon />
        </ListItemIcon>
        <ListItemText primary="Past Matches" />
      </ListItemButton>

      <ListItemButton component={Link} to="/recurring-players">
        <ListItemIcon>
          <RepeatIcon />
        </ListItemIcon>
        <ListItemText primary="Recurring Players" />
      </ListItemButton>
    </List>
  );
};

export default Sidebar;
