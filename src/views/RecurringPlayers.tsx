import { addDoc, collection } from 'firebase/firestore';
import React from 'react';
import { firestoreDb } from '../firebase';
import { Button } from '@mui/material';

const addPlayer = async () => {
    console.log("Adding team... ");
    try {
        const docRef = await addDoc(collection(firestoreDb, "recurring-players"), {
            name: "Example Football Team"
        });
        console.log("Document written with ID: ", docRef.id);
    } catch (error) {
        console.error("Error adding document: ", error);
    }
};
const RecurringPlayers: React.FC = () => {
    return (
        <div className="App">
            <Button variant="contained" color="primary" onClick={addPlayer}>
                Add Team
            </Button>
        </div>
    );
};

export default RecurringPlayers;
