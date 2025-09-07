import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { collection, query, where, getDocs, deleteDoc, doc, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../contexts/AuthContext';

export default function MySetlistsScreen({ navigation }) {
  const [setlists, setSetlists] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    fetchSetlists();
  }, []);

  const fetchSetlists = async () => {
    try {
      const q = query(
        collection(db, 'setlists'), 
        where('userId', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const setlistsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setSetlists(setlistsData);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch setlists');
    } finally {
      setLoading(false);
    }
  };

  const deleteSetlist = async (setlistId) => {
    Alert.alert(
      'Delete Setlist',
      'Are you sure you want to delete this setlist?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'setlists', setlistId));
              setSetlists(setlists.filter(setlist => setlist.id !== setlistId));
              Alert.alert('Success', 'Setlist deleted');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete setlist');
            }
          }
        }
      ]
    );
  };

  const viewSetlist = (setlist) => {
    navigation.navigate('Setlist', {
      setlistName: setlist.name,
      songs: setlist.songs,
      duration: setlist.duration,
      eventType: setlist.eventType,
      notes: setlist.notes,
      isSaved: true
    });
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown date';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString();
  };

  const renderSetlist = ({ item }) => (
    <View style={styles.setlistItem}>
      <TouchableOpacity 
        style={styles.setlistContent}
        onPress={() => viewSetlist(item)}
      >
        <View style={styles.setlistInfo}>
          <Text style={styles.setlistName}>{item.name}</Text>
          <Text style={styles.setlistDetails}>
            {item.eventType} • {item.songCount} songs • {item.totalDuration}
          </Text>
          <Text style={styles.setlistDate}>
            Created: {formatDate(item.createdAt)}
          </Text>
          {item.notes && (
            <Text style={styles.setlistNotes} numberOfLines={2}>
              {item.notes}
            </Text>
          )}
        </View>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.deleteButton}
        onPress={() => deleteSetlist(item.id)}
      >
        <Text style={styles.deleteText}>🗑️</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading setlists...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Setlists</Text>
        <Text style={styles.subtitle}>{setlists.length} saved setlists</Text>
      </View>

      {setlists.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No saved setlists yet</Text>
          <Text style={styles.emptySubtext}>
            Create your first setlist to see it here!
          </Text>
          <TouchableOpacity 
            style={styles.createButton}
            onPress={() => navigation.navigate('CreateSetlist')}
          >
            <Text style={styles.createButtonText}>Create Setlist</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={setlists}
          renderItem={renderSetlist}
          keyExtractor={item => item.id}
          style={styles.setlistsList}
          showsVerticalScrollIndicator={false}
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
    backgroundColor: 'white',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#666',
  },
  setlistsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  setlistItem: {
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
  setlistContent: {
    flex: 1,
  },
  setlistInfo: {
    flex: 1,
  },
  setlistName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  setlistDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  setlistDate: {
    fontSize: 12,
    color: '#999',
    marginBottom: 5,
  },
  setlistNotes: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
  },
  deleteButton: {
    padding: 10,
    marginLeft: 10,
  },
  deleteText: {
    fontSize: 18,
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
    marginBottom: 30,
  },
  createButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
