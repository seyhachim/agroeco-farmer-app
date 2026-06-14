"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Kantumruy_Pro } from "next/font/google";
import {
  Leaf,
  Sprout,
  MapPin,
  BookOpen,
  ShoppingBag,
  MessageCircle,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "@/lib/i18n";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

const kantumruyPro = Kantumruy_Pro({
  subsets: ["khmer", "latin"],
  weight: ["400", "500", "700"],
});

interface Highlight {
  id: string;
  image: string;
  title: string;
  label: string;
  href: string;
}

interface NewsItem {
  id: string;
  image: string;
  title: string;
  excerpt: string;
  date: string;
  href: string;
}

export default function WelcomePage() {
  const { t, lang, setLang } = useTranslations();
  const { user, loading } = useAuth();
  const router = useRouter();
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleSeeMore = () => {
    router.push("/auth/login");
  };

  const scrollHighlights = (direction: "left" | "right") => {
    const container = scrollRef.current;
    if (!container) return;
    const amount = container.clientWidth * 0.8;
    container.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  const formatNewsDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(lang === "kh" ? "km-KH" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  useEffect(() => {
    if (!loading && user) {
      router.push("/");
    }
  }, [user, loading, router]);

  useEffect(() => {
    async function loadHighlights() {
      const items: Highlight[] = [];

      const { data: products } = await supabase
        .from("products")
        .select("id, title, type")
        .eq("type", "shop")
        .order("created_at", { ascending: false })
        .limit(4);

      if (products && products.length > 0) {
        const { data: images } = await supabase
          .from("product_images")
          .select("product_id, image_url")
          .in("product_id", products.map((p) => p.id))
          .order("image_order", { ascending: true });

        for (const product of products) {
          const image = images?.find((img) => img.product_id === product.id);
          if (image) {
            items.push({
              id: product.id,
              image: image.image_url,
              title: product.title,
              label: t("highlightMarketplaceLabel"),
              href: `/resource/detail-product/${product.id}`,
            });
          }
        }
      }

      const { data: guides } = await supabase
        .from("guides_data")
        .select("id, title, image_url")
        .not("image_url", "is", null)
        .order("created_at", { ascending: false })
        .limit(4);

      if (guides && guides.length > 0) {
        for (const guide of guides) {
          items.push({
            id: guide.id,
            image: guide.image_url,
            title: guide.title,
            label: t("highlightKnowledgeLabel"),
            href: `/knowledge/detail-guide/${guide.id}`,
          });
        }
      }

      const { data: posts } = await supabase
        .from("posts")
        .select("id, title, content, images, created_at")
        .not("images", "is", null)
        .order("created_at", { ascending: false })
        .limit(8);

      const postsWithImage =
        posts?.filter((p) => Array.isArray(p.images) && p.images.length > 0) ??
        [];

      for (const post of postsWithImage.slice(0, 4)) {
        items.push({
          id: post.id,
          image: post.images[0],
          title: post.title,
          label: t("highlightForumLabel"),
          href: `/forum/${post.id}`,
        });
      }

      setHighlights(items.slice(0, 9));

      setNews(
        postsWithImage.slice(0, 3).map((post) => ({
          id: post.id,
          image: post.images[0],
          title: post.title,
          excerpt: (post.content ?? "").slice(0, 120),
          date: post.created_at,
          href: `/forum/${post.id}`,
        }))
      );
    }

    loadHighlights();
  }, [t]);

  if (loading || user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600"></div>
      </div>
    );
  }

  const features = [
    {
      icon: MapPin,
      title: t("featureMapTitle"),
      desc: t("featureMapDesc"),
    },
    {
      icon: BookOpen,
      title: t("featureKnowledgeTitle"),
      desc: t("featureKnowledgeDesc"),
    },
    {
      icon: ShoppingBag,
      title: t("featureMarketplaceTitle"),
      desc: t("featureMarketplaceDesc"),
    },
    {
      icon: MessageCircle,
      title: t("featureForumTitle"),
      desc: t("featureForumDesc"),
    },
  ];

  return (
    <div className={`${kantumruyPro.className} relative flex flex-col text-white`}>
      {/* Hero section with background image */}
      <div className="relative min-h-[70vh] flex flex-col">
        <Image
          src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=1600&auto=format&fit=crop"
          alt="Farmer in a green field"
          fill
          priority
          className="object-cover"
        />
        {/* Gradient overlay for readability */}
        <div className="absolute inset-0 bg-linear-to-b from-black/60 via-black/30 to-black/70" />

        {/* Top bar */}
        <div className="relative flex items-center justify-between px-5 pt-6">
          <div className="flex items-center gap-2">
            <Leaf className="h-6 w-6 text-green-400" />
            <span className="text-lg font-bold">
              Agro<span className="text-green-400">Eco</span>
            </span>
          </div>
          <button
            type="button"
            onClick={() => setLang(lang === "kh" ? "en" : "kh")}
            className="text-sm text-white/90 bg-white/10 rounded-full px-3 py-1 backdrop-blur-sm"
          >
            {lang === "kh" ? "EN" : "ខ្មែរ"}
          </button>
        </div>

        {/* Hero content */}
        <div className="relative flex-1 flex flex-col items-center justify-center text-center px-6 pt-6">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/15 ring-1 ring-green-300/40 backdrop-blur-sm">
            <Sprout className="h-8 w-8 text-green-300" strokeWidth={2} />
          </div>
          <h1 className="text-3xl font-bold leading-tight">{t("welcome")}</h1>
          <p className="mt-3 text-white/85 max-w-xs">{t("subtitle")}</p>
        </div>

        {/* CTA pills */}
        <div className="relative px-6 pb-6">
          <p className="text-center text-sm text-white/85 mb-3">
            {t("getStarted")}
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link href="/auth/login" className="flex-1 max-w-40">
              <Button className="w-full h-10 bg-green-700 hover:bg-green-800">
                {t("login")}
              </Button>
            </Link>
            <Link href="/auth/signup" className="flex-1 max-w-40">
              <Button
                variant="outline"
                className="w-full h-10 bg-white/10 border-white/30 text-white hover:bg-white/20"
              >
                {t("signup")}
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Live highlights from the platform */}
      {highlights.length > 0 && (
        <div className="relative bg-white text-gray-900 px-6 pt-8 pb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                {t("highlightsTitle")}
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                {t("highlightsSubtitle")}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => scrollHighlights("left")}
                aria-label="Scroll left"
                className="h-8 w-8 flex items-center justify-center rounded-full bg-green-50 border border-green-100 text-green-700 hover:bg-green-100 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => scrollHighlights("right")}
                aria-label="Scroll right"
                className="h-8 w-8 flex items-center justify-center rounded-full bg-green-50 border border-green-100 text-green-700 hover:bg-green-100 transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div
            ref={scrollRef}
            className="mt-4 flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          >
            {highlights.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="relative aspect-4/5 w-[70%] sm:w-72 shrink-0 snap-start overflow-hidden"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.image}
                  alt={item.title}
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />
                <span className="absolute top-2 left-2 rounded-full bg-green-700/90 px-2 py-0.5 text-xs font-semibold text-white">
                  {item.label}
                </span>
                <span className="absolute bottom-2 left-2 right-2 text-sm font-semibold text-white leading-tight line-clamp-2">
                  {item.title}
                </span>
              </Link>
            ))}

            {/* See more — requires login */}
            <button
              type="button"
              onClick={handleSeeMore}
              className="relative aspect-4/5 w-[70%] sm:w-72 shrink-0 snap-start overflow-hidden rounded-xl bg-green-50 border border-green-100 flex flex-col items-center justify-center gap-2 text-green-700 hover:bg-green-100 transition-colors"
            >
              <div className="h-10 w-10 flex items-center justify-center rounded-full bg-green-700 text-white">
                <ArrowRight className="h-5 w-5" />
              </div>
              <span className="text-base font-semibold">{t("seeMore")}</span>
            </button>
          </div>
        </div>
      )}

      {/* Latest news from the community */}
      {news.length > 0 && (
        <div className="relative bg-white text-gray-900 px-6 pt-2 pb-6">
          <h2 className="text-lg font-bold text-gray-900">{t("newsTitle")}</h2>
          <p className="mt-1 text-sm text-gray-500">{t("newsSubtitle")}</p>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {news.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className="group block overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="relative aspect-video w-full overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.image}
                    alt={item.title}
                    className="absolute inset-0 h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                </div>
                <div className="p-3">
                  <p className="text-xs text-gray-400">
                    {formatNewsDate(item.date)}
                  </p>
                  <h3 className="mt-1 text-sm font-semibold text-gray-900 leading-snug line-clamp-2">
                    {item.title}
                  </h3>
                  {item.excerpt && (
                    <p className="mt-1 text-xs text-gray-500 leading-relaxed line-clamp-2">
                      {item.excerpt}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* About / description section */}
      <div className="relative bg-white text-gray-900 px-6 pt-2 pb-4">
        <h2 className="text-xl font-bold text-center text-green-800">
          Agro<span className="text-green-600">Eco</span>
        </h2>
        <p className="mt-3 text-sm text-gray-600 text-center leading-relaxed">
          {t("platformDescription")}
        </p>

        {/* Feature cards */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          {features.map((feature, i) => (
            <div
              key={i}
              className="bg-green-50 rounded-xl p-3 flex flex-col gap-1.5 border border-green-100"
            >
              <div className="h-8 w-8 flex items-center justify-center rounded-full bg-green-700 text-white">
                <feature.icon className="h-4 w-4" />
              </div>
              <span className="text-sm font-semibold text-gray-900">
                {feature.title}
              </span>
              <span className="text-xs text-gray-500 leading-snug">
                {feature.desc}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
