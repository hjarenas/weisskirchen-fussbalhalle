import React from 'react';
import Button from '@mui/material/Button';
import { firestoreDb } from './firebase';
import { addDoc, collection } from 'firebase/firestore';

const App: React.FC = () => {
  const handleClick = async () => {
    try {
      const docRef = await addDoc(collection(firestoreDb, "teams"), {
        name: "Example Football Team"
      });
      console.log("Document written with ID: ", docRef.id);
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };

  return (
    <div className="App">
      <Button variant="contained" color="primary" onClick={handleClick}>
        Add Team
      </Button>
    </div>
  );
}

export default App;
