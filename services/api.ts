import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

export const API_URL = 'http://192.168.18.5:5000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 saniye timeout
});

// İstek interceptor'ı
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('userToken');
  console.log('Token:', token); // Debug için
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log('API Request:', config);
  return config;
});

api.interceptors.response.use(
  response => {
    console.log('API Response:', response);
    return response;
  },
  error => {
    if (error.response) {
      // Sunucu cevap döndü ama hata kodu var
      console.log('API Error Response:', error.response);
    } else if (error.request) {
      // İstek yapıldı ama cevap alınamadı
      console.log('API Error Request:', error.request);
    } else {
      // İstek oluşturulurken hata oluştu
      console.log('API Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// Yardımcı fonksiyon ekleyin
export function getFullImageUrl(path: string) {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  
  // URL'yi temizle ve normalize et
  const cleanPath = path.trim().replace(/^\/+/, '').replace(/\/+/g, '/');
  return `${API_URL}/${cleanPath}`;
}

// Test edelim:
console.log(getFullImageUrl("/static/uploads/avatar_11_1736785753_photomode_01102023_180025.png"));
// Çıktı: http://192.168.18.5:5000/static/uploads/avatar_11_1736785753_photomode_01102023_180025.png

export const authAPI = {
  login: async (username: string, password: string) => {
    const response = await api.post('/login', { username, password });
    return response.data;
  },
  
  register: async (userData: {
    username: string;
    email: string;
    password: string;
    full_name: string;
  }) => {
    const response = await api.post('/register', userData);
    return response.data;
  },
  
  logout: async () => {
    await SecureStore.deleteItemAsync('userToken');
    return api.post('/logout');
  },
};

export const postsAPI = {
  getPosts: async () => {
    const response = await api.get('/api/posts');
    const posts = response.data.map((post: any) => ({
      ...post,
      avatar_url: getFullImageUrl(post.avatar_url),
      image_url: getFullImageUrl(post.image_url)
    }));
    return { ...response, data: posts };
  },
  
  createPost: (formData: FormData) => 
    api.post('/api/create-post', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
    
  likePost: (postId: number) => api.post(`/api/post/${postId}/like`),
  
  getComments: async (postId: number) => {
    const response = await api.get(`/api/post/${postId}/comments`);
    const comments = response.data.comments.map((comment: any) => ({
      ...comment,
      avatar_url: getFullImageUrl(comment.avatar_url)
    }));
    return { ...response, data: { comments } };
  },
  
  addComment: (postId: number, comment: string) => 
    api.post(`/api/post/${postId}/comments`, { comment_text: comment }),
  
  getPostDetail: async (postId: number) => {
    const response = await api.get(`/api/post/${postId}`);
    return {
      ...response,
      data: {
        ...response.data,
        avatar_url: getFullImageUrl(response.data.avatar_url),
        image_url: getFullImageUrl(response.data.image_url)
      }
    };
  },
};

export const userAPI = {
  getProfile: async () => {
    const response = await api.get('/api/profile');
    return {
      ...response,
      data: {
        ...response.data,
        avatar_url: getFullImageUrl(response.data.avatar_url)
      }
    };
  },
  getUserPosts: async () => {
    const response = await api.get('/api/user/posts');
    const posts = response.data.map((post: any) => ({
      ...post,
      image_url: getFullImageUrl(post.image_url)
    }));
    return { ...response, data: posts };
  },
  getUserByUsername: async (username: string) => {
    const response = await api.get(`/api/user/${username}`);
    return {
      ...response,
      data: {
        user: {
          ...response.data.user,
          avatar_url: getFullImageUrl(response.data.user.avatar_url)
        },
        posts: response.data.posts.map((post: any) => ({
          ...post,
          image_url: getFullImageUrl(post.image_url),
          avatar_url: getFullImageUrl(post.avatar_url)
        }))
      }
    };
  },
  updateProfile: async (formData: FormData) => {
    return api.put('/api/profile/update', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

export default api; 