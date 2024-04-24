import { DocumentData, QueryDocumentSnapshot, Timestamp } from "firebase/firestore";
import { FirestoreMatch, Match } from "../types/Match";

function transformDates(firestoreMatch: FirestoreMatch): Match {
  return {
    ...firestoreMatch,
    date: firestoreMatch.date.toDate()
  };
}

export function fromFirestoreMatch(doc: QueryDocumentSnapshot<DocumentData, DocumentData>): Match {
  const firestoreObject = doc.data() as FirestoreMatch;
  let domainObject = transformDates(firestoreObject);
  domainObject.id = doc.id;
  return domainObject;
}

export function toFirestoreMatch(appMatch: Match): FirestoreMatch {
  // This assumes you have firebase imported and initialized
  const timestamp = Timestamp.fromDate(appMatch.date);
  return {
    ...appMatch,
    date: timestamp
  };
}
