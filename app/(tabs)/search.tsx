import { useState, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Image } from 'expo-image';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAuth } from '@/providers/AuthProvider';
import api, { getFullImageUrl } from '@/services/api';

const { width } = Dimensions.get('window');

type TabType = 'users' | 'hashtags';

interface PopularUser {
  username: string;
  full_name: string;
  avatar_url: string;
  follower_count: number;
  post_count: number;
}

interface PopularHashtag {
  tag: string;
  usage_count: number;
  total_likes: number;
}

export default function SearchScreen() {
  const { token, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('users');
  const [popularUsers, setPopularUsers] = useState<PopularUser[]>([]);
  const [popularHashtags, setPopularHashtags] = useState<PopularHashtag[]>([]);
  const router = useRouter();
  const colorScheme = useColorScheme();

  useEffect(() => {
    if (isAuthenticated && token) {
      if (activeTab === 'users') {
        fetchPopularUsers();
      } else {
        fetchPopularHashtags();
      }
    }
  }, [activeTab, isAuthenticated, token]);

  const fetchPopularUsers = async () => {
    try {
      const response = await api.get('/api/popular-users');
      const usersWithFixedAvatars = response.data.map((user: PopularUser) => ({
        ...user,
        avatar_url: getFullImageUrl(user.avatar_url)
      }));
      setPopularUsers(usersWithFixedAvatars);
    } catch (error) {
      console.error('Popüler kullanıcılar yüklenirken hata:', error);
    }
  };

  const fetchPopularHashtags = async () => {
    try {
      const response = await api.get('/api/popular-hashtags');
      setPopularHashtags(response.data);
    } catch (error) {
      console.error('Popüler hashtagler yüklenirken hata:', error);
    }
  };

  const renderUser = ({ item }: { item: PopularUser }) => (
    <TouchableOpacity 
      style={styles.userCard}
      onPress={() => router.push({
        pathname: '/user/[username]',
        params: { username: item.username }
      })}
    >
      <Image
        source={{ uri: item.avatar_url }}
        style={styles.avatar}
        contentFit="cover"
      />
      <View style={styles.userInfo}>
        <ThemedText type="defaultSemiBold">{item.username}</ThemedText>
        <ThemedText>{item.full_name}</ThemedText>
        <ThemedText style={styles.stats}>
          {item.follower_count} takipçi • {item.post_count} gönderi
        </ThemedText>
      </View>
    </TouchableOpacity>
  );

  const renderHashtag = ({ item }: { item: PopularHashtag }) => (
    <TouchableOpacity 
      style={styles.hashtagCard}
      onPress={() => router.push({
        pathname: '/hashtag/[tag]' as const,
        params: { tag: item.tag.replace('#', '') }
      })}
    >
      <ThemedText type="defaultSemiBold">{item.tag}</ThemedText>
      <ThemedText style={styles.stats}>
        {item.usage_count} gönderi • {item.total_likes} beğeni
      </ThemedText>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ThemedView style={styles.content}>
        {/* Tab Bar */}
        <View style={styles.tabBar}>
          <TouchableOpacity 
            style={[
              styles.tab, 
              activeTab === 'users' && styles.activeTab,
              { borderColor: Colors[colorScheme ?? 'light'].text }
            ]}
            onPress={() => setActiveTab('users')}
          >
            <ThemedText 
              style={[
                styles.tabText,
                activeTab === 'users' && styles.activeTabText
              ]}
            >
              Kullanıcılar
            </ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.tab, 
              activeTab === 'hashtags' && styles.activeTab,
              { borderColor: Colors[colorScheme ?? 'light'].text }
            ]}
            onPress={() => setActiveTab('hashtags')}
          >
            <ThemedText 
              style={[
                styles.tabText,
                activeTab === 'hashtags' && styles.activeTabText
              ]}
            >
              Hashtagler
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <FlashList<PopularUser | PopularHashtag>
          data={activeTab === 'users' ? popularUsers : popularHashtags}
          renderItem={({ item }) => {
            if (activeTab === 'users') {
              return renderUser({ item: item as PopularUser });
            }
            return renderHashtag({ item: item as PopularHashtag });
          }}
          estimatedItemSize={100}
          keyExtractor={(item) => 
            'username' in item ? item.username : item.tag
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
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    borderWidth: 1,
  },
  activeTab: {
    backgroundColor: Colors.light.tint,
  },
  tabText: {
    fontSize: 14,
  },
  activeTabText: {
    color: '#fff',
  },
  userCard: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  hashtagCard: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  stats: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
});