import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';

const DURATIONS = ['15 minutes', '30 minutes', '45 minutes', '60 minutes', '90 minutes', '2 hours'];
const EVENT_TYPES = ['Wedding', 'Corporate Event', 'Bar Gig', 'Tailgate', 'Private Party', 'Concert', 'Other'];

export default function CreateSetlistScreen({ navigation }) {
  const [setlistName, setSetlistName] = useState('');
  const [duration, setDuration] = useState('45 minutes');
  const [eventType, setEventType] = useState('Wedding');
  const [notes, setNotes] = useState('');
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(false);
  const { currentUser } = useAuth();

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

  const generateSetlist = async () => {
    if (!setlistName.trim()) {
      Alert.alert('Error', 'Please enter a setlist name');
      return;
    }

    if (songs.length === 0) {
      Alert.alert('Error', 'You need at least one song to create a setlist');
      return;
    }

    setLoading(true);
    try {
      const generatedSetlist = await api.generateSetlist({
        setlistName,
        duration,
        eventType,
        notes
      });
      
      navigation.navigate('Setlist', {
        setlistName: generatedSetlist.name,
        songs: generatedSetlist.songs,
        duration: generatedSetlist.duration,
        eventType: generatedSetlist.eventType,
        notes: generatedSetlist.notes
      });
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to generate setlist');
    } finally {
      setLoading(false);
    }
  };

  // Simple setlist generation algorithm (replace with AI API call)
  const generateSimpleSetlist = (availableSongs, targetDuration) => {
    const targetMinutes = parseInt(targetDuration);
    const selectedSongs = [];
    let totalMinutes = 0;
    
    // Shuffle songs and pick until we reach target duration
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
    
    return selectedSongs;
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.content}>
        <View style={styles.form}>
          <Text style={styles.label}>Setlist Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Wedding Reception Setlist"
            value={setlistName}
            onChangeText={setSetlistName}
          />

          <Text style={styles.label}>Duration</Text>
          <View style={styles.optionsContainer}>
            {DURATIONS.map((durationOption) => (
              <TouchableOpacity
                key={durationOption}
                style={[
                  styles.optionButton,
                  duration === durationOption && styles.optionButtonSelected
                ]}
                onPress={() => setDuration(durationOption)}
              >
                <Text style={[
                  styles.optionButtonText,
                  duration === durationOption && styles.optionButtonTextSelected
                ]}>
                  {durationOption}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Event Type</Text>
          <View style={styles.optionsContainer}>
            {EVENT_TYPES.map((event) => (
              <TouchableOpacity
                key={event}
                style={[
                  styles.optionButton,
                  eventType === event && styles.optionButtonSelected
                ]}
                onPress={() => setEventType(event)}
              >
                <Text style={[
                  styles.optionButtonText,
                  eventType === event && styles.optionButtonTextSelected
                ]}>
                  {event}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Additional Notes</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Any specific requests, mood, or special instructions..."
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
          />

          <Text style={styles.songsInfo}>
            Available songs: {songs.length}
          </Text>

          <TouchableOpacity 
            style={[styles.generateButton, loading && styles.generateButtonDisabled]} 
            onPress={generateSetlist}
            disabled={loading}
          >
            <Text style={styles.generateButtonText}>
              {loading ? 'Generating...' : '🎵 Generate Setlist'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
  },
  form: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 20,
    color: '#333',
  },
  input: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  optionButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: 'white',
  },
  optionButtonSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  optionButtonText: {
    fontSize: 14,
    color: '#333',
  },
  optionButtonTextSelected: {
    color: 'white',
  },
  songsInfo: {
    fontSize: 14,
    color: '#666',
    marginTop: 20,
    textAlign: 'center',
  },
  generateButton: {
    backgroundColor: '#34C759',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 30,
  },
  generateButtonDisabled: {
    backgroundColor: '#ccc',
  },
  generateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
