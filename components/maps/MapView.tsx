"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import api from "@/lib/api";

// --- TYPES ---
export type PetaMarker = {
  id: string;
  latitude: number;
  longitude: number;
  tipe_marker: "titik" | "garis" | "area";
  path_data: [number, number][] | null;
  kategori: string;
  label: string | null;
  tingkat_bahaya: string;
  radius?: number | null;
  dibuat_pada?: string;
  source?: string;
  status?: string;
  kapasitas?: number;
  terisi?: number;
};

// --- CONFIG & HELPERS ---
const BAHAYA_COLORS: Record<string, string> = {
  kritis: "#DC2626", // Merah
  tinggi: "#F97316", // Oranye
  sedang: "#FACC15", // Kuning
  rendah: "#3B82F6", // Biru
};

const KATEGORI_COLORS: Record<string, string> = {
  POS_PENGUNGSIAN: "#9333EA", // Ungu Violet
};

function getMarkerColor(kategori: string, tingkatBahaya: string): string {
  const normKategori = kategori?.toUpperCase().replace(/ /g, "_");
  if (KATEGORI_COLORS[normKategori]) {
    return KATEGORI_COLORS[normKategori];
  }
  return BAHAYA_COLORS[tingkatBahaya?.toLowerCase()] || "#6B7280";
}

interface Props {
  selectedMarkerId?: string | null;
  panToCoord?: [number, number] | null;
  onMapClick?: () => void;
  onMarkerClick?: (id: string) => void;
  markers: PetaMarker[]; // Terima data dari parent
}

export default function MapView({ selectedMarkerId, panToCoord, onMapClick, onMarkerClick, markers }: Props) {
  const mapRef = useRef<L.Map | null>(null);
  const layersRef = useRef<L.LayerGroup | null>(null);
  const markerRefs = useRef<Record<string, L.Marker | L.Polyline>>({});

  // 2. Inisialisasi Peta
  useEffect(() => {
    if (mapRef.current) return;
    
    const jemberBounds = L.latLngBounds(
      L.latLng(-8.55, 113.20),
      L.latLng(-7.90, 114.15)
    );

    const map = L.map("map", {
      maxBounds: jemberBounds,
      maxBoundsViscosity: 1.0, 
      minZoom: 11,             
      scrollWheelZoom: true,  
    }).setView([-8.1725, 113.7000], 13); 

    mapRef.current = map;

    map.on("click", () => {
      if (onMapClick) onMapClick();
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    layersRef.current = L.layerGroup().addTo(map);

    fetch("/jember.json")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.geometry && mapRef.current) {
          L.geoJSON(data.geometry as any, {
            style: {
              color: "#3b82f6",
              weight: 2,        
              opacity: 0.4,     
              fillColor: "#3b82f6",
              fillOpacity: 0.02, 
              dashArray: "5, 5", 
            },
            interactive: false 
          }).addTo(mapRef.current);
        }
      });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // 3. Render Marker Dinamis dari API (Hanya sekali saat data datang)
  useEffect(() => {
    if (!layersRef.current || markers.length === 0) return;
    
    layersRef.current.clearLayers();
    markerRefs.current = {};

    markers.forEach((m) => {
      const color = getMarkerColor(m.kategori, m.tingkat_bahaya);

      if (m.tipe_marker === "garis" && m.path_data && m.path_data.length > 1) {
        const polyline = L.polyline(m.path_data, {
          color: color,
          weight: 6,
          opacity: 0.7,
          lineJoin: "round"
        }).addTo(layersRef.current!);

        polyline.on("click", (e) => {
          L.DomEvent.stopPropagation(e);
          if (onMarkerClick) onMarkerClick(m.id);
        });

        polyline.bindPopup(`
          <div style="min-width:180px; font-family:sans-serif;">
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:8px;">
               <div style="width:12px; height:12px; border-radius:50%; background:${color}"></div>
               <b style="font-size:14px;">${m.label || "Jalur Bencana"}</b>
            </div>
            <div style="font-size:12px; color:#444;">
              Kategori: <b>${m.kategori}</b><br/>
              Bahaya: <b style="color:${color}">${m.tingkat_bahaya.toUpperCase()}</b>
              <hr style="margin:8px 0; border:0; border-top:1px solid #e5e7eb;"/>
              <a href="https://www.google.com/maps/search/?api=1&query=${m.latitude},${m.longitude}" target="_blank" rel="noopener noreferrer" style="display:block; text-align:center; padding:6px 10px; background-color:#3B82F6; color:white; border-radius:8px; font-size:10px; font-weight:bold; text-decoration:none; transition:background-color 0.2s;">
                🗺️ Google Maps
              </a>
            </div>
          </div>
        `, { closeButton: false });
        markerRefs.current[m.id] = polyline;
      } else {
        const isPos = m.kategori?.toUpperCase().replace(/ /g, "_") === "POS_PENGUNGSIAN";
        let markerIcon;

        if (isPos) {
          // Render beautiful purple house/shelter icon
          const svg = `
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
              <circle cx="16" cy="16" r="15" fill="white" stroke="${color}" stroke-width="2.5"/>
              <path d="M16 7.5 L8 14.5 H10.5 V23.5 H14 V19.5 H18 V23.5 H21.5 V14.5 H24 Z" fill="${color}"/>
            </svg>`;
          markerIcon = L.divIcon({
            html: svg,
            className: `custom-marker marker-id-${m.id}`,
            iconSize: [32, 32],
            iconAnchor: [16, 32],
            popupAnchor: [0, -34],
          });
        } else {
          markerIcon = L.divIcon({
            html: `<div class="marker-core" style="background-color:${color}; width:16px; height:16px; border-radius:50%; border:3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
            className: `custom-marker marker-id-${m.id}`,
            iconSize: [16, 16],
            iconAnchor: [8, 8],
          });
        }

        const marker = L.marker([m.latitude, m.longitude], { icon: markerIcon }).addTo(layersRef.current!);
        
        // Tambahkan Radius Area Bahaya / Dampak (Kecuali Pos Pengungsian)
        if (!isPos && m.radius && Number(m.radius) > 0) {
          const radiusMeters = Number(m.radius);

          L.circle([m.latitude, m.longitude], {
            radius: radiusMeters,
            color: color,
            fillColor: color,
            fillOpacity: 0.12,
            weight: 1.5,
            dashArray: "3, 5"
          }).addTo(layersRef.current!);
        }

        marker.on("click", (e) => {
          L.DomEvent.stopPropagation(e);
          if (onMarkerClick) onMarkerClick(m.id);
        });

        let popupHtml = "";
        if (isPos) {
          popupHtml = `
            <div style="min-width:200px; font-family:system-ui,-apple-system,sans-serif;">
              <div style="display:flex; align-items:center; gap:8px; margin-bottom:8px;">
                 <div style="width:12px; height:12px; border-radius:50%; background:${color}"></div>
                 <b style="font-size:14px; color:#1f2937;">${m.label || "Pos Pengungsian"}</b>
              </div>
              <div style="font-size:12px; color:#4b5563; line-height:1.5;">
                Kategori: <b style="color:${color};">POS PENGUNGSIAN</b><br/>
                Status: <span style="font-weight:750; color:${m.status === 'aktif' ? '#10B981' : m.status === 'penuh' ? '#EF4444' : '#3B82F6'};">${(m.status || 'standby').toUpperCase()}</span><br/>
                Kapasitas: <b>${m.terisi || 0} / ${m.kapasitas || 0} Jiwa</b><br/>
                <hr style="margin:8px 0; border:0; border-top:1px solid #e5e7eb;"/>
                <span style="font-size:10px; color:#9ca3af; font-family:monospace; display:block; margin-bottom:6px;">Koordinat: ${m.latitude.toFixed(5)}, ${m.longitude.toFixed(5)}</span>
                <a href="https://www.google.com/maps/search/?api=1&query=${m.latitude},${m.longitude}" target="_blank" rel="noopener noreferrer" style="display:block; text-align:center; padding:6px 10px; background-color:#3B82F6; color:white; border-radius:8px; font-size:10px; font-weight:bold; text-decoration:none; transition:background-color 0.2s;">
                  🗺️ Google Maps
                </a>
              </div>
            </div>
          `;
        } else {
          const hasRadius = m.radius && Number(m.radius) > 0;
          const radiusRow = hasRadius ? `Radius Dampak: <b>±${m.radius} meter</b><br/>` : "";

          popupHtml = `
            <div style="min-width:180px; font-family:system-ui,-apple-system,sans-serif;">
              <div style="display:flex; align-items:center; gap:8px; margin-bottom:8px;">
                 <div style="width:12px; height:12px; border-radius:50%; background:${color}"></div>
                 <b style="font-size:14px; color:#1f2937;">${m.label || m.kategori}</b>
              </div>
              <div style="font-size:12px; color:#4b5563; line-height:1.5;">
                Kategori: <b>${m.kategori}</b><br/>
                Bahaya: <b style="color:${color}">${(m.tingkat_bahaya || "sedang").toUpperCase()}</b><br/>
                ${radiusRow}
                <hr style="margin:8px 0; border:0; border-top:1px solid #e5e7eb;"/>
                <span style="font-size:10px; color:#9ca3af; font-family:monospace; display:block; margin-bottom:6px;">Koordinat: ${m.latitude.toFixed(5)}, ${m.longitude.toFixed(5)}</span>
                <a href="https://www.google.com/maps/search/?api=1&query=${m.latitude},${m.longitude}" target="_blank" rel="noopener noreferrer" style="display:block; text-align:center; padding:6px 10px; background-color:#3B82F6; color:white; border-radius:8px; font-size:10px; font-weight:bold; text-decoration:none; transition:background-color 0.2s;">
                  🗺️ Google Maps
                </a>
              </div>
            </div>
          `;
        }

        marker.bindPopup(popupHtml, { closeButton: false });
        markerRefs.current[m.id] = marker;
      }
    });
  }, [markers]); // HANYA rerender kalau data markers berubah (bukan saat klik)

  // 4. Update Visual State saat selectedMarkerId berubah (Tanpa hapus layer)
  useEffect(() => {
    if (!selectedMarkerId) {
      // Tutup popup jika ada yang terbuka
      if (mapRef.current) mapRef.current.closePopup();

      // Reset semua ke style awal
      Object.values(markerRefs.current).forEach(obj => {
        if (obj instanceof L.Polyline) obj.setStyle({ weight: 6, opacity: 0.7 });
        if (obj instanceof L.Marker) {
          const el = obj.getElement();
          if (el) el.classList.remove("is-selected");
        }
      });
      return;
    }

    const target = markerRefs.current[selectedMarkerId];
    if (target) {
      // Highlight target
      if (target instanceof L.Polyline) {
        target.setStyle({ weight: 10, opacity: 1 });
      }
      if (target instanceof L.Marker) {
        const el = target.getElement();
        if (el) el.classList.add("is-selected");
      }
    }
  }, [selectedMarkerId]);

  // 5. Logika Gerak Peta yang Halus & Kontrol Popup
  useEffect(() => {
    if (!selectedMarkerId || !mapRef.current) return;

    const target = markerRefs.current[selectedMarkerId];
    if (target) {
      // Pastikan popup sebelumnya ditutup dulu agar tidak tumpang tindih
      mapRef.current.closePopup();

      if (target instanceof L.Marker) {
        mapRef.current.setView(target.getLatLng(), 15, {
          animate: true,
          duration: 0.8, // Percepet durasi gerak
        });
        setTimeout(() => {
          if (selectedMarkerId) target.openPopup();
        }, 400); // Popup muncul lebih cepat
      } else if (target instanceof L.Polyline) {
        mapRef.current.flyToBounds(target.getBounds(), {
          padding: [50, 50],
          duration: 0.8, // Percepet durasi gerak
        });
        setTimeout(() => {
          if (selectedMarkerId) target.openPopup();
        }, 400); // Popup muncul lebih cepat
      }
    }
  }, [selectedMarkerId]);

  // 5. Logika Gerak Peta ke Koordinat Spesifik
  useEffect(() => {
    if (!panToCoord || !mapRef.current) return;
    mapRef.current.setView(panToCoord, 14, {
      animate: true,
      duration: 0.8,
    });
  }, [panToCoord]);

  return (
    <>
      <style jsx global>{`
        .custom-marker { transition: all 0.3s ease; }
        .is-selected .marker-core {
          transform: scale(1.3);
          border-color: #fff !important;
          box-shadow: 0 0 0 4px rgba(255,255,255,0.4), 0 0 20px rgba(0,0,0,0.5) !important;
        }
        .is-selected::after {
          content: '';
          position: absolute;
          top: 0; left: 0; width: 16px; height: 16px;
          border-radius: 50%;
          background: inherit;
          animation: pulse-ring 1.5s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
        }
        @keyframes pulse-ring {
          0% { transform: scale(.33); }
          80%, 100% { opacity: 0; }
        }
      `}</style>
      <div id="map" className="w-full h-full z-0" style={{ minHeight: "400px" }} />
    </>
  );
}



