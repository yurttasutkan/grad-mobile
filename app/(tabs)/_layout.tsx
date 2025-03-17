import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { TouchableOpacity } from 'react-native';
import { DrawerActions } from '@react-navigation/native';
import DashboardScreen from './Dashboard';
import AssetsScreen from './Assets';

const Tab = createBottomTabNavigator();

export default function TabsNavigator() {
  const navigation = useNavigation(); // Get navigation instance

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: { backgroundColor: '#121212' },
        tabBarActiveTintColor: '#f0b90b',
        tabBarInactiveTintColor: '#fff',
        headerStyle: { backgroundColor: '#121212' },
        headerTintColor: '#f0b90b',
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ color, size }) => <FontAwesome name="dashboard" size={size} color={color} />,
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
              style={{ marginLeft: 15 }}
            >
              <FontAwesome name="bars" size={24} color="#f0b90b" />
            </TouchableOpacity>
          ),
        }}
      />
      <Tab.Screen
        name="Assets"
        component={AssetsScreen}
        options={{
          tabBarIcon: ({ color, size }) => <FontAwesome name="briefcase" size={size} color={color} />,
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
              style={{ marginLeft: 15 }}
            >
              <FontAwesome name="bars" size={24} color="#f0b90b" />
            </TouchableOpacity>
          ),
        }}
      />
    </Tab.Navigator>
  );
}
