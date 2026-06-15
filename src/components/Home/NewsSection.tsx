"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface NewsItem {
  id: string;
  title: string;
  image_url: string;
  description: string;
}

export default function NewsSection() {
  const [news, setNews] = useState<NewsItem[]>([]);

  useEffect(() => {
    supabase
      .from("guides_data")
      .select("id, title, image_url, description")
      .not("image_url", "is", null)
      .order("created_at", { ascending: false })
      .limit(3)
      .then(({ data }) => {
        if (data) setNews(data);
      });
  }, []);

  if (news.length === 0) return null;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-800">ព័ត៌មានកសិកម្ម</h2>
      <div className="space-y-3">
        {news.map((item) => (
          <Link key={item.id} href={`/knowledge/detail-guide/${item.id}`} className="block">
            <div className="bg-white rounded-lg overflow-hidden shadow-sm border cursor-pointer hover:shadow-md transition">
              <div className="relative w-full h-48">
                <img
                  src={item.image_url}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/80 to-transparent p-4">
                  <h3 className="text-white text-sm font-medium line-clamp-2">
                    {item.title}
                  </h3>
                  {item.description && (
                    <p className="text-white/70 text-xs mt-1 line-clamp-1">
                      {item.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
