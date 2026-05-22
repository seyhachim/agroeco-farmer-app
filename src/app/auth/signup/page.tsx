// app/auth/signup/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useTranslations } from "@/lib/i18n";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
  const { t, lang, setLang } = useTranslations();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name) {
      newErrors.name = lang === "kh" ? "សូមបញ្ចូលឈ្មោះ" : "Name is required";
    }

    if (!formData.email) {
      newErrors.email = lang === "kh" ? "សូមបញ្ចូលអ៊ីមែល" : "Email is required";
    }

    if (!formData.password) {
      newErrors.password =
        lang === "kh" ? "សូមបញ្ចូលពាក្យសម្ងាត់" : "Password is required";
    }

    if (formData.password.length > 0 && formData.password.length < 6) {
      newErrors.password =
        lang === "kh"
          ? "ពាក្យសម្ងាត់ត្រូវមានយ៉ាងហោចណាស់ 6 តួអក្សរ"
          : "Password must be at least 6 characters";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword =
        lang === "kh" ? "ពាក្យសម្ងាត់មិនត្រូវគ្នា" : "Passwords do not match";
    }

    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      // const { data, error } = await supabase.auth.signUp({
      //   email: formData.email,
      //   password: formData.password,
      //   options: {
      //     data: {
      //       full_name: formData.name,
      //     },
      //     emailRedirectTo: `${window.location.origin}/auth/confirm`,
      //   },
      // });
      const { data, error } = await supabase.auth.signUp({
        email: formData.email.trim(),
        password: formData.password,
        options: {
          data: { full_name: formData.name },
          emailRedirectTo: `${window.location.origin}/auth/confirm`,
        },
      });

      if (error) throw error;

      if (data.user) {
        router.push("/auth/confirm");
      } else if (data.session) {
        router.push("/");
      }
    } catch (error: any) {
      console.error("Sign up error:", error);
      setErrors({
        email:
          error.message ||
          (lang === "kh" ? "កំហុសក្នុងការចុះឈ្មោះ" : "Sign up error occurred"),
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isMounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md text-center">
          <div className="animate-pulse">
            <div className="h-12 bg-gray-200 rounded mb-4"></div>
            <div className="space-y-4">
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <button
        onClick={() => setLang(lang === "kh" ? "en" : "kh")}
        className="absolute top-4 right-4 text-sm text-gray-600 underline"
      >
        {lang === "kh" ? "EN" : "ខ្មែរ"}
      </button>

      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">{t("signup")}</CardTitle>
          <p className="text-gray-600">
            {lang === "kh" ? "ចុះឈ្មោះគណនីថ្មី" : "Create a new account"}
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">{lang === "kh" ? "ឈ្មោះ" : "Name"}</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="mt-1"
                disabled={loading}
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <Label htmlFor="email">{t("email")}</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="mt-1"
                disabled={loading}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <Label htmlFor="password">{t("password")}</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="mt-1"
                disabled={loading}
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            <div>
              <Label htmlFor="confirmPassword">{t("confirmPassword")}</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                className="mt-1"
                disabled={loading}
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full h-12" disabled={loading}>
              {loading
                ? lang === "kh"
                  ? "កំពុងចុះឈ្មោះ..."
                  : "Signing up..."
                : t("signup")}
            </Button>

            <div className="text-center">
              <Link
                href="/auth/login"
                className="text-sm text-green-600 hover:underline"
              >
                {t("switchToLogin")}
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
