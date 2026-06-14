"use client";

import { useEffect, useRef, useState } from "react";
import Map from "./Map";
import TopBar from "./TopBar";
import LocationButton from "./LocationButton";
import RemarkPanel from "./RemarkPanel";
import SearchResults from "./SearchResults";
import MarkerDetailPopup from "./MarkerDetailPopup";
import NotePopup from "./NotePopup";
import { REMARKS } from "./constants/farmMap";
import { supabase, ensureValidSession } from "@/lib/supabase";
import { Kantumruy_Pro } from "next/font/google";
import { useRouter } from "next/navigation";
import { useTranslations } from "@/lib/i18n";

const kantumruyPro = Kantumruy_Pro({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const FarmMapPage = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const userMarkerRef = useRef<any>(null);

  const router = useRouter();
  const { t, tNav, tAuth, lang } = useTranslations();

  const [farmData, setFarmData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [authChecking, setAuthChecking] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [googleResults, setGoogleResults] = useState<any[]>([]);
  const [selectedFilters, setSelectedFilters] = useState<string[]>(["ទាំងអស់"]);
  const [selectedRemarks, setSelectedRemarks] = useState<string[]>(
    REMARKS.map((r) => r.label)
  );
  const [selectedMarker, setSelectedMarker] = useState<any>(null);
  const [mapLoading, setMapLoading] = useState(true);
  const [notePopupOpen, setNotePopupOpen] = useState(false);
  const [noteData, setNoteData] = useState<any>(null);
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getUser();
      setCurrentUser(data.user);
      setAuthChecking(false);
    };
    checkAuth();
  }, []);

  const fetchFarmData = async () => {
    setLoading(true);
    await ensureValidSession();
    const { data, error } = await supabase.from("farm_data").select("*");

    if (error) {
      console.error("Error fetching farm data:", error);
    } else {
      console.log("Fetched farm data:", data);
      setFarmData(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchFarmData();
  }, []);

  const trackLocationOnce = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          if (userMarkerRef.current) {
            userMarkerRef.current.position = { lat: latitude, lng: longitude };
          } else if (mapInstance.current) {
            const dot = document.createElement("div");
            dot.style.cssText =
              "width:16px;height:16px;background:#4285F4;border:2px solid white;border-radius:50%;box-shadow:0 0 4px rgba(0,0,0,0.4)";

            userMarkerRef.current = new window.google.maps.marker.AdvancedMarkerElement({
              position: { lat: latitude, lng: longitude },
              map: mapInstance.current,
              title: "Your Location",
              content: dot,
            });
          }

          if (mapInstance.current) {
            mapInstance.current.setCenter({ lat: latitude, lng: longitude });
            mapInstance.current.setZoom(14);
          }
        },
        (err) => console.error(err),
        { enableHighAccuracy: true }
      );
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setIsSearching(term !== "");
  };

  const clearSearch = () => {
    setSearchTerm("");
    setIsSearching(false);
  };

  const toggleFilter = (value: string) => {
    if (value === "ទាំងអស់") {
      setSelectedFilters(["ទាំងអស់"]);
    } else {
      setSelectedFilters((prev) => {
        const withoutAll = prev.filter((f) => f !== "ទាំងអស់");
        if (withoutAll.includes(value)) {
          return withoutAll.filter((f) => f !== value);
        } else {
          return [...withoutAll, value];
        }
      });
    }
  };

  const handleDirectionsClick = () => {
    if (!selectedMarker) {
      alert(lang === "kh" ? "ទីតាំងមិនត្រឹមត្រូវ" : "Invalid location");
      return;
    }

    const lat = selectedMarker.position?.lat ?? selectedMarker.lat ?? null;
    const lng = selectedMarker.position?.lng ?? selectedMarker.lng ?? null;

    if (lat == null || lng == null) {
      console.error("Marker missing coordinates:", selectedMarker);
      alert(
        lang === "kh"
          ? "ទីតាំងមិនត្រឹមត្រូវ - ខ្វះកូអរដោនេ"
          : "Invalid location - missing coordinates"
      );
      return;
    }

    const name = selectedMarker?.name || "Destination";

    const isAndroid = /Android/i.test(navigator.userAgent);
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    const isMobile = isAndroid || isIOS;

    if (isAndroid) {
      const geoUrl = `geo:${lat},${lng}?q=${lat},${lng}(${encodeURIComponent(
        name
      )})`;
      window.location.href = geoUrl;
      return;
    }

    const gmapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;

    if (isMobile) {
      window.location.href = gmapsUrl;
    } else {
      window.open(gmapsUrl, "_blank");
    }
  };
  const openNotePopup = (marker: any) => {
    setNoteData(marker);
    setNotePopupOpen(true);
  };

  const handleAddFarm = () => {
    if (!currentUser) {
      setLoginModalOpen(true);
      return;
    }
    router.push("/create-farm");
  };

  const handleLogin = () => {
    router.push("/auth/login");
  };

  const handleSignup = () => {
    router.push("/auth/signup");
  };

  const closeLoginModal = () => {
    setLoginModalOpen(false);
  };

  return (
    <section className="w-full h-full relative">
      <div
        className={`w-full h-screen relative flex flex-col ${kantumruyPro.className}`}
      >
        <TopBar
          searchTerm={searchTerm}
          handleSearch={handleSearch}
          clearSearch={clearSearch}
          isSearching={isSearching}
          setIsSearching={setIsSearching}
          selectedFilters={selectedFilters}
          toggleFilter={toggleFilter}
        />

        <Map
          className="flex-1"
          mapRef={mapRef}
          mapInstance={mapInstance}
          markersRef={markersRef}
          userMarkerRef={userMarkerRef}
          selectedRemarks={selectedRemarks}
          setSelectedMarker={setSelectedMarker}
          setMapLoading={setMapLoading}
          mapLoading={mapLoading}
          selectedFilters={selectedFilters}
          searchTerm={searchTerm}
          farmData={farmData}
        />

        <button
          type="button"
          onClick={handleAddFarm}
          className="fixed top-40 right-4 z-50 px-3 text-[14px] py-2 bg-[#0E4123] text-white rounded-md hover:bg-[#0B3118] transition-all duration-200 shadow-xl shadow-[#0E4123]/25 flex items-center space-x-2"
        >
          <span>+</span>
          <span>{tNav("createFarm")}</span>
        </button>

        <LocationButton trackLocationOnce={trackLocationOnce} />

        <RemarkPanel selectedRemarks={selectedRemarks} />

        <SearchResults
          isSearching={isSearching}
          searchTerm={searchTerm}
          setSelectedMarker={setSelectedMarker}
          setIsSearching={setIsSearching}
          mapInstance={mapInstance}
          googleResults={googleResults}
          userMarkerRef={userMarkerRef}
          farmData={farmData}
        />

        <MarkerDetailPopup
          selectedMarker={selectedMarker}
          setSelectedMarker={setSelectedMarker}
          openNotePopup={openNotePopup}
          handleDirectionsClick={handleDirectionsClick}
        />

        <NotePopup
          notePopupOpen={notePopupOpen}
          setNotePopupOpen={setNotePopupOpen}
          noteData={noteData}
        />

        {loginModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-auto">
              <div className="text-center">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-yellow-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {tAuth("loginRequired")}
                </h3>
                <p className="text-gray-600 mb-6">
                  {tAuth("mustLoginToAddFarm")}
                </p>
                <div className="flex flex-col space-y-3">
                  <button
                    onClick={handleLogin}
                    className="w-full px-4 py-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors font-medium"
                  >
                    {tAuth("loginNow")}
                  </button>
                  <button
                    onClick={handleSignup}
                    className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                  >
                    {tAuth("createAccount")}
                  </button>
                  <button
                    onClick={closeLoginModal}
                    className="w-full px-4 py-2 text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    {t("cancel")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default FarmMapPage;
