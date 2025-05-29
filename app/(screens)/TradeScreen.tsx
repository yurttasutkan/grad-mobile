import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getAllCryptoPrices } from '../api/coin';
import { placeBuyOrder, placeSellOrder } from '../api/order';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Slider from '@react-native-community/slider';

interface Coin {
  symbol: string;
  price: number;
  percent_change_24h: number;
}

export default function TradeScreen() {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
  const [orderType, setOrderType] = useState<'buy' | 'sell' | null>(null);
  const [amount, setAmount] = useState<string>('0.01');
  const [price, setPrice] = useState<string>(''); // Custom price input
  const [maxAmount, setMaxAmount] = useState<number>(1);
  const [usdEquivalent, setUsdEquivalent] = useState<number>(0);
  const sliderValueRef = useRef(0);

  const navigation = useNavigation();

  useEffect(() => {
    const fetchCoins = async () => {
      try {
        const response = await getAllCryptoPrices();
        setCoins(response.prices);
      } catch (error) {
        Alert.alert('Error', 'Failed to fetch crypto prices');
      } finally {
        setLoading(false);
      }
    };

    fetchCoins();
  }, []);

  // Logic to determine step size for each symbol
  function getStepSizeForSymbol(symbol: string): number {
    const stepSizes: { [key: string]: number } = {
      BTCUSDT: 0.000001,
      ETHUSDT: 0.0001,
      BNBUSDT: 0.01,
      SOLUSDT: 0.01,
      XRPUSDT: 0.1,
      ADAUSDT: 1,
      AVAXUSDT: 0.01,
      DOGEUSDT: 1,
      DOTUSDT: 0.01,
      LINKUSDT: 0.01,
    };

    return stepSizes[symbol.toUpperCase()] || 0.0001; // Default step size
  }

  const openOrderModal = (symbol: string, type: 'buy' | 'sell') => {
    const isBuy = type === 'buy';
    const current = coins.find(coin => coin.symbol === symbol)?.price || 0;
    const max = isBuy ? 1000 / current : 1; // Example max amount for buy/sell

    setSelectedSymbol(symbol);
    setOrderType(type);
    setAmount((max * 0.25).toFixed(6)); // Start at 25%
    setMaxAmount(max);
    setUsdEquivalent((max * 0.25) * current);
    setPrice(''); // Reset custom price when opening the modal
    setModalVisible(true);
  };

  const submitOrder = async () => {
    if (!selectedSymbol || !orderType) return;
    const numericAmount = parseFloat(amount);
    const customPrice = price && !isNaN(parseFloat(price)) ? price : undefined; // Use custom price as string if provided, else undefined

    if (isNaN(numericAmount) || numericAmount <= 0) {
      Alert.alert('Invalid amount', 'Please enter a valid number');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        Alert.alert('Error', 'Missing token');
        return;
      }
      if (orderType === 'buy') {
        await placeBuyOrder(token, selectedSymbol, numericAmount, customPrice);
        Alert.alert('Success', `Buy order placed for ${selectedSymbol}`);
      } else {
        await placeSellOrder(token, selectedSymbol, numericAmount, customPrice);
        Alert.alert('Success', `Sell order placed for ${selectedSymbol}`);
      }
    } catch (err) {
      Alert.alert('Trade Failed', JSON.stringify(err));
    } finally {
      setModalVisible(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📈 Trade Crypto</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#f0b90b" />
      ) : (
        <FlatList
          data={coins}
          keyExtractor={(item) => item.symbol}
          renderItem={({ item }) => (
            <View style={styles.coinItem}>
              <View style={styles.headerRow}>
                <Text style={styles.symbol}>{item.symbol}</Text>
                <Text
                  style={[
                    styles.percentChange,
                    item.percent_change_24h >= 0 ? styles.positiveChange : styles.negativeChange,
                  ]}
                >
                  {item.percent_change_24h >= 0 ? '▲' : '▼'} %{Math.abs(item.percent_change_24h).toFixed(2)}
                </Text>
              </View>
              <Text style={styles.price}>${item.price.toFixed(4)}</Text>
              <View style={styles.actions}>
                <TouchableOpacity
                  style={[styles.button, styles.buyButton]}
                  onPress={() => openOrderModal(item.symbol, 'buy')}
                >
                  <Text style={styles.buttonText}>Buy</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.sellButton]}
                  onPress={() => openOrderModal(item.symbol, 'sell')}
                >
                  <Text style={styles.buttonText}>Sell</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      {modalVisible && (
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>{orderType === 'buy' ? 'Buy' : 'Sell'} {selectedSymbol}</Text>
            <Text style={styles.modalSubtitle}>Amount: {amount} ({usdEquivalent.toFixed(2)} USDT)</Text>

            {/* Slider for adjusting the amount */}
            <Slider
              minimumValue={0}
              maximumValue={maxAmount}
              step={getStepSizeForSymbol(selectedSymbol || '')}
              value={parseFloat(amount)}
              minimumTrackTintColor="#f0b90b"
              thumbTintColor="#f0b90b"
              onValueChange={(val) => {
                sliderValueRef.current = val;
              }}
              onSlidingComplete={(val) => {
                const rounded = Math.floor(val / getStepSizeForSymbol(selectedSymbol || '')) * getStepSizeForSymbol(selectedSymbol || '');
                const fixed = rounded.toFixed(2);
                setAmount(fixed);
                setUsdEquivalent(rounded * (coins.find(coin => coin.symbol === selectedSymbol)?.price || 0));
              }}
              style={{ width: '100%', marginVertical: 20 }}
            />

            {/* Custom price input */}
            <TextInput
              style={styles.modalInput}
              keyboardType="numeric"
              value={price}
              onChangeText={(val) => setPrice(val)}
              placeholder="Enter custom price (Optional)"
              placeholderTextColor="#999"
            />

            <TextInput
              style={styles.modalInput}
              keyboardType="numeric"
              value={amount}
              onChangeText={(val) => {
                setAmount(val);
                const price = coins.find(coin => coin.symbol === selectedSymbol)?.price || 0;
                setUsdEquivalent(parseFloat(val || '0') * price);
              }}
              placeholder="Enter amount"
              placeholderTextColor="#999"
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalButton} onPress={submitOrder}>
                <Text style={styles.modalButtonText}>Confirm</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton]} onPress={() => setModalVisible(false)}>
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#f0b90b',
    textAlign: 'center',
    marginBottom: 20,
  },
  coinItem: {
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  symbol: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f0b90b',
  },
  percentChange: {
    fontSize: 14,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    overflow: 'hidden',
  },
  positiveChange: {
    backgroundColor: '#003c1a',
    color: '#00e676',
  },
  negativeChange: {
    backgroundColor: '#3d0000',
    color: '#ff5252',
  },
  price: {
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 12,
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  buyButton: {
    backgroundColor: '#00c853',
  },
  sellButton: {
    backgroundColor: '#d50000',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  modalContainer: {
    width: '80%',
    backgroundColor: '#1e1e1e',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    color: '#f0b90b',
    marginBottom: 10,
  },
  modalInput: {
    width: '100%',
    backgroundColor: '#333',
    padding: 10,
    borderRadius: 8,
    color: '#fff',
    fontSize: 16,
    marginBottom: 15,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    backgroundColor: '#f0b90b',
    padding: 10,
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  modalButtonText: {
    fontWeight: 'bold',
    color: '#121212',
  },
  modalSubtitle: {
    color: '#ccc',
    fontSize: 16,
    marginBottom: 8,
  },
});

