"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { User, Sprout, Images, MapPin, ArrowLeft } from "lucide-react";
import { Kantumruy_Pro } from "next/font/google";
import { StepIndicator } from "@/components/createfarm/StepIndicator";
import { MessageAlert } from "@/components/createfarm/MessageAlert";
import { ImageUploader } from "@/components/createfarm/ImageUploader";
import { ArrayInputManager } from "@/components/createfarm/ArrayInputManager";
import { NavigationButtons } from "@/components/createfarm/NavigationButtons";
import MapPicker from "@/components/farmmap/MapPicker";
import { useRouter } from "next/navigation";
import { useTranslations } from "@/lib/i18n";

const kantumruyPro = Kantumruy_Pro({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

interface FarmData {
  owner: string;
  name: string;
  type: string;
  phone: string;
  address: string;
  growing: string[];
  certifications: string[];
  about: string;
  telegramUrl: string;
  lat: string;
  lng: string;
  website?: string;
  farm_size?: string;
  established_year?: string;
  farming_methods: string[];
  products: string[];
}

const CreateFarmPage = () => {
  const router = useRouter();
  const { t, tFarm, tNav, lang } = useTranslations();

  const [formData, setFormData] = useState<FarmData>({
    owner: "",
    name: "",
    type: "Farm",
    phone: "",
    address: "",
    growing: [],
    certifications: [],
    about: "",
    telegramUrl: "",
    lat: "",
    lng: "",
    website: "",
    farm_size: "",
    established_year: "",
    farming_methods: [],
    products: [],
  });

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{
    text: string;
    type: "error" | "success" | "info";
  }>({
    text: "",
    type: "info",
  });
  const [currentStep, setCurrentStep] = useState(1);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [galleryImages, setGalleryImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<{
    profile: string | null;
    gallery: string[];
  }>({ profile: null, gallery: [] });

  const [growingInput, setGrowingInput] = useState("");
  const [certificationsInput, setCertificationsInput] = useState("");
  const [farmingMethodsInput, setFarmingMethodsInput] = useState("");
  const [productsInput, setProductsInput] = useState("");

  const steps = [
    { number: 1, title: tFarm("stepBasicInfo"), icon: User },
    { number: 2, title: tFarm("stepDetails"), icon: Sprout },
    { number: 3, title: tFarm("stepMediaContact"), icon: Images },
    { number: 4, title: tFarm("stepLocation"), icon: MapPin },
  ];

  const handleBackToMap = () => {
    router.push("/map");
  };

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      const user = data.user;
      if (user) {
        setCurrentUser(user);

        const { data: profile } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        setUserProfile(profile);

        const ownerName = profile?.username;

        setFormData((prev) => ({
          ...prev,
          owner: ownerName,
        }));

        const { data: existingFarm } = await supabase
          .from("farm_data")
          .select("*")
          .eq("owner", ownerName)
          .single();

        if (existingFarm) {
          setMessage({
            text: tFarm("alreadyHaveFarm"),
            type: "info",
          });
        }
      }
    };
    fetchUser();
  }, [tFarm]);

  const validateStep = (step: number): boolean => {
    const errors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.name.trim()) {
        errors.name = `${tFarm("farmName")} ${t("required")}`;
      } else if (formData.name.trim().length < 2) {
        errors.name = `${tFarm("farmName")} must be at least 2 characters`;
      }

      if (!formData.type.trim()) {
        errors.type = `${tFarm("farmType")} ${t("required")}`;
      }

      if (!formData.about.trim()) {
        errors.about = `${tFarm("farmAbout")} ${t("required")}`;
      } else if (formData.about.trim().length < 10) {
        errors.about = `${tFarm("farmAbout")} must be at least 10 characters`;
      }
    }

    if (step === 2) {
      if (formData.growing.length === 0) {
        errors.growing = `Please add at least one ${tFarm(
          "growingCrops"
        ).toLowerCase()}`;
      }
    }

    if (step === 3) {
      if (!formData.phone.trim()) {
        errors.phone = `${tFarm("farmPhone")} ${t("required")}`;
      } else if (!/^\+?[0-9\s\-\(\)]{8,}$/.test(formData.phone)) {
        errors.phone = `${tFarm("farmPhone")} is invalid`;
      }

      if (formData.website && !isValidUrl(formData.website)) {
        errors.website = `${tFarm("farmWebsite")} is invalid`;
      }

      // Better Telegram validation - flexible but with helpful guidance
      if (formData.telegramUrl && formData.telegramUrl.trim()) {
        const telegramInput = formData.telegramUrl.trim();

        // Check length
        if (telegramInput.length < 3) {
          errors.telegramUrl =
            lang === "kh"
              ? "ឈ្មោះតេឡេក្រាមខ្លីពេក (យ៉ាងហោចណាស់ ៣ តួអក្សរ)"
              : "Telegram username is too short (minimum 3 characters)";
        } else if (telegramInput.length > 32) {
          errors.telegramUrl =
            lang === "kh"
              ? "ឈ្មោះតេឡេក្រាមវែងពេក (អតិបរមា ៣២ តួអក្សរ)"
              : "Telegram username is too long (maximum 32 characters)";
        }
        // Check for valid characters (Telegram usernames can contain a-z, 0-9, underscores)
        else if (!/^[a-zA-Z0-9_@\.\/:-]+$/.test(telegramInput)) {
          errors.telegramUrl =
            lang === "kh"
              ? "ឈ្មោះតេឡេក្រាមមានតួអក្សរមិនត្រឹមត្រូវ (ត្រូវការ a-z, 0-9, _)"
              : "Telegram username contains invalid characters (only a-z, 0-9, _ allowed)";
        }
        // Check for common mistakes but don't block them
        else if (telegramInput.includes(" ")) {
          // Just a warning, not an error - you can show this as a hint instead
          console.log("Hint: Telegram usernames usually don't contain spaces");
        }
      }
    }

    if (step === 4) {
      if (!formData.lat || !formData.lng) {
        errors.location = `${tFarm("farmLocation")} ${t("required")}`;
      }

      if (!formData.address.trim()) {
        errors.address = `${tFarm("farmAddress")} ${t("required")}`;
      } else if (formData.address.trim().length < 5) {
        errors.address = `${tFarm(
          "farmAddress"
        )} must be at least 5 characters`;
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const isValidUrl = (string: string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const addToArray = (
    field: keyof Pick<
      FarmData,
      "growing" | "certifications" | "farming_methods" | "products"
    >,
    value: string,
    inputSetter: React.Dispatch<React.SetStateAction<string>>
  ) => {
    const trimmedValue = value.trim();
    if (trimmedValue && !formData[field].includes(trimmedValue)) {
      setFormData((prev) => ({
        ...prev,
        [field]: [...(prev[field] as string[]), trimmedValue],
      }));
      inputSetter("");

      if (field === "growing" && formErrors.growing) {
        setFormErrors((prev) => ({
          ...prev,
          growing: "",
        }));
      }
    }
  };

  const removeFromArray = (
    field: keyof Pick<
      FarmData,
      "growing" | "certifications" | "farming_methods" | "products"
    >,
    index: number
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: (prev[field] as string[]).filter((_, i) => i !== index),
    }));
  };

  const handleProfileImageSelect = (file: File) => {
    setProfileImage(file);
    const reader = new FileReader();
    reader.onload = (ev) =>
      setImagePreviews((prev) => ({
        ...prev,
        profile: ev.target?.result as string,
      }));
    reader.readAsDataURL(file);
  };

  const handleGalleryImagesSelect = (files: File[]) => {
    const validFiles = files
      .filter((f) => f.type.startsWith("image/") && f.size <= 5 * 1024 * 1024)
      .slice(0, 5 - galleryImages.length);

    if (validFiles.length === 0) {
      setMessage({
        text: "រូបភាពមិនត្រឹមត្រូវ ឬទំហំធំពេក",
        type: "error",
      });
      return;
    }

    setGalleryImages((prev) => [...prev, ...validFiles]);

    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) =>
        setImagePreviews((prev) => ({
          ...prev,
          gallery: [...prev.gallery, ev.target?.result as string],
        }));
      reader.readAsDataURL(file);
    });
  };

  const removeGalleryImage = (index: number) => {
    setGalleryImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => ({
      ...prev,
      gallery: prev.gallery.filter((_, i) => i !== index),
    }));
  };

  const uploadImageToR2 = async (file: File): Promise<string> => {
    try {
      const data = new FormData();
      const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}_${
        file.name
      }`;
      data.append("file", file);
      data.append("fileName", fileName);

      const res = await fetch(
        "https://r2uploader.ingjin50.workers.dev/upload",
        {
          method: "POST",
          body: data,
        }
      );

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Upload failed: ${res.status} - ${errorText}`);
      }

      const json = await res.json();

      const fileUrl = json.imageUrl || json.fileUrl;

      if (!fileUrl) {
        throw new Error("No file URL returned from upload");
      }

      return fileUrl;
    } catch (error) {
      console.error("Upload error:", error);
      throw error;
    }
  };

  const uploadAllImages = async () => {
    let profileUrl = "";
    const galleryUrls: string[] = [];

    try {
      if (profileImage) {
        profileUrl = await uploadImageToR2(profileImage);
      }

      for (const img of galleryImages) {
        try {
          const url = await uploadImageToR2(img);
          galleryUrls.push(url);
        } catch (error) {
          console.error("Gallery image upload failed, skipping:", error);
        }
      }
    } catch (error) {
      console.warn("Image upload process had issues:", error);
    }

    return { profileUrl, galleryUrls };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) {
      setMessage({
        text: tFarm("mustLogin"),
        type: "error",
      });
      return;
    }

    if (!validateStep(4)) {
      setCurrentStep(4);
      return;
    }

    setLoading(true);
    setUploading(true);

    try {
      let profileUrl = "";
      let galleryUrls: string[] = [];

      if (profileImage || galleryImages.length > 0) {
        const uploadResult = await uploadAllImages();
        profileUrl = uploadResult.profileUrl;
        galleryUrls = uploadResult.galleryUrls;
      }

      const ownerName =
        userProfile?.username || userProfile?.display_name || currentUser.email;

      const farmData = {
        owner: ownerName,
        pf_url: profileUrl || null,
        type: formData.type,
        lat: formData.lat ? parseFloat(formData.lat) : null,
        lng: formData.lng ? parseFloat(formData.lng) : null,
        name: formData.name,
        phone: formData.phone || null,
        address: formData.address || null,
        growing: formData.growing,
        certifications: formData.certifications,
        about: formData.about,
        photos: galleryUrls,
        owner_social: formData.telegramUrl
          ? [{ platform: "Telegram", url: formData.telegramUrl }]
          : [],
        is_visible: true,
        status: "not verified",
      };

      const { data, error } = await supabase
        .from("farm_data")
        .insert([farmData])
        .select();

      if (error) throw error;

      setMessage({
        text: `✅ ${tFarm("farmCreated")}`,
        type: "success",
      });

      setTimeout(() => {
        setFormData({
          owner: ownerName,
          name: "",
          type: "Farm",
          phone: "",
          address: "",
          growing: [],
          certifications: [],
          about: "",
          telegramUrl: "",
          lat: "",
          lng: "",
          website: "",
          farm_size: "",
          established_year: "",
          farming_methods: [],
          products: [],
        });
        setImagePreviews({ profile: null, gallery: [] });
        setProfileImage(null);
        setGalleryImages([]);
        setCurrentStep(1);
        setFormErrors({});
      }, 2000);
    } catch (err: any) {
      setMessage({
        text: `${t("error")}: ${err.message || tFarm("farmCreationError")}`,
        type: "error",
      });
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep < steps.length) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <section className="w-full h-full relative">
      <div
        className={`min-h-screen bg-linear-to-br from-emerald-50 via-green-50 to-cyan-50 p-4 ${kantumruyPro.className}`}
      >
        <div className="max-w-2xl mx-auto">
          <button
            onClick={handleBackToMap}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 mb-6 transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>
              {t("back")} {t("to")} {tNav("farmMap")}
            </span>
          </button>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-linear-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent mb-2">
              {tFarm("createFarm")}
            </h1>
            <p className="text-gray-600">{t("shareYourFarmWithCommunity")}</p>
          </div>

          <StepIndicator steps={steps} currentStep={currentStep} />

          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
            <MessageAlert message={message} />

            <form onSubmit={handleSubmit} className="p-6">
              {currentStep === 1 && (
                <div className="space-y-6 animate-fadeIn">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      {tFarm("farmName")} *
                    </label>
                    <input
                      type="text"
                      name="name"
                      placeholder={t("enterFarmName")}
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className={`w-full p-4 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 ${
                        formErrors.name ? "border-red-300" : "border-gray-200"
                      }`}
                    />
                    {formErrors.name && (
                      <p className="text-red-500 text-sm mt-1">
                        {formErrors.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      {tFarm("farmType")} *
                    </label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      className={`w-full p-4 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 ${
                        formErrors.type ? "border-red-300" : "border-gray-200"
                      }`}
                    >
                      <option value="Farm">កសិដ្ឋាន</option>
                      <option value="NGO">អង្គការ</option>
                      <option value="Store/Market">ហាង/ផ្សារ</option>
                      <option value="Education Center">មជ្ឈមណ្ឌលអប់រំ</option>
                      <option value="Processing Facility">មជ្ឈមណ្ឌលផលិត</option>
                    </select>
                    {formErrors.type && (
                      <p className="text-red-500 text-sm mt-1">
                        {formErrors.type}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      {tFarm("farmAbout")} *
                    </label>
                    <textarea
                      name="about"
                      placeholder={t("tellUsAboutYourFarm")}
                      value={formData.about}
                      onChange={handleInputChange}
                      required
                      rows={4}
                      className={`w-full p-4 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 resize-none ${
                        formErrors.about ? "border-red-300" : "border-gray-200"
                      }`}
                    />
                    {formErrors.about && (
                      <p className="text-red-500 text-sm mt-1">
                        {formErrors.about}
                      </p>
                    )}
                  </div>

                  <NavigationButtons
                    currentStep={currentStep}
                    totalSteps={steps.length}
                    onPrevious={prevStep}
                    onNext={nextStep}
                  />
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-6 animate-fadeIn">
                  <ArrayInputManager
                    label={tFarm("growingCrops")}
                    items={formData.growing}
                    inputValue={growingInput}
                    onInputChange={setGrowingInput}
                    onAddItem={(value) =>
                      addToArray("growing", value, setGrowingInput)
                    }
                    onRemoveItem={(index) => removeFromArray("growing", index)}
                    placeholder={t("addCrops")}
                    error={formErrors.growing}
                    required
                  />

                  <ArrayInputManager
                    label={tFarm("certifications")}
                    items={formData.certifications}
                    inputValue={certificationsInput}
                    onInputChange={setCertificationsInput}
                    onAddItem={(value) =>
                      addToArray(
                        "certifications",
                        value,
                        setCertificationsInput
                      )
                    }
                    onRemoveItem={(index) =>
                      removeFromArray("certifications", index)
                    }
                    placeholder="ឧ. សរីរាង្គ, Fair Trade..."
                    badgeColor="bg-orange-100"
                    textColor="text-orange-800"
                  />

                  <NavigationButtons
                    currentStep={currentStep}
                    totalSteps={steps.length}
                    onPrevious={prevStep}
                    onNext={nextStep}
                  />
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-6 animate-fadeIn">
                  <ImageUploader
                    profileImage={profileImage}
                    galleryImages={galleryImages}
                    imagePreviews={imagePreviews}
                    onProfileImageSelect={handleProfileImageSelect}
                    onGalleryImagesSelect={handleGalleryImagesSelect}
                    onRemoveProfileImage={() => {
                      setProfileImage(null);
                      setImagePreviews((prev) => ({ ...prev, profile: null }));
                    }}
                    onRemoveGalleryImage={removeGalleryImage}
                  />

                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        {tFarm("farmPhone")} *
                      </label>
                      <input
                        type="text"
                        name="phone"
                        placeholder="+855 12 345 678"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className={`w-full p-4 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 ${
                          formErrors.phone
                            ? "border-red-300"
                            : "border-gray-200"
                        }`}
                      />
                      {formErrors.phone && (
                        <p className="text-red-500 text-sm mt-1">
                          {formErrors.phone}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      {tFarm("farmTelegram")}
                    </label>
                    <input
                      type="text"
                      name="telegramUrl"
                      placeholder="https://t.me/yourusername"
                      value={formData.telegramUrl}
                      onChange={handleInputChange}
                      className={`w-full p-4 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 ${
                        formErrors.telegramUrl
                          ? "border-red-300"
                          : "border-gray-200"
                      }`}
                    />
                    {formErrors.telegramUrl && (
                      <p className="text-red-500 text-sm mt-1">
                        {formErrors.telegramUrl}
                      </p>
                    )}
                  </div>

                  <NavigationButtons
                    currentStep={currentStep}
                    totalSteps={steps.length}
                    onPrevious={prevStep}
                    onNext={nextStep}
                  />
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-6 animate-fadeIn">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      {tFarm("farmLocation")} *
                    </label>
                    <div
                      className={`h-80 w-full border-2 rounded-2xl overflow-hidden mb-4 ${
                        formErrors.location
                          ? "border-red-300"
                          : "border-gray-200"
                      }`}
                    >
                      <MapPicker
                        lat={formData.lat ? parseFloat(formData.lat) : 12.5657}
                        lng={formData.lng ? parseFloat(formData.lng) : 104.991}
                        onLocationSelect={(lat, lng) => {
                          setFormData((prev) => ({
                            ...prev,
                            lat: lat.toString(),
                            lng: lng.toString(),
                          }));
                          if (formErrors.location) {
                            setFormErrors((prev) => ({
                              ...prev,
                              location: "",
                            }));
                          }
                        }}
                      />
                    </div>
                    {formErrors.location && (
                      <p className="text-red-500 text-sm mt-1 text-center">
                        {formErrors.location}
                      </p>
                    )}
                    <p className="text-sm text-gray-600 text-center">
                      📍 {tFarm("selectLocation")}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      {tFarm("farmAddress")} *
                    </label>
                    <input
                      type="text"
                      name="address"
                      placeholder={t("fullAddress")}
                      value={formData.address}
                      onChange={handleInputChange}
                      className={`w-full p-4 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 ${
                        formErrors.address
                          ? "border-red-300"
                          : "border-gray-200"
                      }`}
                    />
                    {formErrors.address && (
                      <p className="text-red-500 text-sm mt-1">
                        {formErrors.address}
                      </p>
                    )}
                  </div>

                  <NavigationButtons
                    currentStep={currentStep}
                    totalSteps={steps.length}
                    loading={loading}
                    uploading={uploading}
                    onPrevious={prevStep}
                    onSubmit={handleSubmit}
                    isLastStep
                  />
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CreateFarmPage;
