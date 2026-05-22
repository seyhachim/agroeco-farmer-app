import React, { useState } from "react";
import { MapPin, Target, Loader2 } from "lucide-react";
import { useTranslations } from "../../../lib/i18n";

interface Props {
  currentLocation: string;
  onLocationChange: (location: string) => void;
}

const FilterLocation: React.FC<Props> = ({
  currentLocation,
  onLocationChange,
}) => {
  const { tMarketplace } = useTranslations();
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  // Common cities in Cambodia
  const popularCities = [
    "Phnom Penh",
    "Siem Reap",
    "Battambang",
    "Sihanoukville",
    "Kampong Cham",
    "Kampong Thom",
    "Kampot",
    "Kep",
    "Preah Vihear",
    "Koh Kong",
  ];

  // Get city name from GPS
  const getCurrentCity = async (): Promise<string> => {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          try {
            // Reverse geocoding to get city name
            const response = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
            );
            const data = await response.json();

            if (data.city) {
              resolve(data.city);
            } else {
              resolve("Unknown City");
            }
          } catch (error) {
            resolve("Unknown City");
          }
        },
        (error) => {
          reject(error);
        },
        {
          timeout: 10000,
          enableHighAccuracy: true,
        }
      );
    });
  };

  const handleDetectLocation = async () => {
    if (!navigator.geolocation) {
      alert(tMarketplace("geolocationNotSupported"));
      return;
    }

    setIsGettingLocation(true);

    try {
      const cityName = await getCurrentCity();
      onLocationChange(cityName);
    } catch (error) {
      console.error("Error getting location:", error);
      alert(tMarketplace("locationAccessDenied"));
    } finally {
      setIsGettingLocation(false);
    }
  };

  const handleCitySelect = (city: string) => {
    onLocationChange(city);
  };

  return (
    <div className="font-[kantumruy_Pro] p-4 border-b">
      <h3 className="font-semibold text-gray-800 mb-3">
        {tMarketplace("location")}
      </h3>

      {/* Location Input */}
      <div className="relative mb-4">
        <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder={tMarketplace("locationPlaceholder")}
          className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 focus:ring-green-800 focus:border-green-800"
          value={currentLocation}
          onChange={(e) => onLocationChange(e.target.value)}
        />
      </div>

      {/* Detect Location Button */}
      <button
        className="w-full text-blue-600 text-sm flex items-center justify-center gap-2 py-2.5 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-4"
        onClick={handleDetectLocation}
        disabled={isGettingLocation}
        type="button"
      >
        {isGettingLocation ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {tMarketplace("useCurrentLocation")}...
          </>
        ) : (
          <>
            <Target className="h-4 w-4" />
            {tMarketplace("useCurrentLocation")}
          </>
        )}
      </button>
    </div>
  );
};

export default FilterLocation;
