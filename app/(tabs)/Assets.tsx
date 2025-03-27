import { useEffect, useState } from 'react';
import { StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useNavigation } from '@react-navigation/native';
import { getPortfolio, placeBuyOrder, placeSellOrder } from '../api/order';

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

  const fetchPortfolio = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const data = await getPortfolio();
      setAssets(data.portfolio);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch portfolio');
    } finally {
      isRefresh ? setRefreshing(false) : setLoading(false);
    }
  };

  const handleBuy = async (symbol: string) => {
    try {
      await placeBuyOrder(symbol, 0.01);
      Alert.alert('Success', `Buy order placed for ${symbol}`);
      fetchPortfolio();
    } catch (err) {
      Alert.alert('Buy Failed', JSON.stringify(err));
    }
  };

  const handleSell = async (symbol: string) => {
    try {
      await placeSellOrder(symbol, 0.01);
      Alert.alert('Success', `Sell order placed for ${symbol}`);
      fetchPortfolio();
    } catch (err) {
      Alert.alert('Sell Failed', JSON.stringify(err));
    }
  };

  useEffect(() => {
    fetchPortfolio();

    const interval = setInterval(() => fetchPortfolio(), 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={() => fetchPortfolio()} style={{ marginRight: 15 }}>
          <Text style={{ color: '#f0b90b', fontWeight: 'bold', fontSize: 16 }}>🔄</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

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
                  <TouchableOpacity style={styles.actionButton} onPress={() => handleBuy(`${item.asset}USDT`)}>
                    <Text style={styles.actionText}>Buy</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionButton} onPress={() => handleSell(`${item.asset}USDT`)}>
                    <Text style={styles.actionText}>Sell</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
        />
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
});
