import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, RefreshControl, TextInput } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useNavigation } from '@react-navigation/native';
import { getPortfolio, placeBuyOrder, placeSellOrder } from '../api/order';
import Slider from '@react-native-community/slider';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Asset {
  asset: string;
  free: number;
  locked: number;
  total: number;
  avg_buy_price: number;
  current_price: number;
  pnl: number;
  pnl_percent: number;
}

export default function AssetScreen() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);
  const [orderType, setOrderType] = useState<'buy' | 'sell' | null>(null);
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
  const [amount, setAmount] = useState<string>('0.01');
  const [maxAmount, setMaxAmount] = useState<number>(1);
  const [usdEquivalent, setUsdEquivalent] = useState<number>(0);
  const sliderValueRef = useRef(0);
  // ETHUSDT → 0.001
  const stepSize = selectedSymbol ? getStepSizeForSymbol(selectedSymbol) : 0.001;

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
    const assetSymbol = symbol.replace('USDT', '');
    const assetData = assets.find(a => a.asset === assetSymbol || a.asset === 'USDT');
    const usdt = assets.find(a => a.asset === 'USDT');

    const isBuy = type === 'buy';
    const current = assetData?.current_price || 0;
    const max = isBuy
      ? (usdt?.free || 0) / current
      : assetData?.free || 0;

    setSelectedSymbol(symbol);
    setOrderType(type);
    setAmount((max * 0.25).toFixed(6)); // Start at 25%
    setMaxAmount(max);
    setUsdEquivalent((max * 0.25) * current);
    setModalVisible(true);
  };


  const submitOrder = async () => {
    if (!selectedSymbol || !orderType) return;
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      Alert.alert('Invalid amount', 'Please enter a valid number');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token || !selectedSymbol) {
        Alert.alert('Error', 'Missing token or symbol');
        return;
      }
      if (orderType === 'buy') {
        await placeBuyOrder(token, selectedSymbol, numericAmount);
        Alert.alert('Success', `Buy order placed for ${selectedSymbol}`);
      } else {
        await placeSellOrder(token, selectedSymbol, numericAmount);
        Alert.alert('Success', `Sell order placed for ${selectedSymbol}`);
      }
      fetchPortfolio();
    } catch (err) {
      Alert.alert(`${orderType === 'buy' ? 'Buy' : 'Sell'} Failed`, JSON.stringify(err));
    } finally {
      setModalVisible(false);
    }
  };

  const fetchPortfolio = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        Alert.alert('Error', 'You must be logged in to view your portfolio');
        return;
      }
      const data = await getPortfolio(token);
      setAssets(data.portfolio);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch portfolio');
    } finally {
      isRefresh ? setRefreshing(false) : setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolio();

    const interval = setInterval(() => fetchPortfolio(), 60000);
    return () => clearInterval(interval);
  }, []);

  const totalValue = assets.reduce((sum, a) => sum + a.total * a.current_price, 0);
  const totalCost = assets.reduce((sum, a) => sum + a.avg_buy_price * a.total, 0);
  const totalProfit = totalValue - totalCost;
  const profitColor = totalProfit >= 0 ? styles.profitText : styles.lossText;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Binance Testnet Portfolio</Text>
      <Text style={styles.totalValue}>Total Value: ${totalValue.toFixed(2)}</Text>
      <Text style={[styles.totalProfit, profitColor]}>
        {totalProfit >= 0
          ? `📈 Profit: +$${totalProfit.toFixed(2)}`
          : `📉 Loss: -$${Math.abs(totalProfit).toFixed(2)}`}
      </Text>

      <View style={styles.separator} />

      {loading ? (
        <ActivityIndicator size="large" color="#f0b90b" />
      ) : (
        <FlatList
          data={assets}
          keyExtractor={(item) => item.asset}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchPortfolio(true)}
              colors={['#f0b90b']}
              tintColor="#f0b90b"
            />
          }
          renderItem={({ item }) => {
            const totalValue = item.total * item.current_price;
            const profitTextStyle = item.pnl >= 0 ? styles.profitText : styles.lossText;

            return (
              <View style={styles.assetItem}>
                <View style={styles.assetHeader}>
                  <Text style={styles.assetName}>{item.asset}</Text>
                  <Text style={[styles.profitPercent, profitTextStyle]}>
                    {item.pnl >= 0 ? '+' : ''}
                    {item.pnl_percent.toFixed(2)}%
                  </Text>
                </View>

                <View style={styles.assetDetails}>
                  <View style={styles.leftColumn}>
                    <Text style={styles.assetHoldings}>Holdings: {item.total}</Text>
                    <Text style={styles.assetTotal}>Total: ${totalValue.toFixed(2)}</Text>
                  </View>
                  <View style={styles.rightColumn}>
                    <Text style={styles.assetPrice}>Price: ${item.current_price.toFixed(2)}</Text>
                    <Text style={[styles.pnlAmount, profitTextStyle]}>
                      PnL: ${item.pnl.toFixed(2)}
                    </Text>
                  </View>
                </View>

                <View style={styles.assetActions}>
                  <TouchableOpacity style={styles.actionButton} onPress={() => openOrderModal(`${item.asset}USDT`, 'buy')}>
                    <Text style={styles.actionText}>Buy</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionButton} onPress={() => openOrderModal(`${item.asset}USDT`, 'sell')}>
                    <Text style={styles.actionText}>Sell</Text>
                  </TouchableOpacity>

                </View>
              </View>
            );
          }}
        />
      )}
      {modalVisible && (
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>
              {orderType === 'buy' ? 'Buy' : 'Sell'} {selectedSymbol}
            </Text>

            <Text style={styles.modalSubtitle}>Amount: {amount} ({usdEquivalent.toFixed(2)} USDT)</Text>

            <Slider
              minimumValue={0}
              maximumValue={maxAmount}
              step={stepSize} // e.g., 0.001 for ETH
              value={parseFloat(amount)}
              minimumTrackTintColor="#f0b90b"
              thumbTintColor="#f0b90b"
              onValueChange={(val) => {
                // Update without triggering re-render yet
                sliderValueRef.current = val;
              }}
              onSlidingComplete={(val) => {
                // Round to step precision (Binance usually uses 3 decimals like 0.001)
                const rounded = Math.floor(val / stepSize) * stepSize;
                const fixed = rounded.toFixed(stepSize < 0.01 ? 3 : 2);

                setAmount(fixed);

                const asset = assets.find(a => selectedSymbol?.startsWith(a.asset));
                const price = asset?.current_price || 0;
                setUsdEquivalent(rounded * price);
              }}
              style={{ width: '100%', marginVertical: 20 }}
            />



            <TextInput
              style={styles.modalInput}
              keyboardType="numeric"
              value={amount}
              onChangeText={(val) => {
                setAmount(val);
                const asset = assets.find(a => selectedSymbol?.startsWith(a.asset));
                const price = asset?.current_price || 0;
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
    padding: 20,
    backgroundColor: '#121212', // consistent dark mode
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#f0b90b',
    textAlign: 'center',
    marginBottom: 10,
  },
  totalValue: {
    fontSize: 22,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 5,
  },
  totalProfit: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 10,
  },
  profitText: {
    color: '#00ff00',
  },
  lossText: {
    color: '#ff4d4d',
  },
  separator: {
    height: 1,
    backgroundColor: '#f0b90b',
    marginBottom: 15,
  },
  assetItem: {
    backgroundColor: '#1e1e1e', // consistent background color
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3,
  },
  assetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: '#1e1e1e', // consistent background color
  },
  assetName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f0b90b',
  },
  profitPercent: {
    fontSize: 16,
    fontWeight: '600',
  },
  assetDetails: {
    backgroundColor: '#1e1e1e', // consistent background color
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  leftColumn: {
    flex: 1,
    backgroundColor: '#1e1e1e', // consistent background color
  },
  rightColumn: {
    flex: 1,
    alignItems: 'flex-end',
    backgroundColor: '#1e1e1e', // consistent background color
  },
  assetHoldings: {
    fontSize: 16,
    color: '#ccc',
  },
  assetTotal: {
    fontSize: 16,
    color: '#fff',
  },
  assetPrice: {
    fontSize: 16,
    color: '#f0b90b',
  },
  pnlAmount: {
    fontSize: 16,
    fontWeight: '500',
  },
  assetActions: {
    backgroundColor: '#1e1e1e', // consistent background color
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  actionButton: {
    backgroundColor: '#f0b90b',
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  actionText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#121212',
  },
  assetInfo: {
    backgroundColor: '#1e1e1e', // consistent background color
    marginBottom: 10,
  },
  assetValue: {
    backgroundColor: '#1e1e1e', // consistent background color
    marginBottom: 10,
  },
  profit: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  refreshButton: {
    marginTop: 20,
    backgroundColor: '#f0b90b',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  refreshText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#121212',
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
    backgroundColor: '#1e1e1e',
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
