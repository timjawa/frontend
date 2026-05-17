"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export type MarkerData = {
  id: string;
  lat: number;
  lng: number;
  label: string;
  kategori: string;
  status?: string;
  source: "laporan" | "manual";
  tipe_marker?: "titik" | "garis" | "area";
  path_data?: [number, number][];
};

// --- KONFIGURASI WARNA ---
// Menentukan warna apa yang muncul untuk setiap jenis bencana
const KATEGORI_COLORS: Record<string, string> = {
  BANJIR: "#2563EB",       // Biru
  GEMPA_BUMI: "#7C3AED",    // Ungu
  TANAH_LONGSOR: "#D97706", // Oranye
  KEBAKARAN: "#DC2626",     // Merah
  CUACA_EKSTREM: "#0891B2", // Cyan
  PERINGATAN_DINI: "#B91C1C", // Merah Tua
  UMUM: "#6B7280",          // Abu-abu
};

// Fungsi pembantu untuk mengambil kode warna berdasarkan nama kategori
function getColor(kategori: string) {
  return KATEGORI_COLORS[kategori?.toUpperCase().replace(/ /g, "_")] || "#6B7280";
}

// --- LOGIKA ICON ---
// Membuat tampilan marker kustom (SVG) menggunakan Leaflet divIcon
function createIcon(kategori: string, source: "laporan" | "manual") {
  const color = getColor(kategori);
  const isManual = source === "manual";
  
  // Jika manual (dari admin) berbentuk kotak, jika laporan warga berbentuk bulat
  const shape = isManual
    ? `<rect x="8" y="8" width="16" height="16" rx="3" fill="${color}"/>`
    : `<circle cx="16" cy="14" r="8" fill="${color}"/>
       <polygon points="16,24 12,18 20,18" fill="${color}"/>`;

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
      <circle cx="16" cy="16" r="15" fill="white" stroke="${color}" stroke-width="2.5"/>
      ${shape}
    </svg>`;

  return L.divIcon({
    html: svg,
    className: "",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -34],
  });
}

interface Props {
  markers: MarkerData[];
  center?: [number, number];
  onMapClick?: (lat: number, lng: number) => void;
  clickedCoord?: [number, number] | null;
  isDrawingLine?: boolean;
  currentLinePoints?: [number, number][];
  onLinePointsChange?: (points: [number, number][]) => void;
}

export default function PetaBencanaMap({ 
  markers, 
  center, 
  onMapClick, 
  clickedCoord,
  isDrawingLine = false,
  currentLinePoints = [],
  onLinePointsChange
}: Props) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const clickMarkerRef = useRef<L.Marker | null>(null);
  const drawLineRef = useRef<L.Polyline | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  // --- 1. INISIALISASI PETA ---
  // Berjalan sekali saja saat halaman dimuat
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // Buat objek peta Leaflet
    const map = L.map(containerRef.current, {
      center: center || [-8.1845, 113.6681], // Default: Jember
      zoom: 11,
      zoomControl: true,
    });

    // Tambahkan layer peta (OpenStreetMap)
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; OpenStreetMap',
      maxZoom: 19,
    }).addTo(map);

    // Ambil data batas wilayah Jember dari file JSON lokal
    let isMounted = true;
    fetch("/jember.json")
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.geometry && mapRef.current) {
          // Gambar garis batas Kabupaten Jember
          L.geoJSON(data.geometry as any, {
            style: {
              color: "#991b1b", 
              weight: 3,
              opacity: 0.8,
              fill: false,
              dashArray: "10, 10",
            },
          }).addTo(mapRef.current);
        }
      })
      .catch((err) => console.error("Gagal memuat batas Jember:", err));

    layerGroupRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    return () => {
      isMounted = false;
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Click Handler (handle stale closures)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const handleClick = (e: L.LeafletMouseEvent) => {
      if (isDrawingLine && onLinePointsChange) {
        onLinePointsChange([...currentLinePoints, [e.latlng.lat, e.latlng.lng]]);
      } else if (onMapClick) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    };

    map.on("click", handleClick);
    return () => {
      map.off("click", handleClick);
    };
  }, [isDrawingLine, currentLinePoints, onLinePointsChange, onMapClick]);

  // Update markers
  useEffect(() => {
    if (!layerGroupRef.current) return;
    layerGroupRef.current.clearLayers();

    if (!Array.isArray(markers)) return;

    markers.forEach((m) => {
      const color = getColor(m.kategori);

      if (m.tipe_marker === "garis" && m.path_data && m.path_data.length > 0) {
        // Render Polyline
        const polyline = L.polyline(m.path_data, {
          color: color,
          weight: 6,
          opacity: 0.7,
          lineJoin: "round"
        }).addTo(layerGroupRef.current!);
        
        polyline.bindPopup(`
          <div style="min-width:180px;font-family:system-ui,sans-serif;">
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;">
              <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${color};"></span>
              <span style="font-weight:700;font-size:13px;">${m.label}</span>
            </div>
            <div style="font-size:11px;color:#6B7280;"><b>Jenis:</b> Jalur Bencana (${m.kategori})</div>
          </div>
        `, { closeButton: false });
      } else {
        // Render Standard Marker
        const icon = createIcon(m.kategori, m.source);
        const marker = L.marker([m.lat, m.lng], { icon });
        marker.bindPopup(`
          <div style="min-width:180px;font-family:system-ui,sans-serif;">
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;">
              <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${color};"></span>
              <span style="font-weight:700;font-size:13px;">${m.label}</span>
            </div>
            <div style="font-size:11px;color:#6B7280;margin-bottom:4px;"><b>Kategori:</b> ${m.kategori}</div>
            <div style="margin-top:6px;font-size:10px;color:#9CA3AF;font-family:monospace;">${m.lat.toFixed(7)}, ${m.lng.toFixed(7)}</div>
          </div>
        `, { closeButton: false });
        marker.addTo(layerGroupRef.current!);
      }
    });
  }, [markers]);

  // Click preview marker
  useEffect(() => {
    if (!mapRef.current) return;
    if (clickMarkerRef.current) {
      clickMarkerRef.current.remove();
      clickMarkerRef.current = null;
    }
    if (clickedCoord) {
      const icon = L.divIcon({
        html: `<div style="width:20px;height:20px;border-radius:50%;background:#10B981;border:3px solid white;box-shadow:0 0 0 2px #10B981;animation:pulse 1.5s infinite;"></div>
               <style>@keyframes pulse{0%{transform:scale(1);opacity:1}70%{transform:scale(1.5);opacity:.5}100%{transform:scale(1);opacity:1}}</style>`,
        className: "",
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });
      clickMarkerRef.current = L.marker(clickedCoord, { icon })
        .addTo(mapRef.current)
        .bindPopup("Titik yang dipilih")
        .openPopup();
    }
  }, [clickedCoord]);

  // Drawing Line Preview
  useEffect(() => {
    if (!mapRef.current) return;
    if (drawLineRef.current) drawLineRef.current.remove();

    if (isDrawingLine && currentLinePoints.length > 0) {
      drawLineRef.current = L.polyline(currentLinePoints, {
        color: "#3B82F6",
        weight: 4,
        dashArray: "5, 10"
      }).addTo(mapRef.current);
    }
  }, [currentLinePoints, isDrawingLine]);

  return <div ref={containerRef} className="w-full h-full min-h-[500px]" />;
}
