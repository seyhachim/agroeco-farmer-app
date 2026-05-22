"use client";
import React, { useState, useEffect } from "react";
import TopBar from "../../components/Marketplace/UI/TopBar";
import TabNavigation from "@/components/Marketplace/UI/TabNavigation";
import SearchFilterWithCreate from "../../components/Marketplace/UI/SearchFilterWithCreate";
import AllProducts from "@/components/Marketplace/Shop/AllProducts";
import TradePage from "../../components/Marketplace/Trade/page";
import Posts from "@/components/Marketplace/Post/page";
import CreatePostModal from "@/components/Marketplace/UI/CreatePostModal";
import CreateTradeModal from "../../components/Marketplace/UI/CreateTradeModal";
import { Product } from "../../lib/api/marketplaceApi";
import { TradeRequest } from "../../lib/api/trade";

interface MarketplaceClientProps {
  initialProducts: Product[];
  initialTrades: TradeRequest[];
  bestSellers: Product[];
  tabParam: string;
}

const MarketplaceClient: React.FC<MarketplaceClientProps> = ({
  initialProducts,
  initialTrades,
  bestSellers,
  tabParam,
}) => {
  const [activeTab, setActiveTab] = useState<"shop" | "trade" | "myposts">(
    "shop"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
  const [isCreateTradeModalOpen, setIsCreateTradeModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    if (tabParam === "trade") setActiveTab("trade");
    else if (tabParam === "myposts") setActiveTab("myposts");
    else setActiveTab("shop");
  }, [tabParam]);

  useEffect(() => {
    setSearchQuery("");
  }, [activeTab]);

  const handleSearchChange = (query: string) => setSearchQuery(query);

  const handleCreateClick = () => {
    if (activeTab === "trade") setIsCreateTradeModalOpen(true);
    else setIsCreatePostModalOpen(true);
  };

  const handlePostCreated = () => {
    setIsCreatePostModalOpen(false);
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleTradeCreated = () => {
    setIsCreateTradeModalOpen(false);
    setRefreshTrigger((prev) => prev + 1);
  };

  const handlePostsContentUpdate = () => setRefreshTrigger((prev) => prev + 1);

  return (
    <div className="flex flex-col items-center w-full mb-20">
      <TopBar />

      {(activeTab === "shop" || activeTab === "trade") && (
        <SearchFilterWithCreate
          onSearchChange={handleSearchChange}
          searchQuery={searchQuery}
          onCreateClick={handleCreateClick}
          activeTab={activeTab}
        />
      )}

      <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className={activeTab === "shop" ? "block w-full" : "hidden"}>
        <AllProducts
          searchQuery={searchQuery}
          refreshTrigger={refreshTrigger}
          initialProducts={initialProducts}
          bestSellers={bestSellers}
          onProductCreated={handlePostCreated}
        />
      </div>

      <div className={activeTab === "trade" ? "block w-full" : "hidden"}>
        <TradePage
          searchQuery={searchQuery}
          refreshTrigger={refreshTrigger}
          initialTrades={initialTrades}
        />
      </div>

      <div className={activeTab === "myposts" ? "block w-full" : "hidden"}>
        <Posts
          refreshTrigger={refreshTrigger}
          onItemChanged={handlePostsContentUpdate}
        />
      </div>

      <CreatePostModal
        isOpen={isCreatePostModalOpen}
        onClose={() => setIsCreatePostModalOpen(false)}
        activeTab={activeTab}
        onPostCreated={handlePostCreated}
      />

      <CreateTradeModal
        isOpen={isCreateTradeModalOpen}
        onClose={() => setIsCreateTradeModalOpen(false)}
        onTradeCreated={handleTradeCreated}
      />
    </div>
  );
};

export default MarketplaceClient;
