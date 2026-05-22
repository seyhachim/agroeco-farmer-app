import React from "react";
import LearningHubClient from "./LearningHubClient";
import { getGuides, getStories } from "../../lib/api";
import { Kantumruy_Pro } from "next/font/google";

const kantumruyPro = Kantumruy_Pro({
  variable: "--font-kantumruy-pro",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});
interface PageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function Page({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const tabParam = resolvedParams.tab;

  try {
    const [guidesData, storiesData] = await Promise.all([
      getGuides(),
      getStories(),
    ]);

    return (
      <LearningHubClient
        initialGuides={guidesData}
        initialStories={storiesData}
        tabParam={tabParam}
      />
    );
  } catch (error) {
    console.error("Error fetching data in server component:", error);

    // Return error state to client component
    return (
      <LearningHubClient
        initialGuides={[]}
        initialStories={[]}
        tabParam={tabParam}
        error={true}
      />
    );
  }
}
