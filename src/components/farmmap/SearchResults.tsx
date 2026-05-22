"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useTranslations } from "@/lib/i18n";

interface SearchResultsProps {
  isSearching: boolean;
  searchTerm: string;
  setSelectedMarker: (marker: any) => void;
  setIsSearching: (searching: boolean) => void;
  mapInstance: React.MutableRefObject<any>;
  userMarkerRef: React.MutableRefObject<any>;
  googleResults?: any[];
  farmData?: any[];
}

const SearchResults: React.FC<SearchResultsProps> = ({
  isSearching,
  searchTerm,
  setSelectedMarker,
  setIsSearching,
  mapInstance,
  userMarkerRef,
  googleResults = [],
}) => {
  const [farmResults, setFarmResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { t, lang } = useTranslations();

  const fetchFarms = async (search: string) => {
    if (!search.trim()) {
      setFarmResults([]);
      return;
    }

    setLoading(true);

    const { data, error } = await supabase
      .from("farm_data")
      .select("*")
      .eq("is_visible", true)
      .or(
        `name.ilike.%${search}%,type.ilike.%${search}%,address.ilike.%${search}%`
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching farm data:", error.message);
    } else {
      setFarmResults(data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchFarms(searchTerm);
  }, [searchTerm]);

  const smoothZoom = (targetZoom: number) => {
    let currentZoom = mapInstance.current.getZoom();
    const interval = setInterval(() => {
      if (currentZoom < targetZoom) {
        currentZoom++;
        mapInstance.current.setZoom(currentZoom);
      } else if (currentZoom > targetZoom) {
        currentZoom--;
        mapInstance.current.setZoom(currentZoom);
      } else {
        clearInterval(interval);
      }
    }, 50);
  };

  const getMarkerIcon = (type: string) => {
    switch (type) {
      case "Farm":
        return "/icons/farmmap/location_farm.svg";
      case "Store":
        return "/icons/farmmap/location_store.svg";
      case "NGO":
        return "/icons/farmmap/location_ngo.svg";
      case "Education":
        return "/icons/farmmap/location_education.svg";
      case "Processing":
        return "/icons/farmmap/location_processing.svg";
      default:
        return "/icons/farmmap/google_pin.svg";
    }
  };

  const translations = {
    searching: lang === "kh" ? "កំពុងស្វែងរក..." : "Searching...",
    noAddress: lang === "kh" ? "គ្មានអាសយដ្ឋាន" : "No address",
    noResults: lang === "kh" ? "រកមិនឃើញលទ្ធផល" : "No results found",
    cambodia: lang === "kh" ? "កម្ពុជា" : "Cambodia",
  };

  return (
    <AnimatePresence>
      {isSearching && searchTerm && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute w-full top-16 bg-white z-40 max-h-full overflow-y-auto shadow-lg"
        >
          {loading && (
            <p className="p-3 text-gray-500 text-sm">
              {translations.searching}
            </p>
          )}

          {farmResults.map((farm, index) => (
            <motion.div
              key={`farm-${farm.id}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center gap-3 p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50"
              onClick={() => {
                setSelectedMarker(farm);
                setIsSearching(false);

                mapInstance.current.panTo({ lat: farm.lat, lng: farm.lng });
                smoothZoom(18);
              }}
            >
              <img
                src={getMarkerIcon(farm.type)}
                alt={farm.type}
                className="w-5 h-5"
              />
              <div className="flex flex-col">
                <p className="text-sm font-medium text-gray-800">{farm.name}</p>
                <p className="text-xs text-gray-500">
                  {farm.address || translations.noAddress}
                </p>
              </div>
            </motion.div>
          ))}

          {googleResults.map((place, index) => (
            <motion.div
              key={`google-${index}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center gap-3 p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50"
              onClick={() => {
                const placesService =
                  new window.google.maps.places.PlacesService(
                    mapInstance.current
                  );

                placesService.getDetails(
                  { placeId: place.place_id },
                  (details: any, status: any) => {
                    if (
                      status ===
                        window.google.maps.places.PlacesServiceStatus.OK &&
                      details.geometry
                    ) {
                      const location = details.geometry.location;

                      if (userMarkerRef.current)
                        userMarkerRef.current.setMap(null);

                      userMarkerRef.current = new window.google.maps.Marker({
                        position: location,
                        map: mapInstance.current,
                        title: details.name,
                        icon: {
                          url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
                        },
                      });

                      mapInstance.current.panTo(location);
                      smoothZoom(14);
                    }
                  }
                );

                setIsSearching(false);
              }}
            >
              <div className="w-5 h-5 flex items-center justify-center">
                <img
                  src="/icons/farmmap/google_pin.svg"
                  alt="Google Pins"
                  className="w-6 h-6"
                />
              </div>
              <div className="flex flex-col">
                <p className="text-sm font-medium text-gray-800">
                  {place.name}
                </p>
                <p className="text-xs text-gray-500">
                  {place.address || translations.cambodia}
                </p>
              </div>
            </motion.div>
          ))}

          {!loading &&
            farmResults.length === 0 &&
            googleResults.length === 0 && (
              <p className="p-3 text-gray-500 text-sm">
                {translations.noResults}
              </p>
            )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SearchResults;
