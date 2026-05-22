"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  ChevronLeft,
  Bell,
  Plus,
  Flame,
  TrendingUp,
  Heart,
  Search,
  X,
} from "lucide-react";
import PostCard from "@/components/forum/PostCard";
import { supabase } from "@/lib/supabase";
import CreatePostModal from "@/components/forum/CreatePostModal";
import EditPostModal from "@/components/forum/EditPostModal";
import ShareModal from "@/components/forum/ShareModal";
import { Kantumruy_Pro } from "next/font/google";
import { useTranslations } from "@/lib/i18n";

const kantumruyPro = Kantumruy_Pro({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

let isHasNotification = false;

const Page = () => {
  const { t, tNav, tMarketplace, tLearninghub, lang } = useTranslations();

  const TABS = [
    { key: "new", label: tLearninghub("recent"), icon: <Flame size={16} /> },
    {
      key: "trending",
      label: tLearninghub("popular"),
      icon: <TrendingUp size={16} />,
    },
    { key: "saved", label: tLearninghub("saved"), icon: <Heart size={16} /> },
  ];

  const [activeTab, setActiveTab] = useState<string>(TABS[0].key);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [sharePost, setSharePost] = useState<string | null>(null);
  const [editingPost, setEditingPost] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [tabChanging, setTabChanging] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const SkeletonPostCard = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 animate-pulse">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-24"></div>
          <div className="h-3 bg-gray-200 rounded w-16"></div>
        </div>
      </div>
      <div className="space-y-3">
        <div className="h-5 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
      </div>
      <div className="flex gap-4 mt-4 pt-4 border-t border-gray-100">
        <div className="h-8 bg-gray-200 rounded w-16"></div>
        <div className="h-8 bg-gray-200 rounded w-16"></div>
        <div className="h-8 bg-gray-200 rounded w-16"></div>
      </div>
    </div>
  );

  const handleTabChange = (key: string) => {
    if (key === activeTab) return;

    setTabChanging(true);
    setActiveTab(key);

    setTimeout(() => {
      setTabChanging(false);
    }, 300);
  };

  const handleDeletePost = async (postId: string) => {
    if (
      window.confirm(
        lang === "kh"
          ? "តើអ្នកពិតជាចង់លុបប្រកាសនេះមែនទេ?"
          : "Are you sure you want to delete this post?"
      )
    ) {
      await supabase.from("posts").delete().eq("id", postId);
    }
  };

  const openShare = (post: any) => setSharePost(post.id);
  const closeShare = () => setSharePost(null);

  const toggleLike = async (postId: string) => {
    if (!currentUserId) {
      alert(
        lang === "kh"
          ? "សូមចូលគណនីដើម្បីចុចចូលចិត្ត"
          : "Please login to like posts"
      );
      return;
    }

    const { data: existing } = await supabase
      .from("post_likes")
      .select("*")
      .eq("post_id", postId)
      .eq("user_id", currentUserId)
      .single();

    if (existing) {
      await supabase
        .from("post_likes")
        .delete()
        .eq("post_id", postId)
        .eq("user_id", currentUserId);
    } else {
      await supabase
        .from("post_likes")
        .insert({ post_id: postId, user_id: currentUserId });
    }
  };

  const toggleSave = async (postId: string) => {
    if (!currentUserId) {
      alert(
        lang === "kh"
          ? "សូមចូលគណនីដើម្បីរក្សាទុកប្រកាស"
          : "Please login to save posts"
      );
      return;
    }

    const { data: existing } = await supabase
      .from("post_saves")
      .select("*")
      .eq("post_id", postId)
      .eq("user_id", currentUserId)
      .single();

    if (existing) {
      await supabase
        .from("post_saves")
        .delete()
        .eq("post_id", postId)
        .eq("user_id", currentUserId);
    } else {
      await supabase
        .from("post_saves")
        .insert({ post_id: postId, user_id: currentUserId });
    }
  };

  useEffect(() => {
    const loadUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (!error && data.user) {
        setCurrentUserId(data.user.id);
        setIsUserLoggedIn(true);
      } else {
        setIsUserLoggedIn(false);
      }
      setAuthLoading(false);
    };
    loadUser();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);

    const { data } = await supabase
      .from("posts")
      .select(
        `
        id,
        title,
        content,
        tags,
        created_at,
        edited_at,
        user_id,
        user_profiles (
          display_name,
          avatar_url,
          username,
          telegram_id,
          telegram_users (
            telegram_id,
            display_name,
            username,
            photo_url
          )
        ),
        post_likes ( user_id ),
        post_saves ( user_id )
      `
      )
      .order("created_at", { ascending: false });

    if (!data) {
      setPosts([]);
      setLoading(false);
      return;
    }

    const { data: commentsData } = await supabase
      .from("post_comments")
      .select("id, post_id");

    const commentCountMap: Record<string, number> = {};
    commentsData?.forEach((c: any) => {
      if (!commentCountMap[c.post_id]) commentCountMap[c.post_id] = 0;
      commentCountMap[c.post_id]++;
    });

    const mapped = data.map((post: any) => {
      const profile = post.user_profiles;
      let tg: any = null;

      if (Array.isArray(profile?.telegram_users)) {
        tg = profile.telegram_users[0] || null;
      } else if (
        profile?.telegram_users &&
        typeof profile.telegram_users === "object"
      ) {
        tg = profile.telegram_users;
      }

      const likeUsers = post.post_likes || [];
      const saveUsers = post.post_saves || [];

      return {
        id: post.id,
        user_id: post.user_id,
        title: post.title,
        content: post.content,
        tags: post.tags || [],
        created_at: post.created_at,
        edited_at: post.edited_at,
        user_name: profile?.display_name || tg?.display_name || "Unknown",
        profile_avatar: profile?.avatar_url || tg?.photo_url || null,
        telegram_photo: tg?.photo_url || null,
        likes: likeUsers.length,
        saves: saveUsers.length,
        comments: commentCountMap[post.id] || 0,
        shares: 0,
        isLiked: currentUserId
          ? likeUsers.some((l: any) => l.user_id === currentUserId)
          : false,
        isSaved: currentUserId
          ? saveUsers.some((s: any) => s.user_id === currentUserId)
          : false,
      };
    });

    setTimeout(() => {
      setPosts(mapped);
      setLoading(false);
    }, 600);
  };

  useEffect(() => {
    if (authLoading) return;

    fetchPosts();

    const channel = supabase
      .channel("feed-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "posts" },
        () => fetchPosts()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "post_comments" },
        () => fetchPosts()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "post_likes" },
        () => fetchPosts()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "post_saves" },
        () => fetchPosts()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [authLoading, currentUserId]);

  // Search functionality
  const filteredPosts = useMemo(() => {
    if (!searchQuery.trim()) {
      return posts;
    }

    const query = searchQuery.toLowerCase().trim();
    setIsSearching(true);

    return posts.filter(
      (post) =>
        post.title.toLowerCase().includes(query) ||
        post.content.toLowerCase().includes(query) ||
        post.user_name.toLowerCase().includes(query) ||
        post.tags.some((tag: string) => tag.toLowerCase().includes(query))
    );
  }, [posts, searchQuery]);

  const getDisplayedPosts = () => {
    let postsToDisplay = searchQuery.trim() ? filteredPosts : posts;

    if (activeTab === "trending") {
      return [...postsToDisplay].sort((a, b) => {
        const scoreA = (a.likes || 0) + (a.comments || 0) + (a.saves || 0);
        const scoreB = (b.likes || 0) + (b.comments || 0) + (b.saves || 0);
        return scoreB - scoreA;
      });
    }
    if (activeTab === "saved") {
      return postsToDisplay.filter((p) => p.isSaved);
    }
    return postsToDisplay;
  };

  const displayedPosts = getDisplayedPosts();

  const handleCreatePress = () => {
    if (!isUserLoggedIn) {
      alert(
        lang === "kh"
          ? "សូមចូលគណនី ឬបង្កើតគណនីជាមុនសិន។"
          : "Please login or create an account first."
      );
      return;
    }
    setShowCreateModal(true);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setIsSearching(false);
  };

  const getEmptyStateMessage = () => {
    if (searchQuery.trim() && displayedPosts.length === 0) {
      return {
        title: lang === "kh" ? "រកមិនឃើញលទ្ធផល" : "No results found",
        description:
          lang === "kh"
            ? "ពុំមានប្រកាសណាមួយត្រូវគ្នានឹងការស្វែងរករបស់អ្នកទេ"
            : "No posts match your search criteria",
      };
    }

    if (activeTab === "saved") {
      return {
        title:
          lang === "kh"
            ? "មិនទាន់មានប្រកាសដែលបានរក្សាទុក"
            : "No saved posts yet",
        description:
          lang === "kh"
            ? "អ្នកមិនទាន់រក្សាទុកប្រកាសណាមួយទេ"
            : "You haven't saved any posts yet",
      };
    }

    return {
      title: lang === "kh" ? "មិនទាន់មានប្រកាស" : "No posts found",
      description:
        lang === "kh"
          ? "ជាអ្នកដំបូងដែលបង្កើតប្រកាស!"
          : "Be the first to create a post!",
    };
  };

  const emptyState = getEmptyStateMessage();

  return (
    <div className={kantumruyPro.className}>
      <div className="fixed top-0 left-0 w-full z-50 bg-white">
        {/* Navigation */}
        <nav className="flex justify-between items-center h-16 px-6 py-3.5 shadow-sm animate-fade-in">
          <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 transition-colors duration-200 hover:scale-105 active:scale-95">
            <a href="/">
              <ChevronLeft size={24} />
            </a>
          </button>

          <span className="text-[16px] text-[#0d1b2a] font-medium animate-fade-in wrap-break-word">
            {lang === "kh" ? "ការជជែក" : "Forum"}
          </span>

          <div className="flex items-center gap-3">
            <button className="relative transition-transform duration-200 hover:scale-110 active:scale-95">
              <Bell size={24} className="text-gray-600" />
              {isHasNotification && (
                <span className="absolute top-0 right-0 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-white animate-pulse" />
              )}
            </button>
          </div>
        </nav>

        {/* Search and Create Section */}
        <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-200 animate-slide-down">
          <div className="flex-1 relative">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={tLearninghub("searchPlaceholder")}
                className="h-9 w-full pl-10 pr-10 py-2 border border-[#0e4123] rounded-lg text-sm transition-all duration-200 focus:ring-2 focus:ring-[#0e4123] focus:border-transparent focus:scale-[1.02]"
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          <button
            onClick={handleCreatePress}
            disabled={!isUserLoggedIn}
            className={`h-9 flex items-center gap-1 px-2.5 py-2 rounded-lg border text-[14px] transition-all duration-200 ${
              isUserLoggedIn
                ? "border-[#0e4123] text-[#0e4123] hover:bg-[#0e4123] hover:text-white hover:scale-105 active:scale-95"
                : "border-gray-300 text-gray-400 cursor-not-allowed"
            }`}
          >
            <Plus size={18} /> {t("create")}
          </button>
        </div>

        {/* Tabs Navigation */}
        <nav className="bg-white border-b border-gray-200 w-full flex items-center justify-center px-1 animate-slide-down">
          <ul className="flex w-full">
            {TABS.map(({ key, label, icon }) => (
              <li
                key={key}
                className={`relative flex-1 flex gap-2 items-center justify-center px-2 py-3 cursor-pointer rounded-t-md transition-all duration-200 ${
                  activeTab === key
                    ? "text-[#0e4123]"
                    : "text-gray-600 hover:text-[#0e4123] hover:bg-gray-100/60 hover:scale-105"
                }`}
                onClick={() => handleTabChange(key)}
              >
                <div
                  className={`transition-all duration-200 ${
                    activeTab === key
                      ? "text-[#0e4123] scale-110"
                      : "text-gray-500 scale-100"
                  }`}
                >
                  {icon}
                </div>
                <span className="text-[14px] transition-all duration-200 whitespace-nowrap">
                  {label}
                </span>
                {activeTab === key && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0e4123] animate-scale-in" />
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="pt-44 min-h-screen bg-gray-50">
        <main className="p-6">
          {loading ? (
            <div className="space-y-4 animate-fade-in">
              {[...Array(3)].map((_, i) => (
                <SkeletonPostCard key={i} />
              ))}
            </div>
          ) : (
            <div
              className={`space-y-4 transition-all duration-300 ${
                tabChanging ? "opacity-0 scale-95" : "opacity-100 scale-100"
              }`}
            >
              {displayedPosts.map((post, index) => (
                <div
                  key={post.id}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <PostCard
                    {...post}
                    currentUserId={currentUserId}
                    onToggleLike={() => toggleLike(post.id)}
                    onToggleSave={() => toggleSave(post.id)}
                    onOpenShare={() => openShare(post)}
                    onEdit={() => setEditingPost(post)}
                    onDelete={() => handleDeletePost(post.id)}
                  />
                </div>
              ))}
              {displayedPosts.length === 0 && (
                <div className="text-center py-12 animate-fade-in">
                  <div className="text-gray-500 text-lg">
                    {emptyState.title}
                  </div>
                  <div className="text-gray-400 text-sm mt-2">
                    {emptyState.description}
                  </div>
                  {!searchQuery.trim() &&
                    activeTab !== "saved" &&
                    isUserLoggedIn && (
                      <button
                        onClick={handleCreatePress}
                        className="mt-4 px-6 py-2 bg-[#0e4123] text-white rounded-lg hover:bg-[#0d3a1f] transition-colors duration-200 hover:scale-105 active:scale-95"
                      >
                        {lang === "kh"
                          ? "បង្កើតប្រកាសដំបូង"
                          : "Create First Post"}
                      </button>
                    )}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {showCreateModal && (
        <CreatePostModal
          onClose={() => setShowCreateModal(false)}
          currentUserId={currentUserId}
        />
      )}

      {editingPost && (
        <EditPostModal
          post={editingPost}
          onClose={() => setEditingPost(null)}
        />
      )}

      {sharePost && (
        <ShareModal
          onClose={() => setSharePost(null)}
          link={`${process.env.NEXT_PUBLIC_SITE_URL}/forum/${sharePost}`}
        />
      )}

      <style jsx global>{`
        /* Hide scrollbar for Chrome, Safari and Opera */
        ::-webkit-scrollbar {
          display: none;
        }

        /* Hide scrollbar for IE, Edge and Firefox */
        * {
          -ms-overflow-style: none; /* IE and Edge */
          scrollbar-width: none; /* Firefox */
        }

        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes slide-down {
          from {
            transform: translateY(-10px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        @keyframes fade-in-up {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        @keyframes scale-in {
          from {
            transform: scaleX(0);
          }
          to {
            transform: scaleX(1);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
        .animate-slide-down {
          animation: slide-down 0.4s ease-out;
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
          opacity: 0;
        }
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Page;
