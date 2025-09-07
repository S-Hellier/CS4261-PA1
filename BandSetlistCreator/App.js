import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/contexts/AuthContext';

// Import screens
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import AddSongScreen from './src/screens/AddSongScreen';
import CreateSetlistScreen from './src/screens/CreateSetlistScreen';
import SetlistScreen from './src/screens/SetlistScreen';
import MySetlistsScreen from './src/screens/MySetlistsScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen 
            name="Login" 
            component={LoginScreen} 
            options={{ title: 'Band Setlist Creator' }}
          />
          <Stack.Screen 
            name="Home" 
            component={HomeScreen} 
            options={{ title: 'My Songs' }}
          />
          <Stack.Screen 
            name="AddSong" 
            component={AddSongScreen} 
            options={{ title: 'Add Song' }}
          />
          <Stack.Screen 
            name="CreateSetlist" 
            component={CreateSetlistScreen} 
            options={{ title: 'Create Setlist' }}
          />
          <Stack.Screen 
            name="Setlist" 
            component={SetlistScreen} 
            options={{ title: 'Generated Setlist' }}
          />
          <Stack.Screen 
            name="MySetlists" 
            component={MySetlistsScreen} 
            options={{ title: 'My Setlists' }}
          />
        </Stack.Navigator>
        <StatusBar style="auto" />
      </NavigationContainer>
    </AuthProvider>
  );
}
