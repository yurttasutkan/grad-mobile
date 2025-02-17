import { useState, useRef } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { Text, View } from '@/components/Themed';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
}

const dummyResponses: { [key: string]: string } = {
  hello: "Hi there! How can I help you?",
  price: "You can check the latest prices in the dashboard!",
  btc: "Bitcoin (BTC) is currently trending. Keep an eye on the market!",
  eth: "Ethereum (ETH) is looking strong today. Consider checking its trends.",
  default: "I'm still learning. Try asking about crypto prices or market trends!",
};

export default function ChatbotScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const sendMessage = () => {
    if (!input.trim()) return;

    const userMessage: Message = { id: Date.now().toString(), text: input, sender: 'user' };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    setTimeout(() => {
      const lowerCaseInput = input.toLowerCase();
      const botReply = dummyResponses[lowerCaseInput] || dummyResponses.default;

      const botMessage: Message = { id: Date.now().toString(), text: botReply, sender: 'bot' };
      setMessages((prev) => [...prev, botMessage]);
      setLoading(false);
      
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 1000); // Simulating API delay
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chatbot</Text>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.messageContainer, item.sender === 'user' ? styles.userMessage : styles.botMessage]}>
            <Text style={styles.messageText}>{item.text}</Text>
          </View>
        )}
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-end' }}
      />

      {loading && <ActivityIndicator size="small" color="#f0b90b" />}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Type a message..."
          placeholderTextColor="#aaa"
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#121212',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f0b90b',
    textAlign: 'center',
    marginBottom: 10,
  },
  messageContainer: {
    padding: 10,
    borderRadius: 10,
    marginVertical: 5,
    maxWidth: '80%',
    alignSelf: 'flex-start',
  },
  userMessage: {
    backgroundColor: '#f0b90b',
    alignSelf: 'flex-end',
  },
  botMessage: {
    backgroundColor: '#333',
  },
  messageText: {
    color: '#fff',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: '#333',
    paddingVertical: 5,
  },
  input: {
    flex: 1,
    padding: 10,
    backgroundColor: '#222',
    color: '#fff',
    borderRadius: 10,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: '#f0b90b',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
  },
  sendButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#121212',
  },
});
