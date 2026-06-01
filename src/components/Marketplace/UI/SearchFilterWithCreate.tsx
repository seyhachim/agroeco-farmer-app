"use client";
import React from "react";
import { motion } from "framer-motion";
import { useTranslations } from "../../../lib/i18n";

interface SearchFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onCreateClick: () => void;
  disabled?: boolean;
  activeTab?: "shop" | "trade" | "myposts";
}

export const SearchFilterWithCreate: React.FC<SearchFilterProps> = ({
  searchQuery,
  onSearchChange,
  onCreateClick,
  disabled = false,
  activeTab = "shop",
}) => {
  const { t, tMarketplace } = useTranslations();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value);
  };

  const handleCreateClick = () => {
    if (!disabled) {
      onCreateClick();
    }
  };

  // Get placeholder text based on active tab
  const getPlaceholder = () => {
    switch (activeTab) {
      case "trade":
        return tMarketplace("searchTrades");

      case "shop":
      default:
        return tMarketplace("searchProducts");
    }
  };

  // Get create button text based on active tab
  const getCreateButtonText = () => {
    switch (activeTab) {
      case "trade":
        return tMarketplace("createTrade");
      case "myposts":
      case "shop":
      default:
        return tMarketplace("createProduct");
    }
  };

  // Hide create button for trade tab
  const showCreateButton = activeTab !== "trade";

  return (
    <div className="flex items-center justify-between w-full px-6 py-3.5 gap-3">
      {/* Search Bar */}
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        whileHover={{ scale: 1.02 }}
        className={`flex items-center ${
          showCreateButton ? "flex-1" : "w-full"
        } h-9 rounded-xl border border-[#E3E3E3] bg-white px-3`}
      >
        <img
          src="/icons/learninghub/icon_search.svg"
          alt="search-icon"
          className="w-4 h-4"
        />
        <input
          type="text"
          placeholder={getPlaceholder()}
          className="flex-1 pl-2 text-[14px] font-normal font-[kantumruy_Pro] tracking-[-0.14px]
                     text-[#717D96] placeholder:text-[#717D96]/60 outline-none"
          value={searchQuery}
          onChange={handleInputChange}
          style={{ fontSize: "16px" }}
        />
      </motion.div>

      {/* Create Button - Conditionally rendered */}
      {showCreateButton && (
        <motion.button
          onClick={handleCreateClick}
          disabled={disabled}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          whileHover={!disabled ? { scale: 1.02 } : {}}
          whileTap={!disabled ? { scale: 0.98 } : {}}
          className={`flex items-center justify-center min-h-9 px-2 xs:px-3 sm:px-4 font-[kantumruy_Pro] 
             rounded-[8px] border text-xs xs:text-[13px] sm:text-[14px] font-medium 
             transition-all duration-200 ${
               disabled
                 ? "border-gray-300 text-gray-400 bg-gray-100 cursor-not-allowed"
                 : "border-[#0E4123] text-[#0E4123] bg-white hover:bg-[#0E4123] hover:text-white cursor-pointer"
             }`}
        >
          <span className="mr-1 xs:mr-1.5 text-[13px] xs:text-[14px] sm:text-[16px] font-bold shrink-0">
            +
          </span>
          <span className="truncate max-w-[70px] xs:max-w-[85px] sm:max-w-[110px] md:max-w-none leading-tight">
            {getCreateButtonText()}
          </span>
        </motion.button>
      )}
    </div>
  );
};

export default SearchFilterWithCreate;
