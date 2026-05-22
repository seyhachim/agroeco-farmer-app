"use client";

import { Home, MapPin, MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useRouter, usePathname } from "next/navigation";

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();

  const tabs = [
    { icon: Home, label: "Home", href: "/" },
    { icon: MapPin, label: "Map", href: "/map" },
    { icon: MessageCircle, label: "Messages", href: "/messages", badge: 2 },
    { icon: "👤", label: "Profile", href: "/profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
      <div className="flex">
        {tabs.map((tab, i) => {
          const isActive = pathname === tab.href;
          return (
            <button
              key={i}
              onClick={() => router.push(tab.href)}
              className={`flex-1 flex flex-col items-center py-3 text-xs relative ${
                isActive ? "text-green-800" : "text-gray-400"
              }`}
            >
              {typeof tab.icon === "string" ? (
                <span className="text-lg mb-1">{tab.icon}</span>
              ) : (
                <tab.icon className="w-6 h-6 mb-1" />
              )}
              {tab.badge && (
                <Badge className="absolute top-2 right-8 bg-red-500 text-white">
                  {tab.badge}
                </Badge>
              )}
              {tab.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
