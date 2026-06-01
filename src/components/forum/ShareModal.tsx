"use client";

import { X, Copy, Link2, Share2 } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Kantumruy_Pro } from "next/font/google";
import { useTranslations } from "@/lib/i18n";
import { supabase } from "@/lib/supabase";

const kantumruyPro = Kantumruy_Pro({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

interface ShareModalProps {
  onClose: () => void;
  link: string;
  postId?: string; // Add postId to track which post is being shared
}

const shareApps = [
  {
    name: "Messenger",
    icon: "/share/messenger.svg",
    color: "bg-blue-500",
    shareUrl: (url: string) =>
      `fb-messenger://share?link=${encodeURIComponent(url)}`,
  },
  {
    name: "Facebook",
    icon: "/share/facebook.svg",
    color: "bg-blue-600",
    shareUrl: (url: string) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  {
    name: "Telegram",
    icon: "/share/telegram.svg",
    color: "bg-sky-400",
    shareUrl: (url: string) =>
      `https://t.me/share/url?url=${encodeURIComponent(url)}`,
  },
  {
    name: "Message",
    icon: "/share/sms.svg",
    color: "bg-green-500",
    shareUrl: (url: string) => `sms:?body=${encodeURIComponent(url)}`,
  },
];

export default function ShareModal({ onClose, link, postId }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [safeLink, setSafeLink] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("");
  const { lang } = useTranslations();

  useEffect(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        setCurrentUserId(data.user.id);

        // Get user profile name
        const { data: profile } = await supabase
          .from("user_profiles")
          .select(
            `
            display_name,
            telegram_users ( display_name )
          `
          )
          .eq("id", data.user.id)
          .single();

        const tg = Array.isArray(profile?.telegram_users)
          ? profile.telegram_users[0]
          : profile?.telegram_users;
        setUserName(profile?.display_name || tg?.display_name || "Unknown");
      }
    };

    loadUser();
  }, []);

  useEffect(() => {
    if (typeof link === "string") {
      setSafeLink(link);
    } else {
      console.error("Invalid link provided:", link);
      setSafeLink(window.location.href);
    }
  }, [link]);

  // Function to track share in Supabase
  const trackShare = async (platform: string) => {
    if (!postId || !currentUserId) return;

    try {
      // Update the shares count in the posts table
      const { error: updateError } = await supabase.rpc("increment_shares", {
        post_id: postId,
      });

      if (updateError) {
        console.error("Error updating shares count:", updateError);
      }

      // Create a record in post_shares table (if you have one)
      const { error: shareError } = await supabase.from("post_shares").insert({
        post_id: postId,
        user_id: currentUserId,
        platform: platform,
        shared_at: new Date().toISOString(),
      });

      if (shareError) {
        console.error("Error tracking share:", shareError);
      }

      console.log(`Share tracked for post ${postId} on ${platform}`);
    } catch (error) {
      console.error("Error in trackShare:", error);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(safeLink);
    setCopied(true);

    // Track copy as a share
    if (postId) {
      await trackShare("copy");
    }

    setTimeout(() => setCopied(false), 2000);
  };

  const handleAppShare = async (app: (typeof shareApps)[0]) => {
    // Track the share first
    if (postId) {
      await trackShare(app.name.toLowerCase());
    }

    const shareUrl = app.shareUrl(safeLink);

    if (app.name === "Message") {
      window.open(shareUrl, "_blank");
    } else {
      window.open(shareUrl, "_blank", "width=600,height=400");
    }
  };

  const getShareText = () => {
    if (lang === "kh") {
      return {
        title: "ចែករំលែក",
        subtitle: "ចែករំលែកជាមួយអ្នកដទៃ",
        orCopy: "ឬចម្លងតំណ",
        copy: "ចម្លង",
        copied: "បានចម្លង!",
        shareWith: "ចែករំលែកតាម",
      };
    }
    return {
      title: "Share",
      subtitle: "Share this with others",
      orCopy: "Or copy link",
      copy: "Copy",
      copied: "Copied!",
      shareWith: "Share with",
    };
  };

  const shareText = getShareText();

  return (
    <div className={kantumruyPro.className}>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-end z-50 animate-fade-in">
        <div className="w-full max-w-lg bg-white rounded-t-3xl p-6 animate-slide-up">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg transition-transform duration-200 hover:scale-105">
                <Share2 size={20} className="text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 animate-fade-in">
                  {shareText.title}
                </h2>
                <p className="text-sm text-gray-500 animate-fade-in">
                  {shareText.subtitle}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-gray-100 transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <X size={20} className="text-gray-600" />
            </button>
          </div>

          {/* Horizontal Scrollable Share Apps */}
          <div className="mb-8">
            <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide">
              {shareApps.map((app, i) => (
                <button
                  key={i}
                  onClick={() => handleAppShare(app)}
                  className="flex flex-col items-center gap-2 p-3 rounded-2xl hover:bg-gray-50 active:bg-gray-100 transition-all duration-200 hover:scale-105 active:scale-95 shrink-0 min-w-20 animate-fade-in"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div
                    className={`h-14 w-14 rounded-2xl ${app.color} flex items-center justify-center shadow-sm transition-transform duration-200 hover:scale-110`}
                  >
                    <Image
                      src={app.icon}
                      alt={app.name}
                      width={28}
                      height={28}
                      className="rounded-full"
                    />
                  </div>
                  <span className="text-xs font-medium text-gray-700 whitespace-nowrap">
                    {app.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Link Section */}
          <div className="space-y-3 animate-fade-in">
            <div className="flex items-center gap-2">
              <Link2
                size={16}
                className="text-gray-500 transition-transform duration-200 hover:scale-110"
              />
              <span className="text-sm font-medium text-gray-700">
                {shareText.orCopy}
              </span>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 transition-all duration-200 hover:bg-gray-100 hover:scale-[1.02]">
              <div className="flex items-center justify-between gap-3">
                <span className="text-gray-600 text-sm flex-1 truncate font-medium">
                  {safeLink}
                </span>
                <button
                  onClick={handleCopy}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 hover:scale-105 active:scale-95 ${
                    copied
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {copied ? (
                    <>
                      <div className="w-1.5 h-1.5 bg-green-600 rounded-full animate-pulse" />
                      {shareText.copied}
                    </>
                  ) : (
                    <>
                      <Copy size={16} />
                      {shareText.copy}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
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
          animation: fade-in 0.3s ease-out forwards;
          opacity: 0;
        }
        .animate-slide-up {
          animation: slide-up 0.4s ease-out;
        }
      `}</style>
    </div>
  );
}
