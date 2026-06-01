"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useTranslations } from "@/lib/i18n";
import MapLoader from "./MapLoader";

const FILTER_MAP: Record<string, string[]> = {
  ទាំងអស់: [
    "Farm",
    "NGO",
    "Store/Market",
    "Education Center",
    "Processing Facility",
  ],
  អង្គការ: ["NGO"],
  ហាង: ["Store/Market"],
  កសិដ្ឋាន: ["Farm"],
  មជ្ឈមណ្ឌលអប់រំ: ["Education Center"],
  សម្ភារៈ: ["Processing Facility"],
};

const FILTER_MAP_EN: Record<string, string[]> = {
  All: [
    "Farm",
    "NGO",
    "Store/Market",
    "Education Center",
    "Processing Facility",
  ],
  Organization: ["NGO"],
  Shop: ["Store/Market"],
  Farm: ["Farm"],
  "Education Center": ["Education Center"],
  Equipment: ["Processing Facility"],
};

declare global {
  interface Window {
    google: any;
  }
}

interface MapProps {
  className?: string;
  mapRef: React.RefObject<HTMLDivElement | null>;
  mapInstance: React.MutableRefObject<any>;
  markersRef: React.MutableRefObject<any[]>;
  userMarkerRef: React.MutableRefObject<any>;
  selectedRemarks: string[];
  setSelectedMarker: (marker: any) => void;
  setMapLoading: (loading: boolean) => void;
  mapLoading: boolean;
  selectedFilters: string[];
  searchTerm: string;
  farmData?: any[];
}

const Map: React.FC<MapProps> = ({
  className,
  mapRef,
  mapInstance,
  markersRef,
  userMarkerRef,
  selectedRemarks,
  setSelectedMarker,
  setMapLoading,
  mapLoading,
  selectedFilters,
  searchTerm,
}) => {
  const [farms, setFarms] = useState<any[]>([]);
  const { lang } = useTranslations();

  const fetchFarms = async () => {
    setMapLoading(true);
    const { data, error } = await supabase
      .from("farm_data")
      .select("*")
      .eq("is_visible", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching farm data:", error.message);
    } else {
      setFarms(data || []);
    }
    setMapLoading(false);
  };

  useEffect(() => {
    if (!mapRef.current) return;

    let mounted = true;

    const initMap = async () => {
      if (!mounted || !mapRef.current) return;

      const { Map } = await window.google.maps.importLibrary("maps") as any;

      mapInstance.current = new Map(mapRef.current, {
        center: { lat: 12.5657, lng: 104.991 },
        zoom: 7,
        disableDefaultUI: true,
        mapId: "agroeco_map",
      });

      await fetchFarms();
    };

    const SCRIPT_ID = "google-maps-script";

    const loadMaps = () => {
      if (window.google?.maps?.importLibrary) {
        initMap();
      } else {
        // importLibrary not ready yet, poll briefly
        const poll = setInterval(() => {
          if (window.google?.maps?.importLibrary) {
            clearInterval(poll);
            initMap();
          }
        }, 50);
      }
    };

    if (window.google?.maps) {
      loadMaps();
    } else if (!document.getElementById(SCRIPT_ID)) {
      const script = document.createElement("script");
      script.id = SCRIPT_ID;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places,marker&loading=async`;
      script.async = true;
      script.defer = true;
      script.onload = () => loadMaps();
      document.head.appendChild(script);
    } else {
      const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement;
      existing.addEventListener("load", loadMaps);
      if (window.google?.maps) loadMaps();
    }

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (
      !mapInstance.current ||
      !(mapInstance.current instanceof window.google?.maps?.Map) ||
      farms.length === 0
    )
      return;

    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    const currentFilterMap = lang === "kh" ? FILTER_MAP : FILTER_MAP_EN;
    const allKey = lang === "kh" ? "ទាំងអស់" : "All";

    const getEnglishRemarksFromFilters = (filters: string[]): string[] => {
      if (filters.includes(allKey)) {
        return currentFilterMap[allKey];
      }
      return filters.flatMap((filter) => currentFilterMap[filter] || []);
    };

    const englishRemarksFromFilters =
      getEnglishRemarksFromFilters(selectedFilters);

    let activeFilters: string[] = [];

    if (selectedFilters.length > 0) {
      activeFilters = englishRemarksFromFilters;
    } else if (selectedRemarks.length > 0) {
      activeFilters = selectedRemarks;
    } else {
      activeFilters = currentFilterMap[allKey];
    }

    const filteredFarms = farms.filter((farm) => {
      const farmType = farm.type;

      const matchesType = activeFilters.includes(farmType);

      const matchesSearch =
        !searchTerm ||
        farm.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        farm.address?.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesType && matchesSearch;
    });

    markersRef.current = filteredFarms.map((farm) => {
      const iconImg = document.createElement("img");
      iconImg.src = getMarkerIcon(farm.type);
      iconImg.style.width = "30px";
      iconImg.style.height = "30px";

      const marker = new window.google.maps.marker.AdvancedMarkerElement({
        position: { lat: farm.lat, lng: farm.lng },
        map: mapInstance.current,
        title: farm.name,
        content: iconImg,
      });

      marker.addListener("click", () => {
        const markerData = {
          ...farm,
          position: { lat: farm.lat, lng: farm.lng },
          lat: farm.lat,
          lng: farm.lng,
        };
        setSelectedMarker(markerData);
      });
      return marker;
    });
  }, [farms, selectedRemarks, searchTerm, selectedFilters, lang]);

  const getMarkerIcon = (type: string) => {
    switch (type) {
      case "Farm":
        return "/icons/farmmap/location_farm.svg";
      case "Store/Market":
        return "/icons/farmmap/location_store.svg";
      case "NGO":
        return "/icons/farmmap/location_ngo.svg";
      case "Education Center":
        return "/icons/farmmap/location_education.svg";
      case "Processing Facility":
        return "/icons/farmmap/location_processing.svg";
      default:
        return "/icons/farmmap/google_pin.svg";
    }
  };

  return (
    <>
      <MapLoader loading={mapLoading} />
      <div ref={mapRef} className={`w-full flex-1 ${className || ""}`} />
    </>
  );
};

export default Map;
