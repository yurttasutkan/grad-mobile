import { useEffect, useState } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  View as RNView,
  ScrollView,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { Text, View } from '@/components/Themed';
import { useRouter } from 'expo-router';
import { getAllCryptoPrices } from '../api/coin';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { AntDesign } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { DrawerParamList } from '../_layout';
import { getTransactions } from '../api/order';


interface CoinData {
  symbol: string;
  price: number;
  percent_change_24h: number;
}

const dummyActions = [
  { id: '1', action: 'Bought 0.01 BTC', time: '2 hours ago' },
  { id: '2', action: 'Sold 2 ETH', time: '5 hours ago' },
  { id: '3', action: 'Bought 50 SOL', time: '1 day ago' },
];

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function DashboardScreen() {
  const navigation = useNavigation<DrawerNavigationProp<DrawerParamList>>();
  const [topGainers, setTopGainers] = useState<CoinData[]>([]);
  const [topLosers, setTopLosers] = useState<CoinData[]>([]);
  const [showActions, setShowActions] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'gainers' | 'losers'>('gainers');
  const [accordionHeight, setAccordionHeight] = useState(0);
  const expanded = useSharedValue(0);
  const rotate = useSharedValue(0);
  const gainersOpacity = useSharedValue(1);
  const losersOpacity = useSharedValue(0);
  const gainersTranslate = useSharedValue(0);
  const losersTranslate = useSharedValue(50);

  const [transactions, setTransactions] = useState<any[]>([]);

  

  const gainersStyle = useAnimatedStyle(() => ({
    opacity: gainersOpacity.value,
    transform: [{ translateX: gainersTranslate.value }],
  }));

  const losersStyle = useAnimatedStyle(() => ({
    opacity: losersOpacity.value,
    transform: [{ translateX: losersTranslate.value }],
  }));
  const handleTabSwitch = (tab: 'gainers' | 'losers') => {
    if (tab === 'gainers') {
      gainersOpacity.value = withTiming(1, { duration: 300 });
      gainersTranslate.value = withTiming(0, { duration: 300 });
      losersOpacity.value = withTiming(0, { duration: 300 });
      losersTranslate.value = withTiming(50, { duration: 300 });
    } else {
      gainersOpacity.value = withTiming(0, { duration: 300 });
      gainersTranslate.value = withTiming(-50, { duration: 300 });
      losersOpacity.value = withTiming(1, { duration: 300 });
      losersTranslate.value = withTiming(0, { duration: 300 });
    }
    setSelectedTab(tab);
  };

  const toggleAccordion = () => {
    expanded.value = expanded.value === 0 ? withTiming(1, { duration: 150 }) : withTiming(0, { duration: 150 });
    rotate.value = rotate.value === 0 ? withTiming(1, { duration: 200 }) : withTiming(0, { duration: 200 });
    setShowActions(!showActions);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    maxHeight: expanded.value === 1 ? accordionHeight : 0,
    opacity: withTiming(expanded.value, { duration: 200 }),
  }));


  const rotateStyle = useAnimatedStyle(() => ({
    transform: [
      {
        rotate: `${rotate.value * 90}deg`,
      },
    ],
  }));

  const handleOpenChatbot = () => {
    navigation.navigate('Chatbot');
  };

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const data = await getAllCryptoPrices();
        const prices: CoinData[] = data.prices;

        const sorted = [...prices].sort(
          (a, b) => b.percent_change_24h - a.percent_change_24h
        );

        setTopGainers(sorted.slice(0, 6));
        setTopLosers(sorted.slice(-6).reverse());
      } catch (error) {
        console.error('Failed to load prices:', error);
      }
    };

    fetchPrices();
    const interval = setInterval(fetchPrices, 20000);
    return () => clearInterval(interval);
  }, []);




  return (
    <ScrollView style={styles.container}>
      <RNView style={styles.innerContainer}>
        <Image
          source={{ uri: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png' }}
          style={styles.logo}
        />
        <Text style={styles.title}>Crypto Chatbot Dashboard</Text>

        {/* Toggle Buttons */}
        <View style={styles.tabSelector}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              selectedTab === 'gainers' && styles.tabButtonSelected,
            ]}
            onPress={() => handleTabSwitch('gainers')}
          >
            <Text style={selectedTab === 'gainers' ? styles.tabTextActive : styles.tabText}>
              📈 Gainers
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tabButton,
              selectedTab === 'losers' && styles.tabButtonSelected,
            ]}
            onPress={() => handleTabSwitch('losers')}
          >
            <Text style={selectedTab === 'losers' ? styles.tabTextActive : styles.tabText}>
              📉 Losers
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.subtitle}>
          {selectedTab === 'gainers' ? 'Daily Top Gainers' : 'Daily Top Losers'}
        </Text>

        <View style={styles.priceWrapper}>
          {selectedTab === 'gainers' && (
            <Animated.View style={gainersStyle}>
              <FlatList
                data={topGainers.slice(0, 6)}
                keyExtractor={(item) => item.symbol}
                numColumns={3}
                renderItem={({ item }) => (
                  <Text style={styles.priceText}>
                    <Text style={styles.symbolText}>{item.symbol.replace('USDT', '')}</Text>
                    {'\n'}${item.price.toFixed(4)}
                    {'\n'}<Text style={styles.gainerText}>▲ {item.percent_change_24h}%</Text>
                  </Text>
                )}
              />
            </Animated.View>
          )}

          {selectedTab === 'losers' && (
            <Animated.View style={losersStyle}>
              <FlatList
                data={topLosers.slice(0, 6)}
                keyExtractor={(item) => item.symbol}
                numColumns={3}
                renderItem={({ item }) => (
                  <Text style={styles.priceText}>
                    <Text style={styles.symbolText}>{item.symbol.replace('USDT', '')}</Text>
                    {'\n'}${item.price.toFixed(4)}
                    {'\n'}<Text style={styles.loserText}>▼ {item.percent_change_24h}%</Text>
                  </Text>
                )}
              />
            </Animated.View>
          )}
        </View>




        <TouchableOpacity onPress={toggleAccordion} style={styles.accordionHeader}>
          <View style={styles.accordionRow}>
            <Text style={styles.sectionTitle}>Latest Actions</Text>
            <Animated.View style={rotateStyle}>
              <AntDesign name="right" size={18} color="#f0b90b" />
            </Animated.View>
          </View>
        </TouchableOpacity>

        {/* Hidden wrapper for measuring height once */}
        <View
          style={styles.hiddenAccordion}
          onLayout={(event) => {
            if (accordionHeight === 0) {
              setAccordionHeight(event.nativeEvent.layout.height);
            }
          }}
        >
          {dummyActions.map((item) => (
            <Text key={item.id} style={styles.actionText}>
              {item.action} - {item.time}
            </Text>
          ))}
        </View>

        {/* Animated container */}
        <Animated.View style={[styles.animatedAccordionContainer, animatedStyle]}>
          <View style={{ backgroundColor: '#121212' }} pointerEvents={showActions ? 'auto' : 'none'}>
            {dummyActions.map((item) => (
              <Text key={item.id} style={styles.actionText}>
                {item.action} - {item.time}
              </Text>
            ))}
          </View>
        </Animated.View>

        <TouchableOpacity style={styles.button} onPress={handleOpenChatbot}>
          <Text style={styles.buttonText}>🤖 Open Chatbot</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('TradeScreen')}>
          <Text style={styles.buttonText}>📈 Trade Now</Text>
        </TouchableOpacity>
      </RNView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  innerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
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
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#fff',
    marginVertical: 10,
    fontWeight: 'bold',
    alignSelf: 'center',
  },
  tabSelector: {
    flexDirection: 'row',
    marginBottom: 10,
    backgroundColor: '#121212',
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#f0b90b',
    marginHorizontal: 5,
  },
  tabButtonSelected: {
    backgroundColor: '#f0b90b',
  },
  tabText: {
    color: '#f0b90b',
    fontWeight: 'bold',
  },
  tabTextActive: {
    color: '#121212',
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f0b90b',
  },
  accordionHeader: {
    width: '100%',
    marginBottom: 5,
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#121212',
  },
  accordionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  accordionArrow: {
    fontSize: 18,
    color: '#f0b90b',
  },
  actionsContainer: {
    width: '100%',
    backgroundColor: '#1e1e1e',
    padding: 10,
    borderRadius: 10,
    marginBottom: 15,
  },
  actionText: {
    fontSize: 16,
    color: '#f0b90b',
    marginVertical: 4,
  },
  priceWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    backgroundColor: '#1a1a1a',
    padding: 10,
    borderRadius: 12,
    marginBottom: 20,
    width: '100%',
  },

  priceText: {
    width: '30%', // ~3 columns with spacing
    backgroundColor: '#1e1e1e',
    borderRadius: 10,
    marginBottom: 10,
    padding: 10,
    color: '#f0f0f0',
    fontWeight: '500',
    textAlign: 'center',
    marginHorizontal: '1.5%',
  },

  priceContainer: {
    backgroundColor: '#333',
    padding: 15,
    borderRadius: 15,
    marginBottom: 20,
    width: '100%',
  },
  button: {
    backgroundColor: '#f0b90b',
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
    width: '100%',
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
  animatedAccordionContainer: {
    overflow: 'hidden',
    backgroundColor: '#121212',
  },
  absoluteFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,

  },
  hiddenAccordion: {
    position: 'absolute',
    opacity: 0,
    zIndex: -1,
    backgroundColor: '#121212',
  },
  gainerText: {
    color: '#2ecc71', // green
    fontWeight: 'bold',
  },
  loserText: {
    color: '#e74c3c', // red
    fontWeight: 'bold',
  },
  symbolText: {
    fontWeight: 'bold',
    color: '#f0b90b',
  },

});
