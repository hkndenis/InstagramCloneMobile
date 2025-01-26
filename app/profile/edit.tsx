import { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { userAPI, API_URL } from '@/services/api';
import { router } from 'expo-router';

const DEFAULT_AVATAR = `${API_URL}/static/images/Default_pfp.jpg`;

export default function EditProfileScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [fullName, setFullName] = useState('');

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setAvatar(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);

      const formData = new FormData();
      
      if (avatar) {
        const filename = avatar.split('/').pop() || 'avatar.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';
        
        formData.append('avatar', {
          uri: avatar,
          name: filename,
          type,
        } as any);
      }

      if (fullName) {
        formData.append('full_name', fullName);
      }

      await userAPI.updateProfile(formData);
      router.push('/(tabs)/profile');
      
    } catch (error) {
      console.error('Profil güncellenirken hata:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ThemedView style={styles.content}>
        <TouchableOpacity style={styles.avatarContainer} onPress={pickImage}>
          <Image
            source={{ uri: avatar || DEFAULT_AVATAR }}
            style={styles.avatar}
            contentFit="cover"
          />
          <View style={styles.changePhotoButton}>
            <ThemedText style={styles.changePhotoText}>Fotoğrafı Değiştir</ThemedText>
          </View>
        </TouchableOpacity>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <ThemedText style={styles.label}>Ad Soyad</ThemedText>
            <TextInput
              style={styles.input}
              value={fullName}
              onChangeText={setFullName}
              placeholder="Ad Soyad"
            />
          </View>

          <TouchableOpacity 
            style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isLoading || (!avatar && !fullName)}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <ThemedText style={styles.submitButtonText}>Kaydet</ThemedText>
            )}
          </TouchableOpacity>
        </View>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  changePhotoButton: {
    backgroundColor: '#0095f6',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
  },
  changePhotoText: {
    color: 'white',
    fontWeight: '600',
  },
  form: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    marginBottom: 5,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#0095f6',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
}); 