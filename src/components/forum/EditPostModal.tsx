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

export default function EditPostModal({ post, onClose }: any) {
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const { t, lang } = useTranslations();

  const [title, setTitle] = useState(post.title);
  const [content, setContent] = useState(post.content);
  const [tags, setTags] = useState<string[]>(post.tags || []);
  const [currentTag, setCurrentTag] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const loadUser = async () => {
      const { data: profile } = await supabase
        .from("user_profiles")
        .select(
          `
          display_name,
          avatar_url,
          telegram_users ( display_name, photo_url )
        `
        )
        .eq("id", post.user_id)
        .single();

      const tg = profile?.telegram_users;

      setUser({
        name: profile?.display_name || tg?.display_name || "Unknown",
        avatar: profile?.avatar_url || tg?.photo_url,
      });
    };

    loadUser();
  }, [post.user_id]);

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

    await supabase
      .from("posts")
      .update({
        title,
        content,
        tags,
        edited_at: new Date().toISOString(),
      })
      .eq("id", post.id);

    setSubmitting(false);
    onClose();
  };

  const getPlaceholders = () => {
    if (lang === "kh") {
      return {
        title: "ចំណងជើងប្រកាស...",
        content: "សរសេរអ្វីមួយ...",
        tag: "វាយបញ្ចូលស្លាក ហើយចុច Enter...",
        saving: "កំពុងរក្សាទុក...",
        save: "រក្សាទុកការផ្លាស់ប្តូរ",
        editing: "កំពុងកែសម្រួលជាសាធារណៈ",
      };
    }
    return {
      title: "Post title...",
      content: "Write something...",
      tag: "Type tag and press Enter...",
      saving: "Saving...",
      save: "Save Changes",
      editing: "Editing publicly",
    };
  };

  const placeholders = getPlaceholders();

  return (
    <div className={kantumruyPro.className}>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-end z-50 animate-fade-in">
        <div className="w-full bg-white rounded-t-2xl p-5 max-h-[90vh] overflow-y-auto animate-slide-up">
          <div className="flex justify-between items-center">
            <button
              onClick={onClose}
              className="p-2 rounded-md hover:bg-gray-200 transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <X size={22} />
            </button>

            <span className="text-lg font-semibold animate-fade-in">
              {lang === "kh" ? "កែសម្រួលប្រកាស" : "Edit Post"}
            </span>

            <div className="w-5" />
          </div>

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
                  {placeholders.editing}
                </p>
              </div>
            </div>
          )}

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

          <div className="mb-6 animate-fade-in">
            <div className="flex items-center gap-2 mb-2">
              <Hash
                size={16}
                className="text-[#0E4123] transition-transform duration-200 hover:scale-110"
              />
              <span className="text-sm font-medium text-[#0E4123]">
                {lang === "kh" ? "ស្លាក" : "Tags"}
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

          <button
            onClick={handleSubmit}
            disabled={!title.trim() || !content.trim() || submitting}
            className={`w-full py-3 rounded-lg font-medium mt-4 transition-all duration-200 ${
              title.trim() && content.trim()
                ? "bg-[#0E4123] text-white hover:bg-[#0d3a1f] hover:scale-[1.02] active:scale-95"
                : "bg-gray-200 text-gray-400"
            } animate-fade-in`}
          >
            {submitting ? placeholders.saving : placeholders.save}
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
