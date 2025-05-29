import React, { useState, useContext, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Image, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from 'react-native-screens/lib/typescript/native-stack/types';
import { AuthStackParamList } from './AuthNavigator';
import { api_keys, login } from '../api/auth';

const RegisterScreen = () => {
  const authContext = useContext(AuthContext);
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();

  if (!authContext) {
    throw new Error("AuthContext is undefined. Make sure you have wrapped the app with AuthProvider.");
  }

  const { register } = authContext;

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [binanceApiKey, setBinanceApiKey] = useState('');
  const [binanceSecretKey, setBinanceSecretKey] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleRegister = async () => {
  try {
    // Step 1: Register the user
    await register(name, lastName, email, password);

    // Step 2: Authenticate the user to get the JWT token
    const loginResponse = await login(email, password);  // Assume you have a login function that returns the token
    const token = loginResponse.user.token;  // Assuming the token is in the response
    console.log('Token received:', token);
    // Step 3: Use the token to set the API keys
    await api_keys(binanceApiKey, binanceSecretKey, token);  // Pass the token here

    setSuccess("Registration successful! You can now log in.");
    setError("");
    setTimeout(() => {
      navigation.replace('Login');
    }, 1000);
  } catch (err) {
    setSuccess("");
    if (typeof err === "string") {
      setError(err);
    } else if (err instanceof Error) {
      setError(err.message);
    } else {
      console.log('Error:', err);
      setError("An unknown error occurred.");
    }
  }
};

  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
    });

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}>

      <View style={styles.container}>
        {!isKeyboardVisible && (
          <Image
            source={require('../../assets/images/logo.png')}
            style={{ width: 250, height: 250, alignSelf: 'center' }}
          />
        )}

        <Text style={styles.title}>Register</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#aaa"
          value={email}
          onChangeText={setEmail}
        />

        <TextInput
          style={styles.input}
          placeholder="Name"
          placeholderTextColor="#aaa"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="Last Name"
          placeholderTextColor="#aaa"
          value={lastName}
          onChangeText={setLastName}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#aaa"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TextInput
          style={styles.input}
          placeholder="Binance API Key"
          placeholderTextColor="#aaa"
          value={binanceApiKey}
          onChangeText={setBinanceApiKey}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TextInput
          style={styles.input}
          placeholder="Binance Secret Key"
          placeholderTextColor="#aaa"
          value={binanceSecretKey}
          onChangeText={setBinanceSecretKey}
          autoCapitalize="none"
          autoCorrect={false}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}
        {success ? <Text style={styles.success}>{success}</Text> : null}

        <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
          <Text style={styles.registerText}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView >
  );
};

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
    marginBottom: 20,
  },
  input: {
    height: 50,
    borderColor: '#f0b90b',
    borderWidth: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    paddingHorizontal: 15,
    color: '#fff',
    fontSize: 16,
    marginBottom: 15,
  },
  error: {
    color: '#ff4d4d',
    textAlign: 'center',
    marginBottom: 10,
    fontSize: 14,
  },
  success: {
    color: '#00ff00',
    textAlign: 'center',
    marginBottom: 10,
    fontSize: 14,
  },
  registerButton: {
    marginTop: 10,
    backgroundColor: '#f0b90b',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  registerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#121212',
  },
});

export default RegisterScreen;
