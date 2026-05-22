"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { useFavorites } from "../context/FavContext";
import { Product } from "../../../lib/api/marketplaceApi";
import { Heart } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "../../../lib/i18n";

interface Props {
  product: Product;
  onProductUpdate?: () => void;
}

const ProductCard: React.FC<Props> = ({ product, onProductUpdate }) => {
  const router = useRouter();
  const { favoriteIds, addFavorite, removeFavorite } = useFavorites();
  const { tMarketplace } = useTranslations();
  const isFavorite = favoriteIds.includes(product.id);

  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (isFavorite) {
        await removeFavorite(product.id);
      } else {
        await addFavorite(product.id);
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  const handleNavigate = () => {
    router.push(`/resource/detail-product/${product.id}`);
  };

  if (!product || !product.id) {
    return null;
  }

  return (
    <div
      onClick={handleNavigate}
      className="rounded-lg border border-[#EBECF0] font-[kantumruy_Pro] bg-white overflow-hidden relative w-full transition hover:shadow-md cursor-pointer"
    >
      {/* Product Image */}
      <div className="relative">
        <img
          src={product.images[0] || "/icons/marketplace/placeholder.svg"}
          alt={product.title}
          className="w-full h-36 md:h-44 lg:h-52 object-cover"
        />

        {/* Best Seller Badge */}
        {product.is_best_seller && (
          <div className="absolute top-2 left-2 bg-[#0E4123] text-white px-2 py-1 rounded text-xs font-medium">
            {tMarketplace("bestSeller")}
          </div>
        )}
      </div>

      {/* Favorite Button */}
      <button
        onClick={handleToggle}
        className={`absolute top-0 right-0 p-2 md:p-3 rounded-bl-xl transition-all duration-200 
          ${
            isFavorite
              ? "bg-[#0E4123] text-white"
              : "bg-white text-gray-400 hover:bg-gray-100"
          } shadow-md`}
        aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
      >
        <Heart
          size={20}
          className={`w-4 h-4 sm:w-5 sm:h-5 ${
            isFavorite ? "fill-white text-white" : "text-[#0E4123]"
          }`}
        />
      </button>

      {/* Product Info */}
      <div className="p-3">
        <h3 className="text-[#0D1B2A] text-sm md:text-base lg:text-lg font-medium leading-tight mt-1 truncate">
          {product.title}
        </h3>

        <div className="flex items-center justify-between mt-2">
          <span className="text-green-700  text-base md:text-lg font-bold">
            {tMarketplace("price")}: ${product.price?.toFixed(2) || "0.00"}
          </span>
          {product.old_price && product.old_price > (product.price || 0) && (
            <span className="text-gray-500 text-xs md:text-sm line-through ml-2">
              ${product.old_price.toFixed(2)}
            </span>
          )}
        </div>

        <div className="flex items-center mt-1 text-gray-500 text-xs ">
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
      </div>
    </div>
  );
};

export default ProductCard;
