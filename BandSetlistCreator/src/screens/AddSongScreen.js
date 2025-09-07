import React, { useState } from 'react';
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

const GENRES = ['Rock', 'Pop', 'Country', 'Jazz', 'Blues', 'R&B','Folk', 'Electronic', 'Hip-Hop', 'Classical', 'Other'];

export default function AddSongScreen({ navigation }) {
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [genre, setGenre] = useState('Rock');
  const [duration, setDuration] = useState('');
  const [loading, setLoading] = useState(false);
  const { currentUser } = useAuth();

  const handleSave = async () => {
    if (!title.trim() || !artist.trim() || !duration.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await api.addSong({
        title: title.trim(),
        artist: artist.trim(),
        genre,
        duration: duration.trim(),
      });

      Alert.alert('Success', 'Song added successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
      setTitle('');
      setArtist('');
      setGenre('Rock');
      setDuration('');
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to add song');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.content}>
        <View style={styles.form}>
          <Text style={styles.label}>Song Title *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter song title"
            value={title}
            onChangeText={setTitle}
          />

          <Text style={styles.label}>Artist *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter artist name"
            value={artist}
            onChangeText={setArtist}
          />

          <Text style={styles.label}>Genre</Text>
          <View style={styles.genreContainer}>
            {GENRES.map((genreOption) => (
              <TouchableOpacity
                key={genreOption}
                style={[
                  styles.genreButton,
                  genre === genreOption && styles.genreButtonSelected
                ]}
                onPress={() => setGenre(genreOption)}
              >
                <Text style={[
                  styles.genreButtonText,
                  genre === genreOption && styles.genreButtonTextSelected
                ]}>
                  {genreOption}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Duration *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 4:30"
            value={duration}
            onChangeText={setDuration}
          />

          <TouchableOpacity 
            style={[styles.saveButton, loading && styles.saveButtonDisabled]} 
            onPress={handleSave}
            disabled={loading}
          >
            <Text style={styles.saveButtonText}>
              {loading ? 'Saving...' : 'Save Song'}
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
  genreContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  genreButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: 'white',
  },
  genreButtonSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  genreButtonText: {
    fontSize: 14,
    color: '#333',
  },
  genreButtonTextSelected: {
    color: 'white',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 30,
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
