import { supabase } from "../supabase";

export interface Author {
  id: string;
  name: string;
  username: string;
  avatar: string | null;
  badge: string;
  badgeColor: string;
  email: string | null;
}

export interface PostSummary {
  id: string;
  author: Author;
  timestamp: string;
  title: string;
  content: string;
  full_content?: string | null;
  tags: string[];
  likes: number;
  comments: number;
  shares: number;
  isLiked: boolean;
  isSaved: boolean;
  images?: string[] | null;
  created_at: string;
  engagement_score?: number;
}

export type CommentNode = {
  id: string;
  author: Author;
  timestamp: string;
  content: string;
  likes: number;
  isLiked: boolean;
  isSaved?: boolean;
  replies: CommentNode[];
  parent_id?: string | undefined;
  created_at: string;
};

export type PostDetail = PostSummary & { commentList: CommentNode[] };

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  const diffInWeeks = Math.floor(diffInDays / 7);
  const diffInMonths = Math.floor(diffInDays / 30);
  const diffInYears = Math.floor(diffInDays / 365);
  if (diffInSeconds < 60) return "Just now";
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInDays === 1) return "Yesterday";
  if (diffInDays < 7) return `${diffInDays}d ago`;
  if (diffInWeeks < 4) return `${diffInWeeks}w ago`;
  if (diffInMonths < 12) return `${diffInMonths}mo ago`;
  return `${diffInYears}y ago`;
}

export async function getPosts(
  page = 0,
  pageSize = 10
): Promise<{ posts: PostSummary[]; total: number }> {
  const offset = page * pageSize;

  const {
    data: postsData,
    count,
    error: postsError,
  } = await supabase
    .from("posts")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + pageSize - 1);

  if (postsError) {
    console.error("Error fetching posts:", postsError);
    return { posts: [], total: 0 };
  }

  if (!postsData || postsData.length === 0)
    return { posts: [], total: count || 0 };

  const postIds = postsData.map((p: any) => p.id);

  // comment counts
  const { data: commentRows } = await supabase
    .from("comments")
    .select("post_id")
    .in("post_id", postIds);

  const commentCounts = new Map<string, number>();
  commentRows?.forEach((r: any) => {
    commentCounts.set(r.post_id, (commentCounts.get(r.post_id) || 0) + 1);
  });

  // authors batch
  const authorIds = [...new Set(postsData.map((p: any) => p.author_id))];
  const { data: profiles } = await supabase
    .from("user_profiles")
    .select("id, display_name, username, avatar_url")
    .in("id", authorIds);

  const authorsMap = new Map<string, any>();
  profiles?.forEach((pr: any) => authorsMap.set(pr.id, pr));

  const posts: PostSummary[] = postsData.map((p: any) => {
    const authorProfile = authorsMap.get(p.author_id) || {};
    return {
      id: p.id,
      author: {
        id: p.author_id,
        name: authorProfile.display_name || authorProfile.username || "Unknown",
        username: authorProfile.username || "",
        avatar: authorProfile.avatar_url || null,
        badge: "",
        badgeColor: "",
        email: null,
      },
      timestamp: formatTime(p.created_at),
      title: p.title,
      content: p.content,
      full_content: p.full_content || null,
      tags: p.tags || [],
      likes: p.likes || 0,
      comments: commentCounts.get(p.id) || 0,
      shares: p.shares || 0,
      isLiked: false,
      isSaved: false,
      images: p.images || null,
      created_at: p.created_at,
      engagement_score: p.engagement_score,
    };
  });

  return { posts, total: count || posts.length };
}

export async function getPostById(postId: string): Promise<PostDetail | null> {
  try {
    const { data: postData, error: postError } = await supabase
      .from("posts")
      .select("*")
      .eq("id", postId)
      .single();

    if (postError || !postData) {
      console.error("Error fetching post:", postError);
      return null;
    }

    const { data: authorProfile } = await supabase
      .from("user_profiles")
      .select("id, display_name, username, avatar_url")
      .eq("id", postData.author_id)
      .single();

    const postAuthor: Author = {
      id: postData.author_id,
      name: authorProfile?.display_name || authorProfile?.username || "Unknown",
      username: authorProfile?.username || "",
      avatar: authorProfile?.avatar_url || null,
      badge: "",
      badgeColor: "",
      email: null,
    };

    const { data: allCommentsData } = await supabase
      .from("comments")
      .select("*")
      .eq("post_id", postId)
      .order("created_at", { ascending: true });

    // Build author map for comments
    const commentAuthorIds = [
      ...new Set((allCommentsData || []).map((c: any) => c.author_id)),
    ];

    const { data: commentProfiles } = await supabase
      .from("user_profiles")
      .select("id, display_name, username, avatar_url")
      .in("id", commentAuthorIds);

    const commentAuthorMap = new Map<string, any>();
    commentProfiles?.forEach((p: any) => commentAuthorMap.set(p.id, p));

    const nodesMap = new Map<string, CommentNode>();
    const roots: CommentNode[] = [];

    (allCommentsData || []).forEach((c: any) => {
      const prof = commentAuthorMap.get(c.author_id) || {};
      const node: CommentNode = {
        id: c.id,
        author: {
          id: c.author_id,
          name: prof.display_name || prof.username || "User",
          username: prof.username || "",
          avatar: prof.avatar_url || null,
          badge: "",
          badgeColor: "",
          email: null,
        },
        timestamp: c.created_at,
        content: c.content,
        likes: c.likes || 0,
        isLiked: false,
        replies: [],
        parent_id: c.parent_id || undefined,
        created_at: c.created_at,
      };
      nodesMap.set(node.id, node);
    });

    // Link tree
    nodesMap.forEach((node) => {
      if (node.parent_id) {
        const parent = nodesMap.get(node.parent_id as string);
        if (parent) parent.replies.push(node);
        else roots.push(node);
      } else {
        roots.push(node);
      }
    });

    const detail: PostDetail = {
      id: postData.id,
      author: postAuthor,
      timestamp: formatTime(postData.created_at),
      title: postData.title,
      content: postData.content,
      full_content: postData.full_content || null,
      tags: postData.tags || [],
      likes: postData.likes || 0,
      comments: (allCommentsData || []).length,
      shares: postData.shares || 0,
      isLiked: false,
      isSaved: false,
      commentList: roots,
      images: postData.images || null,
      created_at: postData.created_at,
      engagement_score: postData.engagement_score,
    };

    return detail;
  } catch (error) {
    console.error("Error in getPostById:", error);
    return null;
  }
}

export default {
  getPosts,
  getPostById,
};
