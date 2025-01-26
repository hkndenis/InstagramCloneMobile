import { useEffect, useState } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, Dimensions, Modal } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { postsAPI } from '@/services/api';
import type { Post } from '@/types';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import Animated, { 
  useAnimatedStyle, 
  withSpring,
  withSequence,
  runOnJS,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const IMAGE_HEIGHT = SCREEN_WIDTH;

interface Comment {
  comment_id: number;
  user_id: number;
  username: string;
  avatar_url: string;
  comment_text: string;
  created_at: string;
}

const AnimatedImage = Animated.createAnimatedComponent(Image);

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);
  const [isLikeAnimating, setIsLikeAnimating] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchPostDetails();
    fetchComments();
  }, [id]);

  const fetchPostDetails = async () => {
    try {
      const response = await postsAPI.getPostDetail(Number(id));
      setPost(response.data);
    } catch (error) {
      console.error('Post detayları alınamadı:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await postsAPI.getComments(Number(id));
      setComments(response.data.comments);
    } catch (error) {
      console.error('Yorumlar alınamadı:', error);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      await postsAPI.addComment(Number(id), newComment);
      setNewComment('');
      fetchComments();
    } catch (error) {
      console.error('Yorum eklenemedi:', error);
    }
  };

  const handleLike = async () => {
    if (!post) return;
    
    setIsLikeAnimating(true);
    try {
      await postsAPI.likePost(post.post_id);
      setPost(prev => prev ? {
        ...prev,
        user_has_liked: !prev.user_has_liked,
        like_count: prev.user_has_liked ? prev.like_count - 1 : prev.like_count + 1
      } : null);
    } catch (error) {
      console.error('Beğeni işlemi başarısız:', error);
    }
    setTimeout(() => setIsLikeAnimating(false), 1000);
  };

  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = savedScale.value * Math.min(Math.max(e.scale, 0.5), 3);
    })
    .onEnd(() => {
      savedScale.value = scale.value;
    });

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      if (scale.value > 1) {
        translateX.value = savedTranslateX.value + e.translationX;
        translateY.value = savedTranslateY.value + e.translationY;
      }
    })
    .onEnd(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  const composed = Gesture.Simultaneous(pinchGesture, panGesture);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  const resetZoom = () => {
    scale.value = withSpring(1);
    savedScale.value = 1;
    translateX.value = withSpring(0);
    translateY.value = withSpring(0);
    savedTranslateX.value = 0;
    savedTranslateY.value = 0;
  };

  const handleImagePress = () => {
    setIsModalVisible(true);
  };

  if (isLoading || !post) {
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
        <TouchableOpacity onPress={handleImagePress}>
          <Image
            source={{ uri: post.image_url }}
            style={styles.postImage}
            contentFit="cover"
            transition={200}
          />
        </TouchableOpacity>

        <FlashList
          data={comments}
          ListHeaderComponent={
            <View style={styles.postInfo}>
              <View style={styles.actions}>
                <TouchableOpacity onPress={handleLike}>
                  <Animated.Text style={styles.likeAnimation}>
                    {post.user_has_liked ? '❤️' : '🤍'}
                  </Animated.Text>
                </TouchableOpacity>
                <ThemedText style={styles.likesCount}>{post.like_count} beğeni</ThemedText>
              </View>
              <View style={styles.captionContainer}>
                <TouchableOpacity onPress={() => router.push({
                  pathname: '/user/[username]',
                  params: { username: post.username }
                })}>
                  <ThemedText type="defaultSemiBold">{post.username}</ThemedText>
                </TouchableOpacity>
                <ThemedText style={styles.caption}>{post.caption}</ThemedText>
                <ThemedText style={styles.dateText}>
                  {formatDistanceToNow(new Date(post.created_at), { 
                    addSuffix: true,
                    locale: tr 
                  })}
                </ThemedText>
              </View>
              <ThemedText type="defaultSemiBold" style={styles.commentsTitle}>
                Yorumlar ({comments.length})
              </ThemedText>
            </View>
          }
          renderItem={({ item: comment }) => (
            <View style={styles.commentItem}>
              <Image
                source={{ uri: comment.avatar_url }}
                style={styles.commentAvatar}
                contentFit="cover"
              />
              <View style={styles.commentContent}>
                <ThemedText>
                  <ThemedText type="defaultSemiBold">{comment.username}</ThemedText>{' '}
                  {comment.comment_text}
                </ThemedText>
                <ThemedText style={styles.commentDate}>
                  {formatDistanceToNow(new Date(comment.created_at), { 
                    addSuffix: true,
                    locale: tr 
                  })}
                </ThemedText>
              </View>
            </View>
          )}
          keyExtractor={(item) => item.comment_id.toString()}
          estimatedItemSize={50}
        />

        <View style={styles.commentInput}>
          <TextInput
            style={styles.input}
            placeholder="Yorum yaz..."
            value={newComment}
            onChangeText={setNewComment}
            multiline
          />
          <TouchableOpacity 
            style={styles.sendButton} 
            onPress={handleAddComment}
            disabled={!newComment.trim()}
          >
            <ThemedText style={[
              styles.sendButtonText,
              !newComment.trim() && styles.sendButtonDisabled
            ]}>
              Gönder
            </ThemedText>
          </TouchableOpacity>
        </View>

        <Modal
          visible={isModalVisible}
          transparent={true}
          onRequestClose={() => {
            setIsModalVisible(false);
            resetZoom();
          }}
        >
          <View style={styles.modalContainer}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setIsModalVisible(false);
                resetZoom();
              }}
            >
              <ThemedText style={styles.closeButtonText}>✕</ThemedText>
            </TouchableOpacity>
            
            <GestureHandlerRootView style={styles.gestureContainer}>
              <GestureDetector gesture={composed}>
                <AnimatedImage
                  source={{ uri: post.image_url }}
                  style={[styles.modalImage, animatedStyle]}
                  contentFit="contain"
                  transition={200}
                />
              </GestureDetector>
            </GestureHandlerRootView>
          </View>
        </Modal>
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
  postImage: {
    width: '100%',
    height: IMAGE_HEIGHT,
  },
  postInfo: {
    padding: 10,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  likesCount: {
    marginLeft: 10,
  },
  commentsTitle: {
    marginTop: 15,
    marginBottom: 10,
  },
  captionContainer: {
    padding: 10,
  },
  caption: {
    marginLeft: 5,
  },
  dateText: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  commentAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
  },
  commentContent: {
    flex: 1,
  },
  commentDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  commentInput: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#dbdbdb',
  },
  input: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
  },
  sendButton: {
    justifyContent: 'center',
    paddingHorizontal: 15,
  },
  sendButtonText: {
    color: '#0095f6',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gestureContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1,
    padding: 10,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 24,
  },
  likeAnimation: {
    fontSize: 24,
    marginRight: 5,
  },
});