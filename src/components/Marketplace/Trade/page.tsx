"use client";
import React, { useState, useEffect, useCallback } from "react";
import { tradeApi, TradeRequest } from "../../../lib/api/trade";
import TradeCard from "./TradeCard";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { useTranslations } from "../../../lib/i18n";

interface TradePageProps {
  searchQuery: string;
  refreshTrigger?: number;
  initialTrades: TradeRequest[];
}

const TradePage: React.FC<TradePageProps> = ({
  searchQuery = "",
  refreshTrigger,
  initialTrades = [],
}) => {
  const [tradeRequests, setTradeRequests] =
    useState<TradeRequest[]>(initialTrades);
  const [filteredRequests, setFilteredRequests] =
    useState<TradeRequest[]>(initialTrades);
  const [myTradePosts, setMyTradePosts] = useState<TradeRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<"all" | "incoming" | "outgoing">("all");
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasFetchedTrades, setHasFetchedTrades] = useState(false);
  const { t, tMarketplace } = useTranslations();

  // Filter requests based on current filter
  const getFilteredRequests = useCallback(() => {
    if (!currentUserId) return tradeRequests;

    switch (filter) {
      case "incoming":
        return tradeRequests.filter(
          (req) => req.to_user_id === currentUserId && req.status === "pending"
        );
      case "outgoing":
        return tradeRequests.filter(
          (req) => req.from_user_id === currentUserId
        );
      case "all":
      default:
        return tradeRequests;
    }
  }, [filter, tradeRequests, currentUserId]);

  useEffect(() => {
    checkAuthentication();
  }, []);

  // Fetch trades when user becomes authenticated
  useEffect(() => {
    if (isAuthenticated && !hasFetchedTrades) {
      fetchAllData();
    }
  }, [isAuthenticated, hasFetchedTrades]);

  // Listen for refreshTrigger changes
  useEffect(() => {
    if (refreshTrigger && refreshTrigger > 0 && isAuthenticated) {
      fetchAllData();
    }
  }, [refreshTrigger, isAuthenticated]);

  // Apply search filter when searchQuery or dependencies change
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredRequests(getFilteredRequests());
    } else {
      const searchLower = searchQuery.toLowerCase();
      const searchedRequests = getFilteredRequests().filter(
        (request) =>
          request.title.toLowerCase().includes(searchLower) ||
          request.description.toLowerCase().includes(searchLower) ||
          request.from_user?.name.toLowerCase().includes(searchLower) ||
          request.to_user?.name.toLowerCase().includes(searchLower)
      );
      setFilteredRequests(searchedRequests);
    }
  }, [searchQuery, getFilteredRequests]);

  const checkAuthentication = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("Error checking authentication:", error);
      setIsAuthenticated(false);
    }
  };

  const fetchAllData = async () => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);
      setError(null);

      const requests = await tradeApi.getAllUserRequests();
      setTradeRequests(requests);
      setHasFetchedTrades(true);

      try {
        const posts = await tradeApi.getMyTradePosts();
        setMyTradePosts(posts);
      } catch (postsError) {
        console.error("Failed to load my trade posts:", postsError);
        setMyTradePosts([]);
      }
    } catch (err) {
      console.error("Error fetching trade data:", err);
      setError(err instanceof Error ? err.message : t("error"));
    } finally {
      setLoading(false);
    }
  };

  const refetchAll = () => {
    if (isAuthenticated) {
      fetchAllData();
    }
  };

  // Counts for the stats header
  const incomingCount = tradeRequests.filter(
    (req) => req.to_user_id === currentUserId && req.status === "pending"
  ).length;

  const outgoingCount = tradeRequests.filter(
    (req) => req.from_user_id === currentUserId
  ).length;

  const myPostsCount = myTradePosts.length;

  // Show authentication message if not signed in
  if (!isAuthenticated) {
    return (
      <div className="w-full mx-auto p-4 font-[kantumruy_Pro]">
        <div className="text-center py-12 bg-white rounded-lg border border-dashed">
          <div className="text-lg font-medium mb-4 text-gray-600">
            {tMarketplace("signInRequired")}
          </div>
          <p className="text-gray-500 mb-6">
            {tMarketplace("pleaseSignInToViewTrades")}
          </p>
          <button
            onClick={() => {
              window.location.href = "/auth/signin";
            }}
            className="bg-[#0E4123] text-white px-6 py-2 rounded-lg hover:bg-green-800 transition-colors"
          >
            {t("login")}
          </button>
        </div>
      </div>
    );
  }

  // Show loading state only if we're actively loading and don't have any trades yet
  if (loading && tradeRequests.length === 0) {
    return (
      <div className="w-full mx-auto p-4">
        {/* Stats Header Skeleton */}
        <div className="flex gap-2.5 py-3 overflow-x-auto scrollbar-hide">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="shrink-0 w-32 px-4 py-3 rounded-full bg-gray-100 animate-pulse"
            >
              <div className="h-4 bg-gray-200 rounded mb-1"></div>
              <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto"></div>
            </div>
          ))}
        </div>

        {/* Filter Header Skeleton */}
        <div className="flex justify-between items-center py-6 px-2">
          <div className="h-6 bg-gray-200 rounded w-1/3 animate-pulse"></div>
          <div className="h-6 bg-gray-200 rounded w-1/4 animate-pulse"></div>
        </div>

        {/* Trade Cards Skeleton */}
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse"
            >
              {/* Header Skeleton */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div>
                    <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-16"></div>
              </div>

              {/* Title & Description Skeleton */}
              <div className="mb-4">
                <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-1"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>

              {/* Image Placeholder Skeleton */}
              <div className="mb-4">
                <div className="flex gap-2">
                  {[...Array(2)].map((_, imgIndex) => (
                    <div
                      key={imgIndex}
                      className="w-16 h-16 bg-gray-200 rounded-lg"
                    ></div>
                  ))}
                </div>
              </div>

              {/* Message Skeleton */}
              <div className="mb-4">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>

              {/* Action Buttons Skeleton */}
              <div className="flex gap-3 mb-4">
                <div className="flex-1 h-10 bg-gray-200 rounded-lg"></div>
                <div className="flex-1 h-10 bg-gray-200 rounded-lg"></div>
              </div>

              {/* Footer Skeleton */}
              <div className="flex justify-between items-center">
                <div className="h-3 bg-gray-200 rounded w-20"></div>
                <div className="h-8 bg-gray-200 rounded w-24"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error && tradeRequests.length === 0) {
    return (
      <div className="text-center py-8 font-[kantumruy_Pro]">
        <div className="text-red-600 mb-4">{error}</div>
        <button
          onClick={refetchAll}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          {t("tryAgain")}
        </button>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto p-4 font-[kantumruy_Pro]">
      {/* Stats Header - Horizontal scroll on mobile */}
      <div className="flex gap-2.5 py-3 overflow-x-auto scrollbar-hide">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setFilter("all")}
          className={`shrink-0 px-4 py-2 rounded-full font-medium transition-colors flex items-center gap-2 ${
            filter === "all"
              ? "bg-[#0E4123] text-white"
              : "bg-[#F2F4F7] text-[#374151]"
          }`}
        >
          {tMarketplace("allTradeRequests")}
          <span
            className={`px-2 py-1 rounded-full text-center  text-[14px] font-normal leading-normal ${
              filter === "all"
                ? "bg-white text-gray-800"
                : "bg-[#F3F4F6] text-gray-700"
            }`}
          >
            {tradeRequests.length}
          </span>
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setFilter("incoming")}
          className={`shrink-0 px-4 py-2 rounded-full font-medium transition-colors flex items-center gap-2 ${
            filter === "incoming"
              ? "bg-[#0E4123] text-white"
              : "bg-[#F2F4F7] text-[#374151]"
          }`}
        >
          {tMarketplace("incomingRequest")}
          <span
            className={`px-2 py-1 rounded-full text-center  text-[14px] font-normal leading-normal ${
              filter === "incoming"
                ? "bg-white text-gray-800"
                : "bg-[#F3F4F6] text-gray-700"
            }`}
          >
            {incomingCount}
          </span>
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setFilter("outgoing")}
          className={`shrink-0 px-4 py-2 rounded-full font-medium transition-colors flex items-center gap-2 ${
            filter === "outgoing"
              ? "bg-[#0E4123] text-white"
              : "bg-[#F2F4F7] text-[#374151]"
          }`}
        >
          {tMarketplace("outgoingRequest")}
          <span
            className={`px-2 py-1 rounded-full text-center  text-[14px] font-normal leading-normal ${
              filter === "outgoing"
                ? "bg-white text-gray-800"
                : "bg-[#F3F4F6] text-gray-700"
            }`}
          >
            {outgoingCount}
          </span>
        </motion.button>
      </div>

      {/* Search Results Info */}
      {searchQuery && (
        <div className="py-4 px-2">
          <p className="text-sm text-gray-600">
            {filteredRequests.length === 0
              ? `${tMarketplace("noMatchingTrades")} "${searchQuery}"`
              : `${tMarketplace("found")} ${
                  filteredRequests.length
                } ${tMarketplace("tradeRequest")}${
                  filteredRequests.length === 1 ? "" : "s"
                } ${tMarketplace("for")} "${searchQuery}"`}
          </p>
        </div>
      )}

      {/* Filter Header */}
      <div className="flex justify-between items-center py-6 px-2">
        <h3 className="text-[14px] font-semibold text-gray-900">
          {filter === "all" && tMarketplace("allTradeRequests")}
          {filter === "incoming" && tMarketplace("incomingRequest")}
          {filter === "outgoing" && tMarketplace("outgoingRequest")}
        </h3>
        {filter === "incoming" && incomingCount > 0 && !searchQuery && (
          <span className="text-[12px] text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {tMarketplace("recentlyRequested")}
          </span>
        )}
      </div>

      {/* Trade Cards */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-white rounded-lg border border-dashed">
            <div className="text-lg font-medium mb-2">
              {searchQuery
                ? tMarketplace("noMatchingTrades")
                : tMarketplace("noTrades")}
            </div>
            <div className="text-sm">
              {searchQuery
                ? tMarketplace("tryDifferentSearch")
                : tMarketplace("createTradeToStart")}
            </div>
          </div>
        ) : (
          filteredRequests.map((request) => (
            <TradeCard
              key={request.id}
              tradeRequest={request}
              onStatusUpdate={refetchAll}
              isOwner={request.from_user_id === currentUserId}
              currentUserId={currentUserId}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default TradePage;
