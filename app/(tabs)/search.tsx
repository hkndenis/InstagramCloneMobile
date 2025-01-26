import { useState } from 'react';
import { View, TextInput, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { ThemedView } from '@/components/ThemedView';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import type { Post } from '@/types';

const { width } = Dimensions.get('window');
const GRID_SPACING = 2;
const COLUMN_COUNT = 3;
const PHOTO_SIZE = (width - (COLUMN_COUNT + 1) * GRID_SPACING) / COLUMN_COUNT;

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [posts, setPosts] = useState<Post[]>([]);
  const router = useRouter();

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    // TODO: Arama API'si eklenecek
  };

  const renderPost = ({ item }: { item: Post }) => (
    <TouchableOpacity
      onPress={() => router.push({
        pathname: '/post/[id]',
        params: { id: item.post_id }
      })}
      style={styles.postContainer}
    >
      <Image
        source={{ uri: item.image_url }}
        style={styles.postImage}
        contentFit="cover"
        transition={200}
      />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ThemedView style={styles.content}>
        <TextInput
          style={styles.searchInput}
          placeholder="Ara..."
          value={searchQuery}
          onChangeText={handleSearch}
        />
        <FlashList
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
    padding: 0,
  },
  searchInput: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    margin: 10,
    borderRadius: 8,
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