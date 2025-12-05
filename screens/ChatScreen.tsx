import React, { useEffect, useState, useRef } from "react";
import { 
  View, Text, TextInput, FlatList, StyleSheet, 
  KeyboardAvoidingView, Platform, TouchableOpacity, SafeAreaView, StatusBar 
} from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../App";
import { 
  auth, signOut, addDoc, serverTimestamp, query, orderBy, onSnapshot, 
  messagesCollection 
} from "../firebase";
import { Ionicons } from '@expo/vector-icons';

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
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    const loadCache = async () => {
      try {
        const cached = await AsyncStorage.getItem('chat_history');
        if (cached) setMessages(JSON.parse(cached));
      } catch (e) { console.log(e); }
    };
    loadCache();

    const q = query(messagesCollection, orderBy("createdAt", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs: Message[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Message));
      setMessages(msgs);
      AsyncStorage.setItem('chat_history', JSON.stringify(msgs));
      
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 500);
    });

    return () => unsubscribe();
  }, []);

  const sendMessage = async () => {
    if (!message.trim()) return;
    const textToSend = message;
    setMessage("");

    try {
      await addDoc(messagesCollection, {
        text: textToSend,
        user: name,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      setMessage(textToSend);
      alert("Gagal kirim pesan");
    }
  };

  const handleLogout = () => {
    signOut(auth).then(() => {
      AsyncStorage.removeItem('chat_history');
      navigation.replace("Login");
    });
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp) return "Sending...";
    const date = timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      <View style={styles.header}>
        <View style={styles.headerInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(name)}</Text>
          </View>
          <View>
            <Text style={styles.headerName} numberOfLines={1}>{name}</Text>
            <Text style={styles.headerStatus}>Online</Text>
          </View>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 15, paddingBottom: 20 }}
        renderItem={({ item }) => {
          const isMyMsg = item.user === name;
          return (
            <View style={[
              styles.msgRow, 
              isMyMsg ? styles.rowRight : styles.rowLeft
            ]}>
              {!isMyMsg && (
                <View style={[styles.avatarSmall, { backgroundColor: '#ddd' }]}>
                   <Text style={styles.avatarTextSmall}>{getInitials(item.user)}</Text>
                </View>
              )}
              
              <View style={[
                styles.msgBubble,
                isMyMsg ? styles.bubbleRight : styles.bubbleLeft
              ]}>
                {!isMyMsg && <Text style={styles.senderName}>{item.user}</Text>}
                <Text style={[styles.msgText, isMyMsg ? styles.textWhite : styles.textDark]}>
                  {item.text}
                </Text>
                <Text style={[styles.timeText, isMyMsg ? styles.textWhiteFaint : styles.textDarkFaint]}>
                  {formatTime(item.createdAt)}
                </Text>
              </View>
            </View>
          );
        }}
      />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput 
              style={styles.input} 
              value={message} 
              onChangeText={setMessage} 
              placeholder="Ketik pesan..." 
              multiline
            />
          </View>
          <TouchableOpacity 
            style={[styles.sendBtn, !message.trim() && styles.sendBtnDisabled]} 
            onPress={sendMessage}
            disabled={!message.trim()}
          >
            <Ionicons name="send" size={20} color="#fff" style={{marginLeft: 2}} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F2F2F7" },
  
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 15, paddingVertical: 10, backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: '#E5E5EA',
    elevation: 2, shadowColor: "#000", shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.05
  },
  headerInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  headerName: { fontWeight: 'bold', fontSize: 16, color: '#000' },
  headerStatus: { fontSize: 12, color: '#34C759' }, // Green for online
  avatar: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: '#4A90E2',
    justifyContent: 'center', alignItems: 'center', marginRight: 10
  },
  avatarText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  logoutBtn: { padding: 5 },

  msgRow: { flexDirection: 'row', marginBottom: 12, alignItems: 'flex-end' },
  rowRight: { justifyContent: 'flex-end' },
  rowLeft: { justifyContent: 'flex-start' },
  
  avatarSmall: {
    width: 30, height: 30, borderRadius: 15, marginRight: 8,
    justifyContent: 'center', alignItems: 'center'
  },
  avatarTextSmall: { fontSize: 10, fontWeight: 'bold', color: '#555' },

  msgBubble: {
    maxWidth: '75%', padding: 12, borderRadius: 18,
    elevation: 1, shadowColor: "#000", shadowOffset: {width: 0, height: 1}, shadowOpacity: 0.1
  },
  bubbleRight: {
    backgroundColor: '#007AFF',
    borderBottomRightRadius: 2,
  },
  bubbleLeft: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 2,
  },
  
  senderName: { fontSize: 10, color: '#FF9500', marginBottom: 2, fontWeight: 'bold' },
  msgText: { fontSize: 16, lineHeight: 22 },
  timeText: { fontSize: 10, marginTop: 4, alignSelf: 'flex-end' },
  
  textWhite: { color: '#fff' },
  textDark: { color: '#000' },
  textWhiteFaint: { color: 'rgba(255,255,255,0.7)' },
  textDarkFaint: { color: 'rgba(0,0,0,0.4)' },

  inputContainer: {
    flexDirection: 'row', padding: 10, alignItems: 'flex-end',
    backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#E5E5EA'
  },
  inputWrapper: {
    flex: 1, backgroundColor: '#F2F2F7', borderRadius: 20,
    paddingHorizontal: 15, paddingVertical: 8, marginRight: 10,
    minHeight: 40, maxHeight: 100
  },
  input: { fontSize: 16, color: '#000' },
  sendBtn: {
    backgroundColor: '#007AFF', width: 44, height: 44, borderRadius: 22,
    justifyContent: 'center', alignItems: 'center'
  },
  sendBtnDisabled: { backgroundColor: '#B0B0B0' }
});