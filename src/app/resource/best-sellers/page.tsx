"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ProductCard from "@/components/Marketplace/Shop/ProductCard";
import { FaChevronLeft, FaCrown } from "react-icons/fa";
import { marketplaceApi, Product } from "../../../lib/api/marketplaceApi";
import { useTranslations } from "../../../lib/i18n";

const BestSellersPage = () => {
  const router = useRouter();
  const { tMarketplace } = useTranslations();
  const [bestSellerProducts, setBestSellerProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadBestSellerProducts();
  }, []);

  const loadBestSellerProducts = async () => {
    try {
      setIsLoading(true);
      const products = await marketplaceApi.getBestSellers();
      setBestSellerProducts(products);
    } catch (error) {
      console.error("Error loading best seller products:", error);
      setBestSellerProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Loading Skeleton Component
  const LoadingSkeleton = () => (
    <div className="min-h-screen bg-gray-50 py-4">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between relative mb-8">
          <div className="w-6 h-6 bg-gray-300 rounded ml-2"></div>
          <div className="absolute left-1/2 transform -translate-x-1/2 w-40 h-4 bg-gray-300 rounded"></div>
          <div className="w-6 h-6 bg-gray-300 rounded mr-2"></div>
        </div>

        {/* Product Grid Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden animate-pulse"
            >
              {/* Image Skeleton */}
              <div className="w-full h-48 bg-gray-300"></div>

              {/* Content Skeleton */}
              <div className="p-4 space-y-3">
                {/* Title Skeleton */}
                <div className="space-y-2">
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                </div>

                {/* Price Skeleton */}
                <div className="flex justify-between items-center">
                  <div className="h-5 bg-gray-300 rounded w-16"></div>
                  <div className="h-4 bg-gray-300 rounded w-12"></div>
                </div>

                {/* Rating Skeleton */}
                <div className="flex items-center space-x-1">
                  <div className="h-3 bg-gray-300 rounded w-16"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-8">
        {/* Header */}
        <div className="flex items-center justify-between relative">
          <button onClick={() => router.back()}>
            <FaChevronLeft className="text-xl text-gray-600 ml-2" />
          </button>
          <h1 className="absolute left-1/2 transform -translate-x-1/2 text-[#0D1B2A] text-base font-[kantumruy_Pro] leading-4 tracking-[0.2px] text-center">
            {tMarketplace("bestSeller")}
          </h1>

          <div className="relative mr-2">
            <FaCrown className="text-[#0E4123]" size={24} />
            {bestSellerProducts.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#0E4123] text-[10px] font-bold text-white leading-none">
                {bestSellerProducts.length > 9
                  ? "9+"
                  : bestSellerProducts.length}
              </span>
            )}
          </div>
        </div>

        {/* Best Seller Products */}
        {bestSellerProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {bestSellerProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          // Empty state when no best sellers
          <div className="text-center py-10">
            <FaCrown className="w-10 h-10 text-[#0E4123] mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {tMarketplace("noBestSellersAvailable")}
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {tMarketplace("checkBackLater")}
            </p>
            <button
              onClick={() => router.push("/resource")}
              className="bg-[#0E4123] text-white px-6 py-2 rounded-lg hover:bg-green-800 transition"
            >
              {tMarketplace("browseAllProducts")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BestSellersPage;
