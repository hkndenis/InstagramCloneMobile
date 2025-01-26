import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { ThemedText } from './ThemedText';
import { Post as PostType } from '@/types';
import { postsAPI, getFullImageUrl } from '@/services/api';
import { API_URL } from '@/services/api';
import { useState } from 'react';
import { useRouter } from 'expo-router';

interface PostProps {
  post: PostType;
}

const DEFAULT_AVATAR = `${API_URL}/static/images/Default_pfp.jpg`;

export function Post({ post }: PostProps) {
  const [isLiked, setIsLiked] = useState(post.user_has_liked);
  const [likesCount, setLikesCount] = useState(post.like_count);
  const router = useRouter();

  const handleLike = async () => {
    try {
      await postsAPI.likePost(post.post_id);
      setIsLiked(!isLiked);
      setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
    } catch (error) {
      console.error('Beğeni işlemi başarısız:', error);
    }
  };

  const handlePress = () => {
    router.push({
      pathname: '/post/[id]',
      params: { id: post.post_id }
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image
          source={{ uri: getFullImageUrl(post.avatar_url) }}
          style={styles.avatar}
          contentFit="cover"
          transition={200}
          cachePolicy="memory-disk"
        />
        <TouchableOpacity onPress={() => router.push({
          pathname: '/user/[username]',
          params: { username: post.username }
        })}>
          <ThemedText type="defaultSemiBold">{post.username}</ThemedText>
        </TouchableOpacity>
      </View>
      
      <Image
        source={{ uri: getFullImageUrl(post.image_url) }}
        style={styles.postImage}
        contentFit="cover"
        transition={200}
        cachePolicy="memory-disk"
      />
      
      <View style={styles.actions}>
        <TouchableOpacity onPress={handleLike}>
          <ThemedText>{isLiked ? '❤️' : '🤍'}</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity onPress={handlePress} style={styles.commentButton}>
          <ThemedText>💬</ThemedText>
        </TouchableOpacity>
      </View>
      
      <View style={styles.footer}>
        <ThemedText type="defaultSemiBold">{likesCount} beğeni</ThemedText>
        <TouchableOpacity onPress={handlePress}>
          <ThemedText type="defaultSemiBold">{post.comment_count} yorum</ThemedText>
        </TouchableOpacity>
        <ThemedText>
          <ThemedText type="defaultSemiBold">{post.username}</ThemedText> {post.caption}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: '#f0f0f0'
  },
  postImage: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#f0f0f0'
  },
  actions: {
    flexDirection: 'row',
    padding: 10,
  },
  commentButton: {
    marginLeft: 15,
  },
  footer: {
    padding: 10,
    gap: 5,
  },
}); 