import { supabase } from "../supabase";

export interface Story {
  id: string;
  image_url: string;
  avatar_url: string;
  username: string;
  location: string;
  title: string;
  description: string;
  likes_count: number;
  date: string;
  read_time: string;
  content?: string;
  steps?: { step: number; title: string; detail: string }[];
  tags?: string[];
  resources?: { name: string; url: string }[];
}

export const getStories = async (): Promise<Story[]> => {
  const { data, error } = await supabase
    .from("stories_data")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching stories:", error);
    return [];
  }

  return data || [];
};

export const getStoryById = async (id: string): Promise<Story | null> => {
  const { data, error } = await supabase
    .from("stories_data")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching story:", error);
    return null;
  }

  return data;
};

export const searchStories = async (searchText: string): Promise<Story[]> => {
  const { data, error } = await supabase
    .from("stories_data")
    .select("*")
    .or(
      `title.ilike.%${searchText}%,description.ilike.%${searchText}%,username.ilike.%${searchText}%`
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error searching stories:", error);
    return [];
  }

  return data || [];
};
