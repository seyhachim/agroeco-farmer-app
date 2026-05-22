"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";

import TopBar from "../../components/learninghub/ui/TopBar";
import TabNavigation from "../../components/learninghub/ui/TabNavigation";
import { SearchFilter } from "../../components/learninghub/ui/SearchFilter";
import GuideList from "../../components/learninghub/Guide/GuideList";
import StoriesList from "../../components/learninghub/Stories/StoriesList";
import GuideCard from "../../components/learninghub/Guide/GuideCard";
import { StoriesCard } from "../../components/learninghub/Stories/StoriesCard";
import {
  SavedProvider,
  useSaved,
} from "../../components/learninghub/Saved/SavedContext";
import { searchGuides, searchStories } from "../../lib/api";
import { Guide } from "../../lib/api/guides";
import { Story } from "../../lib/api/stories";
import { useTranslations } from "../../lib/i18n";

// SavedTab Component with i18n
const SavedTab: React.FC<{ searchText: string }> = ({ searchText }) => {
  const { savedGuides, savedStories } = useSaved();
  const [filter, setFilter] = useState<"guides" | "stories">("guides");
  const { tLearninghub, lang } = useTranslations();

  const filteredSavedGuides = savedGuides.filter(
    (g) =>
      g.title?.toLowerCase().includes(searchText.toLowerCase()) ||
      g.description?.toLowerCase().includes(searchText.toLowerCase()) ||
      g.author?.toLowerCase().includes(searchText.toLowerCase())
  );

  const filteredSavedStories = savedStories.filter(
    (s) =>
      s.title?.toLowerCase().includes(searchText.toLowerCase()) ||
      s.description?.toLowerCase().includes(searchText.toLowerCase()) ||
      s.username?.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-4 w-auto items-center mt-4 font-[Kantumruy_Pro]">
      {/* Filter Buttons */}
      <motion.div
        className="bg-[#F9FAFB] p-1 rounded-xl flex w-[382px] max-w-sm mb-6 border border-[#E5E7EB]"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
            filter === "guides"
              ? "bg-white text-[#0E4123] shadow-sm"
              : "bg-transparent text-[#6B7280]"
          }`}
          onClick={() => setFilter("guides")}
        >
          {tLearninghub("savedGuides")}
          <span
            className={`text-xs font-[500] px-2 py-0.5 rounded-full ${
              filter === "guides"
                ? "bg-[#EBECF0] text-[#0E4123]"
                : "bg-[#EBECF0] text-[#334155]"
            }`}
          >
            {savedGuides.length}
          </span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`flex-1 flex items-center  justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
            filter === "stories"
              ? "bg-white text-[#0E4123] shadow-sm"
              : "bg-transparent text-[#6B7280]"
          }`}
          onClick={() => setFilter("stories")}
        >
          {tLearninghub("savedStories")}
          <span
            className={`text-xs font-[500] px-2 py-0.5 rounded-full ${
              filter === "stories"
                ? "bg-[#EBECF0] text-[#0E4123]"
                : "bg-[#EBECF0] text-[#334155]"
            }`}
          >
            {savedStories.length}
          </span>
        </motion.button>
      </motion.div>

      {/* Saved Lists */}
      <div className="w-auto px-6">
        {filter === "guides" && (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            key="guides"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            {filteredSavedGuides.length > 0 ? (
              filteredSavedGuides.map((guide) => (
                <GuideCard key={guide.id} {...guide} />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                  </svg>
                </div>
                <h3
                  className={`text-lg font-semibold text-gray-600 mb-2 ${
                    lang === "kh" ? "font-[Kantumruy_Pro]" : "font-inter"
                  }`}
                >
                  {searchText
                    ? tLearninghub("noSavedGuidesFound")
                    : tLearninghub("noSavedGuides")}
                </h3>
                <p
                  className={`text-gray-500 text-sm ${
                    lang === "kh" ? "font-[Kantumruy_Pro]" : "font-inter"
                  }`}
                >
                  {searchText
                    ? tLearninghub("tryAdjustingSearch")
                    : tLearninghub("startSavingGuides")}
                </p>
              </div>
            )}
          </motion.div>
        )}

        {filter === "stories" && (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            key="stories"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            {filteredSavedStories.length > 0 ? (
              filteredSavedStories.map((story) => (
                <StoriesCard key={story.id} {...story} />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
                <h3
                  className={`text-lg font-semibold text-gray-600 mb-2 ${
                    lang === "kh" ? "font-[Kantumruy_Pro]" : "font-inter"
                  }`}
                >
                  {searchText
                    ? tLearninghub("noSavedStoriesFound")
                    : tLearninghub("noSavedStories")}
                </h3>
                <p
                  className={`text-gray-500 text-sm ${
                    lang === "kh" ? "font-[Kantumruy_Pro]" : "font-inter"
                  }`}
                >
                  {searchText
                    ? tLearninghub("tryAdjustingSearch")
                    : tLearninghub("startSavingStories")}
                </p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

// Client Component Props Interface
interface LearningHubClientProps {
  initialGuides: Guide[];
  initialStories: Story[];
  tabParam?: string | null;
  error?: boolean;
}

// Main Client Component
const LearningHubClient: React.FC<LearningHubClientProps> = ({
  initialGuides,
  initialStories,
  tabParam,
  error = false,
}) => {
  const { tLearninghub, t, lang } = useTranslations();

  const [activeTab, setActiveTab] = useState<"guides" | "stories" | "saved">(
    "guides"
  );
  const [searchText, setSearchText] = useState("");
  const [allGuides, setAllGuides] = useState<Guide[]>(initialGuides);
  const [allStories, setAllStories] = useState<Story[]>(initialStories);
  const [guides, setGuides] = useState<Guide[]>(initialGuides);
  const [stories, setStories] = useState<Story[]>(initialStories);

  const [searchLoading, setSearchLoading] = useState(false);

  // Sync tab with URL param
  useEffect(() => {
    if (tabParam === "stories") setActiveTab("stories");
    else if (tabParam === "saved") setActiveTab("saved");
    else setActiveTab("guides");
  }, [tabParam]);

  // Initialize data from server props
  useEffect(() => {
    setAllGuides(initialGuides);
    setAllStories(initialStories);
    setGuides(initialGuides);
    setStories(initialStories);
  }, [initialGuides, initialStories]);

  // Search effect - only when search text changes
  useEffect(() => {
    if (!searchText.trim()) {
      setGuides(allGuides);
      setStories(allStories);
      setSearchLoading(false);
      return;
    }

    setSearchLoading(true);
    const timeoutId = setTimeout(async () => {
      try {
        if (activeTab === "guides") {
          setGuides(await searchGuides(searchText));
        } else if (activeTab === "stories") {
          setStories(await searchStories(searchText));
        }
      } catch (err) {
        console.error("Error searching:", err);
      } finally {
        setSearchLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchText, activeTab, allGuides, allStories]);

  const filteredGuides = guides.filter(
    (g) =>
      g.title.toLowerCase().includes(searchText.toLowerCase()) ||
      g.description.toLowerCase().includes(searchText.toLowerCase()) ||
      g.author.toLowerCase().includes(searchText.toLowerCase())
  );

  const filteredStories = stories.filter(
    (s) =>
      s.title.toLowerCase().includes(searchText.toLowerCase()) ||
      s.description.toLowerCase().includes(searchText.toLowerCase()) ||
      s.username.toLowerCase().includes(searchText.toLowerCase())
  );

  // Show error state if server fetching failed
  if (error) {
    return (
      <div className="flex flex-col items-center w-full mb-20">
        <TopBar />
        <div className="w-full max-w-7xl px-4 mt-6 text-center py-12">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3
            className={`text-lg font-semibold text-gray-600 mb-2 ${
              lang === "kh" ? "font-[Kantumruy_Pro]" : "font-inter"
            }`}
          >
            {tLearninghub("failedToLoad")}
          </h3>
          <p
            className={`text-gray-500 text-sm ${
              lang === "kh" ? "font-[Kantumruy_Pro]" : "font-inter"
            }`}
          >
            {tLearninghub("pleaseRefresh")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <SavedProvider>
      <div className="flex flex-col items-center w-full mb-20">
        <TopBar />
        <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
        <SearchFilter
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />

        {/* Search Loading State */}
        {searchLoading && (
          <div className="w-full max-w-7xl px-4 mt-6">
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0E4123] mx-auto mb-4"></div>
              <p
                className={`text-gray-600 ${
                  lang === "kh" ? "font-[Kantumruy_Pro]" : "font-inter"
                }`}
              >
                {tLearninghub("searching")}
              </p>
            </div>
          </div>
        )}

        {!searchLoading && (
          <>
            {activeTab === "guides" && (
              <GuideList guides={filteredGuides} searchText={searchText} />
            )}
            {activeTab === "stories" && (
              <StoriesList stories={filteredStories} />
            )}
            {activeTab === "saved" && <SavedTab searchText={searchText} />}
          </>
        )}
      </div>
    </SavedProvider>
  );
};

export default LearningHubClient;
