"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Bell,
  ChevronLeft,
  ThumbsUp,
  MessageCircleMore,
  Heart,
  Share2,
  Clock,
} from "lucide-react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import CommentItem from "@/components/forum/CommentItem";
import ShareModal from "@/components/forum/ShareModal";
import { Kantumruy_Pro } from "next/font/google";
import { useTranslations } from "@/lib/i18n";

const kantumruyPro = Kantumruy_Pro({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const PostDetailPage = () => {
  const { postId } = useParams();
  const router = useRouter();
  const { t, tLearninghub, lang } = useTranslations();

  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [likeLoading, setLikeLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<any>(null);
  const [submittingComment, setSubmittingComment] = useState(false);

  const [showShareModal, setShowShareModal] = useState(false);

  const SkeletonPostDetail = () => (
    <div className="mt-16 p-6 space-y-4 animate-pulse">
      <div className="flex flex-col gap-5 px-1 py-4 bg-white">
        <div className="flex items-center gap-2.5">
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
          <div className="h-4 bg-gray-200 rounded w-4/5"></div>
        </div>

        <div className="flex gap-2">
          <div className="h-6 bg-gray-200 rounded w-16"></div>
          <div className="h-6 bg-gray-200 rounded w-20"></div>
          <div className="h-6 bg-gray-200 rounded w-14"></div>
        </div>

        <div className="flex justify-between items-center pt-4 border-t">
          <div className="flex gap-6">
            <div className="h-8 bg-gray-200 rounded w-16"></div>
            <div className="h-8 bg-gray-200 rounded w-16"></div>
            <div className="h-8 bg-gray-200 rounded w-16"></div>
          </div>
        </div>

        <div className="mt-4 border-t pt-4 space-y-4">
          <div className="h-5 bg-gray-200 rounded w-32"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  useEffect(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getUser();
      setCurrentUserId(data.user?.id ?? null);
    };
    loadUser();
  }, []);

  useEffect(() => {
    if (!postId) return;

    const fetchPostAndComments = async () => {
      setLoading(true);

      const { data: postData } = await supabase
        .from("posts")
        .select(
          `
      id, title, content, tags, created_at, user_id,
      user_profiles (
        display_name, avatar_url, username, telegram_id,
        telegram_users ( display_name, username, photo_url )
      ),
      post_likes ( user_id ),
      post_saves ( user_id )
    `
        )
        .eq("id", postId)
        .single();

      const { data: commentsData } = await supabase
        .from("post_comments")
        .select(
          `
      id, content, created_at, parent_id,
      user_profiles (
        display_name, avatar_url, username, telegram_id,
        telegram_users ( display_name, username, photo_url )
      )
    `
        )
        .eq("post_id", postId)
        .order("created_at", { ascending: true });

      if (postData) {
        const profile = postData.user_profiles as any;

        let tg: any = null;
        if (Array.isArray(profile?.telegram_users)) {
          tg = profile.telegram_users[0] || null;
        } else if (
          profile?.telegram_users &&
          typeof profile.telegram_users === "object"
        ) {
          tg = profile.telegram_users;
        }

        setPost({
          id: postData.id,
          title: postData.title,
          content: postData.content,
          tags: postData.tags || [],
          created_at: postData.created_at,
          user_name: profile?.display_name || tg?.display_name || "Unknown",
          profile_avatar: profile?.avatar_url || tg?.photo_url || null,
          telegram_photo: tg?.photo_url || null,
          likes: postData.post_likes?.length ?? 0,
          saves: postData.post_saves?.length ?? 0,
          comments: commentsData?.length ?? 0,
          shares: 0,
          isLiked: postData.post_likes?.some(
            (l: any) => l.user_id === currentUserId
          ),
          isSaved: postData.post_saves?.some(
            (s: any) => s.user_id === currentUserId
          ),
        });
      }

      function buildTree(list: any[]) {
        const map: any = {};
        const roots: any[] = [];

        list.forEach((c) => (map[c.id] = { ...c, replies: [] }));

        list.forEach((c) => {
          if (c.parent_id) {
            map[c.parent_id]?.replies.push(map[c.id]);
          } else {
            roots.push(map[c.id]);
          }
        });

        return roots;
      }

      if (commentsData) {
        const mappedComments = commentsData.map((c: any) => {
          const profile = c.user_profiles;

          let tg: any = null;
          if (Array.isArray(profile?.telegram_users)) {
            tg = profile.telegram_users[0] || null;
          } else if (
            profile?.telegram_users &&
            typeof profile.telegram_users === "object"
          ) {
            tg = profile.telegram_users;
          }

          return {
            id: c.id,
            parent_id: c.parent_id,
            content: c.content,
            created_at: c.created_at,
            user_name: profile?.display_name || tg?.display_name || "Unknown",
            avatar:
              profile?.avatar_url || tg?.photo_url || "/default-avatar.svg",
          };
        });

        setComments(buildTree(mappedComments));
      }

      setLoading(false);
    };

    fetchPostAndComments();

    const channel = supabase
      .channel(`post-detail-${postId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "post_likes",
          filter: `post_id=eq.${postId}`,
        },
        fetchPostAndComments
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "post_saves",
          filter: `post_id=eq.${postId}`,
        },
        fetchPostAndComments
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "post_comments",
          filter: `post_id=eq.${postId}`,
        },
        fetchPostAndComments
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [postId, currentUserId]);

  const handleToggleLike = async () => {
    if (!post || !currentUserId || likeLoading) return;

    setLikeLoading(true);
    const willLike = !post.isLiked;

    setPost((prev: any) => ({
      ...prev,
      isLiked: willLike,
      likes: prev.likes + (willLike ? 1 : -1),
    }));

    if (willLike) {
      await supabase.from("post_likes").insert({
        post_id: post.id,
        user_id: currentUserId,
      });
    } else {
      await supabase
        .from("post_likes")
        .delete()
        .eq("post_id", post.id)
        .eq("user_id", currentUserId);
    }

    setLikeLoading(false);
  };

  const handleToggleSave = async () => {
    if (!post || !currentUserId || saveLoading) return;

    setSaveLoading(true);
    const willSave = !post.isSaved;

    setPost((prev: any) => ({
      ...prev,
      isSaved: willSave,
      saves: prev.saves + (willSave ? 1 : -1),
    }));

    if (willSave) {
      await supabase.from("post_saves").insert({
        post_id: post.id,
        user_id: currentUserId,
      });
    } else {
      await supabase
        .from("post_saves")
        .delete()
        .eq("post_id", post.id)
        .eq("user_id", currentUserId);
    }

    setSaveLoading(false);
  };

  const handleShare = () => {
    setShowShareModal(true);
  };

  const handleAddComment = async (parentId: string | null = null) => {
    if (!post || !currentUserId || submittingComment) return;

    const trimmed = newComment.trim();
    if (!trimmed) return;

    setSubmittingComment(true);

    const { data, error } = await supabase
      .from("post_comments")
      .insert({
        post_id: post.id,
        user_id: currentUserId,
        content: trimmed,
        parent_id: parentId,
      })
      .select(
        `
        id, content, created_at, parent_id,
        user_profiles (
          display_name, avatar_url, username, telegram_id,
          telegram_users ( display_name, username, photo_url )
        )
      `
      )
      .single();

    if (!error && data) {
      const profile = (data as any).user_profiles;

      let tg: any = null;
      if (Array.isArray(profile?.telegram_users)) {
        tg = profile.telegram_users[0] || null;
      } else if (
        profile?.telegram_users &&
        typeof profile.telegram_users === "object"
      ) {
        tg = profile.telegram_users;
      }

      const mapped = {
        id: data.id,
        parent_id: data.parent_id,
        content: data.content,
        created_at: data.created_at,
        user_name: profile?.display_name || tg?.display_name || "Unknown",
        avatar: profile?.avatar_url || tg?.photo_url || "/default-avatar.svg",
        replies: [],
      };

      if (mapped.parent_id) {
        const updateTree = (list: any[]): any[] =>
          list.map((c) => {
            if (c.id === mapped.parent_id) {
              return { ...c, replies: [...c.replies, mapped] };
            }
            return { ...c, replies: updateTree(c.replies) };
          });

        setComments((prev) => updateTree(prev));
      } else {
        setComments((prev) => [...prev, mapped]);
      }

      setPost((prev: any) =>
        prev ? { ...prev, comments: (prev.comments ?? 0) + 1 } : prev
      );

      setNewComment("");
      setReplyTo(null);
    }

    setSubmittingComment(false);
  };

  if (loading || !post) return <SkeletonPostDetail />;

  const avatarSrc =
    post.telegram_photo || post.profile_avatar || "/default-avatar.svg";

  const formattedDate = new Date(post.created_at).toLocaleString(
    lang === "kh" ? "km-KH" : "en-US",
    {
      hour: "numeric",
      minute: "numeric",
      year: "numeric",
      month: "short",
      day: "numeric",
    }
  );

  const getLikeText = () => {
    if (post.isLiked) {
      return lang === "kh" ? "បានចុចចូលចិត្ត" : "Liked";
    }
    return lang === "kh" ? "ចុចចូលចិត្ត" : "Like";
  };

  const getSaveText = () => {
    if (post.isSaved) {
      return lang === "kh" ? "បានរក្សាទុក" : "Saved";
    }
    return lang === "kh" ? "រក្សាទុក" : "Save";
  };

  return (
    <div className={kantumruyPro.className}>
      <nav className="fixed top-0 left-0 w-full z-50 flex justify-between items-center h-16 bg-white px-6 py-3.5 shadow-sm animate-fade-in">
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-gray-800 transition-colors duration-200 hover:scale-105 active:scale-95"
        >
          <ChevronLeft size={24} />
        </button>

        <span className="text-[16px] text-[#0d1b2a] font-medium animate-fade-in wrap-break-word">
          {lang === "kh" ? "ការជជែក" : "Forum"}
        </span>

        <div className="flex items-center gap-3">
          <button className="transition-transform duration-200 hover:scale-110 active:scale-95">
            <Bell size={24} className="text-gray-600" />
          </button>
        </div>
      </nav>

      <div className="mt-16 p-6 space-y-4 animate-slide-down">
        <div className="flex flex-col gap-5 px-1 py-4">
          <div className="flex items-center gap-2.5">
            <Image
              src={avatarSrc}
              alt="User Avatar"
              width={40}
              height={40}
              className="rounded-full object-cover transition-transform duration-200 hover:scale-105"
            />
            <div className="flex flex-col">
              <span className="font-medium text-[14px] text-[#0d1b2a] wrap-break-word">
                {post.user_name}
              </span>
              <span className="text-[12px] text-gray-500 flex items-center gap-1 wrap-break-word">
                <Clock size={12} /> {formattedDate}
              </span>
            </div>
          </div>

          <span className="font-medium text-[16px] text-[#0d1b2a] animate-fade-in wrap-break-word">
            {post.title}
          </span>

          <span className="text-[14px] text-gray-700 leading-6 animate-fade-in wrap-break-word whitespace-pre-wrap">
            {post.content}
          </span>

          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 animate-fade-in">
              {post.tags.map((tag: string, index: number) => (
                <span
                  key={index}
                  className="text-[12px] text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full transition-colors duration-200 hover:bg-gray-200 wrap-break-word"
                >
                  {tag.startsWith("#") ? tag : `#${tag}`}
                </span>
              ))}
            </div>
          )}

          <div className="flex justify-between items-center animate-fade-in">
            <span className="flex items-center gap-1 text-[12px] text-gray-500 wrap-break-word">
              <ThumbsUp size={16} /> {post.likes}
            </span>

            <div className="flex gap-4">
              <span className="flex items-center gap-1 text-[12px] text-gray-500 wrap-break-word">
                <MessageCircleMore size={16} /> {post.comments}
              </span>
              <span className="flex items-center gap-1 text-[12px] text-gray-500 wrap-break-word">
                <Heart size={16} /> {post.saves}
              </span>
              <span className="flex items-center gap-1 text-[12px] text-gray-500 wrap-break-word">
                <Share2 size={16} /> {post.shares}
              </span>
            </div>
          </div>

          <div className="flex justify-between items-center border-t pt-2.5 animate-fade-in">
            <button
              className="flex items-center transition-all duration-200 hover:scale-105 active:scale-95 wrap-break-word"
              onClick={handleToggleLike}
            >
              <ThumbsUp
                size={16}
                fill={post.isLiked ? "#0e4123" : "none"}
                className={post.isLiked ? "text-[#0e4123]" : "text-gray-500"}
              />
              <span className="ml-2 text-[12px] text-gray-500 wrap-break-word">
                {getLikeText()}
              </span>
            </button>

            <button
              className="flex items-center transition-all duration-200 hover:scale-105 active:scale-95 wrap-break-word"
              onClick={handleToggleSave}
            >
              <Heart
                size={16}
                fill={post.isSaved ? "#0e4123" : "none"}
                className={post.isSaved ? "text-[#0e4123]" : "text-gray-500"}
              />
              <span className="ml-2 text-[12px] text-gray-500 wrap-break-word">
                {getSaveText()}
              </span>
            </button>

            <button
              className="flex items-center transition-all duration-200 hover:scale-105 active:scale-95 wrap-break-word"
              onClick={handleShare}
            >
              <Share2 size={16} className="text-gray-500" />
              <span className="ml-2 text-[12px] text-gray-500 wrap-break-word">
                {lang === "kh" ? "ចែករំលែក" : "Share"}
              </span>
            </button>
          </div>

          <div className="mt-4 border-t pt-4 space-y-4 pb-32 animate-fade-in">
            <div className="flex items-center justify-between">
              <span className="font-medium text-[14px] text-[#0d1b2a] wrap-break-word">
                {lang === "kh" ? "មតិ" : "Comments"} ({post.comments})
              </span>
            </div>

            <div className="space-y-4">
              {comments.length === 0 && (
                <span className="text-[12px] text-gray-400 animate-fade-in wrap-break-word">
                  {lang === "kh"
                    ? "មិនទាន់មានមតិណាមួយទេ។ ជាអ្នកដំបូងដែលផ្តល់មតិ។"
                    : "No comments yet. Be the first to comment."}
                </span>
              )}

              {comments.map((c, index) => (
                <div
                  key={c.id}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CommentItem
                    {...c}
                    onReply={(id: string, user: string) =>
                      setReplyTo({ id, user })
                    }
                  />
                </div>
              ))}
            </div>

            {replyTo && (
              <div className="fixed bottom-0 left-0 w-full bg-white border-t p-3 z-50 animate-slide-up">
                <div className="max-w-screen-sm mx-auto">
                  <span className="text-[12px] text-gray-600 wrap-break-word">
                    {lang === "kh" ? "កំពុងឆ្លើយតបទៅ" : "Replying to"}{" "}
                    <b className="wrap-break-word">{replyTo.user}</b>
                  </span>

                  <textarea
                    className="w-full text-[13px] border border-gray-300 rounded-lg px-3 py-2 mt-2 transition-all duration-200 focus:ring-2 focus:ring-[#0e4123] focus:border-transparent wrap-break-word"
                    rows={2}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                  />

                  <div className="flex justify-end mt-2 gap-2">
                    <button
                      className="px-4 py-1.5 text-gray-600 border border-gray-300 rounded-lg transition-all duration-200 hover:bg-gray-50 hover:scale-105 active:scale-95 wrap-break-word"
                      onClick={() => setReplyTo(null)}
                    >
                      {t("cancel")}
                    </button>
                    <button
                      className="px-4 py-1.5 text-white bg-[#0e4123] rounded-lg transition-all duration-200 hover:bg-[#0d3a1f] hover:scale-105 active:scale-95 disabled:opacity-60 wrap-break-word"
                      onClick={() => handleAddComment(replyTo.id)}
                      disabled={!newComment.trim()}
                    >
                      {lang === "kh" ? "ឆ្លើយតប" : "Reply"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {currentUserId && !replyTo && (
              <div className="fixed bottom-0 left-0 w-full bg-white border-t p-3 z-50 animate-slide-up">
                <div className="max-w-screen-sm mx-auto">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder={
                      lang === "kh" ? "សរសេរមតិ..." : "Write a comment..."
                    }
                    className="w-full text-[13px] border border-gray-300 rounded-lg px-3 py-2 transition-all duration-200 focus:ring-2 focus:ring-[#0e4123] focus:border-transparent wrap-break-word"
                    rows={2}
                  />
                  <div className="flex justify-end mt-2">
                    <button
                      onClick={() => handleAddComment(null)}
                      disabled={!newComment.trim()}
                      className="px-4 py-1.5 rounded-lg text-[13px] bg-[#0e4123] text-white transition-all duration-200 hover:bg-[#0d3a1f] hover:scale-105 active:scale-95 disabled:opacity-60 wrap-break-word"
                    >
                      {lang === "kh" ? "ប្រកាសមតិ" : "Post Comment"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showShareModal && (
        <ShareModal
          onClose={() => setShowShareModal(false)}
          link={`https://agroecofarmerapp.vercel.app/forum/${post.id}`}
          postId={post.id}
        />
      )}

      <style jsx global>{`
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
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
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
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default PostDetailPage;
