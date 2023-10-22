import { Timestamp } from "firebase/firestore";
import { FirestoreMatch, Match } from "../types/Match";

export function fromFirestoreMatch(firestoreMatch: FirestoreMatch): Match {
  return {
    ...firestoreMatch,
    date: firestoreMatch.date.toDate()
  };
}

export function toFirestoreMatch(appMatch: Match): FirestoreMatch {
  // This assumes you have firebase imported and initialized
  const timestamp = Timestamp.fromDate(appMatch.date);
  return {
    ...appMatch,
    date: timestamp
  };
}
