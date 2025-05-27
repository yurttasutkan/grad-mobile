import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useContext, useState } from 'react';
import 'react-native-reanimated';
import { useColorScheme } from '@/components/useColorScheme';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { ActivityIndicator, View, TouchableOpacity, Text, Image } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Import Screens
import ChatbotScreen from './(screens)/Chatbot';
import LoginScreen from './(screens)/LoginScreen';
import TabsNavigator from './(tabs)/_layout'; // Import Tabs as Home
import AuthNavigator from './(screens)/AuthNavigator';
import TradeScreen from './(screens)/TradeScreen';
import { getUser } from './api/auth';

export {
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export type DrawerParamList = {
  Home: undefined;
  Chatbot: undefined;
  Logout: undefined;
  TradeScreen: undefined; // ✅ Add this
};


// Drawer Navigator
const Drawer = createDrawerNavigator<DrawerParamList>();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);



  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const authContext = useContext(AuthContext);
  const userToken = authContext?.userToken;
  const isLoading = authContext?.isLoading;
  const logout = authContext?.logout;


  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        {userToken ? (
          <Drawer.Navigator
            drawerContent={(props) => <CustomDrawerContent {...props} />}
            screenOptions={{
              drawerStyle: { backgroundColor: '#121212' },
              drawerActiveTintColor: '#f0b90b',
              drawerInactiveTintColor: '#fff',
              headerStyle: { backgroundColor: '#121212' },
              headerTintColor: '#f0b90b',
            }}
          >
            {/* ✅ Home (Tabs) as First Screen */}
            <Drawer.Screen
              name="Home"
              component={TabsNavigator}
              options={{
                headerShown: false,
                drawerIcon: ({ color }) => (
                  <FontAwesome name="home" size={20} color={color} />
                ),
              }}
            />

            {/* ✅ Chatbot */}
            <Drawer.Screen
              name="Chatbot"
              component={ChatbotScreen}
              options={{
                drawerIcon: ({ color }) => (
                  <FontAwesome name="comments" size={20} color={color} />
                ),
              }}
            />

            {/* ✅ Trade Screen */}
            <Drawer.Screen
              name="TradeScreen"
              component={TradeScreen}
              options={{
                drawerLabel: 'Trade',
                drawerIcon: ({ color }) => (
                  <FontAwesome name="exchange" size={20} color={color} />
                ),
              }}
            />
            {/* ✅ Logout */}
            <Drawer.Screen
              name="Logout"
              component={() => (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' }}>
                  <Text style={{ color: '#fff', fontSize: 18 }}>Are you sure you want to logout?</Text>
                  <TouchableOpacity
                    style={{
                      backgroundColor: '#f0b90b',
                      padding: 10,
                      borderRadius: 10,
                      marginTop: 20,
                    }}
                    onPress={() => {
                      if (logout) {
                        logout();
                      }
                    }}
                  >
                    <Text style={{ color: '#121212', fontSize: 16 }}>Logout</Text>
                  </TouchableOpacity>
                </View>
              )}
              options={{
                drawerIcon: ({ color }) => (
                  <FontAwesome name="sign-out" size={20} color={color} />
                ),
              }}
            />
          </Drawer.Navigator>
        ) : (
          <AuthNavigator /> // 👈 THIS is key
        )}
      </GestureHandlerRootView>
    </ThemeProvider>
  );
}

function CustomDrawerContent(props: any) {
  const authContext = useContext(AuthContext);
  const userToken = authContext?.userToken;
  const [user, setUser] = useState<{ name: string; lastname: string; email: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        if (userToken) {
          const userInfo = await getUser(userToken);
          setUser(userInfo);
        }
      } catch (error) {
        console.error('Failed to load user info:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userToken]);

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={{ flex: 1, backgroundColor: '#1e1e1e' }}>
      <View style={{ padding: 20, alignItems: 'center', backgroundColor: '#1e1e1e' }}>
        <Image
          source={{ uri: 'https://i.pravatar.cc/100?img=3' }}
          style={{
            width: 70,
            height: 70,
            borderRadius: 35,
            marginBottom: 10,
            borderWidth: 2,
            borderColor: '#f0b90b',
          }}
        />
        {loading ? (
          <ActivityIndicator color="#f0b90b" />
        ) : user ? (
          <>
            <Text style={{ color: '#f0b90b', fontWeight: 'bold', fontSize: 16 }}>
              {user.name} {user.lastname}
            </Text>
            <Text style={{ color: '#ccc', fontSize: 13 }}>{user.email}</Text>
          </>
        ) : (
          <Text style={{ color: '#ccc' }}>User info not available</Text>
        )}
      </View>

      <DrawerItemList {...props} />
    </DrawerContentScrollView>
  );
}
