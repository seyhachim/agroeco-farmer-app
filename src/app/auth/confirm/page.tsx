// app/auth/confirm/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslations } from "@/lib/i18n";

export default function ConfirmPage() {
  const { t, lang } = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const confirmEmail = async () => {
      const token = searchParams.get("token");
      const type = searchParams.get("type");
      const next = searchParams.get("next");
      const email = searchParams.get("email"); // required for both signup & recovery

      if (!token || !email) {
        setError(
          lang === "kh"
            ? "គ្មានអ៊ីមែល ឬ លេខសម្គាល់សម្រាប់បញ្ជាក់សមាជិកភាព"
            : "No email or token provided"
        );
        setLoading(false);
        return;
      }

      if (type === "signup") {
        try {
          const { data, error } = await supabase.auth.verifyOtp({
            type: "signup",
            token,
            email,
          });

          if (error) {
            console.error("Signup verification error:", error);
            setError(
              error.message ||
                (lang === "kh"
                  ? "កំហុសក្នុងការបញ្ជាក់សមាជិកភាព"
                  : "Verification error")
            );
            setLoading(false);
            return;
          }

          if (data.user) {
            setMessage(
              lang === "kh"
                ? "បានបញ្ជាក់សមាជិកភាពដោយជោគជ័យ! កំពុងបញ្ជូនទៅផ្ទាំងគ្រប់គ្រង..."
                : "Successfully confirmed! Redirecting to dashboard..."
            );

            setTimeout(() => router.push(next || "/"), 2000);
          }
        } catch (err) {
          console.error("Signup confirmation error:", err);
          setError(
            lang === "kh"
              ? "កំហុសក្នុងការបញ្ជាក់សមាជិកភាព"
              : "Confirmation error"
          );
        }
      } else if (type === "recovery") {
        try {
          const { error } = await supabase.auth.verifyOtp({
            type: "recovery",
            token,
            email,
          });

          if (error) {
            console.error("Password recovery error:", error);
            setError(
              error.message ||
                (lang === "kh"
                  ? "កំហុសក្នុងការកែប្រែពាក្យសម្ងាត់"
                  : "Password reset error")
            );
          } else {
            setMessage(
              lang === "kh"
                ? "បានកែប្រែពាក្យសម្ងាត់ដោយជោគជ័យ! កំពុងបញ្ជូនទៅផ្ទាំងចូលប្រើប្រាស់..."
                : "Password reset successful! Redirecting to login..."
            );
            setTimeout(() => router.push("/auth/login"), 2000);
          }
        } catch (err) {
          console.error("Password recovery error:", err);
          setError(
            lang === "kh"
              ? "កំហុសក្នុងការកែប្រែពាក្យសម្ងាត់"
              : "Password reset error"
          );
        }
      } else {
        setError(
          lang === "kh"
            ? "ប្រភេទបញ្ជាក់សមាជិកភាពមិនត្រឹមត្រូវ"
            : "Invalid confirmation type"
        );
      }

      setLoading(false);
    };

    confirmEmail();
  }, [searchParams, router, lang]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md text-center">
          <div className="animate-pulse">
            <div className="h-12 bg-gray-200 rounded mb-4"></div>
            <div className="space-y-4">
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
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            {t("confirmPassword")}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          {error ? (
            <div className="mb-4">
              <p className="text-red-500 mb-4">{error}</p>
              <Button
                onClick={() => router.push("/auth/login")}
                className="w-full"
              >
                {lang === "kh" ? "ត្រលប់ទៅការចូលប្រើប្រាស់" : "Go to Login"}
              </Button>
            </div>
          ) : (
            <div>
              <p className="text-green-600 mb-4">{message}</p>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
