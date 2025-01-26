import { useEffect, useState, memo } from 'react';
import { FlatList, RefreshControl, StyleSheet } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { Post } from '../../components/Post';
import { postsAPI } from '@/services/api';
import type { Post as PostType } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { SafeAreaView } from 'react-native-safe-area-context';

// Post bileşenini memoize edelim
const MemoizedPost = memo(Post);

// renderItem fonksiyonunu dışarı çıkaralım
const renderItem = ({ item }: { item: PostType }) => (
  <MemoizedPost 
    post={item}
  />
);

export default function FeedScreen() {
  const { isAuthenticated } = useAuth();
  const [posts, setPosts] = useState<PostType[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPosts = async () => {
    try {
      if (isAuthenticated) {
        const response = await postsAPI.getPosts();
        setPosts(response.data);
      }
    } catch (error) {
      console.error('Posts yüklenirken hata:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPosts();
    setRefreshing(false);
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchPosts();
    }
  }, [isAuthenticated]);

  return (
    <SafeAreaView style={styles.container}>
      <ThemedView style={styles.content}>
        <FlatList
          data={posts}
          renderItem={renderItem}
          keyExtractor={(item) => item.post_id.toString()}
          maxToRenderPerBatch={5}
          windowSize={5}
          removeClippedSubviews
          initialNumToRender={5}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
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
  }
});
