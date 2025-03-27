import { useState, useRef } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { Text, View } from '@/components/Themed';
import { chat } from '../api/chat';
import {
  CandlestickChart,
  CandlestickChartProvider,
} from 'react-native-wagmi-charts';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  chartData?: {
    timestamp: number;
    open: string;
    high: string;
    low: string;
    close: string;
  }[];
  signal?: string;
}

export default function ChatbotScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { id: Date.now().toString(), text: input, sender: 'user' };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const data = await chat(input);
      const botMessage: Message = {
        id: Date.now().toString(),
        text: data.response,
        sender: 'bot',
        chartData: data.chartData,
        signal: data.signal,
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Chat Error:', error);
    } finally {
      setLoading(false);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 300);
    }
  };

  const renderItem = ({ item }: { item: Message }) => {
    const chartCandles = item.chartData?.map((d) => ({
      timestamp: d.timestamp * 1000,
      open: Number(d.open),
      high: Number(d.high),
      low: Number(d.low),
      close: Number(d.close),
    }));

    return (
      <View style={[styles.messageContainer, item.sender === 'user' ? styles.userMessage : styles.botMessage]}>
        <Text style={styles.messageText}>{item.text}</Text>

        {item.sender === 'bot' && chartCandles && chartCandles.length > 0 && (
          <View style={styles.chartContainer}>
            <CandlestickChartProvider data={chartCandles}>
              <CandlestickChart height={200}>
                <CandlestickChart.Candles />
              </CandlestickChart>
            </CandlestickChartProvider>
            {item.signal && (
              <Text style={styles.signalText}>Signal: {item.signal}</Text>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chatbot</Text>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-end' }}
      />

      {loading && <ActivityIndicator size="small" color="#f0b90b" style={{ marginBottom: 10 }} />}

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
    maxWidth: '100%',
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
  chartContainer: {
    marginTop: 10,
  },
  signalText: {
    marginTop: 8,
    color: '#f0b90b',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: '#333',
    paddingVertical: 5,
    backgroundColor: '#121212',
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
