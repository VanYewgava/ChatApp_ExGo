// screens/LoginScreen.tsx
import React, { useState, useEffect } from "react"; // Tambah useEffect
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../App";
import { auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged } from "../firebase";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);

  // --- TAMBAHAN KODE AUTO-LOGIN ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Jika user ditemukan (sudah login), langsung pindah ke Chat
        navigation.replace("Chat", { name: user.email || "User" });
      }
    });
    return () => unsubscribe();
  }, []);
  // --------------------------------

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Email dan Password wajib diisi");
      return;
    }

    try {
      if (isRegister) {
        await createUserWithEmailAndPassword(auth, email, password);
        Alert.alert("Sukses", "Akun berhasil dibuat!");
        // Tidak perlu navigasi manual, karena useEffect di atas akan otomatis jalan
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        // Tidak perlu navigasi manual, useEffect akan menanganinya
      }
    } catch (error: any) {
      Alert.alert("Gagal", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{isRegister ? "Daftar Akun" : "Login ChatApp"}</Text>
      <TextInput 
        style={styles.input} placeholder="Email" value={email} onChangeText={setEmail}
        autoCapitalize="none" keyboardType="email-address"
      />
      <TextInput 
        style={styles.input} placeholder="Password" value={password} onChangeText={setPassword}
        secureTextEntry
      />
      <Button title={isRegister ? "Daftar" : "Masuk"} onPress={handleAuth} />
      <TouchableOpacity onPress={() => setIsRegister(!isRegister)}>
        <Text style={styles.link}>
          {isRegister ? "Sudah punya akun? Login" : "Belum punya akun? Daftar"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 20 },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 12, marginBottom: 15, borderRadius: 8 },
  link: { marginTop: 15, color: "blue", textAlign: "center" }
});