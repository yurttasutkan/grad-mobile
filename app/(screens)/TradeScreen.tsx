import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getAllCryptoPrices } from '../api/coin';
import { placeBuyOrder, placeSellOrder } from '../api/order';

interface Coin {
  symbol: string;
  price: number;
  percent_change_24h: number;
}



export default function TradeScreen() {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [loading, setLoading] = useState(true);
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

  const handleTrade = async (symbol: string, type: string) => {
    try {
      const qty = 0.01; // default trade quantity
      if (type === 'buy') {
        await placeBuyOrder(symbol, qty);
        Alert.alert('Success', `Bought ${qty} ${symbol}`);
      } else {
        await placeSellOrder(symbol, qty);
        Alert.alert('Success', `Sold ${qty} ${symbol}`);
      }
    } catch (err) {
      Alert.alert('Trade Failed', JSON.stringify(err));
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
                  onPress={() => handleTrade(item.symbol, 'buy')}
                >
                  <Text style={styles.buttonText}>Buy</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.sellButton]}
                  onPress={() => handleTrade(item.symbol, 'sell')}
                >
                  <Text style={styles.buttonText}>Sell</Text>
                </TouchableOpacity>
              </View>
            </View>

          )}
        />
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
});
