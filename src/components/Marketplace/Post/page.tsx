"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  Edit,
  Trash2,
  Plus,
  MoreVertical,
  Store,
  Handshake,
} from "lucide-react";
import { marketplaceApi, Product } from "../../../lib/api/marketplaceApi";
import { tradeApi, TradeRequest } from "../../../lib/api/trade";
import CreatePostModal from "../UI/CreatePostModal";
import CreateTradeModal from "../UI/CreateTradeModal";
import EditTradeModal from "../UI/EditTradeModal";
import { useFavorites } from "../context/FavContext";
import { useTranslations } from "../../../lib/i18n";

type ContentType = "shop" | "trade";

interface PostsProps {
  refreshTrigger?: number;
  onItemChanged?: () => void;
}

interface MenuRefs {
  [key: string]: HTMLDivElement | null;
}

const Posts: React.FC<PostsProps> = ({ refreshTrigger = 0, onItemChanged }) => {
  const [userProducts, setUserProducts] = useState<Product[]>([]);
  const [userTrades, setUserTrades] = useState<TradeRequest[]>([]);
  const [activeTab, setActiveTab] = useState<ContentType>("shop");
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreateTradeModalOpen, setIsCreateTradeModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingTrade, setEditingTrade] = useState<TradeRequest | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const menuRefs = useRef<MenuRefs>({});

  const { removeFavoriteByProductId } = useFavorites();
  const { t, tMarketplace, lang } = useTranslations(); // Added lang

  const avatarPlaceholder =
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iMjAiIGZpbGw9IiNFRUVFRUUiLz4KPHBhdGggZD0iTTIwIDIwQzIyLjIwOTEgMjAgMjQgMTguMjA5MSAyNCAxNkMyNCAxMy43OTA5IDIyLjIwOTEgMTIgMjAgMTJDMTcuNzkwOSAxMiAxNiAxMy43OTA5IDE2IDE2QzE2IDE4LjIwOTEgMTcuNzkwOSAyMCAyMCAyMFoiIGZpbGw9IiM5OTk5OTkiLz4KPHBhdGggZD0iTTIwIDIyQzE2LjY3IDIyIDE0IDI0LjY3IDE0IDI4VjMwQzE0IDMwLjU1MjMgMTQuNDQ3NyAzMSAxNSAzMUgyNUMxNS41NTIzIDMxIDE2IDMwLjU1MjMgMTYgMzBWMjhDMTYgMjQuNjcgMTguNjcgMjIgMjIgMjJaIiBmaWxsPSIjOTk5OTk5Ii8+Cjwvc3ZnPgo=";

  const imagePlaceholder = "/icons/marketplace/placeholder.svg";

  // Add Khmer status text function
  const getStatusText = (status: string) => {
    const statusMap = {
      pending: lang === "kh" ? "កំពុងរង់ចាំ" : "Pending",
      accepted: lang === "kh" ? "បានទទួលយក" : "Accepted",
      declined: lang === "kh" ? "បានបដិសេធ" : "Declined",
      completed: lang === "kh" ? "បានបញ្ចប់" : "Completed",
    };

    return statusMap[status as keyof typeof statusMap] || status;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "accepted":
        return "bg-green-100 text-green-800";
      case "declined":
        return "bg-red-100 text-red-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const loadUserContent = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log("Loading user content in Posts component...");

      const [products, trades] = await Promise.all([
        marketplaceApi.getUserProducts(),
        tradeApi.getMyTradePosts(),
      ]);

      setUserProducts(products);
      setUserTrades(trades);
      console.log(
        `Loaded ${products.length} products and ${trades.length} trades`
      );
    } catch (error: unknown) {
      console.error("Error loading user content:", error);
      const errorMessage = error instanceof Error ? error.message : t("error");
      setError(errorMessage);
      setUserProducts([]);
      setUserTrades([]);
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadUserContent();
  }, [loadUserContent]);

  useEffect(() => {
    if (refreshTrigger > 0) {
      console.log("Refresh trigger detected in Posts, reloading content...");
      loadUserContent();
    }
  }, [refreshTrigger, loadUserContent]);

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsCreateModalOpen(true);
    setActiveMenu(null);
  };

  const handleEditTrade = (trade: TradeRequest) => {
    setEditingTrade(trade);
    setActiveMenu(null);
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm(tMarketplace("deleteConfirmation"))) return;

    try {
      await marketplaceApi.deleteProduct(productId);
      removeFavoriteByProductId(productId);
      setUserProducts((prev) => prev.filter((p) => p.id !== productId));
      setActiveMenu(null);

      console.log("Product deleted, notifying parent...");
      onItemChanged?.();
    } catch (error: unknown) {
      console.error("Error deleting product:", error);
      const errorMessage = error instanceof Error ? error.message : t("error");
      alert(errorMessage);
    }
  };

  const handleDeleteTrade = async (tradeId: string) => {
    if (!confirm(tMarketplace("deleteConfirmation"))) return;

    try {
      await tradeApi.deleteTradeRequest(tradeId);
      setUserTrades((prev) => prev.filter((t) => t.id !== tradeId));
      setActiveMenu(null);

      console.log("Trade deleted, notifying parent...");
      onItemChanged?.();
    } catch (error: unknown) {
      console.error("Error deleting trade:", error);
      const errorMessage = error instanceof Error ? error.message : t("error");
      alert(errorMessage);
    }
  };

  const handleCreateClick = () => {
    if (activeTab === "trade") {
      setIsCreateTradeModalOpen(true);
    } else {
      setIsCreateModalOpen(true);
    }
  };

  const handleModalClose = (shouldRefresh: boolean = false) => {
    setIsCreateModalOpen(false);
    setEditingProduct(null);
    if (shouldRefresh) {
      loadUserContent();
      console.log("Product created/edited, notifying parent...");
      onItemChanged?.();
    }
  };

  const handleTradeModalClose = (shouldRefresh: boolean = false) => {
    setIsCreateTradeModalOpen(false);
    setEditingTrade(null);
    if (shouldRefresh) {
      loadUserContent();
      console.log("Trade created/edited, notifying parent...");
      onItemChanged?.();
    }
  };

  const handleTradeUpdated = (shouldRefresh: boolean = false) => {
    setEditingTrade(null);
    if (shouldRefresh) {
      loadUserContent();
      console.log("Trade updated, notifying parent...");
      onItemChanged?.();
    }
  };

  const toggleMenu = (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveMenu(activeMenu === itemId ? null : itemId);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const clickedInsideMenu = Object.values(menuRefs.current).some(
        (ref) => ref && ref.contains(event.target as Node)
      );

      if (!clickedInsideMenu) {
        setActiveMenu(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const setMenuRef = (itemId: string, element: HTMLDivElement | null) => {
    menuRefs.current[itemId] = element;
  };

  const getUserAvatar = (trade: TradeRequest) => {
    return trade.from_user?.avatar || avatarPlaceholder;
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = imagePlaceholder;
  };

  const LoadingSkeleton = () => (
    <div className="w-full px-4 py-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 h-48 rounded-lg"></div>
            <div className="mt-2 bg-gray-200 h-4 rounded"></div>
            <div className="mt-1 bg-gray-200 h-4 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    </div>
  );

  const EmptyState = ({ type }: { type: ContentType }) => (
    <div className="text-center py-12 text-gray-500">
      {type === "shop" ? (
        <Store size={48} className="mx-auto mb-4 text-gray-300" />
      ) : (
        <Handshake size={48} className="mx-auto mb-4 text-gray-300" />
      )}
      <p className="text-lg mb-4">
        {type === "shop"
          ? tMarketplace("youHaveNotCreated") +
            " " +
            tMarketplace("product").toLowerCase()
          : tMarketplace("youHaveNotCreated") +
            " " +
            tMarketplace("tradeRequest").toLowerCase()}
      </p>
      <button
        onClick={handleCreateClick}
        className="bg-[#0E4123] text-white px-6 py-2 rounded-lg hover:bg-green-800 transition"
      >
        {type === "shop"
          ? tMarketplace("createYourFirstProduct")
          : tMarketplace("createYourFirstTrade")}
      </button>
    </div>
  );

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="w-full px-4 py-6 font-[kantumruy_Pro]">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="flex items-center gap-4">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab("shop")}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition ${
                activeTab === "shop"
                  ? "bg-white text-[#0E4123] shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Store size={16} />
              {tMarketplace("products")} ({userProducts.length})
            </button>
            <button
              onClick={() => setActiveTab("trade")}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition ${
                activeTab === "trade"
                  ? "bg-white text-[#0E4123] shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Handshake size={16} />
              {tMarketplace("trades")} ({userTrades.length})
            </button>
          </div>
        </div>

        <button
          onClick={handleCreateClick}
          className="flex items-center justify-center h-9 px-3 sm:px-4 
                   rounded-[8px] border text-[14px] font-medium whitespace-nowrap 
                   transition-all duration-200 border-[#0E4123] text-[#0E4123] bg-white hover:bg-[#0E4123] hover:text-white cursor-pointer"
        >
          <Plus size={20} />
          {t("create")}{" "}
          {activeTab === "shop"
            ? tMarketplace("product")
            : tMarketplace("tradeRequest")}
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          <div className="flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={loadUserContent}
              className="text-red-700 hover:text-red-900 underline text-sm"
            >
              {t("tryAgain")}
            </button>
          </div>
        </div>
      )}

      {/* Content Section */}
      {activeTab === "shop" ? (
        userProducts.length === 0 ? (
          <EmptyState type="shop" />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {userProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onEdit={handleEditProduct}
                onDelete={handleDeleteProduct}
                activeMenu={activeMenu}
                onToggleMenu={toggleMenu}
                setMenuRef={setMenuRef}
                t={t as (key: string) => string}
                tMarketplace={tMarketplace as (key: string) => string}
                imagePlaceholder={imagePlaceholder}
                handleImageError={handleImageError}
              />
            ))}
          </div>
        )
      ) : userTrades.length === 0 ? (
        <EmptyState type="trade" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {userTrades.map((trade) => (
            <TradeCard
              key={trade.id}
              trade={trade}
              onEdit={handleEditTrade}
              onDelete={handleDeleteTrade}
              activeMenu={activeMenu}
              onToggleMenu={toggleMenu}
              setMenuRef={setMenuRef}
              getStatusColor={getStatusColor}
              getStatusText={getStatusText} // Pass the new function
              getUserAvatar={getUserAvatar}
              avatarPlaceholder={avatarPlaceholder}
              t={t as (key: string) => string}
              tMarketplace={tMarketplace as (key: string) => string}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={handleModalClose}
        activeTab="shop"
        onPostCreated={() => handleModalClose(true)}
        editProduct={editingProduct}
      />

      <CreateTradeModal
        isOpen={isCreateTradeModalOpen}
        onClose={handleTradeModalClose}
        onTradeCreated={() => handleTradeModalClose(true)}
      />

      {editingTrade && (
        <EditTradeModal
          tradeRequest={editingTrade}
          isOpen={!!editingTrade}
          onClose={() => setEditingTrade(null)}
          onTradeUpdated={() => handleTradeUpdated(true)}
        />
      )}
    </div>
  );
};

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
  activeMenu: string | null;
  onToggleMenu: (itemId: string, e: React.MouseEvent) => void;
  setMenuRef: (itemId: string, element: HTMLDivElement | null) => void;
  t: (key: string) => string;
  tMarketplace: (key: string) => string;
  imagePlaceholder: string;
  handleImageError?: (e: React.SyntheticEvent<HTMLImageElement>) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onEdit,
  onDelete,
  activeMenu,
  onToggleMenu,
  setMenuRef,
  t,
  tMarketplace,
  imagePlaceholder,
}) => {
  const menuId = `product-${product.id}`;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-lg border border-[#EBECF0] bg-white overflow-hidden relative group font-[kantumruy_Pro]"
    >
      <div className="relative">
        <img
          src={product.images[0] || imagePlaceholder}
          alt={product.title}
          width={300}
          height={200}
          className="w-full h-36 md:h-44 lg:h-52 object-cover"
          onError={handleImageError}
        />

        {/* Desktop & Tablet: Hover Actions - Now visible on tablets too */}
        <div className="hidden xs:flex absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(product);
              }}
              className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition"
              aria-label={t("edit")}
            >
              <Edit size={16} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(product.id);
              }}
              className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition"
              aria-label={t("delete")}
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        {/* Mobile & Tablet Menu - Always visible on touch devices */}
        <div
          className="xs:hidden absolute top-2 right-2"
          ref={(el) => setMenuRef(menuId, el)}
        >
          <button
            onClick={(e) => onToggleMenu(menuId, e)}
            className="bg-white/90 p-1.5 rounded-full shadow-md hover:bg-white transition"
            aria-label={tMarketplace("moreOptions")}
          >
            <MoreVertical size={16} />
          </button>

          {activeMenu === menuId && (
            <div className="absolute right-0 top-8 bg-white rounded-lg shadow-lg border py-1 z-10 min-w-[120px]">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(product);
                }}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-gray-50 text-blue-600"
              >
                <Edit size={14} />
                {t("edit")}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(product.id);
                }}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-gray-50 text-red-600"
              >
                <Trash2 size={14} />
                {t("delete")}
              </button>
            </div>
          )}
        </div>

        {/* Always visible action buttons for tablets - NEW */}
        {/* <div className="xs:hidden md:flex lg:hidden absolute top-2 right-2">
          <div className="flex gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(product);
              }}
              className="bg-white/90 p-1.5 rounded-full shadow-md hover:bg-white transition"
              aria-label={t("edit")}
            >
              <Edit size={14} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(product.id);
              }}
              className="bg-white/90 p-1.5 rounded-full shadow-md hover:bg-white transition"
              aria-label={t("delete")}
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div> */}

        {/* Status Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.is_best_seller && (
            <span className="bg-[#0E4123] text-white px-2 py-1 rounded text-xs font-medium">
              {tMarketplace("bestSeller")}
            </span>
          )}
        </div>
      </div>

      {/* Product Info */}
      <div className="p-3">
        <h3 className="text-[#0D1B2A] font-medium text-sm md:text-base truncate">
          {product.title}
        </h3>

        <div className="flex items-center justify-between mt-2">
          <span className="text-[#0E4123] font-bold text-base md:text-lg">
            ${product.price?.toFixed(2) || "0.00"}
          </span>
          {product.old_price && product.old_price > (product.price || 0) && (
            <span className="text-gray-500 text-sm line-through">
              ${product.old_price.toFixed(2)}
            </span>
          )}
        </div>

        <div className="flex items-center mt-1 text-gray-500 text-xs">
          <Image
            src="/icons/marketplace/icon_location.svg"
            alt={tMarketplace("location")}
            width={12}
            height={12}
            className="mr-1"
          />
          <span className="truncate leading-tight">
            {tMarketplace("location")}: {product.location}
          </span>
        </div>

        <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
          <span>{new Date(product.posted_at).toLocaleDateString()}</span>
          <span className="bg-blue-50 px-2 py-1 rounded">
            {product.category}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

// Trade Card Component
interface TradeCardProps {
  trade: TradeRequest;
  onEdit: (trade: TradeRequest) => void;
  onDelete: (tradeId: string) => void;
  activeMenu: string | null;
  onToggleMenu: (itemId: string, e: React.MouseEvent) => void;
  setMenuRef: (itemId: string, element: HTMLDivElement | null) => void;
  getStatusColor: (status: string) => string;
  getStatusText: (status: string) => string; // Add this prop
  getUserAvatar: (trade: TradeRequest) => string;
  avatarPlaceholder: string;
  t: (key: string) => string;
  tMarketplace: (key: string) => string;
}

const TradeCard: React.FC<TradeCardProps> = ({
  trade,
  onEdit,
  onDelete,
  activeMenu,
  onToggleMenu,
  setMenuRef,
  getStatusColor,
  getStatusText, // Use the new prop
  getUserAvatar,
  avatarPlaceholder,
  t,
  tMarketplace,
}) => {
  const menuId = `trade-${trade.id}`;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-lg border border-[#EBECF0] bg-white overflow-hidden relative group h-auto"
    >
      {/* Trade Header with User Avatar */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            {/* User Avatar */}
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center border border-gray-200 overflow-hidden">
              <img
                src={getUserAvatar(trade)}
                alt={`${
                  trade.from_user?.name || tMarketplace("user")
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
              <h3 className="text-[#0D1B2A] font-medium text-base truncate">
                {trade.from_user?.name || tMarketplace("user")}
              </h3>
              <p className="text-gray-500 text-sm mt-1">
                {t("to")}: {trade.to_user?.name || tMarketplace("user")}
              </p>
            </div>
          </div>

          {/* Status Badge and Menu */}
          <div className="flex justify-center items-center gap-2">
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                trade.status
              )}`}
            >
              {getStatusText(trade.status)} {/* Use the new function */}
            </span>
            {/* Mobile Menu */}
            <div className="relative" ref={(el) => setMenuRef(menuId, el)}>
              <button
                onClick={(e) => onToggleMenu(menuId, e)}
                className="p-1 text-gray-400 hover:text-gray-600 transition"
                aria-label={tMarketplace("moreOptions")}
              >
                <MoreVertical size={16} />
              </button>

              {activeMenu === menuId && (
                <div className="absolute right-0 top-6 bg-white rounded-lg shadow-lg border py-1 z-10 min-w-[120px]">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(trade);
                    }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-gray-50 text-blue-600"
                  >
                    <Edit size={14} />
                    {t("edit")}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(trade.id);
                    }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-gray-50 text-red-600"
                  >
                    <Trash2 size={14} />
                    {t("delete")}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Trade Images */}
      {trade.image_urls && trade.image_urls.length > 0 && (
        <div className="p-4 border-b border-gray-100">
          <div className="flex gap-2 overflow-x-auto">
            {trade.image_urls.slice(0, 3).map((url, index) => (
              <div
                key={index}
                className="w-16 h-16 bg-gray-100 rounded-lg border flex-shrink-0 overflow-hidden"
              >
                <img
                  src={url}
                  alt={`${tMarketplace("trade")} image ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = avatarPlaceholder;
                  }}
                />
              </div>
            ))}
            {trade.image_urls.length > 3 && (
              <div className="w-16 h-16 bg-gray-100 rounded-lg border flex items-center justify-center text-xs text-gray-500">
                +{trade.image_urls.length - 3}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Trade Message */}
      <div className="p-4 border-b border-gray-100">
        <h4 className="text-[#0D1B2A] font-[kantumruy_Pro] text-[12px] font-medium leading-normal tracking-[-0.12px]">
          {tMarketplace("incomingRequestedOffer")}:
        </h4>
        <p className="text-[#4B5563] font-[kantumruy_Pro] text-[12px] font-normal leading-normal tracking-[-0.12px]">
          {trade.description}
        </p>
      </div>

      {/* Trade Footer */}
      <div className="p-4">
        <div className="flex justify-between items-center text-xs text-gray-500">
          <span>{new Date(trade.created_at).toLocaleDateString()}</span>
        </div>
      </div>
    </motion.div>
  );
};

// Helper function for image error handling
const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
  e.currentTarget.src = "/icons/marketplace/placeholder.svg";
};

export default Posts;
