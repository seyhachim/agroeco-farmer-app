"use client";
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";

import Link from "next/link";
import { useSaved } from "../Saved/SavedContext";
import { motion } from "framer-motion";
import { getGuideById } from "../../../lib/api/guides";
import { Guide } from "../../../lib/api/guides";
import { useTranslations } from "../../../lib/i18n";

const GuideDetail = () => {
  const params = useParams();
  const guideId = params?.id as string;
  const [guide, setGuide] = useState<Guide | null>(null);
  const [loading, setLoading] = useState(true);
  const { t, tLearninghub, lang } = useTranslations();

  const { savedGuides, toggleGuide } = useSaved();
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const fetchGuide = async () => {
      if (guideId) {
        setLoading(true);
        const guideData = await getGuideById(guideId);
        setGuide(guideData);
        setLoading(false);
      }
    };

    fetchGuide();
  }, [guideId]);

  useEffect(() => {
    if (guide) {
      // compare by uuid instead of numeric id
      setIsSaved(savedGuides.some((g) => g.id === guide.id));
    }
  }, [savedGuides, guide]);

  // Loading Skeleton Component
  const LoadingSkeleton = () => (
    <div className="min-h-screen bg-gray-50 py-8 ">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Skeleton */}
        <div className="mb-6 animate-pulse">
          <div className="flex items-center space-x-2">
            <div className="h-4 bg-gray-200 rounded w-16"></div>
            <div className="h-4 bg-gray-200 rounded w-4"></div>
            <div className="h-4 bg-gray-200 rounded w-20"></div>
            <div className="h-4 bg-gray-200 rounded w-4"></div>
            <div className="h-4 bg-gray-200 rounded w-48"></div>
          </div>
        </div>

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
              <div className="h-6 bg-gray-200 rounded w-20"></div>
            </div>
          </div>

          {/* Cover Image Skeleton */}
          <div className="w-full h-64 sm:h-80 md:h-96 bg-gray-200 relative">
            <div className="absolute top-4 left-4 h-6 bg-gray-300 rounded w-16"></div>
          </div>

          {/* Content Skeleton */}
          <div className="p-6 space-y-4">
            {/* Content paragraphs */}
            {[...Array(5)].map((_, i) => (
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
                {[...Array(4)].map((_, i) => (
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

  if (!guide) {
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
            {tLearninghub("guideNotFound")}
          </h2>
          <p className="text-gray-600 mb-6 ">
            {tLearninghub("guideNotFoundDescription")}
          </p>
          <Link
            href="/knowledge"
            className="inline-flex items-center px-4 py-2 bg-[#0E4123] text-white rounded-lg hover:bg-[#0C351D] transition-colors"
          >
            {tLearninghub("backToGuides")}
          </Link>
        </div>
      </div>
    );
  }

  // Function to translate category
  const translateCategory = (category: string) => {
    const categoryMap: Record<string, Record<"en" | "kh", string>> = {
      "Soil & Compost": {
        en: "Soil & Compost",
        kh: "ដី និងជីកំប៉ុស",
      },
      Fertilizer: {
        en: "Fertilizer",
        kh: "ជី",
      },
      "Plant Care": {
        en: "Plant Care",
        kh: "ការថែរក្សាដំណាំ",
      },
      // Add more categories as needed
    };

    return categoryMap[category]?.[lang] || category;
  };

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
              <Link
                href="/knowledge"
                className="hover:text-[#0E4123] transition-colors"
              >
                {tLearninghub("guides")}
              </Link>
            </li>
            <li className="flex items-center">
              <span className="mx-2">/</span>
              <span
                className="text-[#0E4123] font-medium truncate block max-w-[150px] sm:max-w-xs md:max-w-sm lg:max-w-md "
                title={guide.title}
              >
                {guide.title}
              </span>
            </li>
          </ol>
        </nav>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-gray-100">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 ">
              {guide.title}
            </h1>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-gray-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <span className="font-medium ">
                    {tLearninghub("author")}: {guide.author}
                  </span>
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
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span>{guide.date}</span>
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
                  <span>{formatReadTime(guide.read_time)}</span>
                </div>
              </div>
              {guide.difficulty && (
                <span
                  className={`px-3 py-1 text-xs font-medium rounded-full ${
                    guide.difficulty === "Beginner"
                      ? "bg-green-100 text-green-800"
                      : guide.difficulty === "Intermediate"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {guide.difficulty}
                </span>
              )}
            </div>
          </div>

          {/* Cover Image */}
          <div className="relative w-full h-64 sm:h-80 md:h-96">
            <img
              src={guide.image_url}
              alt={translateCategory(guide.category)}
              className="w-full h-full object-cover"
            />
            <span className="absolute top-0 left-0 bg-[#0E4123] text-white px-3 py-1.5 rounded-lg text-sm font-medium shadow-md">
              {translateCategory(guide.category)}
            </span>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="prose max-w-none text-gray-700 mb-8 leading-relaxed">
              {guide.content.split("\n").map((paragraph, index) => (
                <p key={index} className="mb-4">
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Steps */}
            {guide.steps && guide.steps.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100 ">
                  {tLearninghub("stepsToFollow")}
                </h2>
                <ol className="space-y-4">
                  {guide.steps.map((step) => (
                    <li key={step.step} className="flex gap-4 items-start">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#0E4123] text-white flex items-center justify-center font-medium">
                        {step.step}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 mb-1 ">
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
            {guide.tags && guide.tags.length > 0 && (
              <div className="mb-8">
                <h3 className="text-sm font-medium text-gray-700 mb-3 ">
                  {tLearninghub("tags")}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {guide.tags.map((tag) => (
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

            {/* External Resources */}
            {guide.resources && guide.resources.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 ">
                  {tLearninghub("helpfulResources")}
                </h3>
                <div className="grid gap-3">
                  {guide.resources.map((res) => (
                    <a
                      key={res.name}
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-[#0E4123] transition-colors group"
                    >
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[#0E4123] flex items-center justify-center mr-3">
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
                      <span className="font-medium text-gray-800 group-hover:text-[#0E4123] transition-colors">
                        {res.name}
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Back Button and Save */}
            <div className="border-t border-gray-100 pt-6 flex justify-between">
              <Link
                href="/knowledge"
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
                {tLearninghub("backToGuides")}
              </Link>

              <button
                onClick={() => toggleGuide(guide)}
                className={`inline-flex items-center px-5 py-2.5 rounded-lg transition-colors" ${
                  isSaved
                    ? "bg-[#0E4123] text-white hover:bg-[#0C351D]"
                    : "bg-white text-[#0E4123] border border-[#0E4123] hover:bg-[#0E4123] hover:text-white"
                }`}
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
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default GuideDetail;
