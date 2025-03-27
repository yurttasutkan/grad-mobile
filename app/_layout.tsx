import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { createDrawerNavigator } from '@react-navigation/drawer';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useContext, useState } from 'react';
import 'react-native-reanimated';
import { useColorScheme } from '@/components/useColorScheme';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { ActivityIndicator, View, TouchableOpacity, Text } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Import Screens
import ChatbotScreen from './(screens)/Chatbot';
import LoginScreen from './(screens)/LoginScreen';
import TabsNavigator from './(tabs)/_layout'; // Import Tabs as Home
import AuthNavigator from './(screens)/AuthNavigator';

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
            screenOptions={{
              drawerStyle: { backgroundColor: '#121212' },
              drawerActiveTintColor: '#f0b90b',
              drawerInactiveTintColor: '#fff',
              headerStyle: { backgroundColor: '#121212' },
              headerTintColor: '#f0b90b',
            }}
          >
            {/* ✅ Home (Tabs) as First Screen */}
            <Drawer.Screen name="Home" component={TabsNavigator} options={{ headerShown: false }} />

            {/* ✅ Chatbot */}
            <Drawer.Screen name="Chatbot" component={ChatbotScreen} />

            {/* ✅ Logout */}
            <Drawer.Screen
              name="Logout"
              component={() => (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
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
            />
          </Drawer.Navigator>
        ) : (
          <AuthNavigator /> // 👈 THIS is key
        )}
      </GestureHandlerRootView>
    </ThemeProvider>
  );
}
