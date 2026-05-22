// types/user.ts

export interface UserProfile {
  id: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  location: string | null;
  website: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateUserProfile {
  display_name?: string;
  bio?: string;
  avatar_url?: string;
  location?: string;
  website?: string;
}

export interface UpdateUserProfile {
  display_name?: string;
  bio?: string;
  avatar_url?: string;
  location?: string;
  website?: string;
}

export interface UserWithProfile {
  user: {
    id: string;
    email: string | null;
    created_at: string;
    updated_at: string;
  };
  profile: UserProfile | null;
}

export interface UserStats {
  total_posts: number;
  total_followers: number;
  total_following: number;
  join_date: string;
}

export interface UserSearchResult {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  username: string | null;
  bio: string | null;
  is_following: boolean;
}
