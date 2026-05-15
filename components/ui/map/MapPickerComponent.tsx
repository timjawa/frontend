"use client";

import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default icon issue with Leaflet in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface MapPickerComponentProps {
  latitude: number | string;
  longitude: number | string;
  onChange: (lat: number, lng: number) => void;
  className?: string;
}

export default function MapPickerComponent({ latitude, longitude, onChange, className }: MapPickerComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markerInstance = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current) return;

    // Default to Jember center if no valid coordinates
    const lat = parseFloat(latitude as string) || -8.1724;
    const lng = parseFloat(longitude as string) || 113.7000;

    if (!mapInstance.current) {
      mapInstance.current = L.map(mapRef.current).setView([lat, lng], 11);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(mapInstance.current);

      markerInstance.current = L.marker([lat, lng], { draggable: true }).addTo(mapInstance.current);

      mapInstance.current.on("click", (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        markerInstance.current?.setLatLng([lat, lng]);
        onChange(lat, lng);
      });

      markerInstance.current.on("dragend", () => {
        const pos = markerInstance.current?.getLatLng();
        if (pos) {
          onChange(pos.lat, pos.lng);
        }
      });

      mapInstance.current.on("dragend", () => {
        const center = mapInstance.current?.getCenter();
        if (center) {
          markerInstance.current?.setLatLng(center);
          onChange(center.lat, center.lng);
        }
      });
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
        markerInstance.current = null;
      }
    };
  }, []);

  // Update marker if props change externally
  useEffect(() => {
    if (mapInstance.current && markerInstance.current) {
      const newLat = parseFloat(latitude as string);
      const newLng = parseFloat(longitude as string);
      if (!isNaN(newLat) && !isNaN(newLng)) {
        const currentPos = markerInstance.current.getLatLng();
        if (currentPos.lat !== newLat || currentPos.lng !== newLng) {
          markerInstance.current.setLatLng([newLat, newLng]);
          mapInstance.current.setView([newLat, newLng]);
        }
      }
    }
  }, [latitude, longitude]);

  return <div ref={mapRef} className={`w-full h-72 rounded-xl z-0 ${className}`} style={{ minHeight: "280px" }} />;
}
