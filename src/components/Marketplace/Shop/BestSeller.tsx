"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ProductCard from "./ProductCard";
import BestSellerHeader from "./BestSellerHeader";
import { marketplaceApi, Product } from "../../../lib/api/marketplaceApi";

interface BestSellerProps {
  initialBestSellers?: Product[];
  refreshTrigger?: number;
}

const BestSeller: React.FC<BestSellerProps> = ({
  initialBestSellers = [],
  refreshTrigger = 0,
}) => {
  const [bestSellers, setBestSellers] = useState<Product[]>(initialBestSellers);
  const [isLoading, setIsLoading] = useState(initialBestSellers.length === 0);
  const router = useRouter();

  const loadBestSellers = async () => {
    try {
      setIsLoading(true);
      console.log("BestSeller: Fetching latest best sellers...");
      const bestSellersData = await marketplaceApi.getBestSellers();
      setBestSellers(bestSellersData);
      console.log(`BestSeller: Loaded ${bestSellersData.length} best sellers`);
    } catch (error) {
      console.error("Error loading best sellers:", error);
      setBestSellers([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialBestSellers.length === 0) {
      loadBestSellers();
    }
  }, [initialBestSellers.length]);

  useEffect(() => {
    if (refreshTrigger > 0) {
      console.log(
        "BestSeller: Parent refresh trigger detected, reloading best sellers..."
      );
      loadBestSellers();
    }
  }, [refreshTrigger]);

  const handleProductUpdate = (updatedProductId: string) => {
    console.log("BestSeller: Product favorite updated, optimizing refresh...");

    setTimeout(() => {
      loadBestSellers();
    }, 1000);
  };

  const handleSeeAll = () => {
    router.push("/resource/best-sellers");
  };

  // Don't show if no best sellers and not loading
  if (bestSellers.length === 0 && !isLoading) {
    return null;
  }

  return (
    <section className="w-full mt-6 mb-8 font-[kantumruy_Pro]">
      <BestSellerHeader title="Best Seller" onSeeAll={handleSeeAll} />

      {isLoading ? (
        <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4 sm:grid sm:grid-cols-3 lg:grid-cols-4 sm:gap-4 md:gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="w-[183px] shrink-0 sm:w-full animate-pulse">
              <div className="bg-gray-200 h-48 rounded-lg"></div>
              <div className="mt-2 bg-gray-200 h-4 rounded"></div>
              <div className="mt-1 bg-gray-200 h-4 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* Mobile: Scrollable Row */}
          <div className="block sm:hidden">
            <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4">
              {bestSellers.map((product) => (
                <div key={product.id} className="w-[183px] flex-shrink-0">
                  <ProductCard
                    product={product}
                    onProductUpdate={() => handleProductUpdate(product.id)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Desktop: Grid */}
          <div className="hidden sm:grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {bestSellers.map((product) => (
              <div key={product.id}>
                <ProductCard
                  product={product}
                  onProductUpdate={() => handleProductUpdate(product.id)}
                />
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
};

export default BestSeller;
