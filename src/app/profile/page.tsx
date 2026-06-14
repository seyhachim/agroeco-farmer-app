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
    <div className="min-h-screen bg-gray-100 p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center">
        <button
          type="button"
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-200 rounded-lg transition"
          aria-label="Go back"
        >
          <ArrowLeft className="text-[#0D1B2A]" size={22} />
        </button>
      </div>

      {/* Avatar card */}
      <div className="rounded-2xl bg-white shadow-md p-6 flex flex-col items-center text-center relative">
        {!isEditing && (
          <button
            type="button"
            onClick={startEditing}
            className="absolute top-4 right-4 flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#0E4123]/10 text-[#0E4123] text-xs font-semibold hover:bg-[#0E4123]/20 transition"
          >
            <Pencil size={14} />
            Edit
          </button>
        )}

        <div className="relative">
          <img
            src={avatarPreview || avatarUrl || "/default-avatar.svg"}
            alt={displayName}
            className="w-24 h-24 rounded-full object-cover border-4 border-[#0E4123]/10"
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
            className="mt-4 w-full max-w-xs text-center text-xl font-bold text-[#0D1B2A] border-b border-gray-200 focus:border-[#0E4123] outline-none pb-1"
          />
        ) : (
          <h1 className="mt-4 text-xl font-bold text-[#0D1B2A]">
            {displayName}
          </h1>
        )}
        <p className="text-sm text-gray-500">Farmer</p>

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

      {/* Details card */}
      <div className="rounded-2xl bg-white shadow-md divide-y divide-gray-100 overflow-hidden">
        {fields.map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-start gap-3 px-4 py-3">
            <Icon size={18} className="mt-0.5 text-[#0E4123] shrink-0" />
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-gray-500">
                {label}
              </span>
              <span className="text-sm text-[#0D1B2A] break-all">
                {value}
              </span>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={async () => {
          await logout();
          router.replace("/auth/login");
        }}
        className="w-full px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition font-medium"
      >
        Logout
      </button>
    </div>
  );
}
