"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useProfile } from "@/context/ProfileContext";
import {
  Mail,
  Phone,
  Calendar,
  Hash,
  Pencil,
  Camera,
  ArrowLeft,
} from "lucide-react";

export default function ProfilePage() {
  const { user, loading, logout } = useAuth();
  const { profile, loading: profileLoading, updateProfile } = useProfile();
  const router = useRouter();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  // Redirect only after loading is done
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth/login");
    }
  }, [loading, user, router]);

  // While checking session, show loader (don't render profile or redirect)
  if (loading || profileLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Checking session...</p>
      </div>
    );
  }

  // If still no user after loading, return nothing (redirect will handle)
  if (!user) {
    return null;
  }

  const displayName =
    profile?.display_name || user.email?.split("@")[0] || "Farmer";

  const avatarUrl = profile?.avatar_url || null;

  const startEditing = () => {
    setNameInput(displayName);
    setAvatarPreview(null);
    setAvatarFile(null);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setAvatarPreview(null);
    setAvatarFile(null);
  };

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const uploadAvatarToR2 = async (file: File): Promise<string> => {
    const data = new FormData();
    const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}_${file.name}`;
    data.append("file", file);
    data.append("fileName", fileName);

    const res = await fetch("https://r2uploader.ingjin50.workers.dev/upload", {
      method: "POST",
      body: data,
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Upload failed: ${res.status} - ${errorText}`);
    }

    const json = await res.json();
    const fileUrl = json.imageUrl || json.fileUrl;
    if (!fileUrl) throw new Error("No file URL returned from upload");
    return fileUrl;
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let newAvatarUrl = avatarUrl;
      if (avatarFile) {
        newAvatarUrl = await uploadAvatarToR2(avatarFile);
      }

      await updateProfile({
        display_name: nameInput.trim() || null,
        avatar_url: newAvatarUrl,
      });

      setIsEditing(false);
      setAvatarPreview(null);
      setAvatarFile(null);
    } catch (error) {
      console.error("Failed to save profile:", error);
      alert("Failed to save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const fields = [
    { icon: Mail, label: "Email", value: user.email || "-" },
    { icon: Phone, label: "Phone", value: user.phone || "-" },
    {
      icon: Calendar,
      label: "Created At",
      value: new Date(user.created_at).toLocaleString(),
    },
    { icon: Hash, label: "User ID", value: user.id },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full bg-white overflow-hidden">
        {/* Banner */}
        <div className="relative bg-[#0E4123] px-6 pt-6 pb-16">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex items-center gap-1 text-sm text-white/80 hover:text-white transition"
              aria-label="Go back"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            {!isEditing && (
              <button
                type="button"
                onClick={startEditing}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/10 text-white text-xs font-semibold hover:bg-white/20 transition"
              >
                <Pencil size={14} />
                Edit
              </button>
            )}
          </div>

          <h1 className="mt-4 text-2xl font-bold text-white">My Profile</h1>
          <p className="text-white/60 text-sm mt-1">
            Manage your account information
          </p>
        </div>

        {/* Avatar overlapping banner */}
        <div className="px-6">
          <div className="-mt-12 flex flex-col items-center text-center">
            <div className="relative">
              <img
                src={avatarPreview || avatarUrl || "/default-avatar.svg"}
                alt={displayName}
                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md bg-white"
              />

              {isEditing && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  title="Change profile picture"
                  aria-label="Change profile picture"
                  className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#0E4123] text-white flex items-center justify-center shadow-md hover:bg-[#0B3118] transition"
                >
                  <Camera size={16} />
                </button>
              )}
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                title="Profile picture"
                onChange={handleAvatarSelect}
                className="hidden"
              />
            </div>

            {isEditing ? (
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Full Name"
                className="mt-3 w-full max-w-xs text-center text-lg font-bold text-gray-900 border-b border-gray-200 focus:border-[#0E4123] outline-none pb-1"
              />
            ) : (
              <h2 className="mt-3 text-lg font-bold text-gray-900">
                {displayName}
              </h2>
            )}

            <span className="mt-1 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#0E4123]/10 text-[#0E4123]">
              Farmer
            </span>

            {isEditing && (
              <div className="mt-4 flex gap-3 w-full max-w-xs">
                <button
                  type="button"
                  onClick={cancelEditing}
                  disabled={saving}
                  className="flex-1 px-4 py-2 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 px-4 py-2 rounded-xl bg-[#0E4123] text-white font-medium hover:bg-[#0B3118] transition disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
              Account Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {fields.map(({ icon: Icon, label, value }) => (
                <div
                  key={label}
                  className="p-4 bg-slate-50 rounded-xl border border-slate-100"
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <Icon size={14} className="text-[#0E4123]" />
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      {label}
                    </label>
                  </div>
                  <p
                    className={`text-gray-800 break-all ${
                      label === "User ID"
                        ? "font-mono text-xs text-gray-500"
                        : "text-sm font-medium"
                    }`}
                  >
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={async () => {
                await logout();
                router.replace("/auth/login");
              }}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
