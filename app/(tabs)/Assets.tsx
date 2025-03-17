import { useEffect, useState } from 'react';
import { StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text, View } from '@/components/Themed';
import axios from 'axios';


// Assetlerin üzerine 
interface Asset {
  id: string;
  name: string;
  symbol: string;
  apiId: string; // CoinCap API ID
  holdings: number; // Amount owned
  avgBuyPrice: number; // User's average buy price
  price?: number; // Live market price
}

const dummyAssets: Asset[] = [
  { id: '1', name: 'Bitcoin', symbol: 'BTC', apiId: 'bitcoin', holdings: 0.5, avgBuyPrice: 40000 },
  { id: '2', name: 'Ethereum', symbol: 'ETH', apiId: 'ethereum', holdings: 2.0, avgBuyPrice: 3500 },
  { id: '3', name: 'Solana', symbol: 'SOL', apiId: 'solana', holdings: 10, avgBuyPrice: 100 },
  { id: '4', name: 'Binance Coin', symbol: 'BNB', apiId: 'binance-coin', holdings: 5, avgBuyPrice: 450 },
  { id: '5', name: 'Cardano', symbol: 'ADA', apiId: 'cardano', holdings: 500, avgBuyPrice: 1.50 },
  { id: '6', name: 'Ripple', symbol: 'XRP', apiId: 'xrp', holdings: 1000, avgBuyPrice: 0.75 },
  { id: '7', name: 'Dogecoin', symbol: 'DOGE', apiId: 'dogecoin', holdings: 5000, avgBuyPrice: 0.10 },
];

export default function AssetScreen() {
  const [assets, setAssets] = useState(dummyAssets);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    
    fetchPrices();
    const interval = setInterval(fetchPrices, 20000); // Refresh every 30 sec
    return () => clearInterval(interval);
  }, []);

  const fetchPrices = async () => {
    try {
      setLoading(true);
      const responses = await Promise.all(
        dummyAssets.map((asset) =>
          axios.get(`https://api.coincap.io/v2/assets/${asset.apiId}`)
        )
      );
      
      const updatedAssets = assets.map((asset, index) => ({
        ...asset,
        price: parseFloat(responses[index].data.data.priceUsd),
      }));

      setAssets(updatedAssets);
    } catch (error) {
      console.error('Error fetching crypto prices:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate total portfolio value & total profit dynamically
  const totalValue = assets.reduce((sum, asset) => sum + (asset.price || 0) * asset.holdings, 0);
  const totalCost = assets.reduce((sum, asset) => sum + asset.avgBuyPrice * asset.holdings, 0);
  const totalProfit = totalValue - totalCost;
  const profitColor = totalProfit >= 0 ? styles.profitText : styles.lossText;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Crypto Portfolio</Text>
      <Text style={styles.totalValue}>Total Value: ${totalValue.toFixed(2)}</Text>
      <Text style={[styles.totalProfit, profitColor]}>
        {totalProfit >= 0 ? `📈 Profit: +$${totalProfit.toFixed(2)}` : `📉 Loss: -$${Math.abs(totalProfit).toFixed(2)}`}
      </Text>

      <View style={styles.separator} />

      {loading ? (
        <ActivityIndicator size="large" color="#f0b90b" />
      ) : (
        <FlatList
          data={assets}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const totalAssetValue = (item.price || 0) * item.holdings;
            const totalCost = item.avgBuyPrice * item.holdings;
            const profit = totalAssetValue - totalCost;
            const profitPercentage = ((profit / totalCost) * 100).toFixed(2);
            const profitTextStyle = profit >= 0 ? styles.profitText : styles.lossText;

            return (
              <View style={styles.assetItem}>
                <View style={styles.assetInfo}>
                  <Text style={styles.assetName}>{item.name} ({item.symbol})</Text>
                  <Text style={styles.assetHoldings}>Holdings: {item.holdings} {item.symbol}</Text>
                </View>
                <View style={styles.assetValue}>
                  <Text style={styles.assetPrice}>${item.price?.toFixed(2) || 'Loading...'}</Text>
                  <Text style={styles.assetTotal}>Total: ${totalAssetValue.toFixed(2)}</Text>
                  <Text style={[styles.profit, profitTextStyle]}>
                    {profit >= 0 ? `+${profitPercentage}%` : `${profitPercentage}%`}
                  </Text>
                </View>
              </View>
            );
          }}
        />
      )}

      <TouchableOpacity style={styles.refreshButton} onPress={fetchPrices}>
        <Text style={styles.refreshText}>🔄 Refresh</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#121212',
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
    color: '#00ff00', // Green for profit
  },
  lossText: {
    color: '#ff4d4d', // Red for loss
  },
  separator: {
    height: 1,
    backgroundColor: '#f0b90b',
    marginBottom: 15,
  },
  assetItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    marginBottom: 10,
    elevation: 5,
  },
  assetName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  assetHoldings: {
    fontSize: 16,
    color: '#aaa',
  },
  assetInfo: {
    backgroundColor: '#1a1a1a',
    flex: 1,
  },
  assetValue: {
    alignItems: 'flex-end',
    backgroundColor: '#1a1a1a',
  },
  assetPrice: {
    fontSize: 18,
    color: '#f0b90b',
  },
  assetTotal: {
    fontSize: 16,
    color: '#fff',
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
