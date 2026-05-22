"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";

export default function BottomNavigation() {
  const [activeTab, setActiveTab] = useState("home");
  const pathname = usePathname();

  // Hide bottom nav on /map
  if (pathname === "/map") return null;
  if (pathname.startsWith("/knowledge")) return null;

  const tabs = [
    { icon: "🏠", label: "Home", href: "/", id: "home" },
    { icon: "🚗", label: "Transport", href: "/transport", id: "transport" },
    { icon: "💬", label: "Messages", href: "/messages", id: "messages" },
    { icon: "👤", label: "Profile", href: "/main/profile", id: "profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
      <div className="flex">
        {tabs.map((item, index) => (
          <Button
            key={index}
            variant={activeTab === item.id ? "default" : "ghost"}
            className="flex-1 flex flex-col items-center py-3 px-4 text-xs relative"
            asChild
            onClick={() => setActiveTab(item.id)}
          >
            <Link href={item.href}>
              <span className="text-lg mb-1">{item.icon}</span>
              <span>{item.label}</span>
              {index === 2 && (
                <Badge className="absolute top-2 right-8 h-5 w-5 p-0 flex items-center justify-center text-xs">
                  2
                </Badge>
              )}
            </Link>
          </Button>
        ))}
      </div>
    </nav>
  );
}
