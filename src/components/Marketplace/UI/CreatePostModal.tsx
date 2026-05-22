"use client";
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, Trash2, AlertCircle } from "lucide-react";
import {
  marketplaceApi,
  Product,
  CreateProductData,
} from "../../../lib/api/marketplaceApi";
import { supabase } from "../../../lib/supabase";
import { useTranslations } from "../../../lib/i18n";

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: "shop" | "trade" | "myposts";
  onPostCreated: () => void;
  editProduct?: Product | null;
}

const categories = [
  "Seeds",
  "Tools",
  "Equipment",
  "Product",
  "Live Stock",
  "Trade",
] as const;

const certifications = [
  "Organic Only",
  "Agroecology Friendly",
  "Certified Organic",
] as const;

type Category = (typeof categories)[number];
type Certification = (typeof certifications)[number] | "";

interface FormData {
  title: string;
  description: string;
  price: string;
  oldPrice: string;
  discount: string;
  category: Category | "";
  certification: Certification;
  location: string;
  isBestSeller: boolean;
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({
  isOpen,
  onClose,
  activeTab,
  onPostCreated,
  editProduct,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { t, tMarketplace } = useTranslations();

  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    price: "",
    oldPrice: "",
    discount: "",
    category: "",
    certification: "",
    location: "",
    isBestSeller: false,
  });

  // Handle Escape key press
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Initialize form when editing
  useEffect(() => {
    if (editProduct) {
      setFormData({
        title: editProduct.title,
        description: editProduct.description,
        price: editProduct.price?.toString() || "",
        oldPrice: editProduct.old_price?.toString() || "",
        discount: editProduct.discount || "",
        category: (editProduct.category as Category) || "",
        certification: (editProduct.certification as Certification) || "",
        location: editProduct.location,
        isBestSeller: editProduct.is_best_seller,
      });
      setExistingImages(editProduct.images || []);
      setImagePreviews([]);
      setImages([]);
      setImagesToDelete([]);
    } else {
      // Reset form for new product
      setFormData({
        title: "",
        description: "",
        price: "",
        oldPrice: "",
        discount: "",
        category: "",
        certification: "",
        location: "",
        isBestSeller: false,
      });
      setExistingImages([]);
      setImagePreviews([]);
      setImages([]);
      setImagesToDelete([]);
    }
    setError(null);
  }, [editProduct, isOpen]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const totalImages = images.length + existingImages.length + files.length;

    if (totalImages > 3) {
      setError(tMarketplace("maximumPhotos_Product"));
      return;
    }

    // Validate file types and sizes
    const validImages = files.filter((file) => {
      const isValidType = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
      ].includes(file.type);
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB

      if (!isValidType) {
        setError(
          `Invalid file type: ${file.name}. ${tMarketplace(
            "pleaseUseValidImageFormats"
          )}`
        );
        return false;
      }
      if (!isValidSize) {
        setError(
          `File too large: ${file.name}. ${tMarketplace(
            "maximumFileSize"
          )} 10MB.`
        );
        return false;
      }
      return true;
    });

    if (validImages.length === 0) return;

    const newImages = [...images, ...validImages];
    setImages(newImages);

    const newPreviews = validImages.map((file) => URL.createObjectURL(file));
    setImagePreviews((prev) => [...prev, ...newPreviews]);

    // Clear error if upload was successful
    if (
      error?.includes("maximum") ||
      error?.includes("Invalid") ||
      error?.includes("large")
    ) {
      setError(null);
    }
  };

  const removeImage = (index: number, isExisting: boolean = false) => {
    if (isExisting) {
      const imageToRemove = existingImages[index];
      setImagesToDelete((prev) => [...prev, imageToRemove]);
      setExistingImages((prev) => prev.filter((_, i) => i !== index));
    } else {
      const newImages = images.filter((_, i) => i !== index);
      const newPreviews = imagePreviews.filter((_, i) => i !== index);

      setImages(newImages);
      setImagePreviews(newPreviews);
      if (imagePreviews[index]) {
        URL.revokeObjectURL(imagePreviews[index]);
      }
    }

    // Clear error if it was about maximum images
    if (error?.includes("maximum")) {
      setError(null);
    }
  };

  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      setError(tMarketplace("enterProductTitle"));
      return false;
    }

    if (!formData.description.trim()) {
      setError(tMarketplace("enterProductDescription"));
      return false;
    }

    if (!formData.location.trim()) {
      setError(tMarketplace("enterLocation"));
      return false;
    }

    if (!formData.category) {
      setError(tMarketplace("categoryRequired"));
      return false;
    }

    // Validate price if provided
    if (formData.price && parseFloat(formData.price) < 0) {
      setError(tMarketplace("priceMustBePositive"));
      return false;
    }

    if (formData.oldPrice && parseFloat(formData.oldPrice) < 0) {
      setError(tMarketplace("oldPriceMustBePositive"));
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      setError(t("pleaseSignIn"));
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const itemData: CreateProductData = {
        title: formData.title,
        description: formData.description,
        price: formData.price ? parseFloat(formData.price) : null,
        old_price: formData.oldPrice ? parseFloat(formData.oldPrice) : null,
        discount: formData.discount || null,
        category: formData.category || null,
        certification: formData.certification || null,
        location: formData.location,
        is_best_seller: formData.isBestSeller,
        type: "shop",
      };

      if (editProduct) {
        // Update existing product with images to delete
        await marketplaceApi.updateProduct(
          editProduct.id,
          itemData,
          images.length > 0 ? images : undefined,
          imagesToDelete.length > 0 ? imagesToDelete : undefined
        );
      } else {
        // Create new product
        await marketplaceApi.createProduct(itemData, images);
      }

      // Call the onPostCreated callback to trigger refresh
      onPostCreated();
      handleClose();
    } catch (error: unknown) {
      console.error("Error creating/updating item:", error);
      const errorMessage = error instanceof Error ? error.message : t("error");
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      title: "",
      description: "",
      price: "",
      oldPrice: "",
      discount: "",
      category: "",
      certification: "",
      location: "",
      isBestSeller: false,
    });
    setImages([]);
    // Clean up all object URLs
    imagePreviews.forEach((url) => URL.revokeObjectURL(url));
    setImagePreviews([]);
    setExistingImages([]);
    setImagesToDelete([]);
    setError(null);
    onClose();
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    // Clear error when user starts typing
    if (error) {
      setError(null);
    }
  };

  const allImages = [...existingImages, ...imagePreviews];
  const canAddMoreImages = allImages.length < 3;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50"
            onClick={handleClose}
          />

          <div className="fixed inset-0 flex items-center justify-center p-4 font-[kantumruy_Pro]">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editProduct ? t("edit") : t("create")}{" "}
                  {tMarketplace("product")}
                </h2>
                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                  disabled={isLoading}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form
                onSubmit={handleSubmit}
                className="p-6 overflow-y-auto max-h-[70vh]"
              >
                {/* Error Display */}
                {error && (
                  <div className="mb-6 rounded-lg p-3 bg-red-50 border border-red-200">
                    <div className="flex items-start gap-2">
                      <AlertCircle
                        className="text-red-600 mt-0.5 shrink-0"
                        size={16}
                      />
                      <div>
                        <p className="text-red-800 text-sm font-medium">
                          {error}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {tMarketplace("images")} (
                      {tMarketplace("maximumPhotos_Product")})
                    </label>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      {allImages.map((preview, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            width={200}
                            height={200}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              removeImage(index, index < existingImages.length)
                            }
                            className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-100 md:opacity-0 md:group-hover:opacity-100 transition duration-200 shadow-lg"
                            aria-label={t("delete")}
                            disabled={isLoading}
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      {canAddMoreImages && (
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-gray-400 transition"
                          disabled={isLoading}
                        >
                          <Upload className="w-8 h-8 mb-2" />
                          <span className="text-sm">{t("addImages")}</span>
                        </button>
                      )}
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                      style={{ fontSize: "16px" }}
                      disabled={isLoading}
                    />
                    {imagesToDelete.length > 0 && (
                      <p className="text-sm text-gray-500 mt-2">
                        {imagesToDelete.length}{" "}
                        {tMarketplace("existingImagesWillBeRemoved")}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      {tMarketplace("currentImages")}: {allImages.length}/3
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {tMarketplace("title")}
                    </label>
                    <input
                      type="text"
                      style={{ fontSize: "16px" }}
                      required
                      value={formData.title}
                      onChange={handleChange}
                      name="title"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder={t("enterTitle")}
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {tMarketplace("description")}
                    </label>
                    <textarea
                      required
                      value={formData.description}
                      onChange={handleChange}
                      name="description"
                      rows={4}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder={t("enterDescription")}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {tMarketplace("category")}
                      </label>
                      <select
                        required
                        value={formData.category}
                        onChange={handleChange}
                        name="category"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        disabled={isLoading}
                      >
                        <option value="">{t("selectCategory")}</option>
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {tMarketplace("certification")}
                      </label>
                      <select
                        value={formData.certification}
                        onChange={handleChange}
                        name="certification"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        disabled={isLoading}
                      >
                        <option value="">{t("selectCertification")}</option>
                        {certifications.map((cert) => (
                          <option key={cert} value={cert}>
                            {cert}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {tMarketplace("location")}
                    </label>
                    <input
                      type="text"
                      style={{ fontSize: "16px" }}
                      required
                      value={formData.location}
                      onChange={handleChange}
                      name="location"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder={t("enterLocation")}
                      disabled={isLoading}
                    />
                  </div>

                  {/* Price Section */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {tMarketplace("price")} ($)
                      </label>
                      <input
                        type="number"
                        style={{ fontSize: "16px" }}
                        step="0.01"
                        min="0"
                        value={formData.price}
                        onChange={handleChange}
                        name="price"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="0.00"
                        disabled={isLoading}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {tMarketplace("oldPrice")} ($)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        style={{ fontSize: "16px" }}
                        value={formData.oldPrice}
                        onChange={handleChange}
                        name="oldPrice"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="0.00"
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                  {/* 
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isBestSeller"
                      name="isBestSeller"
                      checked={formData.isBestSeller}
                      onChange={handleChange}
                      className="w-4 h-4 text-green-800 border-gray-300 rounded focus:ring-green-800 accent-green-800"
                      disabled={isLoading}
                    />
                    <label
                      htmlFor="isBestSeller"
                      className="ml-2 text-sm text-gray-700"
                    >
                      {tMarketplace("markAsBestSeller")}
                    </label>
                  </div> */}
                </div>

                <div className="mt-8 flex flex-col sm:flex-row gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={isLoading}
                    className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors font-medium"
                  >
                    {t("cancel")}
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 py-3 px-4 bg-[#0E4123] text-white rounded-lg hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        {editProduct
                          ? tMarketplace("updating")
                          : tMarketplace("creating")}
                      </>
                    ) : editProduct ? (
                      t("update")
                    ) : (
                      t("create")
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CreatePostModal;
