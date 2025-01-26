export interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  avatar_url: string;
  bio?: string;
  followers_count: number;
  following_count: number;
  posts_count: number;
}

export interface Post {
  post_id: number;
  user_id: number;
  username: string;
  avatar_url: string;
  image_url: string;
  caption: string;
  caption_with_tags: string | null;
  like_count: number;
  comment_count: number;
  user_has_liked: boolean;
  created_at: string;
} 