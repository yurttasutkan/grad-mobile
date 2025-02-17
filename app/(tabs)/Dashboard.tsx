import { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, Image, FlatList } from 'react-native';
import { Text, View } from '@/components/Themed';
import axios from 'axios';
import { useRouter } from 'expo-router';


const fetchCryptoPrice = async (assetId: string) => {
  try {
    const response = await axios.get(
      `https://api.coincap.io/v2/assets/${assetId}`
    );
    return response.data.data?.priceUsd ? parseFloat(response.data.data.priceUsd).toFixed(2) : null;
  } catch (error) {
    console.error('Error fetching price:', error);
    return null;
  }
};


const dummyActions = [
  { id: '1', action: 'Bought 0.01 BTC', time: '2 hours ago' },
  { id: '2', action: 'Sold 2 ETH', time: '5 hours ago' },
  { id: '3', action: 'Bought 50 SOL', time: '1 day ago' },
];

export default function DashboardScreen() {
  const [btcPrice, setBtcPrice] = useState('Loading...');
  const [ethPrice, setEthPrice] = useState('Loading...');

  useEffect(() => {
    async function fetchPrices() {
      const btc = await fetchCryptoPrice('bitcoin');
      const eth = await fetchCryptoPrice('ethereum');
      setBtcPrice(btc ? `$${btc}` : 'Unavailable');
      setEthPrice(eth ? `$${eth}` : 'Unavailable');
    }

    fetchPrices();
    const interval = setInterval(fetchPrices, 20000); // Refresh every 20 seconds
    return () => clearInterval(interval);
  }, []);


  // Inside the DashboardScreen component:
  const router = useRouter();
 const handleOpenChatbot = () => {
  router.push('/Screens/Chatbot');
};
  return (
    <View style={styles.container}>
      <Image source={{ uri: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png' }} style={styles.logo} />
      <Text style={styles.title}>Crypto Chatbot Dashboard</Text>
      <Text style={styles.subtitle}>Live Crypto Prices</Text>
      <View style={styles.priceContainer}>
        <Text style={styles.priceText}>BTC: {btcPrice}</Text>
        <Text style={styles.priceText}>ETH: {ethPrice}</Text>
      </View>
      <Text style={styles.sectionTitle}>Latest Actions</Text>
      <FlatList
        data={dummyActions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Text style={styles.actionText}>{item.action} - {item.time}</Text>
        )}
      />
      <TouchableOpacity style={styles.button} onPress={handleOpenChatbot}>
        <Text style={styles.buttonText}>🤖 Open Chatbot</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => console.log('Trade Now')}>
        <Text style={styles.buttonText}>📈 Trade Now</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#121212',
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#f0b90b',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f0b90b',
    marginTop: 20,
  },
  assetText: {
    fontSize: 16,
    color: '#fff',
    marginVertical: 5,
  },
  actionText: {
    fontSize: 16,
    color: '#f0b90b',
    marginVertical: 5,
  },
  priceContainer: {
    backgroundColor: '#333',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    width: '80%',
    alignItems: 'center',
  },
  priceText: {
    fontSize: 18,
    color: '#f0b90b',
    marginBottom: 5,
  },
  button: {
    backgroundColor: '#f0b90b',
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
    width: '80%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#121212',
  },
});
