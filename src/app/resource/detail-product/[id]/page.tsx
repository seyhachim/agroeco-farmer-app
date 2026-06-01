"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  FaChevronLeft,
  FaStar,
  FaStarHalf,
  FaTimes,
  FaExpand,
} from "react-icons/fa";
import {
  MessageSquare,
  Heart,
  Share2,
  Trash2,
  Edit,
  Handshake,
} from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, A11y } from "swiper/modules";
import { useFavorites } from "../../../../components/Marketplace/context";
import { marketplaceApi, Product } from "../../../../lib/api/marketplaceApi";
import { reviewsApi, Review } from "../../../../lib/api/reviewsApi";
import { supabase } from "../../../../lib/supabase";
import CreateTradeModal from "../../../../components/Marketplace/UI/CreateTradeModal";
import { useTranslations } from "../../../../lib/i18n";
import "swiper/css";
import "swiper/css/pagination";

const ProductDetailPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const { favoriteIds, addFavorite, removeFavorite } = useFavorites();
  const { t, tMarketplace, tAuth } = useTranslations();

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [ratingDistribution, setRatingDistribution] = useState<number[]>([
    0, 0, 0, 0, 0,
  ]);
  const [hasUserReviewed, setHasUserReviewed] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isProductOwner, setIsProductOwner] = useState(false);

  // Popup states
  const [showReviewPopup, setShowReviewPopup] = useState(false);
  const [showEditReviewPopup, setShowEditReviewPopup] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [previewImages, setPreviewImages] = useState<string[]>([]);

  // Trade modal state
  const [isCreateTradeModalOpen, setIsCreateTradeModalOpen] = useState(false);
  const [prefilledRecipient, setPrefilledRecipient] = useState("");

  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewImages, setReviewImages] = useState<File[]>([]);
  const [hoverRating, setHoverRating] = useState(0);

  const [deletingReviewId, setDeletingReviewId] = useState<string | null>(null);
  const [userReviewOwnership, setUserReviewOwnership] = useState<{
    [key: string]: boolean;
  }>({});
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [editReviewRating, setEditReviewRating] = useState(0);
  const [editReviewComment, setEditReviewComment] = useState("");
  const [editReviewImages, setEditReviewImages] = useState<File[]>([]);
  const [existingReviewImages, setExistingReviewImages] = useState<string[]>(
    []
  );
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

  // Lock scroll when popups are open
  useEffect(() => {
    if (
      showReviewPopup ||
      showEditReviewPopup ||
      showImagePreview ||
      isCreateTradeModalOpen
    ) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    // Cleanup function
    return () => {
      document.body.style.overflow = "";
    };
  }, [
    showReviewPopup,
    showEditReviewPopup,
    showImagePreview,
    isCreateTradeModalOpen,
  ]);

  useEffect(() => {
    if (id) {
      loadProduct();
      loadReviews();
      checkUserReview();
      checkAuthentication();
    }
  }, [id]);

  useEffect(() => {
    if (reviews.length > 0 && isAuthenticated) {
      checkReviewOwnership();
    }
  }, [reviews, isAuthenticated]);

  useEffect(() => {
    // Check if current user is the product owner
    if (product && currentUserId) {
      setIsProductOwner(product.user_id === currentUserId);

      // Set prefilled recipient to product owner's display name
      if (product.seller?.name) {
        setPrefilledRecipient(product.seller.name);
      }
    }
  }, [product, currentUserId]);

  const loadProduct = async () => {
    try {
      setIsLoading(true);
      const productData = await marketplaceApi.getProductById(id as string);
      setProduct(productData);
    } catch (error) {
      console.error("Error loading product:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadReviews = async () => {
    try {
      const reviewsData = await reviewsApi.getProductReviews(id as string);
      setReviews(reviewsData);

      // Calculate rating distribution
      const distribution = [0, 0, 0, 0, 0];
      reviewsData.forEach((review) => {
        const starIndex = Math.floor(review.rating) - 1;
        if (starIndex >= 0 && starIndex < 5) {
          distribution[starIndex]++;
        }
      });

      setRatingDistribution(distribution);

      // Update product with real review data
      if (product) {
        const averageRating =
          reviewsData.length > 0
            ? reviewsData.reduce((sum, review) => sum + review.rating, 0) /
              reviewsData.length
            : 0;

        setProduct((prev) =>
          prev
            ? {
                ...prev,
                rating: averageRating,
                review_count: reviewsData.length,
              }
            : prev
        );
      }
    } catch (error) {
      console.error("Error loading reviews:", error);
      setReviews([]);
    }
  };

  const checkUserReview = async () => {
    try {
      const hasReviewed = await reviewsApi.hasUserReviewed(id as string);
      setHasUserReviewed(hasReviewed);
    } catch (error) {
      console.error("Error checking user review:", error);
    }
  };

  const checkAuthentication = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
      setCurrentUserId(user?.id || null);
    } catch (error) {
      console.error("Error checking authentication:", error);
      setIsAuthenticated(false);
      setCurrentUserId(null);
    } finally {
      setAuthLoading(false);
    }
  };

  const checkReviewOwnership = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const ownershipMap: { [key: string]: boolean } = {};
      reviews.forEach((review) => {
        ownershipMap[review.id] = review.user_id === user.id;
      });

      setUserReviewOwnership(ownershipMap);
    } catch (error) {
      console.error("Error checking review ownership:", error);
    }
  };

  // Trade Functions
  const handleCreateTrade = () => {
    if (!isAuthenticated) {
      alert(t("pleaseSignIn"));
      router.push("/auth/signin");
      return;
    }

    if (isProductOwner) {
      alert(tMarketplace("yourProduct"));
      return;
    }

    setIsCreateTradeModalOpen(true);
  };

  const handleTradeCreated = () => {
    setIsCreateTradeModalOpen(false);
    alert(tMarketplace("tradeCreatedSuccess"));
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (
      !confirm(
        `${tMarketplace("areYouSureDelete")} ${tMarketplace("cannotUndo")}`
      )
    ) {
      return;
    }

    setDeletingReviewId(reviewId);
    try {
      await reviewsApi.deleteReview(reviewId);
      await Promise.all([loadReviews(), checkUserReview(), loadProduct()]);
      alert(tMarketplace("reviewDeleted"));
    } catch (error: unknown) {
      console.error("Error deleting review:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : typeof error === "string"
          ? error
          : t("error");
      alert(errorMessage);
    } finally {
      setDeletingReviewId(null);
    }
  };

  // Image Preview Functions
  const openImagePreview = (images: string[], startIndex: number = 0) => {
    setPreviewImages(images);
    setSelectedImageIndex(startIndex);
    setShowImagePreview(true);
  };

  const closeImagePreview = () => {
    setShowImagePreview(false);
    setPreviewImages([]);
    setSelectedImageIndex(0);
  };

  const nextImage = () => {
    setSelectedImageIndex((prev) =>
      prev === previewImages.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setSelectedImageIndex((prev) =>
      prev === 0 ? previewImages.length - 1 : prev - 1
    );
  };

  // Open Edit Review Popup
  const handleEditReview = (review: Review) => {
    setEditingReview(review);
    setEditReviewRating(review.rating);
    setEditReviewComment(review.comment);
    setEditReviewImages([]);
    setExistingReviewImages(review.images || []);
    setShowEditReviewPopup(true);
  };

  // Close Edit Review Popup
  const handleCancelEdit = () => {
    setEditingReview(null);
    setEditReviewRating(0);
    setEditReviewComment("");
    setEditReviewImages([]);
    setExistingReviewImages([]);
    setShowEditReviewPopup(false);
  };

  // Open Create Review Popup
  const handleOpenReviewPopup = () => {
    if (!isAuthenticated) {
      alert(tMarketplace("signInToReview"));
      router.push("/auth/signin");
      return;
    }
    setShowReviewPopup(true);
  };

  // Close Create Review Popup
  const handleCloseReviewPopup = () => {
    setShowReviewPopup(false);
    setReviewRating(0);
    setReviewComment("");
    setReviewImages([]);
  };

  // FIXED: Edit Review Submission - Properly handle image removal
  const handleSubmitEditReview = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingReview) return;

    if (editReviewRating === 0 || !editReviewComment.trim()) {
      alert(tMarketplace("provideRatingAndComment"));
      return;
    }

    setIsSubmittingEdit(true);
    try {
      // Delete the old review first
      await reviewsApi.deleteReview(editingReview.id);

      // Recreate the review with the updated content and images
      await reviewsApi.createReview({
        product_id: id as string,
        rating: editReviewRating,
        comment: editReviewComment.trim(),
        images: editReviewImages, // Only send new images
        existing_image_urls: existingReviewImages, // Send remaining existing image URLs
      });

      // Reset form and refresh data
      handleCancelEdit();
      await Promise.all([loadReviews(), checkUserReview(), loadProduct()]);
      alert(tMarketplace("reviewUpdated"));
    } catch (error: unknown) {
      console.error("Error updating review:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : typeof error === "string"
          ? error
          : t("error");
      alert(errorMessage);
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  // Review submission handlers
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();

    if (reviewRating === 0 || !reviewComment.trim()) {
      alert(tMarketplace("provideRatingAndComment"));
      return;
    }

    if (reviewComment.length > 500) {
      alert(tMarketplace("reviewCommentMaxLength"));
      return;
    }

    setIsSubmittingReview(true);
    try {
      await reviewsApi.createReview({
        product_id: id as string,
        rating: reviewRating,
        comment: reviewComment.trim(),
        images: reviewImages,
      });

      handleCloseReviewPopup();
      await Promise.all([loadReviews(), checkUserReview(), loadProduct()]);
      alert(tMarketplace("thankYouForReview"));
    } catch (error: unknown) {
      console.error("Error submitting review:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : typeof error === "string"
          ? error
          : t("error");
      alert(errorMessage);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleReviewImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages = Array.from(files).slice(0, 5 - reviewImages.length);
      setReviewImages((prev) => [...prev, ...newImages]);
    }
  };

  const removeReviewImage = (index: number) => {
    setReviewImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleEditReviewImageSelect = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files;
    if (files) {
      const availableSlots =
        5 - (existingReviewImages.length + editReviewImages.length);
      const newImages = Array.from(files).slice(0, availableSlots);
      setEditReviewImages((prev) => [...prev, ...newImages]);
    }
  };

  // FIXED: Image removal - properly update state without affecting other images
  const removeEditReviewImage = (
    index: number,
    isExisting: boolean = false
  ) => {
    if (isExisting) {
      // Remove from existing images using filter (safer than splice)
      setExistingReviewImages((prev) => prev.filter((_, i) => i !== index));
    } else {
      // Remove from new images using filter
      setEditReviewImages((prev) => prev.filter((_, i) => i !== index));
    }
  };

  // Base64 placeholder images
  const avatarPlaceholder =
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iMjAiIGZpbGw9IiNFRUVFRUUiLz4KPHBhdGggZD0iTTIwIDIwQzIyLjIwOTEgMjAgMjQgMTguMjA5MSAyNCAxNkMyNCAxMy43OTA5IDIyLjIwOTEgMTIgMjAgMTJDMTcuNzkwOSAxMiAxNiAxMy43OTA5IDE2IDE2QzE2IDE4LjIwOTEgMTcuNzkwOSAyMCAyMCAyMFoiIGZpbGw9IiM5OTk5OTkiLz4KPHBhdGggZD0iTTIwIDIyQzE2LjY3IDIyIDE0IDI0LjY3IDE0IDI4VjMwQzE0IDMwLjU1MjMgMTQuNDQ3NyAzMSAxNSAzMUgyNUMxNS41NTIzIDMxIDE2IDMwLjU1MjMgMTYgMzBWMjhDMTYgMjQuNjcgMTguNjcgMjIgMjIgMjJaIiBmaWxsPSIjOTk5OTk5Ii8+Cjwvc3ZnPgo=";

  const productImagePlaceholder =
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjRjNGNEY2Ii8+CjxyZWN0IHg9IjIwIiB5PSIyMCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRDFENUZCIi8+CjxjaXJjbGUgY3g9IjQwIiBjeT0iMzAiIHI9IjUiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTI1IDUwTDM1IDQwTDQ1IDQ1TDU1IDM1VjUwSDI1WiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K";

  // Share functionality
  const handleShare = async () => {
    const shareData = {
      title: product?.title || tMarketplace("amazingProduct"),
      text: product?.description || tMarketplace("checkOutThisProduct"),
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // user cancelled or share not supported
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        setShowShareOptions(true);
        setTimeout(() => setShowShareOptions(false), 3000);
      } catch {
        setShowShareOptions(true);
      }
    }
  };

  const shareToPlatform = (platform: string) => {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(
      product?.title || tMarketplace("amazingProduct")
    );

    let shareUrl = "";
    switch (platform) {
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${title}`;
        break;
      case "linkedin":
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
        break;
      case "whatsapp":
        shareUrl = `https://wa.me/?text=${title}%20${url}`;
        break;
      case "telegram":
        shareUrl = `https://t.me/share/url?url=${url}&text=${title}`;
        break;
      default:
        return;
    }

    window.open(shareUrl, "_blank", "width=600,height=400");
    setShowShareOptions(false);
  };

  // Calculate rating statistics
  const ratingStats = {
    average:
      reviews.length > 0
        ? reviews.reduce((sum, review) => sum + review.rating, 0) /
          reviews.length
        : 0,
    total: reviews.length,
    distribution: ratingDistribution,
  };

  // Render stars for reviews
  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <FaStar
        key={i}
        className={`w-4 h-4 ${i < rating ? "text-[#FACC15]" : "text-gray-300"}`}
      />
    ));
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Loading Skeleton Component
  const LoadingSkeleton = () => (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Top Bar Skeleton */}
      <div className="fixed top-0 w-full z-10 bg-white border-b p-4 md:p-6 flex justify-between items-center">
        <div className="w-6 h-6 bg-gray-200 rounded"></div>
        <div className="w-32 h-4 bg-gray-200 rounded"></div>
        <div className="w-6 h-6 bg-gray-200 rounded"></div>
      </div>

      {/* Image Carousel Skeleton */}
      <div className="relative w-full h-[283px] md:h-[400px] lg:h-[500px] mt-[57px] md:mt-[72px] bg-gray-200 animate-pulse">
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="w-2 h-2 bg-gray-400 rounded-full"></div>
          ))}
        </div>
      </div>

      {/* Product Details Skeleton */}
      <div className="flex-1 px-5 py-5 md:px-10 lg:px-32 space-y-6">
        {/* Title + Favorite Skeleton */}
        <div className="flex flex-col gap-5 border-b border-gray-200 pb-4">
          <div className="flex justify-between items-center">
            <div className="space-y-2 flex-1">
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-gray-200 rounded"></div>
              <div className="w-6 h-6 bg-gray-200 rounded"></div>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-4 h-4 bg-gray-200 rounded"></div>
            ))}
            <div className="ml-2 w-20 h-4 bg-gray-200 rounded"></div>
          </div>
        </div>

        {/* Price Section Skeleton */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="h-8 bg-gray-200 rounded w-24"></div>
            <div className="flex items-center gap-2">
              <div className="h-5 bg-gray-200 rounded w-16"></div>
              <div className="h-6 bg-gray-200 rounded w-12"></div>
            </div>
          </div>
          <div className="flex gap-2 items-center">
            <div className="w-4 h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-32"></div>
          </div>
        </div>

        {/* Description Skeleton */}
        <div className="border-b border-gray-200 pb-4">
          <div className="h-5 bg-gray-200 rounded w-24 mb-3"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>

        {/* Reviews Skeleton */}
        <div className="border-b border-gray-200 pb-4">
          <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Seller Info Skeleton */}
        <div className="border-b border-gray-200 pb-4 mb-[165px]">
          <div className="h-5 bg-gray-200 rounded w-32 mb-3"></div>
          <div className="flex items-center gap-3 p-3 md:p-5">
            <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="h-3 bg-gray-200 rounded w-20"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar Skeleton */}
      <div className="flex lg:flex-col lg:items-start sm:flex-row justify-between gap-3 sm:gap-2 items-center border-t border-gray-200 bg-white p-4 md:px-10 fixed bottom-0 w-full">
        <div className="lg:w-full w-[124px] md:w-56 h-12 bg-gray-200 rounded-md"></div>
        <div className="w-[248px] md:w-[448px] lg:w-full h-12 bg-gray-200 rounded-md"></div>
      </div>
    </div>
  );

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (!product) {
    return (
      <div className="p-8 text-center text-gray-500">
        {tMarketplace("productNotFound")}
      </div>
    );
  }

  const isFavorite = favoriteIds.includes(product.id);

  const toggleFavorite = () => {
    if (isFavorite) removeFavorite(product.id);
    else addFavorite(product.id);
  };

  // Calculate discount percentage
  const discountPercent =
    product.old_price && product.price
      ? Math.round(
          ((product.old_price - product.price) / product.old_price) * 100
        )
      : 0;

  const displayedReviews = showAllReviews ? reviews : reviews.slice(0, 3);

  // Show Create Trade button only to authenticated users who are NOT the product owner
  const showCreateTradeButton = isAuthenticated && !isProductOwner;

  return (
    <div className="flex flex-col min-h-screen bg-white font-[kantumruy_Pro]">
      {/* Top Bar */}
      <div className="fixed top-0 w-full z-10 bg-white border-b p-4 md:p-6 flex justify-between items-center">
        <button onClick={() => router.back()} className="ml-2">
          <FaChevronLeft className="text-xl md:text-2xl text-[#5B5B5B]" />
        </button>
        <h1 className="text-[#0D1B2A]  text-base md:text-lg lg:text-xl font-normal leading-4 tracking-tightest not-italic">
          {tMarketplace("productDetails")}
        </h1>
        <div className="w-6 h-6"></div> {/* Spacer for alignment */}
      </div>

      {/* Image Carousel */}
      <div className="relative w-full h-[283px] md:h-[400px] lg:h-[500px] mt-[57px] md:mt-[72px]">
        <Swiper
          modules={[Pagination, A11y]}
          spaceBetween={0}
          slidesPerView={1}
          pagination={{ clickable: true }}
          className="w-full h-full"
        >
          {product.images && product.images.length > 0 ? (
            product.images.map((imageSrc, index) => (
              <SwiperSlide key={index}>
                <img
                  src={imageSrc || productImagePlaceholder}
                  alt={`${product.title} image ${index + 1}`}
                  className="object-cover w-full h-full cursor-pointer"
                  onClick={() => openImagePreview(product.images || [], index)}
                  onError={(e) => {
                    e.currentTarget.src = productImagePlaceholder;
                  }}
                />
              </SwiperSlide>
            ))
          ) : (
            <SwiperSlide>
              <img
                src={productImagePlaceholder}
                alt={`${product.title} placeholder`}
                className="object-cover w-full h-full"
              />
            </SwiperSlide>
          )}
        </Swiper>
      </div>

      {/* Product Details */}
      <div className="flex-1 px-5 py-5 md:px-10 lg:px-32 space-y-4 md:space-y-6">
        {/* Title + Favorite */}
        <div className="flex flex-col gap-5 border-b border-gray-200 pb-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl md:text-3xl font-semibold text-gray-900">
              {product.title}
            </h2>
            <div className="flex items-center gap-3">
              <button onClick={toggleFavorite} className="p-1">
                <Heart
                  size={24}
                  className={`md:w-6 md:h-6 transition-colors ${
                    isFavorite
                      ? "fill-[#0E4123] text-[#0E4123]"
                      : "text-gray-600 hover:text-[#0E4123]"
                  }`}
                />
              </button>

              {/* Share Button with Dropdown */}
              <div className="relative">
                <button
                  onClick={handleShare}
                  className="p-1 text-gray-600 hover:text-[#0E4123] transition-colors"
                >
                  <Share2 size={22} className="md:w-6 md:h-6" />
                </button>

                {/* Share Options Dropdown */}
                {showShareOptions && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50 py-2">
                    <div className="px-4 py-2 text-sm text-gray-500 border-b border-gray-100">
                      {tMarketplace("shareThisProduct")}
                    </div>
                    <button
                      onClick={() => shareToPlatform("facebook")}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <span className="mr-2">📘</span> Facebook
                    </button>
                    <button
                      onClick={() => shareToPlatform("twitter")}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <span className="mr-2">🐦</span> Twitter
                    </button>
                    <button
                      onClick={() => shareToPlatform("linkedin")}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <span className="mr-2">💼</span> LinkedIn
                    </button>
                    <button
                      onClick={() => shareToPlatform("whatsapp")}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <span className="mr-2">💚</span> WhatsApp
                    </button>
                    <button
                      onClick={() => shareToPlatform("telegram")}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <span className="mr-2">📱</span> Telegram
                    </button>
                    <div className="px-4 py-2 text-xs text-gray-400 border-t border-gray-100">
                      {tMarketplace("linkCopied")}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center">
            {[...Array(5)].map((_, i) => {
              const rating = ratingStats.average || 0;
              const fullStars = Math.floor(rating);
              const hasHalfStar = rating % 1 >= 0.5;

              if (i < fullStars) {
                return <FaStar key={i} className="text-[#FACC15]" />;
              } else if (i === fullStars && hasHalfStar) {
                return <FaStarHalf key={i} className="text-[#FACC15]" />;
              } else {
                return <FaStar key={i} className="text-gray-300" />;
              }
            })}
            <p className="text-gray-600  text-sm md:text-base ml-2">
              {ratingStats.average.toFixed(1)} ({ratingStats.total}{" "}
              {tMarketplace("reviews")})
            </p>
          </div>
        </div>

        {/* Price Section */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[#0E4123]  text-2xl md:text-3xl font-bold leading-8">
              ${product.price?.toFixed(2) || "0.00"}
            </span>
            {product.old_price && product.old_price > (product.price || 0) && (
              <div className="flex items-center gap-2.5">
                <span className="text-gray-500  text-lg line-through">
                  ${product.old_price.toFixed(2)}
                </span>
                <span className="text-red-600 text-sm md:text-base font-semibold rounded-full bg-red-100 px-2 py-0.5">
                  {discountPercent}% OFF
                </span>
              </div>
            )}
          </div>
          <div className="flex gap-2 items-center">
            <Image
              src="/icons/marketplace/icon_clock.svg"
              alt="clock"
              width={16}
              height={16}
              className="md:w-5 md:h-5"
              onError={(e) => {
                e.currentTarget.src =
                  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTggMTRDMTEuMzEzNyAxNCAxNCAxMS4zMTM3IDE0IDhDMTQgNC42ODYyOSAxMS4zMTM3IDIgOCAyQzQuNjg2MjkgMiAyIDQuNjg2MjkgMiA4QzIgMTEuMzEzNyA0LjY4NjI5IDE0IDggMTRaIiBzdHJva2U9IiM2NjY2NjYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+CjxwYXRoIGQ9Ik04IDRWOEwxMCAxMCIgc3Ryb2tlPSIjNjY2NjY2IiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4K";
              }}
            />
            <p className="text-gray-600  text-sm md:text-base">
              {tMarketplace("postedOn")}{" "}
              {new Date(product.posted_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Description */}
        <div className="border-b border-gray-200 pb-4">
          <h3 className="text-gray-900  text-sm md:text-lg font-semibold mb-2">
            {tMarketplace("description")}
          </h3>
          <p className="text-gray-600  text-xs md:text-base leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Reviews Section */}
        <div className="border-b border-gray-200 pb-4">
          <h3 className="text-gray-900  text-sm md:text-lg font-semibold mb-4">
            {tMarketplace("customerReviews")} ({ratingStats.total})
          </h3>

          {/* Overall Rating Summary */}
          <div className="flex items-center gap-6 mb-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">
                {ratingStats.average.toFixed(1)}
              </div>
              <div className="flex items-center justify-center gap-1 mt-1">
                {renderStars(Math.round(ratingStats.average))}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                {ratingStats.total} {tMarketplace("reviews")}
              </div>
            </div>

            {/* Rating Distribution */}
            <div className="flex-1 space-y-1">
              {[5, 4, 3, 2, 1].map((stars, index) => {
                const starCount = ratingStats.distribution[4 - index] || 0;
                const percentage =
                  ratingStats.total > 0
                    ? Math.min(100, (starCount / ratingStats.total) * 100)
                    : 0;

                return (
                  <div key={stars} className="flex items-center gap-2 text-sm">
                    <span className="w-8 text-gray-600">{stars}</span>
                    <FaStar className="w-3 h-3 text-[#FACC15]" />
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-[#FACC15] h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="w-8 text-gray-500 text-right">
                      {starCount}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Review Submission Section */}
          <div className="border-t border-gray-200 pt-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900">
                {tMarketplace("shareYourExperience")}
              </h4>
              {!authLoading && !hasUserReviewed && isAuthenticated && (
                <button
                  onClick={handleOpenReviewPopup}
                  className="bg-[#0E4123] text-white px-4 py-2 rounded-md hover:bg-green-800 transition-colors text-sm font-medium"
                >
                  {tMarketplace("writeReview")}
                </button>
              )}
            </div>

            {authLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#0E4123] mx-auto"></div>
              </div>
            ) : hasUserReviewed ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <p className="text-green-800 font-medium">
                    {tMarketplace("alreadyReviewed")}
                  </p>
                </div>
              </div>
            ) : !isAuthenticated ? (
              <div className="text-center py-4 border border-gray-200 rounded-lg">
                <p className="text-gray-600 mb-3">
                  {tMarketplace("signInToReview")}
                </p>
                <button
                  onClick={() => router.push("/auth/signin")}
                  className="bg-[#0E4123] text-white px-6 py-2 rounded-md hover:bg-green-800 transition-colors"
                >
                  {t("login")}
                </button>
              </div>
            ) : (
              <div className="text-center py-4 border border-gray-200 rounded-lg">
                <p className="text-gray-600">
                  {tMarketplace("shareYourThoughts")}
                </p>
              </div>
            )}
          </div>

          {/* Reviews List */}
          <div className="space-y-6">
            {displayedReviews.length > 0 ? (
              displayedReviews.map((review) => (
                <div
                  key={review.id}
                  className="border-b border-gray-100 pb-6 last:border-b-0"
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={review.user?.avatar || avatarPlaceholder}
                      alt={review.user?.name || tMarketplace("anonymous")}
                      className="w-10 h-10 rounded-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = avatarPlaceholder;
                      }}
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">
                            {review.user?.name || tMarketplace("anonymous")}
                          </span>
                        </div>

                        {/* Delete Button - Only show for user's own reviews */}
                        {userReviewOwnership[review.id] && (
                          <button
                            onClick={() => handleDeleteReview(review.id)}
                            disabled={deletingReviewId === review.id}
                            className="text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                          >
                            {deletingReviewId === review.id ? (
                              <>
                                <div className="w-3 h-3 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                                {tMarketplace("deleting")}
                              </>
                            ) : (
                              <>
                                <Trash2 size={14} />
                                {tMarketplace("deleteReview")}
                              </>
                            )}
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-2.5 mb-2">
                        <div className="flex items-center gap-1">
                          {renderStars(review.rating)}
                        </div>
                        <span className="text-sm text-gray-500">
                          {formatDate(review.created_at)}
                        </span>
                      </div>
                      <p className="text-gray-700 mb-3">{review.comment}</p>

                      {/* Review Images */}
                      {review.images && review.images.length > 0 && (
                        <div className="flex gap-2 mb-3 flex-wrap">
                          {review.images.map((img, idx) => (
                            <div key={idx} className="relative group">
                              <img
                                src={img}
                                alt={`Review image ${idx + 1}`}
                                className="w-20 h-20 rounded-lg object-cover border border-gray-200 cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={() =>
                                  openImagePreview(review.images || [], idx)
                                }
                                onError={(e) => {
                                  e.currentTarget.src = productImagePlaceholder;
                                }}
                              />
                              <div className="absolute inset-0 group-hover:bg-black/50 transition-all rounded-lg flex items-center justify-center pointer-events-none">
                                <FaExpand
                                  className="text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                  size={16}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Edit Button */}
                      {userReviewOwnership[review.id] && (
                        <div className="flex justify-end">
                          <button
                            onClick={() => handleEditReview(review)}
                            className="text-[#0E4123] hover:text-green-800 text-sm font-medium flex items-center gap-1"
                          >
                            <>
                              <Edit size={14} />
                              {tMarketplace("editReview")}
                            </>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaStar className="w-8 h-8 text-gray-400" />
                </div>
                <h4 className="text-lg font-semibold text-gray-600 mb-2">
                  {tMarketplace("noReviewsYet")}
                </h4>
                <p className="text-gray-500 text-sm">
                  {tMarketplace("beTheFirst")}
                </p>
              </div>
            )}
          </div>

          {reviews.length > 3 && (
            <button
              onClick={() => setShowAllReviews(!showAllReviews)}
              className="mt-4 text-[#0E4123] font-medium hover:text-green-800 transition-colors"
            >
              {showAllReviews
                ? tMarketplace("showLessReviews")
                : `${tMarketplace("showAllReviews")} (${reviews.length})`}
            </button>
          )}
        </div>

        <div className="border-b border-gray-200 pb-4 mb-[165px]">
          <h3 className="text-gray-900  text-sm md:text-lg font-semibold mb-2">
            {tMarketplace("sellerInformation")}
          </h3>
          <div className="flex items-center gap-3 p-3 md:p-5 ">
            <img
              src={product.seller?.avatar || avatarPlaceholder}
              alt={product.seller?.name || tMarketplace("seller")}
              width={48}
              height={48}
              className="rounded-full object-cover md:w-14 md:h-14"
              onError={(e) => {
                e.currentTarget.src = avatarPlaceholder;
              }}
            />
            <div className="flex-1">
              <p className="text-[#0D1B2A]  text-sm md:text-lg font-medium">
                {product.seller?.name || tMarketplace("seller")}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex lg:flex-col lg:items-start sm:flex-row justify-between gap-3 sm:gap-2 items-center border-t border-gray-200 bg-white p-4 md:px-10 fixed bottom-0 w-full">
        <button className="flex items-center justify-center text-gray-700 bg-[#F3F4F6] gap-2 border rounded-md lg:w-full w-[124px] md:w-56 py-3 hover:bg-gray-100 transition text-sm md:text-base">
          <MessageSquare size={18} /> {tMarketplace("chat")}
        </button>

        {showCreateTradeButton ? (
          <button
            onClick={handleCreateTrade}
            className="flex items-center justify-center gap-2 rounded-md w-[248px] md:w-md lg:w-full py-3 transition text-white text-center  text-sm md:text-base font-medium bg-[#0E4123] hover:bg-green-800"
          >
            <Handshake size={18} />
            {tMarketplace("createTrade")}
          </button>
        ) : !isAuthenticated ? (
          <button
            onClick={() => router.push("/auth/signin")}
            className="flex items-center justify-center gap-2 rounded-md w-[248px] md:w-md lg:w-full py-3 transition text-white text-center  text-sm md:text-base font-medium bg-[#0E4123] hover:bg-green-800"
          >
            {tMarketplace("signInToTrade")}
          </button>
        ) : isProductOwner ? (
          <button
            disabled
            className="flex items-center justify-center gap-2 rounded-md w-[248px] md:w-md lg:w-full py-3 transition text-gray-500 text-center  text-sm md:text-base font-medium bg-gray-200 cursor-not-allowed"
          >
            {tMarketplace("yourProduct")}
          </button>
        ) : null}
      </div>

      <CreateTradeModal
        isOpen={isCreateTradeModalOpen}
        onClose={() => setIsCreateTradeModalOpen(false)}
        onTradeCreated={handleTradeCreated}
        prefilledRecipient={prefilledRecipient}
      />

      {showReviewPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">
                {tMarketplace("writeAReview")}
              </h3>
              <button
                onClick={handleCloseReviewPopup}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FaTimes size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="p-6 space-y-6">
              {/* Star Rating Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  {tMarketplace("yourRating")} *
                </label>
                <div className="flex gap-2 justify-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-2 focus:outline-none transition-transform hover:scale-110"
                    >
                      <FaStar
                        className={`w-10 h-10 ${
                          star <= (hoverRating || reviewRating)
                            ? "text-[#FACC15]"
                            : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <p className="text-center text-sm text-gray-500 mt-3">
                  {reviewRating > 0
                    ? `${reviewRating} ${tMarketplace(
                        reviewRating > 1 ? "stars" : "star"
                      )}`
                    : tMarketplace("selectYourRating")}
                </p>
              </div>

              {/* Comment Input */}
              <div>
                <label
                  htmlFor="review-comment"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  {tMarketplace("yourReview")} *
                </label>
                <textarea
                  id="review-comment"
                  rows={6}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder={tMarketplace("reviewCommentPlaceholder")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                  required
                  maxLength={500}
                />
                <p
                  className={`text-sm mt-1 ${
                    reviewComment.length > 450
                      ? "text-red-500"
                      : "text-gray-500"
                  }`}
                >
                  {reviewComment.length}/500 {tMarketplace("characters")}
                </p>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {tMarketplace("addPhotos")} ({reviewImages.length}/5)
                </label>
                <div className="flex flex-wrap gap-3">
                  {/* Selected Images Preview */}
                  {reviewImages.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Preview ${index + 1}`}
                        className="w-20 h-20 rounded-lg object-cover border border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={() => removeReviewImage(index)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}

                  {/* Add Image Button */}
                  {reviewImages.length < 5 && (
                    <label className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 hover:border-gray-400 transition-colors cursor-pointer">
                      <span className="text-2xl">+</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleReviewImageSelect}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  {tMarketplace("reviewImagesOptional")}
                </p>
              </div>

              {/* Submit Button */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseReviewPopup}
                  className="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-md hover:bg-gray-400 transition-colors font-medium"
                >
                  {t("cancel")}
                </button>
                <button
                  type="submit"
                  disabled={
                    isSubmittingReview ||
                    reviewRating === 0 ||
                    !reviewComment.trim()
                  }
                  className="flex-1 bg-[#0E4123] text-white py-3 px-4 rounded-md hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {isSubmittingReview ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      {t("loading")}
                    </div>
                  ) : (
                    tMarketplace("submitReview")
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Review Popup */}
      {showEditReviewPopup && editingReview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">
                {tMarketplace("editYourReview")}
              </h3>
              <button
                onClick={handleCancelEdit}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FaTimes size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitEditReview} className="p-6 space-y-6">
              {/* Star Rating Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  {tMarketplace("yourRating")} *
                </label>
                <div className="flex gap-2 justify-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setEditReviewRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-2 focus:outline-none transition-transform hover:scale-110"
                    >
                      <FaStar
                        className={`w-10 h-10 ${
                          star <= (hoverRating || editReviewRating)
                            ? "text-[#FACC15]"
                            : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <p className="text-center text-sm text-gray-500 mt-3">
                  {editReviewRating > 0
                    ? `${editReviewRating} ${tMarketplace(
                        editReviewRating > 1 ? "stars" : "star"
                      )}`
                    : tMarketplace("selectYourRating")}
                </p>
              </div>

              {/* Comment Input */}
              <div>
                <label
                  htmlFor="edit-review-comment"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  {tMarketplace("yourReview")}
                </label>
                <textarea
                  id="edit-review-comment"
                  rows={6}
                  value={editReviewComment}
                  onChange={(e) => setEditReviewComment(e.target.value)}
                  placeholder={tMarketplace("reviewCommentPlaceholder")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                  required
                  maxLength={500}
                />
                <p
                  className={`text-sm mt-1 ${
                    editReviewComment.length > 450
                      ? "text-red-500"
                      : "text-gray-500"
                  }`}
                >
                  {editReviewComment.length}/500 {tMarketplace("characters")}
                </p>
              </div>

              {/* Image Upload - FIXED */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {tMarketplace("addPhotos")} (
                  {existingReviewImages.length + editReviewImages.length}/5)
                </label>

                {/* Existing Images */}
                {existingReviewImages.length > 0 && (
                  <div className="mb-3">
                    <p className="text-sm text-gray-600 mb-2">
                      {tMarketplace("currentPhotos")}:
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {existingReviewImages.map((image, index) => (
                        <div key={`existing-${index}`} className="relative">
                          <img
                            src={image}
                            alt={`Existing review image ${index + 1}`}
                            className="w-20 h-20 rounded-lg object-cover border border-gray-300"
                            onError={(e) => {
                              e.currentTarget.src = productImagePlaceholder;
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => removeEditReviewImage(index, true)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* New Images */}
                {existingReviewImages.length > 0 &&
                  editReviewImages.length > 0 && (
                    <p className="text-sm text-gray-600 mb-2">
                      {tMarketplace("newPhotos")}:
                    </p>
                  )}
                <div className="flex flex-wrap gap-3">
                  {/* New Images Preview */}
                  {editReviewImages.map((image, index) => (
                    <div key={`new-${index}`} className="relative">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`New preview ${index + 1}`}
                        className="w-20 h-20 rounded-lg object-cover border border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={() => removeEditReviewImage(index, false)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  ))}

                  {/* Add Image Button - Only show if total images < 5 */}
                  {existingReviewImages.length + editReviewImages.length <
                    5 && (
                    <label className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 hover:border-gray-400 transition-colors cursor-pointer">
                      <span className="text-2xl">+</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleEditReviewImageSelect}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                <p className="text-sm text-gray-500 mt-2">
                  {existingReviewImages.length + editReviewImages.length}{" "}
                  {tMarketplace("of")} 5 {tMarketplace("photosAdded")}
                  {existingReviewImages.length + editReviewImages.length >= 5 &&
                    ` - ${tMarketplace("maximumPhotos")}`}
                </p>
              </div>

              {/* Submit Button */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-md hover:bg-gray-400 transition-colors font-medium"
                >
                  {t("cancel")}
                </button>
                <button
                  type="submit"
                  disabled={
                    isSubmittingEdit ||
                    editReviewRating === 0 ||
                    !editReviewComment.trim()
                  }
                  className="flex-1 bg-[#0E4123] text-white py-3 px-4 rounded-md hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {isSubmittingEdit ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      {tMarketplace("updating")}
                    </div>
                  ) : (
                    tMarketplace("updateReview")
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Image Preview Popup */}
      {showImagePreview && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
          <div className="relative w-full max-w-4xl max-h-[90vh]">
            {/* Close Button */}
            <button
              onClick={closeImagePreview}
              className="absolute top-4 right-4 z-10 text-white hover:text-gray-300 transition-colors"
            >
              <FaTimes size={24} />
            </button>

            {/* Navigation Buttons */}
            {previewImages.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 text-white hover:text-gray-300 transition-colors bg-black/50 rounded-full p-2"
                >
                  <FaChevronLeft size={24} />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 text-white hover:text-gray-300 transition-colors bg-black/50 rounded-full p-2"
                >
                  <FaChevronLeft size={24} className="rotate-180" />
                </button>
              </>
            )}

            {/* Main Image */}
            <img
              src={previewImages[selectedImageIndex]}
              alt={`Preview ${selectedImageIndex + 1}`}
              className="w-full h-full object-contain max-h-[80vh] rounded-lg"
              onError={(e) => {
                e.currentTarget.src = productImagePlaceholder;
              }}
            />

            {/* Image Counter */}
            {previewImages.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white bg-black/50 rounded-full px-3 py-1 text-sm">
                {selectedImageIndex + 1} / {previewImages.length}
              </div>
            )}

            {/* Thumbnail Strip */}
            {previewImages.length > 1 && (
              <div className="flex justify-center mt-4 space-x-2 overflow-x-auto">
                {previewImages.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    className={`w-12 h-12 object-cover rounded cursor-pointer border-2 ${
                      index === selectedImageIndex
                        ? "border-white"
                        : "border-transparent opacity-60 hover:opacity-100"
                    } transition-all`}
                    onClick={() => setSelectedImageIndex(index)}
                    onError={(e) => {
                      e.currentTarget.src = productImagePlaceholder;
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
export default ProductDetailPage;
