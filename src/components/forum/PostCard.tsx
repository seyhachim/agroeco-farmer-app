"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ThumbsUp,
  MessageCircleMore,
  Heart,
  Share2,
  Clock,
  MoreVertical,
} from "lucide-react";
import Image from "next/image";
import { Kantumruy_Pro } from "next/font/google";
import { useTranslations } from "@/lib/i18n";

const kantumruyPro = Kantumruy_Pro({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

interface PostCardProps {
  id: string;
  user_id: string;
  currentUserId: string | null;
  user_name: string;
  profile_avatar: string | null;
  telegram_photo: string | null;
  title: string;
  content: string;
  tags: string[];
  created_at: string;
  edited_at: string | null;
  likes: number;
  comments: number;
  saves: number;
  shares: number;
  isLiked: boolean;
  isSaved: boolean;
  onToggleLike: () => void;
  onToggleSave: () => void;
  onOpenShare: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const PostCard = ({
  id,
  user_id,
  currentUserId,
  user_name,
  profile_avatar,
  telegram_photo,
  title,
  content,
  tags,
  created_at,
  edited_at,
  likes,
  comments,
  saves,
  shares,
  isLiked,
  isSaved,
  onToggleLike,
  onToggleSave,
  onOpenShare,
  onEdit,
  onDelete,
}: PostCardProps) => {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const { lang } = useTranslations();

  const avatarSrc = telegram_photo || profile_avatar || "/default-avatar.svg";

  const formattedDate = created_at
    ? new Date(created_at).toLocaleString(lang === "kh" ? "km-KH" : "en-US", {
        hour: "numeric",
        minute: "numeric",
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : lang === "kh"
    ? "ថ្មីៗ"
    : "recently";

  const previewContent =
    content?.length > 160 ? content.slice(0, 160) + "..." : content;

  const goToDetail = () => router.push(`/forum/${id}`);

  const getButtonText = () => {
    if (lang === "kh") {
      return {
        like: isLiked ? "បានចុចចូលចិត្ត" : "ចុចចូលចិត្ត",
        comment: "មតិ",
        share: "ចែករំលែក",
        save: isSaved ? "បានរក្សាទុក" : "រក្សាទុក",
        edit: "កែសម្រួល",
        delete: "លុប",
        edited: "បានកែសម្រួល",
      };
    }
    return {
      like: isLiked ? "Liked" : "Like",
      comment: "Comment",
      share: "Share",
      save: isSaved ? "Saved" : "Save",
      edit: "Edit Post",
      delete: "Delete Post",
      edited: "Edited",
    };
  };

  const buttonText = getButtonText();

  return (
    <div className={kantumruyPro.className}>
      <div
        className="flex flex-col gap-4 px-4 py-3 border border-[#ebecf0] bg-white rounded-xl cursor-pointer relative transition-all duration-300 hover:shadow-lg hover:scale-[1.02] animate-fade-in-up"
        onClick={goToDetail}
      >
        <div className="flex items-center justify-between">
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
                {user_name}
              </span>
              <span className="text-[12px] text-gray-500 flex items-center gap-1 wrap-break-word">
                <Clock size={12} /> {formattedDate}
                {edited_at && (
                  <span className="ml-2 bg-[#f3f6f3] px-2 py-0.5 rounded-full text-[10px] text-gray-600 animate-fade-in break-keep">
                    {buttonText.edited}
                  </span>
                )}
              </span>
            </div>
          </div>

          {currentUserId === user_id && (
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(!menuOpen);
                }}
                className="transition-transform duration-200 hover:scale-110 active:scale-95"
              >
                <MoreVertical size={20} className="text-gray-600" />
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-6 w-32 rounded-md shadow-lg bg-white border z-50 animate-fade-in">
                  <button
                    className="w-full text-left px-3 py-2 text-[13px] hover:bg-gray-100 transition-all duration-200 hover:scale-105 wrap-break-word"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpen(false);
                      onEdit();
                    }}
                  >
                    {buttonText.edit}
                  </button>

                  <button
                    className="w-full text-left px-3 py-2 text-[13px] text-red-600 hover:bg-gray-100 transition-all duration-200 hover:scale-105 wrap-break-word"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpen(false);
                      onDelete();
                    }}
                  >
                    {buttonText.delete}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        <span className="font-medium text-[14px] text-[#0d1b2a] animate-fade-in wrap-break-word">
          {title}
        </span>
        <span className="text-[12px] text-gray-600 animate-fade-in wrap-break-word leading-relaxed">
          {previewContent}
        </span>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 animate-fade-in">
            {tags.map((tag, index) => (
              <span
                key={index}
                className="text-[12px] text-gray-600 bg-[#f3f4f6] px-3 py-1 rounded-full transition-all duration-200 hover:bg-gray-200 hover:scale-105 wrap-break-word"
              >
                {tag.startsWith("#") ? tag : `#${tag}`}
              </span>
            ))}
          </div>
        )}
        <div className="flex justify-between items-center mt-2 mb-1 animate-fade-in">
          <span
            className={`flex items-center gap-1 text-[12px] transition-colors duration-200 wrap-break-word ${
              isLiked ? "text-[#0e4123]" : "text-gray-500"
            }`}
          >
            <ThumbsUp size={16} /> {likes}
          </span>

          <div className="flex gap-4">
            <span className="flex items-center gap-1 text-[12px] text-gray-500 wrap-break-word">
              <MessageCircleMore size={16} /> {comments}
            </span>

            <span
              className={`flex items-center gap-1 text-[12px] transition-colors duration-200 wrap-break-word ${
                isSaved ? "text-[#0e4123]" : "text-gray-500"
              }`}
            >
              <Heart size={16} /> {saves}
            </span>
          </div>
        </div>
        <div className="flex justify-between items-center border-t border-gray-200 py-2 animate-fade-in">
          <button
            className="flex items-center transition-all duration-200 hover:scale-105 active:scale-95 wrap-break-word"
            onClick={(e) => {
              e.stopPropagation();
              onToggleLike();
            }}
          >
            <ThumbsUp
              size={16}
              fill={isLiked ? "#0e4123" : "none"}
              className={isLiked ? "text-[#0e4123]" : "text-gray-500"}
            />
            <span
              className={`ml-2 text-[12px] transition-colors duration-200 wrap-break-word ${
                isLiked ? "text-[#0e4123]" : "text-gray-500"
              }`}
            >
              {buttonText.like}
            </span>
          </button>

          <button
            className="flex items-center transition-all duration-200 hover:scale-105 active:scale-95 wrap-break-word"
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/forum/${id}`);
            }}
          >
            <MessageCircleMore size={16} className="text-gray-500" />
            <span className="ml-2 text-[12px] text-gray-500 wrap-break-word">
              {buttonText.comment}
            </span>
          </button>

          <button
            className="flex items-center transition-all duration-200 hover:scale-105 active:scale-95 wrap-break-word"
            onClick={(e) => {
              e.stopPropagation();
              onOpenShare();
            }}
          >
            <Share2 size={16} className="text-gray-500" />
            <span className="ml-2 text-[12px] text-gray-500 wrap-break-word">
              {buttonText.share}
            </span>
          </button>

          <button
            className="flex items-center transition-all duration-200 hover:scale-105 active:scale-95 wrap-break-word"
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave();
            }}
          >
            <Heart
              size={16}
              fill={isSaved ? "#0e4123" : "none"}
              className={isSaved ? "text-[#0e4123]" : "text-gray-500"}
            />
            <span
              className={`ml-2 text-[12px] transition-colors duration-200 wrap-break-word ${
                isSaved ? "text-[#0e4123]" : "text-gray-500"
              }`}
            >
              {buttonText.save}
            </span>
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
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.4s ease-out;
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
};

export default PostCard;
