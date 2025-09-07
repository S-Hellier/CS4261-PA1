import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyA25KPFIWvpsSn3Lpb1oQmOfoYuPDR7ix4",
  authDomain: "setlist-creator-3d94e.firebaseapp.com",
  projectId: "setlist-creator-3d94e",
  storageBucket: "setlist-creator-3d94e.firebasestorage.app",
  messagingSenderId: "811055481868",
  appId: "1:811055481868:web:591591cbdefb4f8ac91a29"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const db = getFirestore(app);

export default app;
