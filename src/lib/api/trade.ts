import { supabase } from "../supabase";

// Define proper interfaces
interface UserProfile {
  id: string;
  display_name?: string;
  username?: string;
  avatar_url?: string;
}

interface TradeUser {
  name: string;
  avatar: string;
  points?: number;
  contributorLevel?: string;
}

export interface TradeRequest {
  id: string;
  from_user_id: string;
  to_user_id: string;
  product_id?: string;
  status: "pending" | "accepted" | "declined" | "completed";
  image_urls: string[];
  title: string;
  description: string;
  created_at: string;
  updated_at: string;
  from_user?: TradeUser;
  to_user?: TradeUser;
}

export interface CreateTradeRequest {
  to_user_display_name: string;
  title: string;
  description: string;
  image_urls?: string[];
}

export interface UpdateTradeRequest {
  status?: "pending" | "accepted" | "declined" | "completed";
  title?: string;
  description?: string;
  image_urls?: string[];
}

// Database trade request interface
interface DatabaseTradeRequest {
  id: string;
  from_user_id: string;
  to_user_id: string;
  product_id?: string;
  status: "pending" | "accepted" | "declined" | "completed";
  title: string;
  description: string;
  image_urls: string[];
  created_at: string;
  updated_at: string;
}

// Upload image function
export const uploadImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    console.log("Uploading image:", {
      name: file.name,
      size: file.size,
      type: file.type,
    });

    const response = await fetch(
      "https://r2uploader.ingjin50.workers.dev/upload",
      {
        method: "POST",
        body: formData,
      }
    );

    console.log("Upload response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Upload failed with status:", response.status, errorText);
      throw new Error(`Upload failed: ${response.status}`);
    }

    const responseText = await response.text();
    console.log("Raw response text:", responseText);

    let data: unknown;
    try {
      data = JSON.parse(responseText);
      console.log("Parsed response data:", data);
    } catch (parseError) {
      console.error("Failed to parse response as JSON:", parseError);
      throw new Error("Upload service returned invalid JSON");
    }

    const responseData = data as Record<string, unknown>;
    const imageUrl =
      responseData.url ||
      responseData.imageUrl ||
      responseData.fileUrl ||
      responseData.location ||
      responseData.path;

    if (!imageUrl || typeof imageUrl !== "string") {
      console.error("No URL found in response. Full response:", data);
      throw new Error(
        "No URL returned from upload service. Response: " + JSON.stringify(data)
      );
    }

    console.log("Upload successful, using URL:", imageUrl);
    return imageUrl;
  } catch (error) {
    console.error("Upload error:", error);
    throw new Error(
      "Failed to upload image: " +
        (error instanceof Error ? error.message : "Unknown error")
    );
  }
};

// Helper function to enrich trade requests with user data
const enrichTradeRequestsWithUserData = async (
  requests: DatabaseTradeRequest[]
): Promise<TradeRequest[]> => {
  if (!requests || requests.length === 0) return [];

  // Get all user IDs involved
  const userIds = new Set<string>();
  requests.forEach((request) => {
    userIds.add(request.from_user_id);
    userIds.add(request.to_user_id);
  });

  // Fetch user profiles
  const { data: userProfiles, error } = await supabase
    .from("user_profiles")
    .select("id, display_name, username, avatar_url")
    .in("id", Array.from(userIds));

  if (error) {
    console.error("Error fetching user profiles:", error);
    throw error;
  }

  // Create user map
  const userMap = new Map<string, UserProfile>();
  userProfiles?.forEach((profile) => {
    userMap.set(profile.id, profile);
  });

  // Transform requests
  return requests.map((request) => {
    const fromUser = userMap.get(request.from_user_id);
    const toUser = userMap.get(request.to_user_id);

    const enhancedRequest = {
      ...request,
      from_user: {
        name: fromUser?.display_name || fromUser?.username || "User",
        avatar: fromUser?.avatar_url || "/icons/learninghub/user_avatar.jpg",
        points: 650,
        contributorLevel: "Contributor",
      },
      to_user: {
        name: toUser?.display_name || toUser?.username || "User",
        avatar: toUser?.avatar_url || "/icons/learninghub/user_avatar.jpg",
      },
    };

    return tradeApi.transformTradeRequest(enhancedRequest);
  });
};

export const tradeApi = {
  // Create trade request
  async createTradeRequest(
    tradeData: CreateTradeRequest
  ): Promise<TradeRequest> {
    try {
      console.log("Starting trade request creation with data:", tradeData);

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error("Please sign in to send trade request");
      }

      // Get target user
      const { data: toUser, error: userError } = await supabase
        .from("user_profiles")
        .select("id, display_name, username, avatar_url")
        .eq("display_name", tradeData.to_user_display_name)
        .single();

      if (userError || !toUser) {
        throw new Error(`User "${tradeData.to_user_display_name}" not found`);
      }

      // Get current user info
      const { data: fromUser } = await supabase
        .from("user_profiles")
        .select("display_name, username, avatar_url")
        .eq("id", user.id)
        .single();

      // Prepare image URLs - ensure it's never undefined
      const imageUrls = tradeData.image_urls || [];
      console.log("Image URLs to be saved:", imageUrls);

      // Insert trade request
      const insertData = {
        from_user_id: user.id,
        to_user_id: toUser.id,
        title: tradeData.title,
        description: tradeData.description,
        image_urls: imageUrls,
        status: "pending",
      };

      console.log("Inserting trade request with data:", insertData);

      const { data: tradeRequest, error: insertError } = await supabase
        .from("trade_requests")
        .insert([insertData])
        .select()
        .single();

      if (insertError) {
        console.error("Insert error:", insertError);
        throw new Error(`Failed to create trade: ${insertError.message}`);
      }

      console.log("Trade request created successfully:", tradeRequest);

      // Manually create response with proper typing
      const response = {
        ...tradeRequest,
        from_user: {
          name: fromUser?.display_name || fromUser?.username || "You",
          avatar: fromUser?.avatar_url || "/icons/learninghub/user_avatar.jpg",
          points: 650,
          contributorLevel: "Contributor",
        },
        to_user: {
          name: toUser.display_name || toUser.username || "User",
          avatar: toUser.avatar_url || "/icons/learninghub/user_avatar.jpg",
        },
      };

      return this.transformTradeRequest(response);
    } catch (error) {
      console.error("Error in createTradeRequest:", error);
      throw error;
    }
  },

  // Create trade request with image uploads
  async createTradeRequestWithImages(
    tradeData: Omit<CreateTradeRequest, "image_urls">,
    images: File[]
  ): Promise<TradeRequest> {
    try {
      console.log("Starting trade creation with", images.length, "images");

      // Upload images first
      let imageUrls: string[] = [];
      if (images && images.length > 0) {
        console.log("Uploading images...");
        const uploadPromises = images.map((file) => uploadImage(file));
        imageUrls = await Promise.all(uploadPromises);
        console.log("All images uploaded successfully:", imageUrls);
      }

      // Create the trade request with uploaded image URLs
      const fullTradeData: CreateTradeRequest = {
        ...tradeData,
        image_urls: imageUrls,
      };

      return await this.createTradeRequest(fullTradeData);
    } catch (error) {
      console.error("Error in createTradeRequestWithImages:", error);
      throw error;
    }
  },

  // Get all trade requests for user - UPDATED FOR SERVER SAFETY
  async getAllUserRequests(): Promise<TradeRequest[]> {
    // Check if we're on the server (no window object)
    if (typeof window === "undefined") {
      console.log("Server context: Returning empty trades array");
      return [];
    }

    // Client context: Use the existing authentication logic
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new Error("Please sign in to view trade requests");
    }

    try {
      const { data: requests, error } = await supabase
        .from("trade_requests")
        .select("*")
        .or(`from_user_id.eq.${user.id},to_user_id.eq.${user.id}`)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return await enrichTradeRequestsWithUserData(requests || []);
    } catch (error) {
      console.error("Error fetching trade requests:", error);
      throw new Error("Failed to load trade requests");
    }
  },

  // Get incoming trade requests
  async getIncomingRequests(): Promise<TradeRequest[]> {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new Error("Please sign in to view trade requests");
    }

    const { data: requests, error } = await supabase
      .from("trade_requests")
      .select("*")
      .eq("to_user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return enrichTradeRequestsWithUserData(requests || []);
  },

  // Get outgoing trade requests
  async getOutgoingRequests(): Promise<TradeRequest[]> {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new Error("Please sign in to view trade requests");
    }

    const { data: requests, error } = await supabase
      .from("trade_requests")
      .select("*")
      .eq("from_user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return enrichTradeRequestsWithUserData(requests || []);
  },

  // Update trade request status
  async updateTradeStatus(
    requestId: string,
    status: "accepted" | "declined" | "completed"
  ): Promise<TradeRequest> {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new Error("Please sign in to update trade request");
    }

    const { data: tradeRequest, error } = await supabase
      .from("trade_requests")
      .update({
        status: status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", requestId)
      .select()
      .single();

    if (error) throw error;

    // Enrich with user data
    const enriched = await enrichTradeRequestsWithUserData([tradeRequest]);
    return enriched[0];
  },

  // Update trade request
  async updateTradeRequest(
    requestId: string,
    updates: UpdateTradeRequest
  ): Promise<TradeRequest> {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new Error("Please sign in to update trade request");
    }

    const { data: tradeRequest, error } = await supabase
      .from("trade_requests")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", requestId)
      .select()
      .single();

    if (error) throw error;

    // Enrich with user data
    const enriched = await enrichTradeRequestsWithUserData([tradeRequest]);
    return enriched[0];
  },

  // Delete trade request
  async deleteTradeRequest(requestId: string): Promise<void> {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new Error("Please sign in to delete trade request");
    }

    const { error } = await supabase
      .from("trade_requests")
      .delete()
      .eq("id", requestId)
      .eq("from_user_id", user.id);

    if (error) throw error;
  },

  // Get user's own trade posts
  async getMyTradePosts(): Promise<TradeRequest[]> {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new Error("Please sign in to view your trade posts");
    }

    const { data: requests, error } = await supabase
      .from("trade_requests")
      .select("*")
      .eq("from_user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return enrichTradeRequestsWithUserData(requests || []);
  },

  // Helper method to get current user
  async getCurrentUser() {
    return await supabase.auth.getUser();
  },

  // Helper function to transform trade request data
  transformTradeRequest(
    request: DatabaseTradeRequest & {
      from_user?: TradeUser;
      to_user?: TradeUser;
    }
  ): TradeRequest {
    return {
      id: request.id,
      from_user_id: request.from_user_id,
      to_user_id: request.to_user_id,
      product_id: request.product_id,
      status: request.status,
      title: request.title || "Trade Item",
      description: request.description || "",
      image_urls: request.image_urls || [],
      created_at: request.created_at,
      updated_at: request.updated_at,
      from_user: request.from_user || {
        name: "User",
        avatar: "/icons/learninghub/user_avatar.jpg",
        points: 650,
        contributorLevel: "Contributor",
      },
      to_user: request.to_user || {
        name: "User",
        avatar: "/icons/learninghub/user_avatar.jpg",
      },
    };
  },
};
