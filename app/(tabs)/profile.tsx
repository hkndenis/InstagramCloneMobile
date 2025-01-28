import { useEffect, useState, memo } from 'react';
import { View, StyleSheet, TouchableOpacity, FlatList, Dimensions } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useAuth } from '@/hooks/useAuth';
import { SafeAreaView } from 'react-native-safe-area-context';
import { userAPI, getFullImageUrl, postsAPI } from '@/services/api';
import { Image as ExpoImage } from 'expo-image';
import { router } from 'expo-router';
import type { Post } from '@/types';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const GRID_SPACING = 2; // Fotoğraflar arası boşluk
const COLUMN_COUNT = 3;
const PHOTO_SIZE = (width - (COLUMN_COUNT + 1) * GRID_SPACING) / COLUMN_COUNT; // Boşlukları hesaba katarak

// Profil postları için yeni bir bileşen
const ProfilePost = memo(({ post }: { post: Post }) => {
  const handlePress = () => {
    router.push({
      pathname: '/post/[id]',
      params: { id: post.post_id }
    });
  };

  return (
    <TouchableOpacity onPress={handlePress} style={styles.postContainer}>
      <ExpoImage
        source={{ 
          uri: post.image_url,
          headers: { 'Accept': 'image/png,image/jpeg' }
        }}
        style={styles.postImage}
        contentFit="cover"
        cachePolicy="memory-disk"
        transition={0}
      />
    </TouchableOpacity>
  );
});

interface UserProfile {
  username: string;
  posts_count: number;
  followers_count: number;
  following_count: number;
  avatar_url: string;
  full_name: string;
  bio?: string;
}

export default function ProfileScreen() {
  const { signOut } = useAuth();
  const [userInfo, setUserInfo] = useState<UserProfile>({
    username: '',
    posts_count: 0,
    followers_count: 0,
    following_count: 0,
    avatar_url: '',
    full_name: '',
  });
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchUserProfile();
    fetchUserPosts();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setIsLoading(true);
      const response = await userAPI.getProfile();
      setUserInfo(response.data);
    } catch (error) {
      console.error('Profil bilgileri alınamadı:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserPosts = async () => {
    try {
      const response = await userAPI.getUserPosts();
      setPosts(response.data);
    } catch (error) {
      console.error('Kullanıcı postları alınamadı:', error);
    }
  };

  const renderPost = ({ item }: { item: Post }) => (
    <TouchableOpacity
      onPress={() => router.push({
        pathname: '/post/[id]',
        params: { id: item.post_id }
      })}
      style={styles.postContainer}
    >
      <ExpoImage
        source={{ 
          uri: item.image_url,
          headers: { 'Accept': 'image/png,image/jpeg' }
        }}
        style={styles.postImage}
        contentFit="cover"
        cachePolicy="memory-disk"
        transition={0}
      />
    </TouchableOpacity>
  );

  const fetchMorePosts = async () => {
    // Implement the logic to fetch more posts
  };

  if (isLoading || !userInfo) {
    return (
      <SafeAreaView style={styles.container}>
        <ThemedView style={styles.content}>
          <ThemedText>Yükleniyor...</ThemedText>
        </ThemedView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ThemedView style={styles.content}>
        <View style={styles.header}>
          <View style={styles.avatarSection}>
            <TouchableOpacity 
              onPress={() => router.push('/profile/edit')} 
              style={styles.avatarContainer}
            >
              <ExpoImage 
                source={{ 
                  uri: userInfo.avatar_url || getFullImageUrl('/static/images/Default_pfp.jpg'),
                  headers: { 'Accept': 'image/png,image/jpeg' }
                }} 
                style={styles.avatar}
                contentFit="cover"
                transition={0}
              />
              <View style={styles.editAvatarBadge}>
                <Feather name="camera" size={14} color="white" />
              </View>
            </TouchableOpacity>

            <View style={styles.stats}>
              <View style={styles.statItem}>
                <ThemedText type="title">{userInfo.posts_count}</ThemedText>
                <ThemedText>Gönderiler</ThemedText>
              </View>
              <View style={styles.statItem}>
                <ThemedText type="title">{userInfo.followers_count}</ThemedText>
                <ThemedText>Takipçiler</ThemedText>
              </View>
              <View style={styles.statItem}>
                <ThemedText type="title">{userInfo.following_count}</ThemedText>
                <ThemedText>Takip</ThemedText>
              </View>
            </View>
          </View>

          <View style={styles.userInfo}>
            <ThemedText type="defaultSemiBold" style={styles.username}>{userInfo.username}</ThemedText>
            <ThemedText style={styles.fullName}>{userInfo.full_name}</ThemedText>
            {userInfo.bio && <ThemedText style={styles.bio}>{userInfo.bio}</ThemedText>}
          </View>

          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => router.push('/profile/edit')}
          >
            <ThemedText>Profili Düzenle</ThemedText>
          </TouchableOpacity>
        </View>

        <FlashList
          data={posts}
          numColumns={3}
          renderItem={renderPost}
          keyExtractor={(item) => item.post_id.toString()}
          estimatedItemSize={PHOTO_SIZE}
          contentContainerStyle={styles.gridContainer}
          ItemSeparatorComponent={() => <View style={{ height: GRID_SPACING }} />}
          onEndReached={fetchMorePosts}
          onEndReachedThreshold={0.5}
        />
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
    padding: 0,
  },
  header: {
    padding: 20,
  },
  avatarSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 30,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f0f0',
  },
  editAvatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#0095f6',
    padding: 4,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'white',
  },
  stats: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  userInfo: {
    marginBottom: 15,
    paddingHorizontal: 5,
  },
  username: {
    fontSize: 16,
    marginBottom: 2,
  },
  fullName: {
    fontSize: 14,
    marginBottom: 4,
  },
  bio: {
    fontSize: 14,
    lineHeight: 19,
  },
  editButton: {
    borderWidth: 1,
    borderColor: '#dbdbdb',
    borderRadius: 4,
    padding: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  logoutButton: {
    backgroundColor: '#ff4444',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 'auto', // En alta yapıştır
  },
  logoutText: {
    color: 'white',
    fontWeight: 'bold',
  },
  gridContainer: {
    padding: GRID_SPACING,
  },
  postContainer: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    marginRight: GRID_SPACING,
    marginBottom: GRID_SPACING,
  },
  postImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
  },
  statItem: {
    alignItems: 'center',
  },
}); 