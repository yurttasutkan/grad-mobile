import React, { useState, useContext, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { useRouter } from 'expo-router';
import RegisterScreen from './RegisterScreen';
const LoginScreen = () => {
  const authContext = useContext(AuthContext);
  const router = useRouter();
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true); // ✅ wait until component is mounted
  }, []);

  if (!authContext) {
    throw new Error("AuthContext is undefined. Make sure you have wrapped the app with AuthProvider.");
  }

  const { login } = authContext;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    try {
      await login(email, password);
      if (hasMounted) {
        router.replace('../(tabs)');
      }
    } catch (err) {
      if (typeof err === "string") {
        console.log('Error:', err);
        setError(err);
      } else if (err instanceof Error) {
        setError(err.message);
        console.log('Error:', err);
      } else {
        setError("An unknown error occurred.");
      }
    }
  };

  const goToRegister = () => {
    if (hasMounted) {
      router.push('/(screens)/RegisterScreen');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#aaa"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#aaa"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity onPress={goToRegister}>
        <Text style={styles.registerLink}>Don't have an account? Register</Text>
      </TouchableOpacity>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginText}>Login</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
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
    color: '#ff4d4d', // Red for errors
    textAlign: 'center',
    marginBottom: 10,
    fontSize: 14,
  },
  loginButton: {
    marginTop: 10,
    backgroundColor: '#f0b90b',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  loginText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#121212',
  },
  registerLink: {
    color: '#f0b90b',
    textAlign: 'center',
    marginTop: 15,
    fontSize: 16,
  },
  
});

export default LoginScreen;
