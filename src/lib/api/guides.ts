import { supabase } from "../supabase";

export interface Guide {
  id: string;
  category: string;
  title: string;
  description: string;
  content: string;
  author: string;
  date: string;
  read_time: string;
  image_url: string;
  tags?: string[];
  related_ids?: string[];
  difficulty?: "Beginner" | "Intermediate" | "Advanced";
  steps?: {
    step: number;
    title: string;
    detail: string;
    image?: string;
  }[];
  likes?: number;
  resources?: {
    name: string;
    url: string;
  }[];
  video_url?: string;
}

export const getGuides = async (): Promise<Guide[]> => {
  const { data, error } = await supabase
    .from("guides_data")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching guides:", error);
    return [];
  }

  return data || [];
};

export const getGuideById = async (id: string): Promise<Guide | null> => {
  const { data, error } = await supabase
    .from("guides_data")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching guide:", error);
    return null;
  }

  return data;
};

export const searchGuides = async (searchText: string): Promise<Guide[]> => {
  const { data, error } = await supabase
    .from("guides_data")
    .select("*")
    .or(
      `title.ilike.%${searchText}%,description.ilike.%${searchText}%,author.ilike.%${searchText}%`
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error searching guides:", error);
    return [];
  }

  return data || [];
};

export const getGuidesByCategory = async (
  category: string
): Promise<Guide[]> => {
  const { data, error } = await supabase
    .from("guides_data")
    .select("*")
    .eq("category", category)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching guides by category:", error);
    return [];
  }

  return data || [];
};
