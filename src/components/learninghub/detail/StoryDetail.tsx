"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useSaved } from "../Saved/SavedContext";
import { motion } from "framer-motion";
import { getStoryById } from "../../../lib/api/stories";
import { Story } from "../../../lib/api/stories";
import { useTranslations } from "../../../lib/i18n";

const StoryDetail = () => {
  const params = useParams();
  const storyId = params?.id as string;
  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);
  const { tLearninghub, lang } = useTranslations();

  const { savedStories, toggleStory } = useSaved();
  const [isSaved, setIsSaved] = useState(false);
  const router = useRouter();

  // Navigate back to stories tab
  const handleBack = () => {
    router.push("/knowledge?tab=stories");
  };

  useEffect(() => {
    const fetchStory = async () => {
      if (storyId) {
        setLoading(true);
        const storyData = await getStoryById(storyId);
        setStory(storyData);
        setLoading(false);
      }
    };

    fetchStory();
  }, [storyId]);

  useEffect(() => {
    if (story) {
      setIsSaved(savedStories.some((s) => s.id === story.id));
    }
  }, [savedStories, story]);

  // Loading Skeleton Component
  const LoadingSkeleton = () => (
    <div className="min-h-screen bg-gray-50 py-8 ">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Skeleton */}
        <nav className="mb-6 animate-pulse">
          <div className="flex items-center space-x-2">
            <div className="h-4 bg-gray-200 rounded w-16"></div>
            <div className="h-4 bg-gray-200 rounded w-4"></div>
            <div className="h-4 bg-gray-200 rounded w-20"></div>
            <div className="h-4 bg-gray-200 rounded w-4"></div>
            <div className="h-4 bg-gray-200 rounded w-48"></div>
          </div>
        </nav>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* Header Skeleton */}
          <div className="p-6 border-b border-gray-100">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-12"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Cover Image Skeleton */}
          <div className="w-full h-64 sm:h-80 md:h-96 bg-gray-200"></div>

          {/* Content Skeleton */}
          <div className="p-6 space-y-4">
            {/* Content paragraphs */}
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded w-4/6"></div>
              </div>
            ))}

            {/* Steps section skeleton */}
            <div className="pt-4">
              <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex gap-4 items-start">
                    <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-32"></div>
                      <div className="h-3 bg-gray-200 rounded w-full"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tags section skeleton */}
            <div className="pt-4">
              <div className="h-4 bg-gray-200 rounded w-16 mb-3"></div>
              <div className="flex flex-wrap gap-2">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="w-16 h-6 bg-gray-200 rounded-full"
                  ></div>
                ))}
              </div>
            </div>

            {/* Resources section skeleton */}
            <div className="pt-4">
              <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
              <div className="space-y-3">
                {[...Array(2)].map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="w-10 h-10 bg-gray-200 rounded-lg mr-3"></div>
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action buttons skeleton */}
            <div className="pt-6 border-t border-gray-100 flex justify-between">
              <div className="w-32 h-10 bg-gray-200 rounded-lg"></div>
              <div className="w-24 h-10 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (!story) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
        <div className="text-center p-8 bg-white rounded-xl shadow-sm max-w-md w-full">
          <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-gray-100 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2 ">
            {tLearninghub("storyNotFound")}
          </h2>
          <p className="text-gray-600 mb-6 ">
            {tLearninghub("storyNotFoundDescription")}
          </p>
          <button
            onClick={handleBack}
            className="inline-flex items-center px-4 py-2 bg-[#0E4123] text-white rounded-lg hover:bg-[#0C351D] transition-colors"
          >
            {tLearninghub("backToStories")}
          </button>
        </div>
      </div>
    );
  }

  // Function to format read time based on language
  const formatReadTime = (readTime: string) => {
    if (lang === "kh") {
      return readTime
        .replace("min", "នាទី")
        .replace("mins", "នាទី")
        .replace("minute", "នាទី")
        .replace("minutes", "នាទី")
        .replace("read", "អាន")
        .replace("Read", "អាន");
    }
    return readTime;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gray-50 py-8 font-[Kantumruy_Pro] "
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <ol className="flex flex-wrap items-center text-sm text-gray-600 gap-y-1">
            <li>
              <Link href="/" className="hover:text-[#0E4123] transition-colors">
                {tLearninghub("home")}
              </Link>
            </li>
            <li className="flex items-center">
              <span className="mx-2">/</span>
              <button
                onClick={handleBack}
                className="hover:text-[#0E4123] transition-colors"
              >
                {tLearninghub("stories")}
              </button>
            </li>
            <li className="flex items-center">
              <span className="mx-2">/</span>
              <span
                className="text-[#0E4123] font-medium truncate block max-w-[150px] sm:max-w-xs md:max-w-sm lg:max-w-md "
                title={story.title}
              >
                {story.title}
              </span>
            </li>
          </ol>
        </nav>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-gray-100">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 ">
              {story.title}
            </h1>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                      <img
                        src={story.avatar_url}
                        alt={story.username}
                        className="w-8 h-8 object-cover"
                        onError={(e) => {
                          e.currentTarget.src =
                            "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiByeD0iMTYiIGZpbGw9IiNFRUVFRUUiLz4KPHBhdGggZD0iTTE2IDE2QzE3Ljc2NzEgMTYgMTkuMTQyOSAxNC42MjQzIDE5LjE0MjkgMTIuODU3MUMxOS4xNDI5IDExLjA5IDE3Ljc2NzEgOS43MTQyOSAxNiA5LjcxNDI5QzE0LjIzMjkgOS43MTQyOSAxMi44NTcxIDExLjA5IDEyLjg1NzEgMTIuODU3MUMxMi44NTcxIDE0LjYyNDMgMTQuMjMyOSAxNiAxNiAxNloiIGZpbGw9IiM5OTk5OTkiLz4KPHBhdGggZD0iTTE2IDE3LjZDMTMuMDk2IDE3LjYgMTAuNzE0MyAxOS45ODE3IDEwLjcxNDMgMjIuODg1N1YyNEMxMC43MTQzIDI0LjQ0MTQgMTEuMTU3MyAyNC44ODU3IDExLjYgMjQuODg1N0gyMC40QzIwLjg0MjcgMjQuODg1NyAyMS4yODU3IDI0LjQ0MTQgMjEuMjg1NyAyNFYyMi44ODU3QzIxLjI4NTcgMTkuOTgxNyAxOC45MDQgMTcuNiAxNiAxNy42WiIgZmlsbD0iIzk5OTk5OSIvPgo8L3N2Zz4K";
                        }}
                      />
                    </div>
                    <div>
                      <span className="font-medium text-gray-900 block ">
                        {story.username}
                      </span>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        <span>{story.location}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-gray-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <span>{story.date}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-gray-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>{formatReadTime(story.read_time)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Cover Image */}
          <div className="relative w-full h-64 sm:h-80 md:h-96">
            <img
              src={story.image_url}
              alt={story.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src =
                  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjRjNGNEY2Ii8+CjxyZWN0IHg9IjIwIiB5PSIyMCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRDFENUZCIi8+CjxjaXJjbGUgY3g9IjQwIiBjeT0iMzAiIHI9IjUiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTI1IDUwTDM1IDQwTDQ1IDQ1TDU1IDM1VjUwSDI1WiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K";
              }}
            />
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="prose max-w-none text-gray-700 mb-8 leading-relaxed">
              {story.content?.split("\n\n").map((para, index) => (
                <p key={index} className="mb-4">
                  {para}
                </p>
              ))}
            </div>

            {/* Steps */}
            {story.steps && story.steps.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100 ">
                  {tLearninghub("stepsToFollow")}
                </h2>
                <ol className="space-y-4">
                  {story.steps.map((step) => (
                    <li key={step.step} className="flex gap-4 items-start">
                      <div className="shrink-0 w-8 h-8 rounded-full bg-[#0E4123] text-white flex items-center justify-center font-medium">
                        {step.step}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 mb-1">
                          {step.title}
                        </h3>
                        <p className="text-gray-600 ">{step.detail}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Tags */}
            {story.tags && story.tags.length > 0 && (
              <div className="mb-8">
                <h3 className="text-sm font-medium text-gray-700 mb-3 ">
                  {tLearninghub("tags")}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {story.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-[#0E4123] hover:text-white transition-colors cursor-default"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Resources */}
            {story.resources && story.resources.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 ">
                  {tLearninghub("helpfulResources")}
                </h3>
                <div className="grid gap-3">
                  {story.resources.map((res) => (
                    <a
                      key={res.name}
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-[#0E4123] transition-colors group"
                    >
                      <div className="shrink-0 w-10 h-10 rounded-lg bg-[#0E4123] flex items-center justify-center mr-3">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                      </div>
                      <span className="font-medium text-gray-800 group-hover:text-[#0E4123] transition-colors ">
                        {res.name}
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Back Button & Save */}
            <div className="border-t border-gray-100 flex justify-between mt-4 pt-4">
              <button
                onClick={handleBack}
                className="inline-flex items-center px-5 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                {tLearninghub("backToStories")}
              </button>

              <motion.button
                onClick={() => toggleStory(story)}
                className={`inline-flex items-center px-5 py-2.5 rounded-lg transition-colors' ${
                  isSaved
                    ? "bg-[#0E4123] text-white hover:bg-[#0C351D]"
                    : "bg-white text-[#0E4123] border border-[#0E4123] hover:bg-[#0E4123] hover:text-white"
                }`}
                whileTap={{ scale: 0.95 }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                  />
                </svg>
                {isSaved ? tLearninghub("saved") : tLearninghub("save")}
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default StoryDetail;
