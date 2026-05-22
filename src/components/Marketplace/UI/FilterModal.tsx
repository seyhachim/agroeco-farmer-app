"use client";
import React, { useEffect } from "react";
import FilterCategory from "./FilterCategory";
import FilterCheckbox from "./FilterCheckbox";
import FilterPrice from "./FilterPrice";
import FilterLocation from "./FilterLocation";
import { useTranslations } from "../../../lib/i18n";

interface FilterParams {
  category: string[];
  certification: string[];
  minPrice: number | null;
  maxPrice: number | null;
  location: string;
}

interface Props {
  onClose: () => void;
  onReset: () => void;
  onApply: () => void;
  hasActiveFilters: boolean;
  hasTempChanges: boolean;
  filterParams: FilterParams;
  onFilterChange: (
    key: keyof FilterParams,
    value: string | string[] | number | null
  ) => void;
}

const FilterModal: React.FC<Props> = ({
  onClose,
  onReset,
  onApply,
  hasTempChanges,
  filterParams,
  onFilterChange,
}) => {
  const { t, tMarketplace } = useTranslations();

  const resetClass = hasTempChanges
    ? "text-blue-600 font-medium text-sm cursor-pointer"
    : "text-gray-400 text-sm cursor-default";

  // Prevent background scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50"
      aria-modal="true"
      role="dialog"
      aria-label={tMarketplace("filterModal")}
    >
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50" onClick={onClose}></div>

      {/* Modal Alignment Container */}
      <div className="fixed inset-0 flex justify-center items-end sm:items-start pointer-events-none">
        {/* Modal Content Container (Full Screen on Laptop, Bottom-aligned on Mobile) */}
        <div
          className="bg-white 
                        w-full 
                        h-[841px] max-h-full
                        sm:h-screen sm:max-h-full sm:rounded-none sm:shadow-none 
                        flex flex-col 
                        rounded-t-2xl shadow-2xl 
                        relative z-10 pointer-events-auto"
        >
          {/* Header (Fixed Position) */}
          <div className="flex justify-between items-center p-4 border-b shrink-0 font-[kantumruy_Pro]">
            <button
              className={resetClass}
              onClick={hasTempChanges ? onReset : undefined}
              disabled={!hasTempChanges}
              aria-disabled={!hasTempChanges}
            >
              {tMarketplace("reset")}
            </button>
            <h2 className="text-lg font-semibold text-gray-800 absolute left-1/2 transform -translate-x-1/2 ">
              {tMarketplace("filters")}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          {/* Filter Fields (Scrollable Content Area) */}
          <div className="overflow-y-auto flex-grow pb-4">
            <FilterCategory
              currentCategory={filterParams.category}
              onCategoryChange={(catArr) => onFilterChange("category", catArr)}
            />
            <FilterCheckbox
              currentSelection={filterParams.certification}
              onCheckboxChange={(certs) =>
                onFilterChange("certification", certs)
              }
            />
            <FilterPrice
              minPrice={filterParams.minPrice}
              maxPrice={filterParams.maxPrice}
              onPriceChange={onFilterChange}
            />
            <FilterLocation
              currentLocation={filterParams.location}
              onLocationChange={(loc) => onFilterChange("location", loc)}
            />
          </div>

          {/* Footer (Fixed Position) */}
          <div className="p-5 border-t border-gray-100 bg-white shadow-lg shrink-0">
            <button
              className="w-full bg-green-900 text-white py-3 rounded-lg font-medium"
              onClick={onApply}
            >
              {tMarketplace("applyFilters")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterModal;
