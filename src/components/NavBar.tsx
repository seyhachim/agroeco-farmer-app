"use client";

import { usePathname } from "next/navigation";

export default function NavBar() {
  const pathname = usePathname();

  // Hide navbar on /map
  if (pathname === "/map") return null;
  if (pathname === "/knowledge") return null;
  if (pathname.startsWith("/knowledge")) return null;

  return (
    <header className="bg-gradient-to-r from-green-700 to-green-800 text-white p-6">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm">9:41</p>
          <p className="text-lg">🌱កម្ពុជា</p>
        </div>
      </div>
    </header>
  );
}
