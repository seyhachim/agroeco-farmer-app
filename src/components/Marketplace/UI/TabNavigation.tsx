"use client";
import React from "react";
import { motion } from "framer-motion";
import { useTranslations } from "../../../lib/i18n";

export interface Tab {
  id: "shop" | "trade" | "myposts";
  label: string;
  icon: string;
  activeIcon: string;
}

export interface TabNavigationProps {
  activeTab: Tab["id"];
  setActiveTab: React.Dispatch<React.SetStateAction<Tab["id"]>>;
}

const TabNavigation: React.FC<TabNavigationProps> = ({
  activeTab,
  setActiveTab,
}) => {
  const { tMarketplace } = useTranslations();

  const tabs: Tab[] = [
    {
      id: "shop",
      label: tMarketplace("shop"),
      icon: "/icons/marketplace/icon_shop.svg",
      activeIcon: "/icons/marketplace/icon_shop_active.svg",
    },
    {
      id: "trade",
      label: tMarketplace("trade"),
      icon: "/icons/marketplace/icon_trade.svg",
      activeIcon: "/icons/marketplace/icon_trade_active.svg",
    },
    {
      id: "myposts",
      label: tMarketplace("myPosts"),
      icon: "/icons/marketplace/icon_post.svg",
      activeIcon: "/icons/marketplace/icon_post_active.svg",
    },
  ];

  return (
    <nav className="w-full flex items-center justify-between border-t border-b border-[#E3E3E3] bg-white pl-6 pr-6">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className="w-[127px] h-full flex flex-col items-center justify-center relative"
        >
          <motion.div
            className="flex items-center gap-1 mt-3 mb-3"
            whileTap={{ scale: 0.95 }}
          >
            <img
              src={activeTab === tab.id ? tab.activeIcon : tab.icon}
              alt={`${tab.label} icon`}
              className="w-[18px] h-[18px]"
            />
            <span
              className={`text-[14px] font-500 font-[kantumruy_Pro] transition-colors duration-200 ${
                activeTab === tab.id ? "text-[#0E4123]" : "text-[#6B7280]"
              }`}
            >
              {tab.label}
            </span>
          </motion.div>
          {activeTab === tab.id && (
            <motion.span
              layoutId="underline"
              className="absolute bottom-0 w-full h-[2px] bg-[#0E4123]"
              transition={{ duration: 0.3 }}
            />
          )}
        </button>
      ))}
    </nav>
  );
};

export default TabNavigation;
