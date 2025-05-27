import { useState, useRef } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { Text, View } from '@/components/Themed';
import { chat } from '../api/chat';
import {
  CandlestickChart,
  CandlestickChartProvider,
  LineChart,
} from 'react-native-wagmi-charts';
import Markdown from 'react-native-markdown-display';

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

    // 📈 Overlay indicators
    ema?: number;
    sma?: number;

    // 📊 Subchart indicators
    rsi?: number;
    macd?: number;
    macd_signal?: number;
    stoch_k?: number;
    stoch_d?: number;
  }[];
  signal?: string;
  symbol?: string;
  timeframe?: string;
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
      console.log('Chat Response:', data);
      const botMessage: Message = {
        id: Date.now().toString(),
        text: data.response,
        sender: 'bot',
        chartData: data.chartData,
        signal: data.signal,
        symbol: data.symbol,
        timeframe: data.timeframe,
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Chat Error:', error);
    } finally {
      setLoading(false);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 300);
    }
  };

  const getTradingViewHTML = (symbol: string = 'BTCUSDT', interval: string = 'D') => `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8">
      <script src="https://s3.tradingview.com/tv.js"></script>
      <style>
        html, body {
          margin: 0;
          padding: 0;
          background-color: #000;
        }
        #tv_chart_container {
          width: 100%;
          height: 100%;
        }
      </style>
    </head>
    <body>
      <div id="tv_chart_container"></div>
      <script>
        new TradingView.widget({
          container_id: "tv_chart_container",
          width: "100%",
          height: "100%",
          symbol: "BINANCE:${symbol}",
          interval: "${interval}",
          timezone: "Etc/UTC",
          theme: "dark",
          style: "1",
          locale: "en",
          enable_publishing: false,
          hide_side_toolbar: false,
          withdateranges: true,
          studies: [
            "MAExp@tv-basicstudies",     // EMA
            "MASimple@tv-basicstudies"   // SMA
          ],
          study_overrides: {
            "MAExp.length": 20,
            "MAExp.color": "#00c2ff",
            "MASimple.length": 50,
            "MASimple.color": "#f0b90b"
          },
          toolbar_bg: "#121212",
          hide_legend: false,
          hide_top_toolbar: false,
          save_image: false
        });
      </script>
    </body>
  </html>
`;

  const renderItem = ({ item }: { item: Message }) => {
    const candles = (item.chartData ?? []).map(d => ({
      timestamp: d.timestamp * 1000,
      open: Number(d.open),
      high: Number(d.high),
      low: Number(d.low),
      close: Number(d.close),
      ema: Number(d.ema),
      sma: Number(d.sma),
    }));

    const rsiLine = item.chartData?.map(d => ({ timestamp: d.timestamp * 1000, value: Number(d.rsi) }));
    const macdLine = item.chartData?.map(d => ({ timestamp: d.timestamp * 1000, value: Number(d.macd) }));
    const macdSignalLine = item.chartData?.map(d => ({ timestamp: d.timestamp * 1000, value: Number(d.macd_signal) }));

    return (
      <View style={[styles.messageContainer, item.sender === 'user' ? styles.userMessage : styles.botMessage]}>
        {item.sender === 'bot' ? (
          <Markdown style={markdownStyles}>
            {item.text}
          </Markdown>
        ) : (
          <Text style={styles.messageText}>{item.text}</Text>
        )}
        {item.sender === 'bot' && candles && candles.length > 0 && (
          <View style={styles.chartContainer}>
            <View style={styles.chartMeta}>
              <Text style={styles.chartLabel}>
                🪙 {item.symbol ?? 'Symbol'} | ⏱ {item.timeframe ?? '1D'}
              </Text>
              {item.signal && (
                <Text
                  style={[
                    styles.signalText,
                    { color: item.signal === 'BUY' ? '#00ff88' : item.signal === 'SELL' ? '#ff5e5e' : '#f0b90b' },
                  ]}
                >
                  📊 Signal: {item.signal}
                </Text>
              )}
            </View>

            <View style={styles.chartWrapper}>
              <CandlestickChartProvider data={candles}>
                <CandlestickChart height={200} width={350}>
                  <CandlestickChart.Candles />

                  {/* Optional: Crosshair and Tooltip */}
                  <CandlestickChart.Crosshair>
                    <CandlestickChart.Tooltip />
                  </CandlestickChart.Crosshair>
                </CandlestickChart>

                {/* Optional: Timestamp Label */}
                <CandlestickChart.DatetimeText style={{ color: '#fff' }} />
              </CandlestickChartProvider>
              {/* RSI Line Chart */}
              <View style={styles.indicatorChart}>
                <Text style={styles.chartLabel}>RSI</Text>
                <LineChart.Provider data={rsiLine ?? []}>
                  <LineChart height={120} width={320}>
                    <LineChart.Path color="#29abe2" />
                    <LineChart.CursorCrosshair>
                      <LineChart.Tooltip
                        style={{ backgroundColor: '#f3f3f3', borderColor: '#444', borderWidth: 1 }}
                        textStyle={{ color: '#000' }}
                      />
                    </LineChart.CursorCrosshair>
                  </LineChart>
                </LineChart.Provider>
              </View>

              {/* MACD Chart */}
              <View style={styles.indicatorChart}>
                <Text style={styles.chartLabel}>MACD</Text>
                <LineChart.Provider data={macdLine ?? []}>
                  <LineChart height={80} width={320}>
                    <LineChart.Path color="#ff5e5e" />
                    <LineChart.CursorCrosshair>
                      <LineChart.Tooltip
                        style={{ backgroundColor: '#f3f3f3', borderColor: '#444', borderWidth: 1 }}
                        textStyle={{ color: '#000' }}
                      />
                    </LineChart.CursorCrosshair>
                  </LineChart>
                </LineChart.Provider>
                <LineChart.Provider data={macdSignalLine ?? []}>
                  <LineChart height={80} width={320}>
                    <LineChart.Path color="#f0b90b" />
                    <LineChart.CursorCrosshair>
                      <LineChart.Tooltip
                        style={{ backgroundColor: '#222', borderColor: '#444', borderWidth: 1 }}
                        textStyle={{ color: '#fff' }}
                      />
                    </LineChart.CursorCrosshair>
                  </LineChart>
                </LineChart.Provider>
              </View>
            </View>


          </View>
        )}

      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Crypto Assistant Chatbot</Text>

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
    fontSize: 16,
  },
  chartContainer: {
    marginTop: 10,
    alignItems: 'center', // center horizontally
    justifyContent: 'center',
    paddingHorizontal: 50, // add side padding to avoid edge overflow
    backgroundColor: '#222',
  },

  signalText: {
    fontSize: 16,
    marginTop: 8,
    color: '#f0b90b',
    fontWeight: 'bold',
    textAlign: 'center',
    backgroundColor: '#222',
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
  chartMeta: {
    marginBottom: 8,
    backgroundColor: '#222',
  },
  chartLabel: {
    fontSize: 16,
    color: '#ccc',
    fontWeight: 'bold',
    backgroundColor: '#222',
  },
  chartWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 5,
    borderRadius: 8,
    backgroundColor: '#222', // or match your theme
    alignSelf: 'center',     // prevents full stretch
    width: '100%',
    maxWidth: 340,           // or 320 for tighter charts
  },
  indicatorChart: {
    backgroundColor: '#222',
    borderRadius: 8,
    alignItems: 'center',
  },
  valueLabel: {
    color: '#ccc',
    fontSize: 13,
    marginTop: 4,
    textAlign: 'center',
  },

});

const markdownStyles = StyleSheet.create({
  text: {
    color: '#fff',
    fontSize: 16,
  },
  heading1: {
    color: '#f0b90b',
    fontSize: 20,
    marginBottom: 8,
  },
  heading2: {
    color: '#f0b90b',
    fontSize: 18,
    marginBottom: 6,
  },
  strong: {
    color: '#f0b90b',
  },
  bullet_list_icon: {
    color: '#f0b90b',
  },
  paragraph: {
    marginBottom: 12,
  },
});