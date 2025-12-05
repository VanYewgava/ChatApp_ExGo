// App.tsx
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Perhatikan: Kita tidak lagi mengimport signInAnonymously karena sudah dihapus
import LoginScreen from "./screens/LoginScreen";
import ChatScreen from "./screens/ChatScreen";

// Definisi tipe data navigasi
export type RootStackParamList = {
  Login: undefined;
  Chat: { name: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  // Di sini kita TIDAK melakukan login otomatis anonim lagi.
  // Login akan ditangani sepenuhnya oleh halaman LoginScreen.

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen 
          name="Login" 
          component={LoginScreen} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="Chat" 
          component={ChatScreen} 
          options={({ route }) => ({ 
            title: route.params.name, // Judul header sesuai nama user
            headerBackVisible: false  // Hilangkan tombol back default
          })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}