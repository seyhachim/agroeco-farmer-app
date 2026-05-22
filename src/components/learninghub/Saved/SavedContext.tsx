"use client";
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { Guide } from "../../../lib/api/guides";
import { Story } from "../../../lib/api/stories";
import { supabase } from "../../../lib/supabase";

interface SavedContextType {
  savedGuides: Guide[];
  savedStories: Story[];
  toggleGuide: (guide: Guide) => void;
  toggleStory: (story: Story) => void;
  userAvatar: string | null;
  loading: boolean;
  isGuideSaved: (guideId: string) => boolean;
  isStorySaved: (storyId: string) => boolean;
}

const SavedContext = createContext<SavedContextType | undefined>(undefined);

export const SavedProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [userId, setUserId] = useState<string | null>(null);
  const [savedGuides, setSavedGuides] = useState<Guide[]>([]);
  const [savedStories, setSavedStories] = useState<Story[]>([]);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Get user info
  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);

        // Fetch user avatar from user_profiles
        const { data: profile } = await supabase
          .from("user_profiles")
          .select("avatar_url")
          .eq("id", user.id)
          .single();
        if (profile) setUserAvatar(profile.avatar_url);
      } else {
        setLoading(false);
      }
    };
    getUser();
  }, []);

  // Fetch saved items from Supabase
  useEffect(() => {
    const fetchSavedItems = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        console.log("Fetching saved items for user:", userId);

        // Fetch saved items with their actual data
        const { data: savedItems, error } = await supabase
          .from("saved_items")
          .select("*")
          .eq("user_id", userId);

        if (error) {
          console.error("Error fetching saved items:", error);
          return;
        }

        console.log("Raw saved items from database:", savedItems);

        if (savedItems) {
          // Extract guide IDs and story IDs
          const guideIds = savedItems
            .filter((item) => item.item_type === "guide")
            .map((item) => item.item_id);

          const storyIds = savedItems
            .filter((item) => item.item_type === "story")
            .map((item) => item.item_id);

          console.log("Guide IDs found:", guideIds);
          console.log("Story IDs found:", storyIds);

          // Fetch actual guide data - USING guides_data table
          if (guideIds.length > 0) {
            const { data: guides, error: guidesError } = await supabase
              .from("guides_data")
              .select("*")
              .in("id", guideIds);

            console.log("Fetched guides:", guides);
            if (!guidesError && guides) {
              setSavedGuides(guides);
            } else {
              console.error("Error fetching guides:", guidesError);
              setSavedGuides([]);
            }
          } else {
            setSavedGuides([]);
          }

          // Fetch actual story data - USING stories_data table
          if (storyIds.length > 0) {
            const { data: stories, error: storiesError } = await supabase
              .from("stories_data")
              .select("*")
              .in("id", storyIds);

            console.log("Fetched stories:", stories);
            if (!storiesError && stories) {
              setSavedStories(stories);
            } else {
              console.error("Error fetching stories:", storiesError);
              setSavedStories([]);
            }
          } else {
            setSavedStories([]);
          }
        } else {
          setSavedGuides([]);
          setSavedStories([]);
        }
      } catch (error) {
        console.error("Error in fetchSavedItems:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSavedItems();
  }, [userId]);

  // Check if a guide is saved
  const isGuideSaved = (guideId: string): boolean => {
    return savedGuides.some((guide) => guide.id === guideId);
  };

  // Check if a story is saved
  const isStorySaved = (storyId: string): boolean => {
    return savedStories.some((story) => story.id === storyId);
  };

  const toggleGuide = async (guide: Guide) => {
    if (!userId) {
      alert("Please log in first");
      return;
    }

    const existing = savedGuides.find((g) => g.id === guide.id);

    if (existing) {
      // Remove from saved - DELETE FROM SUPABASE
      console.log("Removing guide from saved:", guide.id);
      const { error } = await supabase
        .from("saved_items")
        .delete()
        .eq("user_id", userId)
        .eq("item_id", guide.id)
        .eq("item_type", "guide");

      if (error) {
        console.error("Error removing guide from saved:", error);
        alert("Error removing guide from saved");
      } else {
        console.log("Successfully removed guide from saved_items table");
        setSavedGuides(savedGuides.filter((g) => g.id !== guide.id));
      }
    } else {
      // Add to saved
      console.log("Adding guide to saved:", guide.id);
      const { error } = await supabase.from("saved_items").insert({
        user_id: userId,
        item_id: guide.id,
        item_type: "guide",
      });

      if (error) {
        console.error("Error saving guide:", error);
        alert("Error saving guide");
      } else {
        console.log("Successfully saved guide to saved_items table");
        setSavedGuides([...savedGuides, guide]);
      }
    }
  };

  const toggleStory = async (story: Story) => {
    if (!userId) {
      alert("Please log in first");
      return;
    }

    const existing = savedStories.find((s) => s.id === story.id);

    if (existing) {
      // Remove from saved - DELETE FROM SUPABASE
      console.log("Removing story from saved:", story.id);
      const { error } = await supabase
        .from("saved_items")
        .delete()
        .eq("user_id", userId)
        .eq("item_id", story.id)
        .eq("item_type", "story");

      if (error) {
        console.error("Error removing story from saved:", error);
        alert("Error removing story from saved");
      } else {
        console.log("Successfully removed story from saved_items table");
        setSavedStories(savedStories.filter((s) => s.id !== story.id));
      }
    } else {
      // Add to saved
      console.log("Adding story to saved:", story.id);
      const { error } = await supabase.from("saved_items").insert({
        user_id: userId,
        item_id: story.id,
        item_type: "story",
      });

      if (error) {
        console.error("Error saving story:", error);
        alert("Error saving story");
      } else {
        console.log("Successfully saved story to saved_items table");
        setSavedStories([...savedStories, story]);
      }
    }
  };

  return (
    <SavedContext.Provider
      value={{
        savedGuides,
        savedStories,
        toggleGuide,
        toggleStory,
        userAvatar,
        loading,
        isGuideSaved,
        isStorySaved,
      }}
    >
      {children}
    </SavedContext.Provider>
  );
};

export const useSaved = () => {
  const context = useContext(SavedContext);
  if (!context) throw new Error("useSaved must be used within SavedProvider");
  return context;
};
