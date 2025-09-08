const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Firebase Admin with service account
let serviceAccount;

if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
  // For Railway deployment - use environment variable
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
} else {
  // For local development - use file
  try {
    serviceAccount = require('./serviceAccountKey.json');
  } catch (error) {
    console.log('Service account key not found');
    serviceAccount = null;
  }
}

if (serviceAccount) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: process.env.FIREBASE_PROJECT_ID || 'setlist-creator-3d94e'
  });
} else {
  console.error('Firebase service account not configured');
  process.exit(1);
}

const db = admin.firestore();

const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Routes

// Get user's songs
app.get('/api/songs', verifyToken, async (req, res) => {
  try {
    const songsRef = db.collection('songs');
    const snapshot = await songsRef.where('userId', '==', req.user.uid).get();
    
    const songs = [];
    snapshot.forEach(doc => {
      songs.push({ id: doc.id, ...doc.data() });
    });
    
    res.json(songs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch songs' });
  }
});

// Add a new song
app.post('/api/songs', verifyToken, async (req, res) => {
  try {
    const { title, artist, genre, duration } = req.body;
    
    if (!title || !artist || !duration) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const songData = {
      title: title.trim(),
      artist: artist.trim(),
      genre: genre || 'Other',
      duration: duration.trim(),
      userId: req.user.uid,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    const docRef = await db.collection('songs').add(songData);
    res.json({ id: docRef.id, ...songData });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add song' });
  }
});

// Delete a song
app.delete('/api/songs/:id', verifyToken, async (req, res) => {
  try {
    const songId = req.params.id;
    const songRef = db.collection('songs').doc(songId);
    
    // 
    const songDoc = await songRef.get();
    if (!songDoc.exists) {
      return res.status(404).json({ error: 'Song not found' });
    }
    
    if (songDoc.data().userId !== req.user.uid) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    await songRef.delete();
    res.json({ message: 'Song deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete song' });
  }
});

// Generate setlist
app.post('/api/setlists/generate', verifyToken, async (req, res) => {
  try {
    const { setlistName, duration, eventType, notes } = req.body;
    
    // Get user's songs
    const songsRef = db.collection('songs');
    const userSongs = await songsRef.where('userId', '==', req.user.uid).get();
    
    const availableSongs = [];
    userSongs.forEach(doc => {
      availableSongs.push({ id: doc.id, ...doc.data() });
    });
    
    if (availableSongs.length === 0) {
      return res.status(400).json({ error: 'No songs available' });
    }
    
    // Simple setlist generation algorithm
    const targetMinutes = parseInt(duration);
    const selectedSongs = [];
    let totalMinutes = 0;

    //take in this parameter *******.
    const shuffledSongs = [...availableSongs].sort(() => Math.random() - 0.5);
    
    for (const song of shuffledSongs) {
      const songMinutes = parseFloat(song.duration.split(':')[0]) + parseFloat(song.duration.split(':')[1]) / 60;
      if (totalMinutes + songMinutes <= targetMinutes) {
        selectedSongs.push({
          ...song,
          order: selectedSongs.length + 1
        });
        totalMinutes += songMinutes;
      }
    }
    
    const setlist = {
      name: setlistName,
      songs: selectedSongs,
      duration,
      eventType,
      notes,
      userId: req.user.uid,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    // Save setlist to database
    const setlistRef = await db.collection('setlists').add(setlist);
    
    res.json({ id: setlistRef.id, ...setlist });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate setlist' });
  }
});

// Get user's setlists
app.get('/api/setlists', verifyToken, async (req, res) => {
  try {
    const setlistsRef = db.collection('setlists');
    const snapshot = await setlistsRef.where('userId', '==', req.user.uid).get();
    
    const setlists = [];
    snapshot.forEach(doc => {
      setlists.push({ id: doc.id, ...doc.data() });
    });
    
    res.json(setlists);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch setlists' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Band Setlist API is running' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API endpoints available at http://localhost:${PORT}/api`);
});
