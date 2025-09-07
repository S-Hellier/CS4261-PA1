import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';

export default function HomeScreen({ navigation }) {
  const [songs, setSongs] = useState([]);
  const { currentUser, logout } = useAuth();

  useEffect(() => {
    fetchSongs();
  }, []);

  const fetchSongs = async () => {
    try {
      const songsData = await api.getSongs();
      setSongs(songsData);
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to fetch songs');
    }
  };

  const deleteSong = async (songId) => {
    try {
      await api.deleteSong(songId);
      setSongs(songs.filter(song => song.id !== songId));
      Alert.alert('Success', 'Song deleted');
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to delete song');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigation.replace('Login');
    } catch (error) {
      Alert.alert('Error', 'Failed to logout');
    }
  };

  const renderSong = ({ item }) => (
    <View style={styles.songItem}>
      <View style={styles.songInfo}>
        <Text style={styles.songTitle}>{item.title}</Text>
        <Text style={styles.songArtist}>{item.artist}</Text>
        <Text style={styles.songGenre}>{item.genre} • {item.duration}</Text>
      </View>
      <TouchableOpacity 
        style={styles.deleteButton}
        onPress={() => deleteSong(item.id)}
      >
        <Text style={styles.deleteText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome, {currentUser?.email}</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => navigation.navigate('AddSong')}
        >
          <Text style={styles.addButtonText}>+ Add Song</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.createButton}
          onPress={() => navigation.navigate('CreateSetlist')}
          disabled={songs.length === 0}
        >
          <Text style={[styles.createButtonText, songs.length === 0 && styles.disabledText]}>
            Create Setlist
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.secondaryActions}>
        <TouchableOpacity 
          style={styles.setlistsButton}
          onPress={() => navigation.navigate('MySetlists')}
        >
          <Text style={styles.setlistsButtonText}>My Setlists</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>My Songs ({songs.length})</Text>
      
      {songs.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No songs yet</Text>
          <Text style={styles.emptySubtext}>Add your first song to get started!</Text>
        </View>
      ) : (
        <FlatList
          data={songs}
          renderItem={renderSong}
          keyExtractor={item => item.id}
          style={styles.songsList}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  welcomeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  logoutButton: {
    padding: 8,
  },
  logoutText: {
    color: '#007AFF',
    fontSize: 14,
  },
  actions: {
    flexDirection: 'row',
    padding: 20,
    gap: 10,
  },
  secondaryActions: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  addButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  createButton: {
    flex: 1,
    backgroundColor: '#34C759',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledText: {
    opacity: 0.5,
  },
  setlistsButton: {
    backgroundColor: '#FF9500',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  setlistsButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    paddingHorizontal: 20,
    marginBottom: 10,
    color: '#333',
  },
  songsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  songItem: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  songInfo: {
    flex: 1,
  },
  songTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  songArtist: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  songGenre: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    padding: 8,
    borderRadius: 5,
  },
  deleteText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});
