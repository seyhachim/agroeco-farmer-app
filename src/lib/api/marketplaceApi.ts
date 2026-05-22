import { supabase } from "../supabase";

export interface Product {
  id: string;
  user_id: string;
  title: string;
  description: string;
  price: number | null;
  old_price: number | null;
  discount: string | null;
  category: string | null;
  certification: string | null;
  location: string;
  is_best_seller: boolean;
  type: "shop" | "trade";
  rating: number;
  review_count: number;
  posted_at: string;
  created_at: string;
  updated_at: string;
  images: string[];
  seller?: {
    name: string;
    avatar: string;
    points: number;
    contributorLevel: string;
  };
}

export interface CreateProductData {
  title: string;
  description: string;
  price?: number | null;
  old_price?: number | null;
  discount?: string | null;
  category?: string | null;
  certification?: string | null;
  location: string;
  is_best_seller?: boolean;
  type: "shop" | "trade";
  trade_item?: string | null;
  desired_item?: string | null;
  trade_condition?: string | null;
}

interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  image_order: number;
  created_at: string;
}

export const marketplaceApi = {
  // Upload images function
  async uploadImages(files: File[]): Promise<string[]> {
    const uploadPromises = files.map(async (file) => {
      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await fetch(
          "https://r2uploader.ingjin50.workers.dev/upload",
          {
            method: "POST",
            body: formData,
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Upload failed:", response.status, errorText);
          throw new Error(`Upload failed: ${response.status}`);
        }

        const data = await response.json();

        let imageUrl: string | null = null;

        if (data.url) {
          imageUrl = data.url.startsWith("http")
            ? data.url
            : `https://kh-products.ingjin50.workers.dev/${data.url}`;
        } else if (data.imageUrl) {
          imageUrl = data.imageUrl.startsWith("http")
            ? data.imageUrl
            : `https://kh-products.ingjin50.workers.dev/${data.imageUrl}`;
        } else if (data.imageURL) {
          imageUrl = data.imageURL.startsWith("http")
            ? data.imageURL
            : `https://kh-products.ingjin50.workers.dev/${data.imageURL}`;
        } else if (data.key) {
          imageUrl = `https://kh-products.ingjin50.workers.dev/${data.key}`;
        }

        if (!imageUrl) {
          console.error("No valid image URL found:", data);
          throw new Error("No valid image URL returned");
        }

        console.log("Upload successful:", imageUrl);
        return imageUrl;
      } catch (error) {
        console.error("Upload error:", file.name, error);
        const placeholderUrl =
          "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjRjNGNEY2Ii8+CjxyZWN0IHg9IjIwIiB5PSIyMCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRDFENUZCIi8+CjxjaXJjbGUgY3g9IjQwIiBjeT0iMzAiIHI9IjUiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTI1IDUwTDM1IDQwTDQ1IDQ1TDU1IDM1VjUwSDI1WiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K";
        console.log("Using placeholder:", placeholderUrl);
        return placeholderUrl;
      }
    });

    return Promise.all(uploadPromises);
  },

  // Delete images from storage
  async deleteImages(imageUrls: string[]): Promise<void> {
    if (!imageUrls || imageUrls.length === 0) return;

    console.log("Attempting to delete images:", imageUrls);

    const deletePromises = imageUrls.map(async (imageUrl) => {
      try {
        // Skip placeholder images or invalid URLs
        if (
          imageUrl.includes("placeholder.svg") ||
          !imageUrl.startsWith("http")
        ) {
          console.log(
            "Skipping deletion of placeholder or invalid URL:",
            imageUrl
          );
          return;
        }

        // Extract the filename from the URL - handle different URL formats
        let filename: string | null = null;

        // Try different URL patterns
        if (imageUrl.includes("kh-products.ingjin50.workers.dev/")) {
          filename =
            imageUrl.split("kh-products.ingjin50.workers.dev/").pop() || null;
        } else if (imageUrl.includes("r2uploader.ingjin50.workers.dev/")) {
          filename =
            imageUrl.split("r2uploader.ingjin50.workers.dev/").pop() || null;
        } else {
          // Fallback: just get the last part of the URL
          filename = imageUrl.split("/").pop() || null;
        }

        if (!filename) {
          console.warn("Could not extract filename from URL:", imageUrl);
          return;
        }

        // Clean up filename - remove any query parameters
        filename = filename.split("?")[0];

        console.log("Extracted filename for deletion:", filename);

        // Call the delete endpoint
        const response = await fetch(
          "https://r2uploader.ingjin50.workers.dev/delete",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ filename }),
          }
        );

        if (!response.ok) {
          // Don't throw error for 404 - file might already be deleted
          if (response.status === 404) {
            console.log("Image not found (already deleted?):", filename);
          } else {
            console.error(
              "Delete failed for:",
              filename,
              "Status:",
              response.status
            );
            // Try to get error details
            try {
              const errorText = await response.text();
              console.error("Delete error details:", errorText);
            } catch (e) {
              console.error("Could not read error response");
            }
          }
        } else {
          console.log("Successfully deleted image:", filename);
        }
      } catch (error) {
        console.error("Error deleting image:", imageUrl, error);
        // Don't throw - continue with other deletions
      }
    });

    await Promise.all(deletePromises);
    console.log("Image deletion process completed");
  },

  // Get user display name and avatar from user_profiles
  async getUserDisplayName(
    userId: string
  ): Promise<{ name: string; avatar: string }> {
    try {
      const { data: userProfile, error } = await supabase
        .from("user_profiles")
        .select("display_name, username, avatar_url")
        .eq("id", userId)
        .single();

      if (error) {
        console.log("No user profile found for:", userId);
        return {
          name: "Seller",
          avatar:
            "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iMjAiIGZpbGw9IiNFRUVFRUUiLz4KPHBhdGggZD0iTTIwIDIwQzIyLjIwOTEgMjAgMjQgMTguMjA5MSAyNCAxNkMyNCAxMy43OTA5IDIyLjIwOTEgMTIgMjAgMTJDMTcuNzkwOSAxMiAxNiAxMy43OTA5IDE2IDE2QzE2IDE4LjIwOTEgMTcuNzkwOSAyMCAyMCAyMFoiIGZpbGw9IiM5OTk5OTkiLz4KPHBhdGggZD0iTTIwIDIyQzE2LjY3IDIyIDE0IDI0LjY3IDE0IDI4VjMwQzE0IDMwLjU1MjMgMTQuNDQ3NyAzMSAxNSAzMUgyNUMxNS41NTIzIDMxIDE2IDMwLjU1MjMgMTYgMzBWMjhDMTYgMjQuNjcgMTguNjcgMjIgMjIgMjJaIiBmaWxsPSIjOTk5OTk5Ii8+Cjwvc3ZnPgo=",
        };
      }

      return {
        name: userProfile.display_name || userProfile.username || "Seller",
        avatar:
          userProfile.avatar_url ||
          "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iMjAiIGZpbGw9IiNFRUVFRUUiLz4KPHBhdGggZD0iTTIwIDIwQzIyLjIwOTEgMjAgMjQgMTguMjA5MSAyNCAxNkMyNCAxMy43OTA5IDIyLjIwOTEgMTIgMjAgMTJDMTcuNzkwOSAxMiAxNiAxMy43OTA5IDE2IDE2QzE2IDE4LjIwOTEgMTcuNzkwOSAyMCAyMCAyMFoiIGZpbGw9IiM5OTk5OTkiLz4KPHBhdGggZD0iTTIwIDIyQzE2LjY3IDIyIDE0IDI0LjY3IDE0IDI4VjMwQzE0IDMwLjU1MjMgMTQuNDQ3NyAzMSAxNSAzMUgyNUMxNS41NTIzIDMxIDE2IDMwLjU1MjMgMTYgMzBWMjhDMTYgMjQuNjcgMTguNjcgMjIgMjIgMjJaIiBmaWxsPSIjOTk5OTk5Ii8+Cjwvc3ZnPgo=",
      };
    } catch (error) {
      console.error("Error getting user display name:", error);
      return {
        name: "Seller",
        avatar:
          "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iMjAiIGZpbGw9IiNFRUVFRUUiLz4KPHBhdGggZD0iTTIwIDIwQzIyLjIwOTEgMjAgMjQgMTguMjA5MSAyNCAxNkMyNCAxMy43OTA5IDIyLjIwOTEgMTIgMjAgMTJDMTcuNzkwOSAxMiAxNiAxMy43OTA5IDE2IDE2QzE2IDE4LjIwOTEgMTcuNzkwOSAyMCAyMCAyMFoiIGZpbGw9IiM5OTk5OTkiLz4KPHBhdGggZD0iTTIwIDIyQzE2LjY3IDIyIDE0IDI0LjY3IDE0IDI4VjMwQzE0IDMwLjU1MjMgMTQuNDQ3NyAzMSAxNSAzMUgyNUMxNS41NTIzIDMxIDE2IDMwLjU1MjMgMTYgMzBWMjhDMTYgMjQuNjcgMTguNjcgMjIgMjIgMjJaIiBmaWxsPSIjOTk5OTk5Ii8+Cjwvc3ZnPgo=",
      };
    }
  },

  // Create product with images
  async createProduct(
    productData: CreateProductData,
    images: File[]
  ): Promise<Product> {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error("Please sign in to create a post");
    }

    let imageUrls: string[] = [];

    try {
      // Upload images first
      if (images && images.length > 0) {
        console.log("Starting image upload for", images.length, "images");
        imageUrls = await this.uploadImages(images);
        console.log("Image upload completed, URLs:", imageUrls);
      } else {
        imageUrls = [
          "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjRjNGNEY2Ii8+CjxyZWN0IHg9IjIwIiB5PSIyMCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRDFENUZCIi8+CjxjaXJjbGUgY3g9IjQwIiBjeT0iMzAiIHI9IjUiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTI1IDUwTDM1IDQwTDQ1IDQ1TDU1IDM1VjUwSDI1WiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K",
        ];
        console.log("No images provided, using placeholder");
      }

      // Validate image URLs
      const validImageUrls = imageUrls.filter(
        (url) => url && url.trim() !== ""
      );
      if (validImageUrls.length === 0) {
        validImageUrls.push(
          "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjRjNGNEY2Ii8+CjxyZWN0IHg9IjIwIiB5PSIyMCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRDFENUZCIi8+CjxjaXJjbGUgY3g9IjQwIiBjeT0iMzAiIHI9IjUiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTI1IDUwTDM1IDQwTDQ1IDQ1TDU1IDM1VjUwSDI1WiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K"
        );
        console.log("No valid image URLs, using placeholder");
      }

      console.log("Final image URLs:", validImageUrls);

      // Create product
      console.log("Creating product with data:", {
        ...productData,
        user_id: user.id,
      });

      const { data: product, error: productError } = await supabase
        .from("products")
        .insert([{ ...productData, user_id: user.id }])
        .select()
        .single();

      if (productError) {
        console.error("Product creation error:", productError);
        throw productError;
      }

      console.log("Product created:", product.id);

      // Create product images
      const imageRecords = validImageUrls.map((url, index) => ({
        product_id: product.id,
        image_url: url,
        image_order: index,
      }));

      console.log("Creating image records:", imageRecords);
      const { error: imagesError } = await supabase
        .from("product_images")
        .insert(imageRecords);

      if (imagesError) {
        console.error("Image records creation error:", imagesError);
        // Rollback: delete the product if image creation fails
        await supabase.from("products").delete().eq("id", product.id);
        throw imagesError;
      }

      console.log("Product and images created successfully");
      const createdProduct = await this.getProductById(product.id);
      if (!createdProduct) {
        throw new Error("Failed to retrieve created product");
      }
      return createdProduct;
    } catch (error) {
      console.error("Error in createProduct:", error);
      throw error;
    }
  },

  // Update product with image deletion support
  async updateProduct(
    productId: string,
    productData: Partial<CreateProductData>,
    newImages?: File[],
    imagesToDelete?: string[]
  ): Promise<Product> {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error("Please sign in to update a post");
    }

    try {
      // Update product
      const { error: productError } = await supabase
        .from("products")
        .update({ ...productData, updated_at: new Date().toISOString() })
        .eq("id", productId)
        .eq("user_id", user.id);

      if (productError) throw productError;

      // Handle image deletion if specified
      if (imagesToDelete && imagesToDelete.length > 0) {
        console.log("Deleting specified images from database:", imagesToDelete);

        // Delete from database first
        const { error: deleteError } = await supabase
          .from("product_images")
          .delete()
          .eq("product_id", productId)
          .in("image_url", imagesToDelete);

        if (deleteError) {
          console.error("Error deleting images from database:", deleteError);
          throw deleteError;
        }

        console.log(" Images deleted from database");

        // Delete from storage (don't await - run in background)
        this.deleteImages(imagesToDelete).catch((error) => {
          console.error(" Background image deletion failed:", error);
          // Continue even if storage deletion fails
        });
      }

      // Handle new image uploads if provided
      if (newImages && newImages.length > 0) {
        let imageUrls: string[] = [];

        try {
          console.log(" Uploading new images:", newImages.length);
          imageUrls = await this.uploadImages(newImages);
        } catch (uploadError) {
          console.error(" Image upload failed:", uploadError);
          imageUrls = [
            "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjRjNGNEY2Ii8+CjxyZWN0IHg9IjIwIiB5PSIyMCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRDFENUZCIi8+CjxjaXJjbGUgY3g9IjQwIiBjeT0iMzAiIHI9IjUiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTI1IDUwTDM1IDQwTDQ1IDQ1TDU1IDM1VjUwSDI1WiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K",
          ];
        }

        // Validate image URLs
        const validImageUrls = imageUrls.filter(
          (url) => url && url.trim() !== ""
        );
        if (validImageUrls.length === 0) {
          validImageUrls.push(
            "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjRjNGNEY2Ii8+CjxyZWN0IHg9IjIwIiB5PSIyMCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRDFENUZCIi8+CjxjaXJjbGUgY3g9IjQwIiBjeT0iMzAiIHI9IjUiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTI1IDUwTDM1IDQwTDQ1IDQ1TDU1IDM1VjUwSDI1WiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K"
          );
        }

        // Get current highest image order to append new images
        const { data: currentImages } = await supabase
          .from("product_images")
          .select("image_order")
          .eq("product_id", productId)
          .order("image_order", { ascending: false })
          .limit(1);

        const startOrder =
          currentImages && currentImages.length > 0
            ? currentImages[0].image_order + 1
            : 0;

        // Create new image records
        const imageRecords = validImageUrls.map((url, index) => ({
          product_id: productId,
          image_url: url,
          image_order: startOrder + index,
        }));

        console.log(" Adding new image records:", imageRecords);
        const { error: imagesError } = await supabase
          .from("product_images")
          .insert(imageRecords);

        if (imagesError) throw imagesError;
      }

      const updatedProduct = await this.getProductById(productId);
      if (!updatedProduct) {
        throw new Error("Failed to retrieve updated product");
      }
      return updatedProduct;
    } catch (error) {
      console.error(" Error in updateProduct:", error);
      throw error;
    }
  },
  async calculateBestSellerStatus(productId: string): Promise<boolean> {
    try {
      // Get all reviews for the product
      const { data: reviews, error } = await supabase
        .from("reviews")
        .select("rating")
        .eq("product_id", productId);

      if (error) {
        console.error("Error fetching reviews:", error);
        return false;
      }

      const reviewCount = reviews?.length || 0;

      // Check if product has more than 2 reviews
      if (reviewCount < 3) {
        // Not enough reviews, ensure it's not marked as best seller
        const { error: updateError } = await supabase
          .from("products")
          .update({ is_best_seller: false })
          .eq("id", productId);

        if (updateError) {
          console.error("Error updating best seller status:", updateError);
        }
        return false;
      }

      // Calculate average rating
      const totalRating =
        reviews?.reduce((sum, review) => sum + review.rating, 0) || 0;
      const averageRating = totalRating / reviewCount;

      console.log(
        `Product ${productId}: ${reviewCount} reviews, average rating: ${averageRating.toFixed(
          2
        )}`
      );

      // Mark as best seller if more than 3 reviews AND average rating >= 3.5
      const isBestSeller = reviewCount >= 4 && averageRating >= 3.5;

      // Update the product's best seller status in the database
      const { error: updateError } = await supabase
        .from("products")
        .update({
          is_best_seller: isBestSeller,
          rating: Math.round(averageRating * 10) / 10, // Update rating too
          review_count: reviewCount,
        })
        .eq("id", productId);

      if (updateError) {
        console.error("Error updating best seller status:", updateError);
      }

      console.log(`Product ${productId} best seller status: ${isBestSeller}`);
      return isBestSeller;
    } catch (error) {
      console.error("Error in calculateBestSellerStatus:", error);
      return false;
    }
  },
  // Get all products with images
  async getProducts(filters?: {
    type?: "shop" | "trade";
    category?: string[];
    certification?: string[];
    minPrice?: number;
    maxPrice?: number;
    location?: string;
    search?: string;
  }): Promise<Product[]> {
    try {
      console.log(" Getting products with filters:", filters);

      // Simple query - just get products
      let query = supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      // Apply filters
      if (filters?.type) {
        query = query.eq("type", filters.type);
      }

      if (
        filters?.category &&
        filters.category.length > 0 &&
        !filters.category.includes("All")
      ) {
        query = query.in("category", filters.category);
      }

      if (
        filters?.certification &&
        filters.certification.length > 0 &&
        !filters.certification.includes("All")
      ) {
        query = query.in("certification", filters.certification);
      }

      if (filters?.minPrice) {
        query = query.gte("price", filters.minPrice);
      }

      if (filters?.maxPrice) {
        query = query.lte("price", filters.maxPrice);
      }

      if (filters?.location) {
        query = query.ilike("location", `%${filters.location}%`);
      }

      if (filters?.search) {
        query = query.or(
          `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
        );
      }

      const { data: products, error } = await query;

      if (error) {
        console.error(" Products query error:", error);
        throw error;
      }

      console.log(" Products loaded:", products?.length || 0);

      if (!products || products.length === 0) {
        return [];
      }

      // Calculate best seller status for all products
      const productsWithBestSellerStatus = await Promise.all(
        products.map(async (product) => {
          const isBestSeller = await this.calculateBestSellerStatus(product.id);
          return {
            ...product,
            is_best_seller: isBestSeller,
          };
        })
      );

      // Get images for all products
      const productIds = productsWithBestSellerStatus.map((p) => p.id);
      const { data: productImages } = await supabase
        .from("product_images")
        .select("*")
        .in("product_id", productIds);

      // Create a map of product_id to images
      const imagesMap = new Map<string, ProductImage[]>();
      productImages?.forEach((img) => {
        if (!imagesMap.has(img.product_id)) {
          imagesMap.set(img.product_id, []);
        }
        imagesMap.get(img.product_id)!.push(img);
      });

      // Get user display names and avatars for all products
      const userInfos = await Promise.all(
        productsWithBestSellerStatus.map((product) =>
          this.getUserDisplayName(product.user_id)
        )
      );

      // Transform data with user info
      return productsWithBestSellerStatus.map((product, index) => {
        const productImgs = imagesMap.get(product.id) || [];
        const sortedImages = productImgs.sort(
          (a, b) => a.image_order - b.image_order
        );
        const userInfo = userInfos[index];

        return {
          ...product,
          images:
            sortedImages.length > 0
              ? sortedImages.map((img) => img.image_url)
              : [
                  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjRjNGNEY2Ii8+CjxyZWN0IHg9IjIwIiB5PSIyMCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRDFENUZCIi8+CjxjaXJjbGUgY3g9IjQwIiBjeT0iMzAiIHI9IjUiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTI1IDUwTDM1IDQwTDQ1IDQ1TDU1IDM1VjUwSDI1WiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K",
                ],
          seller: {
            name: userInfo.name,
            avatar: userInfo.avatar,
            points: 650,
            contributorLevel: "Contributor",
          },
        };
      });
    } catch (error) {
      console.error(" Error in getProducts:", error);
      throw error;
    }
  },

  // Get product by ID
  async getProductById(id: string): Promise<Product | null> {
    try {
      console.log(" Getting product by ID:", id);

      // Get product
      const { data: product, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error(" Product not found:", error);
        return null;
      }

      console.log(" Product found:", product.title);

      // Get product images
      const { data: productImages } = await supabase
        .from("product_images")
        .select("*")
        .eq("product_id", id)
        .order("image_order", { ascending: true });

      // Get user display name and avatar
      const userInfo = await this.getUserDisplayName(product.user_id);

      console.log("User display name:", userInfo.name);

      return {
        ...product,
        images:
          productImages && productImages.length > 0
            ? productImages.map((img) => img.image_url)
            : [
                "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjRjNGNEY2Ii8+CjxyZWN0IHg9IjIwIiB5PSIyMCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRDFENUZCIi8+CjxjaXJjbGUgY3g9IjQwIiBjeT0iMzAiIHI9IjUiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTI1IDUwTDM1IDQwTDQ1IDQ1TDU1IDM1VjUwSDI1WiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K",
              ],
        seller: {
          name: userInfo.name,
          avatar: userInfo.avatar,
          points: 650,
          contributorLevel: "Top Contributor",
        },
      };
    } catch (error) {
      console.error(" Error in getProductById:", error);
      return null;
    }
  },

  // Get user's products
  async getUserProducts(): Promise<Product[]> {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error("Please sign in to view your posts");
      }

      console.log(" Getting user products for:", user.id);

      const { data: products, error } = await supabase
        .from("products")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error(" User products query error:", error);
        throw error;
      }

      console.log(" User products loaded:", products?.length || 0);

      if (!products || products.length === 0) {
        return [];
      }

      // Get images for user's products
      const productIds = products.map((p) => p.id);
      const { data: productImages } = await supabase
        .from("product_images")
        .select("*")
        .in("product_id", productIds);

      // Create a map of product_id to images
      const imagesMap = new Map<string, ProductImage[]>();
      productImages?.forEach((img) => {
        if (!imagesMap.has(img.product_id)) {
          imagesMap.set(img.product_id, []);
        }
        imagesMap.get(img.product_id)!.push(img);
      });

      // Get current user's info for the avatar
      const userInfo = await this.getUserDisplayName(user.id);

      return products.map((product) => {
        const productImgs = imagesMap.get(product.id) || [];
        const sortedImages = productImgs.sort(
          (a, b) => a.image_order - b.image_order
        );

        return {
          ...product,
          images:
            sortedImages.length > 0
              ? sortedImages.map((img) => img.image_url)
              : [
                  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjRjNGNEY2Ii8+CjxyZWN0IHg9IjIwIiB5PSIyMCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRDFENUZCIi8+CjxjaXJjbGUgY3g9IjQwIiBjeT0iMzAiIHI9IjUiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTI1IDUwTDM1IDQwTDQ1IDQ1TDU1IDM1VjUwSDI1WiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K",
                ],
          seller: {
            name: "You",
            avatar: userInfo.avatar,
            points: 650,
            contributorLevel: "Contributor",
          },
        };
      });
    } catch (error) {
      console.error(" Error in getUserProducts:", error);
      throw error;
    }
  },

  // Get best seller products
  async getBestSellers(): Promise<Product[]> {
    try {
      console.log(" Getting best sellers...");

      // First get all products and calculate best seller status
      const allProducts = await this.getProducts({ type: "shop" });

      // Filter products that are marked as best sellers
      const bestSellers = allProducts.filter(
        (product) => product.is_best_seller
      );

      console.log(" Best sellers loaded:", bestSellers.length);

      return bestSellers;
    } catch (error) {
      console.error(" Error in getBestSellers:", error);
      throw error;
    }
  },

  // Delete product
  async deleteProduct(productId: string): Promise<void> {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error("Please sign in to delete a post");
      }

      console.log(" Deleting product:", productId);

      // First get product images to delete from storage
      const { data: productImages } = await supabase
        .from("product_images")
        .select("image_url")
        .eq("product_id", productId);

      // Delete product (this will cascade delete product_images due to foreign key)
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", productId)
        .eq("user_id", user.id);

      if (error) {
        console.error(" Delete product error:", error);
        throw error;
      }

      // Delete images from storage in background (don't block the main operation)
      if (productImages && productImages.length > 0) {
        const imageUrls = productImages.map((img) => img.image_url);
        this.deleteImages(imageUrls).catch((error) => {
          console.error(" Background image deletion failed:", error);
        });
      }

      console.log(" Product deleted successfully");
    } catch (error) {
      console.error(" Error in deleteProduct:", error);
      throw error;
    }
  },
  async getRatingDistribution(productId: string): Promise<number[]> {
    try {
      const { data: reviews, error } = await supabase
        .from("reviews")
        .select("rating")
        .eq("product_id", productId);

      if (error) throw error;

      if (!reviews || reviews.length === 0) {
        return [0, 0, 0, 0, 0]; // [5-star, 4-star, 3-star, 2-star, 1-star]
      }

      const distribution = [0, 0, 0, 0, 0]; // 5 to 1 stars

      reviews.forEach((review) => {
        const starIndex = 5 - Math.floor(review.rating); // Convert rating to index
        if (starIndex >= 0 && starIndex < 5) {
          distribution[starIndex]++;
        }
      });

      return distribution;
    } catch (error) {
      console.error("Error getting rating distribution:", error);
      return [0, 0, 0, 0, 0];
    }
  },

  // Get product with enhanced rating info
  async getProductByIdWithReviews(
    id: string
  ): Promise<(Product & { ratingDistribution: number[] }) | null> {
    try {
      const product = await this.getProductById(id);
      if (!product) return null;

      const ratingDistribution = await this.getRatingDistribution(id);

      return {
        ...product,
        ratingDistribution,
      };
    } catch (error) {
      console.error("Error getting product with reviews:", error);
      return null;
    }
  },
};
