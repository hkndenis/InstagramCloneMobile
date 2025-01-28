import { useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { StyleSheet, Dimensions, View, TouchableOpacity } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Image } from 'expo-image';
import { useAuth } from '@/providers/AuthProvider';
import api, { getFullImageUrl } from '@/services/api';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const COLUMN_COUNT = 3;
const GRID_SPACING = 2;
const PHOTO_SIZE = (width - (COLUMN_COUNT + 1) * GRID_SPACING) / COLUMN_COUNT;

interface HashtagPost {
  post_id: number;
  image_url: string;
  like_count: number;
  comment_count: number;
}

export default function HashtagScreen() {
  const { tag } = useLocalSearchParams<{ tag: string }>();
  const { isAuthenticated } = useAuth();
  const [posts, setPosts] = useState<HashtagPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      fetchHashtagPosts();
    }
  }, [isAuthenticated, tag]);

  const fetchHashtagPosts = async () => {
    try {
      const response = await api.get(`/api/hashtag/${tag}/posts`);
      const postsWithFixedUrls = response.data.map((post: HashtagPost) => ({
        ...post,
        image_url: getFullImageUrl(post.image_url)
      }));
      setPosts(postsWithFixedUrls);
    } catch (error) {
      console.error('Hashtag gönderileri yüklenirken hata:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderPost = ({ item }: { item: HashtagPost }) => (
    <TouchableOpacity 
      style={styles.postContainer}
      onPress={() => router.push({
        pathname: '/post/[id]',
        params: { id: item.post_id }
      })}
    >
      <Image
        source={{ uri: item.image_url }}
        style={styles.postImage}
        contentFit="cover"
      />
      <View style={styles.postStats}>
        <ThemedText style={styles.statsText}>❤️ {item.like_count}</ThemedText>
        <ThemedText style={styles.statsText}>💬 {item.comment_count}</ThemedText>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ThemedView style={styles.content}>
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>#{tag}</ThemedText>
          <ThemedText style={styles.postCount}>{posts.length} gönderi</ThemedText>
        </View>

        <FlashList
          data={posts}
          renderItem={renderPost}
          numColumns={3}
          estimatedItemSize={PHOTO_SIZE}
          keyExtractor={(item) => item.post_id.toString()}
          contentContainerStyle={styles.grid}
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
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  title: {
    fontSize: 24,
    marginBottom: 4,
  },
  postCount: {
    color: '#666',
  },
  grid: {
    padding: GRID_SPACING,
  },
  postContainer: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    margin: GRID_SPACING / 2,
  },
  postImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  postStats: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 4,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  statsText: {
    color: '#fff',
    fontSize: 12,
  }
}); 