"use client";

import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default icon issue with Leaflet in Next.js
if (typeof window !== "undefined") {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });
}

interface CreateMapPickerComponentProps {
  latitude: number | string;
  longitude: number | string;
  tipeMarker: "titik" | "garis";
  pathPoints: [number, number][];
  onMapClick: (lat: number, lng: number) => void;
  className?: string;
}

export default function CreateMapPickerComponent({
  latitude,
  longitude,
  tipeMarker,
  pathPoints,
  onMapClick,
  className,
}: CreateMapPickerComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markerInstance = useRef<L.Marker | null>(null);
  const polylineInstance = useRef<L.Polyline | null>(null);
  const pathMarkersGroup = useRef<L.FeatureGroup | null>(null);

  const onMapClickRef = useRef(onMapClick);
  useEffect(() => {
    onMapClickRef.current = onMapClick;
  }, [onMapClick]);

  // Initialize Map
  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current) return;

    const initialLat = parseFloat(latitude as string) || -8.1724;
    const initialLng = parseFloat(longitude as string) || 113.7000;

    if (!mapInstance.current) {
      mapInstance.current = L.map(mapRef.current).setView([initialLat, initialLng], 12);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(mapInstance.current);

      pathMarkersGroup.current = L.featureGroup().addTo(mapInstance.current);

      mapInstance.current.on("click", (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        if (onMapClickRef.current) {
          onMapClickRef.current(lat, lng);
        }
      });
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
        markerInstance.current = null;
        polylineInstance.current = null;
        pathMarkersGroup.current = null;
      }
    };
  }, []);

  // Handle single point mode (render/update single marker)
  useEffect(() => {
    if (!mapInstance.current) return;

    if (tipeMarker === "titik") {
      // Clear path lines & markers
      if (polylineInstance.current) {
        polylineInstance.current.remove();
        polylineInstance.current = null;
      }
      if (pathMarkersGroup.current) {
        pathMarkersGroup.current.clearLayers();
      }

      const lat = parseFloat(latitude as string);
      const lng = parseFloat(longitude as string);

      if (!isNaN(lat) && !isNaN(lng)) {
        if (!markerInstance.current) {
          markerInstance.current = L.marker([lat, lng], { draggable: true }).addTo(mapInstance.current);
          
          // Arahkan & zoom peta secara otomatis ke titik koordinat awal
          mapInstance.current.setView([lat, lng], 15, { animate: true });

          // Bind tooltip that shows the current coordinate
          markerInstance.current.bindTooltip(`Lat: ${lat.toFixed(5)}<br>Lng: ${lng.toFixed(5)}`, { 
            permanent: true, 
            direction: "top",
            className: "text-xs font-mono font-bold text-blue-600 bg-white px-2 py-1 border border-blue-200 rounded-lg shadow-sm",
            offset: [0, -35]
          });

          // Update tooltip text in real-time while dragging
          markerInstance.current.on("drag", () => {
            const pos = markerInstance.current?.getLatLng();
            if (pos) {
              markerInstance.current?.setTooltipContent(`Lat: ${pos.lat.toFixed(5)}<br>Lng: ${pos.lng.toFixed(5)}`);
            }
          });

          markerInstance.current.on("dragend", () => {
            const pos = markerInstance.current?.getLatLng();
            if (pos && onMapClickRef.current) {
              onMapClickRef.current(pos.lat, pos.lng);
            }
          });
        } else {
          markerInstance.current.setLatLng([lat, lng]);
          markerInstance.current.setTooltipContent(`Lat: ${lat.toFixed(5)}<br>Lng: ${lng.toFixed(5)}`);
        }
      } else {
        if (markerInstance.current) {
          markerInstance.current.remove();
          markerInstance.current = null;
        }
      }
    } else {
      // If switched to line mode, remove the single point marker
      if (markerInstance.current) {
        markerInstance.current.remove();
        markerInstance.current = null;
      }
    }
  }, [latitude, longitude, tipeMarker]);

  // Handle line mode (render polyline & path vertices)
  useEffect(() => {
    if (!mapInstance.current) return;

    if (tipeMarker === "garis") {
      // Update polyline
      if (!polylineInstance.current) {
        polylineInstance.current = L.polyline(pathPoints, {
          color: "#dc2626",
          weight: 4,
          opacity: 0.8,
        }).addTo(mapInstance.current);
        
        // Arahkan & zoom peta ke titik awal garis
        if (pathPoints.length > 0) {
          mapInstance.current.setView(pathPoints[0], 15, { animate: true });
        }
      } else {
        polylineInstance.current.setLatLngs(pathPoints);
      }

      // Update path vertex markers (circles)
      if (pathMarkersGroup.current) {
        pathMarkersGroup.current.clearLayers();
        pathPoints.forEach((pt, index) => {
          const isFirst = index === 0;
          const markerColor = isFirst ? "#059669" : "#dc2626"; // Emerald for start, Red for rest
          
          const circle = L.circleMarker(pt, {
            radius: 6,
            fillColor: markerColor,
            color: "#ffffff",
            weight: 2,
            fillOpacity: 1,
          });

          // Bind simple tooltip showing the order
          circle.bindTooltip(`Titik ${index + 1}`, { permanent: false, direction: "top" });
          
          if (pathMarkersGroup.current) {
            circle.addTo(pathMarkersGroup.current);
          }
        });
      }
    } else {
      // Clear line drawings if not in line mode
      if (polylineInstance.current) {
        polylineInstance.current.remove();
        polylineInstance.current = null;
      }
      if (pathMarkersGroup.current) {
        pathMarkersGroup.current.clearLayers();
      }
    }
  }, [pathPoints, tipeMarker]);

  return <div ref={mapRef} className={`w-full h-[400px] rounded-xl z-0 ${className}`} style={{ minHeight: "400px" }} />;
}
