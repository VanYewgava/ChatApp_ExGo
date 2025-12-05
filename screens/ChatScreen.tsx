import React, { useEffect, useState } from "react";
import { 
  View, Text, TextInput, Button, FlatList, StyleSheet, 
  KeyboardAvoidingView, Platform, Alert 
} from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../App";
import { 
  auth, signOut, addDoc, serverTimestamp, query, orderBy, onSnapshot, 
  messagesCollection 
} from "../firebase";

type Message = {
  id: string;
  text: string;
  user: string;
  createdAt: any;
};

type Props = NativeStackScreenProps<RootStackParamList, "Chat">;

export default function ChatScreen({ route, navigation }: Props) {
  const { name } = route.params;
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    // 1. FITUR OFFLINE: Load data dari penyimpanan HP dulu
    const loadCache = async () => {
      try {
        const cached = await AsyncStorage.getItem('chat_history');
        if (cached) {
          setMessages(JSON.parse(cached)); // Tampilkan chat lama dari HP
        }
      } catch (e) {
        console.log("Gagal load cache", e);
      }
    };
    loadCache();

    // 2. FITUR ONLINE: Konek ke Firebase
    const q = query(messagesCollection, orderBy("createdAt", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs: Message[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Message));
      
      setMessages(msgs); // Update tampilan dengan data baru
      
      // Simpan copy chat terbaru ke HP (Local Storage)
      AsyncStorage.setItem('chat_history', JSON.stringify(msgs));
    });

    return () => unsubscribe();
  }, []);

  // Fungsi Kirim Pesan (Sudah diperbaiki agar input langsung kosong)
  const sendMessage = async () => {
    if (!message.trim()) return;

    const textToSend = message; // Simpan teks ke variabel
    setMessage(""); // UI langsung kosong biar cepat

    try {
      await addDoc(messagesCollection, {
        text: textToSend,
        user: name,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      setMessage(textToSend); // Balikin teks kalau gagal
      Alert.alert("Error", "Gagal mengirim pesan. Cek koneksi internet.");
    }
  };

  const handleLogout = () => {
    signOut(auth).then(() => {
      // Opsional: Hapus history saat logout agar user lain tidak bisa baca
      AsyncStorage.removeItem('chat_history');
      navigation.replace("Login");
    });
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={90}
    >
      {/* Header dengan tombol Logout */}
      <View style={styles.header}>
        <Text style={styles.headerText}>User: {name}</Text>
        <Button title="Logout" color="red" onPress={handleLogout} />
      </View>

      <FlatList
        data={messages}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={[
            styles.msgBox, 
            item.user === name ? styles.myMsg : styles.otherMsg
          ]}>
            <Text style={styles.user}>{item.user}</Text>
            <Text style={styles.text}>{item.text}</Text>
          </View>
        )}
        contentContainerStyle={{ padding: 10, paddingBottom: 20 }}
      />
      
      <View style={styles.inputContainer}>
        <TextInput 
          style={styles.input} 
          value={message} 
          onChangeText={setMessage} 
          placeholder="Ketik pesan..." 
        />
        <Button title="Kirim" onPress={sendMessage} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  header: { 
    padding: 15, flexDirection: 'row', justifyContent: 'space-between', 
    alignItems: 'center', backgroundColor: '#fff', elevation: 2 
  },
  headerText: { fontWeight: 'bold', fontSize: 16 },
  msgBox: { padding: 10, marginVertical: 5, borderRadius: 8, maxWidth: '80%' },
  myMsg: { alignSelf: 'flex-end', backgroundColor: '#d1f0ff' }, 
  otherMsg: { alignSelf: 'flex-start', backgroundColor: '#fff' }, 
  user: { fontWeight: 'bold', fontSize: 10, marginBottom: 2, color: "#555" },
  text: { fontSize: 16 },
  inputContainer: { 
    flexDirection: 'row', alignItems: 'center', padding: 10, 
    backgroundColor: "#fff", borderTopWidth: 1, borderColor: "#ddd" 
  },
  input: { 
    flex: 1, borderWidth: 1, borderColor: "#ddd", borderRadius: 20, 
    paddingHorizontal: 15, paddingVertical: 10, marginRight: 10, backgroundColor: "#fff" 
  }
});