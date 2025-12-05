import React, { useState, useEffect } from "react";
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  Alert, KeyboardAvoidingView, Platform, ActivityIndicator 
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../App";
import { auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged } from "../firebase";
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigation.replace("Chat", { name: user.email || "User" });
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert("Eits!", "Email dan Password harus diisi dulu ya.");
      return;
    }

    try {
      if (isRegister) {
        await createUserWithEmailAndPassword(auth, email, password);
        Alert.alert("Berhasil", "Akun jadi! Silakan tunggu login otomatis...");
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (error: any) {
      Alert.alert("Gagal", error.message);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.card}>
        <View style={styles.iconHeader}>
          <Ionicons name="chatbubbles" size={60} color="#4A90E2" />
        </View>
        
        <Text style={styles.title}>ChatApp PBP</Text>
        <Text style={styles.subtitle}>
          {isRegister ? "Buat akun baru yuk!" : "Selamat datang kembali"}
        </Text>

        <View style={styles.inputContainer}>
          <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
          <TextInput 
            style={styles.input} 
            placeholder="Email Address" 
            value={email} 
            onChangeText={setEmail}
            autoCapitalize="none" 
            keyboardType="email-address"
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
          <TextInput 
            style={styles.input} 
            placeholder="Password" 
            value={password} 
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={handleAuth}>
          <Text style={styles.buttonText}>{isRegister ? "DAFTAR SEKARANG" : "MASUK"}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setIsRegister(!isRegister)} style={styles.switchButton}>
          <Text style={styles.switchText}>
            {isRegister ? "Sudah punya akun? " : "Belum punya akun? "}
            <Text style={styles.boldText}>{isRegister ? "Login" : "Daftar"}</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F0F4F8" },
  container: { flex: 1, justifyContent: "center", padding: 20, backgroundColor: "#F0F4F8" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  iconHeader: { alignItems: "center", marginBottom: 20 },
  title: { fontSize: 28, fontWeight: "bold", textAlign: "center", color: "#333" },
  subtitle: { fontSize: 14, textAlign: "center", marginBottom: 30, color: "#888" },
  inputContainer: { 
    flexDirection: "row", alignItems: "center", backgroundColor: "#F5F5F5", 
    borderRadius: 12, marginBottom: 15, paddingHorizontal: 15, height: 50 
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, height: "100%", color: "#333" },
  button: {
    backgroundColor: "#4A90E2", borderRadius: 12, height: 50, 
    justifyContent: "center", alignItems: "center", marginTop: 10,
    shadowColor: "#4A90E2", shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.3, shadowRadius: 5, elevation: 4
  },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  switchButton: { marginTop: 20, alignItems: "center" },
  switchText: { color: "#666" },
  boldText: { fontWeight: "bold", color: "#4A90E2" }
});