"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ProductCard from "./ProductCard";
import { marketplaceApi, Product } from "../../../lib/api/marketplaceApi";
import FilterButton from "../UI/FilterButton";
import FilterModal from "../UI/FilterModal";
import BestSeller from "./BestSeller";
import { useTranslations } from "../../../lib/i18n";

interface FilterParams {
  category: string[];
  certification: string[];
  minPrice: number | null;
  maxPrice: number | null;
  location: string;
}

const initialFilterState: FilterParams = {
  category: ["All"],
  certification: ["All"],
  minPrice: null,
  maxPrice: null,
  location: "",
};

interface Props {
  searchQuery: string;
  refreshTrigger?: number;
  initialProducts: Product[];
  bestSellers: Product[];
  onProductCreated?: () => void;
}

const AllProducts: React.FC<Props> = ({
  searchQuery,
  refreshTrigger,
  initialProducts = [],
  bestSellers = [],
}) => {
  const { t, tMarketplace } = useTranslations();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] =
    useState<FilterParams>(initialFilterState);
  const [tempFilters, setTempFilters] =
    useState<FilterParams>(initialFilterState);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [forceRefresh, setForceRefresh] = useState(0);
  const [bestSellerRefreshTrigger, setBestSellerRefreshTrigger] = useState(0);

  const hasActiveFilters = useMemo(
    () => JSON.stringify(appliedFilters) !== JSON.stringify(initialFilterState),
    [appliedFilters]
  );

  const hasTempChanges = useMemo(
    () => JSON.stringify(tempFilters) !== JSON.stringify(initialFilterState),
    [tempFilters]
  );

  // Load products from API
  const loadProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log("Loading products...");

      const filters = {
        type: "shop" as const,
        search: searchQuery.trim() || undefined,
        category: appliedFilters.category.includes("All")
          ? undefined
          : appliedFilters.category,
        certification: appliedFilters.certification.includes("All")
          ? undefined
          : appliedFilters.certification,
        minPrice: appliedFilters.minPrice || undefined,
        maxPrice: appliedFilters.maxPrice || undefined,
        location: appliedFilters.location.trim() || undefined,
      };

      const productsData = await marketplaceApi.getProducts(filters);
      setProducts(productsData);
      console.log(`Loaded ${productsData.length} products`);
    } catch (err) {
      console.error("Error loading products:", err);
      setError(t("error"));
    } finally {
      setIsLoading(false);
    }
  }, [appliedFilters, searchQuery, t]);

  // Effect to load products when filters, search, or refresh triggers change
  useEffect(() => {
    loadProducts();
  }, [loadProducts, refreshTrigger, forceRefresh]);

  // Effect to reset to initial products when search and filters are cleared
  useEffect(() => {
    if (
      !hasActiveFilters &&
      !searchQuery.trim() &&
      initialProducts.length > 0
    ) {
      setProducts(initialProducts);
    }
  }, [hasActiveFilters, searchQuery, initialProducts]);

  // Listen for product creation/deletion/updates and refresh best sellers
  useEffect(() => {
    if (refreshTrigger && refreshTrigger > 0) {
      console.log("Refresh triggered in AllProducts");
      loadProducts();
      // Also trigger best seller refresh
      setBestSellerRefreshTrigger((prev) => prev + 1);
    }
  }, [refreshTrigger, loadProducts]);

  const handleTempChange = (
    key: keyof FilterParams,
    value: string | string[] | number | null
  ) => {
    if (key === "minPrice" || key === "maxPrice") {
      const numValue = value === "" || value === null ? null : Number(value);
      setTempFilters((prev) => ({ ...prev, [key]: numValue }));
    } else {
      setTempFilters((prev) => ({ ...prev, [key]: value }));
    }
  };

  const handleResetFilters = () => {
    setTempFilters(initialFilterState);
    setAppliedFilters(initialFilterState);
    setForceRefresh((prev) => prev + 1);
  };

  const handleApplyFilters = () => {
    setAppliedFilters(tempFilters);
    setIsFilterOpen(false);
    setForceRefresh((prev) => prev + 1);
  };

  // Lock scroll when filter modal is open
  useEffect(() => {
    document.body.style.overflow = isFilterOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isFilterOpen]);

  return (
    <motion.section
      className="w-full px-4 py-6 sm:px-6 lg:px-8 font-[kantumruy_Pro]"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <BestSeller
        initialBestSellers={bestSellers}
        refreshTrigger={bestSellerRefreshTrigger}
      />
      <motion.h2
        className="text-lg md:text-xl font-medium text-[#6B7280] mt-6"
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
      >
        {tMarketplace("allProducts")}
      </motion.h2>

      <div className="flex justify-between items-center mb-4">
        <div>
          <p className="text-gray-500 text-xs sm:text-sm mt-1">
            {tMarketplace("showing")}:{" "}
            <span className="text-green-700 font-medium">
              {hasActiveFilters || searchQuery !== ""
                ? tMarketplace("filteredResults")
                : tMarketplace("allProducts")}{" "}
              ({products.length})
            </span>
          </p>
          {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {(hasActiveFilters || searchQuery !== "") && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleResetFilters}
              className="px-2 sm:px-3 py-1.5 text-xs sm:text-sm rounded-md bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-700 transition whitespace-nowrap"
            >
              {tMarketplace("resetFilters")}
            </motion.button>
          )}
          <motion.div whileHover={{ scale: 1.1 }}>
            <FilterButton onClick={() => setIsFilterOpen(true)} />
          </motion.div>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 h-48 rounded-lg"></div>
              <div className="mt-2 bg-gray-200 h-4 rounded"></div>
              <div className="mt-1 bg-gray-200 h-4 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      ) : (
        <motion.div
          layout
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
        >
          <AnimatePresence>
            {products.map((product) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </AnimatePresence>

          {products.length === 0 && !isLoading && (
            <motion.div
              className="col-span-full py-10 text-center text-gray-500 text-base sm:text-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {error ? t("error") : tMarketplace("noProductsMatch")}
            </motion.div>
          )}
        </motion.div>
      )}

      <AnimatePresence>
        {isFilterOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <FilterModal
              onClose={() => setIsFilterOpen(false)}
              onReset={handleResetFilters}
              onApply={handleApplyFilters}
              hasActiveFilters={hasActiveFilters}
              hasTempChanges={hasTempChanges}
              filterParams={tempFilters}
              onFilterChange={handleTempChange}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
};

export default AllProducts;
