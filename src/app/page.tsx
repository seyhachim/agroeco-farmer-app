"use client";
import { useEffect, useState } from "react";
import { getTelegramUser, TelegramUser } from "@/lib/telegram";
import { getLocation } from "@/lib/location";
import { getWeather } from "@/lib/weather";
import WeatherCard from "@/components/Header/WeatherCard";
import FeatureGrid from "@/components/Home/FeatureGrid";
import NewsSection from "@/components/Home/NewsSection";
import BottomNav from "@/components/Navigation/BottomNav";
import UserInfo from "@/components/Header/UserInfo";

export default function Home() {
  const [activeTab, setActiveTab] = useState("Home");
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [location, setLocation] = useState<any>({ loading: true });
  const [weather, setWeather] = useState<any>({ loading: true });

  useEffect(() => {
    const tgUser = getTelegramUser();
    setUser(tgUser);
  }, []);

  useEffect(() => {
    (async () => {
      const loc = await getLocation();
      setLocation(loc);
      if (loc.coordinates) {
        const w = await getWeather(
          loc.coordinates.latitude,
          loc.coordinates.longitude
        );
        setWeather(w);
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <header className="bg-green-800 text-white p-6">
        <UserInfo user={user} />
        <WeatherCard weather={weather} location={location} />
      </header>

      <main className="p-4 space-y-6">
        <FeatureGrid />
        <NewsSection />
      </main>

      {/* <BottomNav /> */}
    </div>
  );
}
