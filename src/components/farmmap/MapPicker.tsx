"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";

interface MapPickerProps {
  lat: number;
  lng: number;
  onLocationSelect: (lat: number, lng: number) => void;
}

const MapPicker: React.FC<MapPickerProps> = ({
  lat,
  lng,
  onLocationSelect,
}) => {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const markerRef = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;

    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat, lng },
      zoom: 8,
      disableDefaultUI: false,
    });

    const marker = new window.google.maps.Marker({
      position: { lat, lng },
      map,
      draggable: true,
    });

    marker.addListener("dragend", (e: any) => {
      onLocationSelect(e.latLng.lat(), e.latLng.lng());
    });

    map.addListener("click", (e: any) => {
      marker.setPosition({ lat: e.latLng.lat(), lng: e.latLng.lng() });
      onLocationSelect(e.latLng.lat(), e.latLng.lng());
    });

    markerRef.current = marker;
  }, [mapLoaded]);

  return (
    <>
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`}
        strategy="afterInteractive"
        onLoad={() => setMapLoaded(true)}
      />
      <div ref={mapRef} className="w-full h-80 rounded-lg shadow-md" />
    </>
  );
};

export default MapPicker;
