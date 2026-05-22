"use client";
import React, { useState } from "react";
import { TradeRequest, tradeApi } from "../../../lib/api/trade";
import Image from "next/image";
import { useTranslations } from "../../../lib/i18n";

interface TradeCardProps {
  tradeRequest: TradeRequest;
  onStatusUpdate: () => void;
  isOwner?: boolean;
  currentUserId?: string;
}

const TradeCard: React.FC<TradeCardProps> = ({
  tradeRequest,
  onStatusUpdate,
  currentUserId = "",
}) => {
  const { tMarketplace, lang } = useTranslations();
  const [showFullDescription, setShowFullDescription] = useState(false);
  const isPending = tradeRequest.status === "pending";
  const isRecipient = currentUserId === tradeRequest.to_user_id;

  const MAX_DESCRIPTION_LENGTH = 120;
  const shouldTruncate =
    tradeRequest.description.length > MAX_DESCRIPTION_LENGTH;
  const displayDescription = showFullDescription
    ? tradeRequest.description
    : tradeRequest.description.slice(0, MAX_DESCRIPTION_LENGTH) +
      (shouldTruncate ? "..." : "");

  const handleStatusUpdate = async (newStatus: "accepted" | "declined") => {
    try {
      await tradeApi.updateTradeStatus(tradeRequest.id, newStatus);
      onStatusUpdate();
    } catch (error) {
      console.error("Error updating trade status:", error);
      alert(tMarketplace("errorUpdatingStatus"));
    }
  };

  const getTimeDisplay = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (lang === "kh") {
      // Khmer time format
      if (diffInMinutes < 1) return "ទើបតែមកដល់";
      if (diffInMinutes < 60) return `${diffInMinutes}នាទីមុន`;
      if (diffInHours < 24) return `${diffInHours}ម៉ោងមុន`;
      if (diffInDays < 7) return `${diffInDays}ថ្ងៃមុន`;

      return date.toLocaleDateString("km-KH", {
        month: "short",
        day: "numeric",
      });
    } else {
      // English time format
      if (diffInMinutes < 1) return "Just now";
      if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
      if (diffInHours < 24) return `${diffInHours}h ago`;
      if (diffInDays < 7) return `${diffInDays}d ago`;

      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  // Function to get status text based on language
  const getStatusText = (status: string) => {
    const statusMap = {
      pending: lang === "kh" ? "កំពុងរង់ចាំ" : "Pending",
      accepted: lang === "kh" ? "បានទទួលយក" : "Accepted",
      declined: lang === "kh" ? "បានបដិសេធ" : "Declined",
      completed: lang === "kh" ? "បានបញ្ចប់" : "Completed",
    };

    return statusMap[status as keyof typeof statusMap] || status;
  };

  const avatarPlaceholder =
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iMjAiIGZpbGw9IiNFRUVFRUUiLz4KPHBhdGggZD0iTTIwIDIwQzIyLjIwOTEgMjAgMjQgMTguMjA5MSAyNCAxNkMyNCAxMy43OTA5IDIyLjIwOTEgMTIgMjAgMTJDMTcuNzkwOSAxMiAxNiAxMy43OTA5IDE2IDE2QzE2IDE4LjIwOTEgMTcuNzkwOSAyMCAyMCAyMFoiIGZpbGw9IiM5OTk5OTkiLz4KPHBhdGggZD0iTTIwIDIyQzE2LjY3IDIyIDE0IDI0LjY3IDE0IDI4VjMwQzE0IDMwLjU1MjMgMTQuNDQ3NyAzMSAxNSAzMUgyNUMxNS41NTIzIDMxIDE2IDMwLjU1MjMgMTYgMzBWMjhDMTYgMjQuNjcgMTguNjcgMjIgMjIgMjJaIiBmaWxsPSIjOTk5OTk5Ii8+Cjwvc3ZnPgo=";

  const clockIcon = "/icons/marketplace/icon_clock.svg";

  const getUserAvatar = () => {
    if (tradeRequest.from_user?.avatar) {
      return tradeRequest.from_user.avatar;
    }
    return avatarPlaceholder;
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 font-[kantumruy_Pro]">
        {/* Header - With avatar like image */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-3">
            {/* User Avatar */}
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center border border-gray-200 overflow-hidden">
              <img
                src={getUserAvatar()}
                alt={`${
                  tradeRequest.from_user?.name || tMarketplace("user")
                }'s avatar`}
                width={40}
                height={40}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = avatarPlaceholder;
                }}
              />
            </div>
            <div>
              <h3 className="text-[14px] font-bold text-gray-900 mb-1">
                {tradeRequest.from_user?.name || tMarketplace("user")}
              </h3>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <Image
                    src={clockIcon}
                    alt={tMarketplace("time")}
                    width={12}
                    height={12}
                    className="opacity-60"
                    onError={(e) => {
                      e.currentTarget.src =
                        "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iMTIiIHZpZXdCb3g9IjAgMCAxMiAxMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iNiIgY3k9IjYiIHI9IjUiIHN0cm9rZT0iIzZCNzI4MCIgc3Ryb2tlLXdpZHRoPSIxIi8+CjxwYXRoIGQ9Ik02IDMuNVY2SDguNSIgc3Ryb2tlPSIjNkI3MjgwIiBzdHJva2Utd2lkdGg9IjEiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPgo8L3N2Zz4K";
                    }}
                  />
                  <span>{getTimeDisplay(tradeRequest.created_at)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Status Badge - Moved to top right */}
          <div
            className={`px-3 py-1 rounded-full text-[12px] font-medium ${
              tradeRequest.status === "pending"
                ? "bg-[#FFEDD5] text-[#EA580C] "
                : tradeRequest.status === "accepted"
                ? "bg-[#DCFCE7] text-[#16A34A] "
                : tradeRequest.status === "declined"
                ? "bg-[#FEE2E2] text-[#991B1B]"
                : "bg-blue-100 text-blue-800 "
            }`}
          >
            {getStatusText(tradeRequest.status)}
          </div>
        </div>

        {/* Trade Images */}
        {tradeRequest.image_urls && tradeRequest.image_urls.length > 0 && (
          <div className="mb-6">
            <div className="flex gap-2 overflow-x-auto">
              {tradeRequest.image_urls.map((url, index) => (
                <div
                  key={index}
                  className="w-20 h-20 bg-gray-100 rounded-lg border flex-shrink-0 overflow-hidden"
                >
                  <img
                    src={url}
                    alt={`${tMarketplace("tradeImage")} ${index + 1}`}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src =
                        "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjRjNGNEY2Ii8+CjxyZWN0IHg9IjIwIiB5PSIyMCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRDFENUZCIi8+CjxjaXJjbGUgY3g9IjQwIiBjeT0iMzAiIHI9IjUiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTI1IDUwTDM1IDQwTDQ1IDQ1TDU1IDM1VjUwSDI1WiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K";
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Incoming requested offer section */}
        <div className="mb-6">
          <h4 className="text-[#0D1B2A]  text-[12px] font-medium leading-normal tracking-[-0.12px] mb-2">
            {tMarketplace("incomingRequestedOffer")}
          </h4>
          <p className="text-[#4B5563]  text-[12px] font-normal leading-normal tracking-[-0.12px]">
            {displayDescription}
          </p>
          {shouldTruncate && (
            <button
              onClick={() => setShowFullDescription(!showFullDescription)}
              className="text-[#0088FF]  text-[12px] font-medium mt-1 hover:text-green-700 transition-colors"
            >
              {showFullDescription
                ? tMarketplace("showLess")
                : tMarketplace("showMore")}
            </button>
          )}
        </div>

        {/* Action Buttons - With icons */}
        {isRecipient && isPending && (
          <div className="flex gap-3 mb-6">
            <button
              onClick={() => handleStatusUpdate("accepted")}
              className="flex-1 py-3 bg-[#10B981] text-white rounded-lg hover:bg-green-700 transition-colors font-medium shadow-sm flex items-center justify-center gap-2"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M13 4L6 11L3 8"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {tMarketplace("accept")}
            </button>

            <button
              onClick={() => handleStatusUpdate("declined")}
              className="flex-1 py-3 bg-[#F3F4F6] text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M4 4L12 12M12 4L4 12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {tMarketplace("decline")}
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default TradeCard;
