import { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAuth } from '@/hooks/useAuth';
import { authAPI } from '@/services/api';
import { AxiosError } from 'axios';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      console.log('Login attempt with:', { username, password });

      const response = await authAPI.login(username, password);
      console.log('Login response:', response);

      if (response.success) {
        console.log('Login successful, token:', response.token);
        await signIn(response.token);
      } else {
        console.log('Login failed:', response.message);
        alert(response.message || 'Giriş başarısız');
      }
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      console.log('Login error:', error);
      
      if (error.code === 'ECONNABORTED') {
        alert('Bağlantı zaman aşımına uğradı. Lütfen tekrar deneyin.');
      } else if (!error.response) {
        alert('Sunucuya bağlanılamıyor. İnternet bağlantınızı kontrol edin.');
      } else {
        alert(error.response.data.message || 'Giriş başarısız');
      }
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>Giriş Yap</ThemedText>
      
      <TextInput
        style={styles.input}
        placeholder="Kullanıcı Adı"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Şifre"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <ThemedText style={styles.buttonText}>Giriş Yap</ThemedText>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => router.push('register' as any)}>
        <ThemedText style={styles.linkText}>Hesabın yok mu? Kayıt ol</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: 40,
  },
  input: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#0095f6',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  linkText: {
    color: '#0095f6',
    textAlign: 'center',
    marginTop: 20,
  },
}); 