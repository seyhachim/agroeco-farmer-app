"use client";
import React from "react";
import { StoriesCard } from "./StoriesCard";
import { Story } from "../../../lib/api/stories";
import { useTranslations } from "../../../lib/i18n";

interface StoriesListProps {
  stories?: Story[];
}

const StoriesList: React.FC<StoriesListProps> = ({ stories }) => {
  const { tLearninghub, lang } = useTranslations();

  if (!stories || stories.length === 0) {
    return (
      <p
        className={`text-gray-500 text-center mt-4 ${
          lang === "kh" ? "font-[Kantumruy_Pro]" : "font-inter"
        }`}
      >
        {tLearninghub("noStoriesFound")}
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {stories.map((story) => (
        <StoriesCard key={story.id} {...story} />
      ))}
    </div>
  );
};

export default StoriesList;
