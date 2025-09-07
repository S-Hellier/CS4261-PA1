# Band Setlist Creator - App Wireframes

## App Flow

### 1. Authentication Screen
```
┌─────────────────────────┐
│    🎵 Setlist Creator   │
│                         │
│  [Sign Up] [Sign In]    │
│                         │
│  Or continue as guest   │
└─────────────────────────┘
```

### 2. My Songs Screen (Main Dashboard)
```
┌─────────────────────────┐
│  🎵 My Songs    [+] Add │
│                         │
│  • Sweet Child O' Mine  │
│  • Hotel California     │
│  • Wonderwall           │
│  • Stairway to Heaven   │
│                         │
│  [Create New Setlist]   │
│  [My Setlists]          │
└─────────────────────────┘
```

### 3. Add Song Screen
```
┌─────────────────────────┐
│  ← Add New Song         │
│                         │
│  Song Title:            │
│  [________________]     │
│                         │
│  Artist:                │
│  [________________]     │
│                         │
│  Genre:                 │
│  [Rock ▼]               │
│                         │
│  Duration:              │
│  [4:30]                 │
│                         │
│  [Save Song]            │
└─────────────────────────┘
```

### 4. Create Setlist Screen
```
┌─────────────────────────┐
│  ← Create Setlist       │
│                         │
│  Setlist Name:          │
│  [________________]     │
│                         │
│  Duration:              │
│  [45 minutes ▼]         │
│                         │
│  Event Type:            │
│  [Wedding ▼]            │
│                         │
│  Vibe/Notes:            │
│  [________________]     │
│  [________________]     │
│                         │
│  [Generate Setlist]     │
└─────────────────────────┘
```

### 5. Generated Setlist Screen
```
┌─────────────────────────┐
│  ← Wedding Setlist      │
│                         │
│  1. Sweet Child O' Mine │
│     4:30                │
│                         │
│  2. Hotel California    │
│     6:30                │
│                         │
│  3. Wonderwall          │
│     4:20                │
│                         │
│  Total: 45:00           │
│                         │
│  [Regenerate] [Save]    │
│  [Share] [Edit]         │
└─────────────────────────┘
```

## Key Features

## Technical Architecture

```
Mobile App (React Native/Flutter)
    ↓ HTTP/REST API
Backend Server (Node.js + Express)
    ↓ Database queries
Database (PostgresQL)
    ↓ API calls
AI Service (OpenAI)
```

## Data Models

### User
- id, email, name, createdAt

### Song
- id, userId, title, artist, genre, duration, createdAt

### Setlist
- id, userId, name, duration, eventType, notes, songs[], createdAt

### SetlistSong
- songId, order, notes
