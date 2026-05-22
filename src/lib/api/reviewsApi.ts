// lib/api/reviewsApi.ts - UPDATED WITH BEST SELLER LOGIC
import { supabase } from "../supabase";
import { marketplaceApi } from "./marketplaceApi";

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  comment: string;
  created_at: string;
  updated_at: string;
  user?: {
    name: string;
    avatar: string;
    verified: boolean;
  };
  images?: string[];
}

export interface CreateReviewData {
  product_id: string;
  rating: number;
  comment: string;
  images?: File[];
  existing_image_urls?: string[];
}

export const reviewsApi = {
  // Get reviews for a product
  async getProductReviews(productId: string): Promise<Review[]> {
    try {
      const { data: reviews, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("product_id", productId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (!reviews || reviews.length === 0) {
        return [];
      }

      // Get user information for reviews
      const userIds = [...new Set(reviews.map((review) => review.user_id))];

      // Get user profiles
      const { data: userProfiles } = await supabase
        .from("user_profiles")
        .select("id, display_name, username, avatar_url")
        .in("id", userIds);

      const userMap = new Map();
      userProfiles?.forEach((profile) => {
        userMap.set(profile.id, {
          name: profile.display_name || profile.username || "User",
          avatar: profile.avatar_url || this.getDefaultAvatar(),
          verified: true,
        });
      });

      // Get review images
      const { data: reviewImages } = await supabase
        .from("review_images")
        .select("review_id, image_url")
        .in(
          "review_id",
          reviews.map((review) => review.id)
        );

      const imagesMap = new Map();
      reviewImages?.forEach((img) => {
        if (!imagesMap.has(img.review_id)) {
          imagesMap.set(img.review_id, []);
        }
        imagesMap.get(img.review_id).push(img.image_url);
      });

      return reviews.map((review) => ({
        ...review,
        user: userMap.get(review.user_id),
        images: imagesMap.get(review.id) || [],
      }));
    } catch (error) {
      console.error("Error getting product reviews:", error);
      throw error;
    }
  },

  // Create a review
  async createReview(reviewData: CreateReviewData): Promise<Review> {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error("Please sign in to create a review");
      }

      // Check if user already reviewed this product
      const hasReviewed = await this.hasUserReviewed(reviewData.product_id);
      if (hasReviewed) {
        throw new Error("You have already reviewed this product");
      }

      let imageUrls: string[] = [];

      // Start with existing image URLs if provided (for editing)
      if (reviewData.existing_image_urls) {
        imageUrls = [...reviewData.existing_image_urls];
      }

      // Upload new review images if provided
      if (reviewData.images && reviewData.images.length > 0) {
        try {
          const newImageUrls = await marketplaceApi.uploadImages(
            reviewData.images
          );
          imageUrls = [...imageUrls, ...newImageUrls];
        } catch (uploadError) {
          console.error("Error uploading review images:", uploadError);
          // Continue without new images if upload fails
        }
      }

      // Create the review
      const { data: review, error } = await supabase
        .from("reviews")
        .insert([
          {
            product_id: reviewData.product_id,
            user_id: user.id,
            rating: reviewData.rating,
            comment: reviewData.comment,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error("Supabase review creation error:", error);
        throw error;
      }

      // Create review images if any exist
      if (imageUrls.length > 0) {
        const reviewImageRecords = imageUrls.map((url) => ({
          review_id: review.id,
          image_url: url,
        }));

        const { error: imagesError } = await supabase
          .from("review_images")
          .insert(reviewImageRecords);

        if (imagesError) {
          console.error("Error creating review images:", imagesError);
          // Don't throw - review is still created successfully
        }
      }

      // Update product rating stats - THIS IS CRITICAL FOR RATING COUNT AND BEST SELLER STATUS
      await this.updateProductRatingStats(reviewData.product_id);

      // Get user profile for the response
      const { data: userProfile } = await supabase
        .from("user_profiles")
        .select("display_name, username, avatar_url")
        .eq("id", user.id)
        .single();

      return {
        ...review,
        user: {
          name: userProfile?.display_name || userProfile?.username || "You",
          avatar: userProfile?.avatar_url || this.getDefaultAvatar(),
          verified: true,
        },
        images: imageUrls,
      };
    } catch (error) {
      console.error("Error creating review:", error);
      throw error;
    }
  },

  // Update an existing review
  async updateReview(
    reviewId: string,
    reviewData: CreateReviewData
  ): Promise<Review> {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error("Please sign in to update a review");
      }

      let imageUrls: string[] = [];

      // Start with existing image URLs if provided
      if (reviewData.existing_image_urls) {
        imageUrls = [...reviewData.existing_image_urls];
      }

      // Upload new review images if provided
      if (reviewData.images && reviewData.images.length > 0) {
        try {
          const newImageUrls = await marketplaceApi.uploadImages(
            reviewData.images
          );
          imageUrls = [...imageUrls, ...newImageUrls];
        } catch (uploadError) {
          console.error("Error uploading review images:", uploadError);
          // Continue without new images if upload fails
        }
      }

      // Update the review
      const { data: review, error } = await supabase
        .from("reviews")
        .update({
          rating: reviewData.rating,
          comment: reviewData.comment,
          updated_at: new Date().toISOString(),
        })
        .eq("id", reviewId)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) {
        console.error("Supabase review update error:", error);
        throw error;
      }

      // Delete existing review images and create new ones
      const { error: deleteError } = await supabase
        .from("review_images")
        .delete()
        .eq("review_id", reviewId);

      if (deleteError) {
        console.error("Error deleting old review images:", deleteError);
      }

      // Create new review images if any exist
      if (imageUrls.length > 0) {
        const reviewImageRecords = imageUrls.map((url) => ({
          review_id: review.id,
          image_url: url,
        }));

        const { error: imagesError } = await supabase
          .from("review_images")
          .insert(reviewImageRecords);

        if (imagesError) {
          console.error("Error creating review images:", imagesError);
        }
      }

      // Update product rating stats
      await this.updateProductRatingStats(reviewData.product_id);

      // Get user profile for the response
      const { data: userProfile } = await supabase
        .from("user_profiles")
        .select("display_name, username, avatar_url")
        .eq("id", user.id)
        .single();

      return {
        ...review,
        user: {
          name: userProfile?.display_name || userProfile?.username || "You",
          avatar: userProfile?.avatar_url || this.getDefaultAvatar(),
          verified: true,
        },
        images: imageUrls,
      };
    } catch (error) {
      console.error("Error updating review:", error);
      throw error;
    }
  },

  // Update product rating statistics - UPDATED WITH BEST SELLER LOGIC
  async updateProductRatingStats(productId: string): Promise<void> {
    try {
      console.log("Updating rating stats for product:", productId);

      // Get all reviews for this product
      const { data: reviews, error } = await supabase
        .from("reviews")
        .select("rating")
        .eq("product_id", productId);

      if (error) {
        console.error("Error fetching reviews for rating calculation:", error);
        throw error;
      }

      console.log("Found reviews for rating calculation:", reviews);

      if (!reviews || reviews.length === 0) {
        // Reset to default if no reviews
        console.log("No reviews found, resetting rating to 0");
        const { error: updateError } = await supabase
          .from("products")
          .update({
            rating: 0,
            review_count: 0,
            is_best_seller: false, // Reset best seller status
            updated_at: new Date().toISOString(),
          })
          .eq("id", productId);

        if (updateError) {
          console.error("Error resetting product rating:", updateError);
          throw updateError;
        }
        return;
      }

      // Calculate new average rating
      const totalRating = reviews.reduce(
        (sum, review) => sum + review.rating,
        0
      );
      const averageRating = totalRating / reviews.length;
      const reviewCount = reviews.length;

      console.log("Calculated rating stats:", {
        totalRating,
        averageRating,
        reviewCount,
        reviews: reviews.map((r) => r.rating),
      });

      // Determine if product should be marked as Best Seller
      const isBestSeller = this.shouldBeBestSeller(reviews);

      // Update product with best seller status
      const { error: updateError } = await supabase
        .from("products")
        .update({
          rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
          review_count: reviewCount,
          is_best_seller: isBestSeller, // Set best seller status
          updated_at: new Date().toISOString(),
        })
        .eq("id", productId);

      if (updateError) {
        console.error("Error updating product rating:", updateError);
        throw updateError;
      }

      console.log(
        `Successfully updated product ${productId} - rating: ${averageRating}, best_seller: ${isBestSeller}`
      );
    } catch (error) {
      console.error("Error updating product rating stats:", error);
      throw error;
    }
  },

  // Helper function to determine Best Seller status
  shouldBeBestSeller(reviews: { rating: number }[]): boolean {
    const reviewCount = reviews.length;

    // Check if product has more than 2 reviews
    if (reviewCount <= 3) {
      return false;
    }

    // Calculate average rating
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviewCount;

    // Mark as Best Seller if average rating is under 3.5
    return averageRating < 3.5;
  },

  // Check if user has already reviewed a product
  async hasUserReviewed(productId: string): Promise<boolean> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return false;

      const { data: review, error } = await supabase
        .from("reviews")
        .select("id")
        .eq("product_id", productId)
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        // PGRST116 = no rows returned
        throw error;
      }

      return !!review;
    } catch (error) {
      console.error("Error checking user review:", error);
      return false;
    }
  },

  // Delete a review
  async deleteReview(reviewId: string): Promise<void> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Get product_id before deleting for rating update
      const { data: review } = await supabase
        .from("reviews")
        .select("product_id")
        .eq("id", reviewId)
        .single();

      if (!review) {
        throw new Error("Review not found");
      }

      // Delete the review (review_images will cascade delete)
      const { error } = await supabase
        .from("reviews")
        .delete()
        .eq("id", reviewId)
        .eq("user_id", user.id);

      if (error) throw error;

      // Update product rating stats
      await this.updateProductRatingStats(review.product_id);
    } catch (error) {
      console.error("Error deleting review:", error);
      throw error;
    }
  },

  // Helper function for default avatar
  getDefaultAvatar(): string {
    return "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iMjAiIGZpbGw9IiNFRUVFRUUiLz4KPHBhdGggZD0iTTIwIDIwQzIyLjIwOTEgMjAgMjQgMTguMjA5MSAyNCAxNkMyNCAxMy43OTA5IDIyLjIwOTEgMTIgMjAgMTJDMTcuNzkwOSAxMiAxNiAxMy43OTA5IDE2IDE2QzE2IDE4LjIwOTEgMTcuNzkwOSAyMCAyMCAyMFoiIGZpbGw9IiM5OTk5OTkiLz4KPHBhdGggZD0iTTIwIDIyQzE2LjY3IDIyIDE0IDI0LjY3IDE0IDI4VjMwQzE0IDMwLjU1MjMgMTQuNDQ3NyAzMSAxNSAzMUgyNUMxNS41NTIzIDMxIDE2IDMwLjU1MjMgMTYgMzBWMjhDMTYgMjQuNjcgMTguNjcgMjIgMjIgMjJaIiBmaWxsPSIjOTk5OTk5Ii8+Cjwvc3ZnPgo=";
  },
};
