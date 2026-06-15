"use client";
import { useEffect, useState } from "react";
import { getLocation } from "@/lib/location";
import { getWeather } from "@/lib/weather";
import WeatherCard from "@/components/Header/WeatherCard";
import FeatureGrid from "@/components/Home/FeatureGrid";
import NewsSection from "@/components/Home/NewsSection";
import UserInfo from "@/components/Header/UserInfo";
import ProfileButton from "@/components/Header/ProfileButton";
import { useAuth } from "@/context/AuthContext";

export default function Home() {
  const [activeTab, setActiveTab] = useState("Home");
  const { user } = useAuth();
  const [location, setLocation] = useState<any>({ loading: true });
  const [weather, setWeather] = useState<any>({ loading: true });

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
        <div className="flex items-center justify-between mb-2">
          <UserInfo user={user ?? null} />
          <ProfileButton />
        </div>
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
