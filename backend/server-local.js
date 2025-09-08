const express = require('express');
const cors = require('cors');
const { OpenAI } = require('openai');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize OpenAI (optional for testing)
let openai;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
}

// Mock data for testing
const mockSongs = [
  { id: '1', title: 'Bohemian Rhapsody', artist: 'Queen', genre: 'Rock', duration: '5:55' },
  { id: '2', title: 'Hotel California', artist: 'Eagles', genre: 'Rock', duration: '6:30' },
  { id: '3', title: 'Imagine', artist: 'John Lennon', genre: 'Pop', duration: '3:03' },
  { id: '4', title: 'Stairway to Heaven', artist: 'Led Zeppelin', genre: 'Rock', duration: '8:02' },
  { id: '5', title: 'Sweet Caroline', artist: 'Neil Diamond', genre: 'Pop', duration: '3:21' },
  { id: '6', title: 'Don\'t Stop Believin\'', artist: 'Journey', genre: 'Rock', duration: '4:10' }
];

// ChatGPT Setlist Generation Function (same as before)
const generateSetlistWithChatGPT = async (availableSongs, targetMinutes, eventType, notes) => {
  if (!openai) {
    throw new Error('OpenAI not configured');
  }
  
  try {
    const songList = availableSongs.map((song, index) => 
      `${index + 1}. "${song.title}" by ${song.artist} [${song.genre}] - ${song.duration}`
    ).join('\\n');

    const prompt = `You are a professional setlist curator. Create a setlist for a ${eventType || 'general'} event that should last approximately ${targetMinutes} minutes.

User notes/preferences: ${notes || 'No specific preferences provided'}

Available songs:
${songList}

Please select songs that:
1. Flow well together musically
2. Match the event type and user preferences
3. Stay within the ${targetMinutes}-minute duration limit
4. Create good energy progression

Respond with ONLY a JSON array of song numbers in the order they should be played. For example: [1, 5, 3, 8, 2]
Do not include any other text in your response.`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 150,
      temperature: 0.7
    });

    const content = response.choices[0].message.content.trim();
    const selectedIndices = JSON.parse(content);
    
    const selectedSongs = selectedIndices.map((index, order) => ({
      ...availableSongs[index - 1],
      order: order + 1
    }));

    return selectedSongs;
  } catch (error) {
    console.error('ChatGPT generation failed:', error);
    throw error;
  }
};

// Routes (no authentication required for local testing)

// Get mock songs
app.get('/api/songs', (req, res) => {
  res.json(mockSongs);
});

// Generate setlist (simplified for local testing)
app.post('/api/setlists/generate', async (req, res) => {
  try {
    const { setlistName, duration, eventType, notes } = req.body;
    
    console.log('Received setlist generation request:', { setlistName, duration, eventType, notes });
    
    const targetMinutes = parseInt(duration);
    let selectedSongs = [];
    
    try {
      if (openai) {
        console.log('Generating setlist with ChatGPT...');
        selectedSongs = await generateSetlistWithChatGPT(mockSongs, targetMinutes, eventType, notes);
        console.log(`ChatGPT generated setlist with ${selectedSongs.length} songs`);
      } else {
        throw new Error('OpenAI not configured');
      }
    } catch (error) {
      console.log('ChatGPT failed, falling back to random algorithm:', error.message);
      let totalMinutes = 0;
      const shuffledSongs = [...mockSongs].sort(() => Math.random() - 0.5);
      
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
    }
    
    const setlist = {
      id: 'mock-' + Date.now(),
      name: setlistName,
      songs: selectedSongs,
      duration,
      eventType,
      notes,
      createdAt: new Date()
    };
    
    res.json(setlist);
  } catch (error) {
    console.error('Error generating setlist:', error);
    res.status(500).json({ error: 'Failed to generate setlist' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Local Band Setlist API is running',
    openai_configured: !!openai 
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Local server running on port ${PORT}`);
  console.log(`📡 API endpoints available at http://localhost:${PORT}/api`);
  console.log(`🤖 OpenAI configured: ${!!openai}`);
  console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
});
