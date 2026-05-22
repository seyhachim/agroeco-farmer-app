import Image from "next/image";
import { Play } from "lucide-react";
import { useTranslations } from "@/lib/i18n";

interface CommentItemProps {
  id: string;
  user_name: string;
  avatar: string | null;
  content: string;
  created_at: string;
  depth?: number;
  parent_user?: string | null;
  replies?: any[];
  onReply?: (id: string, user: string) => void;
}

const CommentItem = ({
  id,
  user_name,
  avatar,
  content,
  created_at,
  depth = 0,
  parent_user = null,
  replies = [],
  onReply,
}: CommentItemProps) => {
  const { lang } = useTranslations();

  const avatarSrc = avatar || "/default-avatar.svg";

  const formattedDate = new Date(created_at).toLocaleString(
    lang === "kh" ? "km-KH" : "en-US",
    {
      hour: "numeric",
      minute: "numeric",
      year: "numeric",
      month: "short",
      day: "numeric",
    }
  );

  return (
    <div className="w-full relative animate-fade-in">
      {depth > 0 && (
        <svg
          className="absolute left-4 top-0 h-full w-8 pointer-events-none"
          viewBox="0 0 40 100"
          preserveAspectRatio="none"
        >
          <path
            d="
        M20 45    /* Start at bottom-center of parent avatar (40px avatar + ~5px offset) */
        L20 65    /* Straight down */
        Q20 75 30 75  /* Curve right into reply bubble */
      "
            fill="none"
            stroke="#d1d5db"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </svg>
      )}

      <div className="flex gap-3">
        <Image
          src={avatarSrc}
          alt={user_name}
          width={40}
          height={40}
          className="w-10 h-10 rounded-full object-cover bg-gray-200 shrink-0 transition-transform duration-200 hover:scale-105"
        />

        <div className="flex flex-col flex-1">
          <span className="font-medium text-[12px] text-[#63637b] flex items-center gap-1">
            {depth > 0 && parent_user ? (
              <>
                {user_name}
                <Play
                  fill="#9d9db0"
                  color="#9d9db0"
                  size={14}
                  className="transition-transform duration-200 hover:scale-110"
                />
                {parent_user}
              </>
            ) : (
              user_name
            )}
          </span>

          <span className="w-full font-normal text-[14px] text-[#2b2b2b] leading-5 mt-1 break-all whitespace-pre-wrap animate-fade-in">
            {content}
          </span>

          <div className="flex gap-4 mt-2 items-center">
            <span className="font-light text-[10px] text-[#6d6c6e]">
              {formattedDate}
            </span>

            <button
              onClick={() => onReply?.(id, user_name)}
              className="font-medium text-xs text-[#42629e] transition-all duration-200 hover:text-[#2d4a8a] hover:scale-105 active:scale-95"
            >
              {lang === "kh" ? "ឆ្លើយតប" : "Reply"}
            </button>
          </div>
        </div>
      </div>

      {replies.length > 0 && (
        <div className="ml-10 mt-4 space-y-3">
          {replies.map((reply, index) => (
            <div
              key={reply.id}
              className="animate-fade-in-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <CommentItem
                {...reply}
                depth={depth + 1}
                parent_user={user_name}
                onReply={onReply}
              />
            </div>
          ))}
        </div>
      )}

      <style jsx global>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(15px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.4s ease-out forwards;
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.5s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
};

export default CommentItem;
