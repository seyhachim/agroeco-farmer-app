"use client";
import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useTranslations } from "../../../lib/i18n";

export interface Tab {
  id: "guides" | "stories" | "saved";
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
  const { tLearninghub } = useTranslations();

  const tabs: Tab[] = [
    {
      id: "guides",
      label: tLearninghub("guides"),
      icon: "/icons/learninghub/icon_guide.svg",
      activeIcon: "/icons/learninghub/icon_guide_active.svg",
    },
    {
      id: "stories",
      label: tLearninghub("stories"),
      icon: "/icons/learninghub/icon_stories.svg",
      activeIcon: "/icons/learninghub/icon_stories_active.svg",
    },
    {
      id: "saved",
      label: tLearninghub("saved"),
      icon: "/icons/learninghub/icon_save.svg",
      activeIcon: "/icons/learninghub/icon_save_active.svg",
    },
  ];

  return (
    <nav className="w-full flex items-center justify-between border-t border-b border-[#E3E3E3] bg-white pl-6 pr-6 font-[Kantumruy_Pro]">
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
            <Image
              src={activeTab === tab.id ? tab.activeIcon : tab.icon}
              alt={`${tab.label} icon`}
              width={18}
              height={18}
            />
            <span
              className={`text-[14px] font-500  transition-colors duration-200 ${
                activeTab === tab.id ? "text-[#0E4123]" : "text-[#6B7280]"
              }`}
            >
              {tab.label}
            </span>
          </motion.div>
          {activeTab === tab.id && (
            <motion.span
              layoutId="underline"
              className="absolute bottom-0 w-full h-0.5 bg-[#0E4123]"
              transition={{ duration: 0.3 }}
            />
          )}
        </button>
      ))}
    </nav>
  );
};

export default TabNavigation;
