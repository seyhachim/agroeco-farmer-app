"use client";

import { X, Hash, Globe } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Kantumruy_Pro } from "next/font/google";
import { useTranslations } from "@/lib/i18n";

const kantumruyPro = Kantumruy_Pro({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export default function CreatePostModal({ onClose, currentUserId }: any) {
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const { t, lang } = useTranslations();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      if (!currentUserId) return;

      const { data: profile } = await supabase
        .from("user_profiles")
        .select(
          `
          display_name,
          avatar_url,
          telegram_users ( display_name, photo_url )
        `
        )
        .eq("id", currentUserId)
        .single();

      const tg = Array.isArray(profile?.telegram_users)
        ? profile.telegram_users[0]
        : profile?.telegram_users;

      setUser({
        name: profile?.display_name || tg?.display_name || "Unknown",
        avatar: profile?.avatar_url || tg?.photo_url,
      });
    };

    load();
  }, [currentUserId]);

  const addTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && currentTag.trim()) {
      e.preventDefault();
      if (!tags.includes(currentTag.trim()) && tags.length < 5) {
        setTags([...tags, currentTag.trim()]);
        setCurrentTag("");
      }
    }
  };

  const removeTag = (t: string) => {
    setTags(tags.filter((item) => item !== t));
  };

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim() || submitting) return;

    setSubmitting(true);

    await supabase.from("posts").insert({
      user_id: currentUserId,
      user_name: user?.name ?? "Unknown",
      title,
      content,
      tags,
    });

    setSubmitting(false);
    onClose();
  };

  const getPlaceholders = () => {
    if (lang === "kh") {
      return {
        title: "តើអ្នកកំពុងគិតអំពីអ្វី?",
        content: "សរសេរអ្វីមួយ...",
        tag: "វាយបញ្ចូលស្លាក ហើយចុច Enter...",
        posting: "កំពុងបង្ហោះ...",
        publish: "បង្ហោះប្រកាស",
      };
    }
    return {
      title: "What's on your mind?",
      content: "Write something...",
      tag: "Type tag and press Enter...",
      posting: "Publishing...",
      publish: "Publish Post",
    };
  };

  const placeholders = getPlaceholders();

  return (
    <div className={kantumruyPro.className}>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-end z-50 animate-fade-in">
        <div className="w-full bg-white rounded-t-2xl p-5 max-h-[90vh] overflow-y-auto animate-slide-up">
          {/* Header */}
          <div className="flex justify-between items-center">
            <button
              onClick={onClose}
              className="p-2 rounded-md hover:bg-gray-200 transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <X size={22} />
            </button>

            <span className="text-lg font-semibold animate-fade-in">
              {lang === "kh" ? "បង្កើតប្រកាស" : "Create Post"}
            </span>

            <div className="w-5" />
          </div>

          {/* User */}
          {user && (
            <div className="flex items-center gap-3 mt-6 mb-6 animate-fade-in">
              <Image
                src={user.avatar}
                alt="Avatar"
                width={42}
                height={42}
                className="rounded-full border transition-transform duration-200 hover:scale-105"
              />
              <div>
                <p className="font-semibold">{user.name}</p>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Globe size={12} />
                  {lang === "kh" ? "កំពុងបង្ហោះជាសាធារណៈ" : "Posting publicly"}
                </p>
              </div>
            </div>
          )}

          {/* Title */}
          <div className="mb-6 animate-fade-in">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={placeholders.title}
              className="w-full text-xl font-semibold outline-none bg-transparent transition-all duration-200 focus:scale-[1.02]"
              maxLength={100}
            />
          </div>

          {/* Content */}
          <div className="mb-6 animate-fade-in">
            <textarea
              ref={contentRef}
              rows={6}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={placeholders.content}
              className="w-full text-[15px] leading-relaxed outline-none bg-transparent resize-none transition-all duration-200 focus:scale-[1.01] focus:ring-2 focus:ring-[#0e4123] focus:rounded-lg focus:px-2 focus:py-1"
              maxLength={2000}
            />
          </div>

          {/* Tags */}
          <div className="mb-6 animate-fade-in">
            <div className="flex items-center gap-2 mb-2">
              <Hash
                size={16}
                className="text-[#0E4123] transition-transform duration-200 hover:scale-110"
              />
              <span className="text-sm font-medium text-[#0E4123]">
                {lang === "kh" ? "បន្ថែមស្លាក" : "Add Tags"}
              </span>
              <span className="text-xs text-gray-400">({tags.length}/5)</span>
            </div>

            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag, i) => (
                <div
                  key={i}
                  className="flex items-center gap-1 bg-gray-200 px-3 py-1 rounded-full text-sm transition-all duration-200 hover:bg-gray-300 hover:scale-105 animate-fade-in"
                >
                  #{tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="hover:text-red-600 transition-colors duration-200 hover:scale-110"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>

            <input
              type="text"
              value={currentTag}
              onChange={(e) => setCurrentTag(e.target.value)}
              onKeyDown={addTag}
              placeholder={placeholders.tag}
              className="w-full px-3 py-2 border rounded-lg outline-none transition-all duration-200 focus:ring-2 focus:ring-[#0e4123] focus:border-transparent focus:scale-[1.02]"
              disabled={tags.length >= 5}
            />
          </div>

          {/* Publish */}
          <button
            onClick={handleSubmit}
            disabled={!title.trim() || !content.trim() || submitting}
            className={`w-full py-3 rounded-lg font-medium mt-4 transition-all duration-200 ${
              title.trim() && content.trim()
                ? "bg-[#0E4123] text-white hover:bg-[#0d3a1f] hover:scale-[1.02] active:scale-95"
                : "bg-gray-200 text-gray-400"
            } animate-fade-in`}
          >
            {submitting ? placeholders.posting : placeholders.publish}
          </button>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
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
          animation: fade-in 0.3s ease-out;
        }
        .animate-slide-up {
          animation: slide-up 0.4s ease-out;
        }
      `}</style>
    </div>
  );
}
