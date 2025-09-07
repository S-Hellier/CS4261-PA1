import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Share,
} from 'react-native';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../contexts/AuthContext';

export default function SetlistScreen({ route, navigation }) {
  const { setlistName, songs, duration, eventType, notes } = route.params;
  const [saving, setSaving] = useState(false);
  const { currentUser } = useAuth();

  const calculateTotalDuration = () => {
    let totalMinutes = 0;
    songs.forEach(song => {
      const [minutes, seconds] = song.duration.split(':').map(Number);
      totalMinutes += minutes + (seconds / 60);
    });
    const hours = Math.floor(totalMinutes / 60);
    const mins = Math.floor(totalMinutes % 60);
    return hours > 0 ? `${hours}:${mins.toString().padStart(2, '0')}` : `${mins} minutes`;
  };

  const shareSetlist = async () => {
    try {
      const setlistText = `${setlistName}\n\n${songs.map((song, index) => 
        `${index + 1}. ${song.title} - ${song.artist} (${song.duration})`
      ).join('\n')}\n\nTotal Duration: ${calculateTotalDuration()}`;

      await Share.share({
        message: setlistText,
        title: setlistName,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share setlist');
    }
  };

  const saveSetlist = async () => {
    if (!currentUser) {
      Alert.alert('Error', 'You must be logged in to save setlists');
      return;
    }

    setSaving(true);
    try {
      const setlistData = {
        name: setlistName,
        songs: songs,
        duration: duration,
        eventType: eventType,
        notes: notes || '',
        totalDuration: calculateTotalDuration(),
        userId: currentUser.uid,
        createdAt: new Date(),
        songCount: songs.length
      };

      await addDoc(collection(db, 'setlists'), setlistData);
      
      Alert.alert('Success', 'Setlist saved to your account!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to save setlist. Please try again.');
      console.error('Error saving setlist:', error);
    } finally {
      setSaving(false);
    }
  };

  const renderSong = ({ item, index }) => (
    <View style={styles.songItem}>
      <View style={styles.songNumber}>
        <Text style={styles.songNumberText}>{index + 1}</Text>
      </View>
      <View style={styles.songInfo}>
        <Text style={styles.songTitle}>{item.title}</Text>
        <Text style={styles.songArtist}>{item.artist}</Text>
      </View>
      <View style={styles.songDuration}>
        <Text style={styles.durationText}>{item.duration}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.setlistName}>{setlistName}</Text>
        <Text style={styles.eventType}>{eventType}</Text>
        {notes ? <Text style={styles.notes}>Notes: {notes}</Text> : null}
      </View>

      <View style={styles.stats}>
        <Text style={styles.statText}>{songs.length} songs</Text>
        <Text style={styles.statText}>•</Text>
        <Text style={styles.statText}>{calculateTotalDuration()}</Text>
      </View>

      <FlatList
        data={songs}
        renderItem={renderSong}
        keyExtractor={(item, index) => index.toString()}
        style={styles.songsList}
        showsVerticalScrollIndicator={false}
      />

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton} onPress={shareSetlist}>
          <Text style={styles.actionButtonText}>Share</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, saving && styles.actionButtonDisabled]} 
          onPress={saveSetlist}
          disabled={saving}
        >
          <Text style={styles.actionButtonText}>
            {saving ? 'Saving...' : 'Save'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.actionButtonText}>Regenerate</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  setlistName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  eventType: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  notes: {
    fontSize: 14,
    color: '#888',
    fontStyle: 'italic',
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  statText: {
    fontSize: 14,
    color: '#666',
    marginHorizontal: 5,
  },
  songsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  songItem: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  songNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  songNumberText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
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
  songDuration: {
    marginLeft: 10,
  },
  durationText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    padding: 20,
    gap: 10,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonDisabled: {
    backgroundColor: '#ccc',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
