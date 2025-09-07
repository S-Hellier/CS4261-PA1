import { auth } from '../../firebase';

const API_BASE_URL = 'https://setlist-creator-production.up.railway.app/api';

const getAuthToken = async () => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('No authenticated user');
  }
  return await user.getIdToken();
};

const apiRequest = async (endpoint, options = {}) => {
  const token = await getAuthToken();
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }
  
  return response.json();
};

// API functions
export const api = {
  // Songs
  getSongs: () => apiRequest('/songs'),
  
  addSong: (songData) => apiRequest('/songs', {
    method: 'POST',
    body: JSON.stringify(songData),
  }),
  
  deleteSong: (songId) => apiRequest(`/songs/${songId}`, {
    method: 'DELETE',
  }),
  
  // Setlists
  getSetlists: () => apiRequest('/setlists'),
  
  generateSetlist: (setlistData) => apiRequest('/setlists/generate', {
    method: 'POST',
    body: JSON.stringify(setlistData),
  }),
  
  // Health check
  healthCheck: () => apiRequest('/health'),
};
