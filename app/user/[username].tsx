import { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image as ExpoImage } from 'expo-image';
import { FlashList } from '@shopify/flash-list';
import { userAPI } from '@/services/api';
import type { Post, User } from '@/types';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');
const GRID_SPACING = 2;
const COLUMN_COUNT = 3;
const PHOTO_SIZE = (width - (COLUMN_COUNT + 1) * GRID_SPACING) / COLUMN_COUNT;

export default function UserProfileScreen() {
  const { username } = useLocalSearchParams<{ username: string }>();
  const [userInfo, setUserInfo] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchUserProfile();
  }, [username]);

  const fetchUserProfile = async () => {
    try {
      setIsLoading(true);
      const response = await userAPI.getUserByUsername(username);
      setUserInfo(response.data.user);
      setPosts(response.data.posts);
    } catch (error) {
      console.error('Kullanıcı bilgileri alınamadı:', error);
    } finally {
      setIsLoading(false);
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
        source={{ uri: item.image_url }}
        style={styles.postImage}
        contentFit="cover"
        transition={200}
      />
    </TouchableOpacity>
  );

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
        <FlashList
          ListHeaderComponent={
            <>
              <View style={styles.header}>
                <ExpoImage
                  source={{ uri: userInfo.avatar_url }}
                  style={styles.avatar}
                  contentFit="cover"
                />
                <View style={styles.stats}>
                  <View style={styles.statItem}>
                    <ThemedText type="title">{posts.length}</ThemedText>
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
                <ThemedText type="defaultSemiBold">{userInfo.full_name}</ThemedText>
                {userInfo.bio && <ThemedText>{userInfo.bio}</ThemedText>}
              </View>
            </>
          }
          data={posts}
          numColumns={3}
          renderItem={renderPost}
          keyExtractor={(item) => item.post_id.toString()}
          estimatedItemSize={PHOTO_SIZE}
          contentContainerStyle={styles.gridContainer}
          ItemSeparatorComponent={() => <View style={{ height: GRID_SPACING }} />}
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
    height: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 20,
  },
  stats: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  userInfo: {
    paddingHorizontal: 20,
    marginBottom: 20,
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
}); 