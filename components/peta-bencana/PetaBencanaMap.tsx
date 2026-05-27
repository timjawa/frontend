"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export type MarkerData = {
  id: string | number;
  lat: number;
  lng: number;
  label: string;
  kategori: string;
  status?: string;
  source: "laporan" | "manual" | "pos_pengungsian";
  tipe_marker?: "titik" | "garis" | "area";
  path_data?: [number, number][];
  tingkat_bahaya?: string;
  kapasitas?: number;
  terisi?: number;
  radius?: number | null;
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
  POS_PENGUNGSIAN: "#9333EA", // Ungu Violet
  UMUM: "#6B7280",          // Abu-abu
};

// Fungsi pembantu untuk mengambil kode warna berdasarkan nama kategori
function getColor(kategori: string) {
  return KATEGORI_COLORS[kategori?.toUpperCase().replace(/ /g, "_")] || "#6B7280";
}

// --- LOGIKA ICON ---
// Membuat tampilan marker kustom (SVG) menggunakan Leaflet divIcon
function createIcon(kategori: string, source: "laporan" | "manual" | "pos_pengungsian") {
  const color = getColor(kategori);
  const isManual = source === "manual";
  const isPosPengungsian = kategori?.toUpperCase().replace(/ /g, "_") === "POS_PENGUNGSIAN";
  
  let shape = "";
  if (isPosPengungsian) {
    // Beautiful house/shelter icon
    shape = `<path d="M16 7.5 L8 14.5 H10.5 V23.5 H14 V19.5 H18 V23.5 H21.5 V14.5 H24 Z" fill="${color}"/>`;
  } else {
    shape = isManual
      ? `<rect x="8" y="8" width="16" height="16" rx="3" fill="${color}"/>`
      : `<circle cx="16" cy="14" r="8" fill="${color}"/>
         <polygon points="16,24 12,18 20,18" fill="${color}"/>`;
  }

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
  onEditMarker?: (id: string | number) => void;
  onDeleteMarker?: (id: string | number) => void;
  onDeselectMarker?: () => void;
  panToCoord?: [number, number] | null;
}

export default function PetaBencanaMap({ 
  markers, 
  center, 
  onMapClick, 
  clickedCoord,
  isDrawingLine = false,
  currentLinePoints = [],
  onLinePointsChange,
  onEditMarker,
  onDeleteMarker,
  onDeselectMarker,
  panToCoord
}: Props) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const clickMarkerRef = useRef<L.Marker | null>(null);
  const drawLineRef = useRef<L.Polyline | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const panMarkerRef = useRef<L.Marker | null>(null);

  // Keep latest callbacks in refs to avoid stale closures and unnecessary redraws
  const onEditMarkerRef = useRef(onEditMarker);
  const onDeleteMarkerRef = useRef(onDeleteMarker);
  const onDeselectMarkerRef = useRef(onDeselectMarker);

  useEffect(() => {
    onEditMarkerRef.current = onEditMarker;
    onDeleteMarkerRef.current = onDeleteMarker;
    onDeselectMarkerRef.current = onDeselectMarker;
  }, [onEditMarker, onDeleteMarker, onDeselectMarker]);

  // --- DOM Event Delegation for Popup Buttons ---
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handlePopupClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const editBtn = target.closest(".edit-marker-btn");
      const deleteBtn = target.closest(".delete-marker-btn");

      if (editBtn) {
        const markerId = editBtn.getAttribute("data-id");
        if (markerId && onEditMarkerRef.current) {
          onEditMarkerRef.current(markerId);
        }
      }

      if (deleteBtn) {
        const markerId = deleteBtn.getAttribute("data-id");
        if (markerId && onDeleteMarkerRef.current) {
          onDeleteMarkerRef.current(markerId);
        }
      }
    };

    container.addEventListener("click", handlePopupClick);
    return () => {
      container.removeEventListener("click", handlePopupClick);
    };
  }, []);

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

    // Bind popupclose to trigger deselection when user closes the popup
    map.on("popupclose", () => {
      setTimeout(() => {
        const activePopup = (map as any)._popup;
        if (!activePopup && onDeselectMarkerRef.current) {
          onDeselectMarkerRef.current();
        }
      }, 100);
    });

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
        
        if (m.source === "manual") {
          // No immediate click handler to edit, let popup open normally
        }

        polyline.bindPopup(`
          <div style="min-width:180px;font-family:system-ui,sans-serif;padding:2px;">
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;">
              <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${color};"></span>
              <span style="font-weight:700;font-size:13px;color:#1F2937;">${m.label || "Jalur Jalan"}</span>
            </div>
            <div style="font-size:11px;color:#4B5563;margin-bottom:4px;"><b>Jenis:</b> Jalur Bencana (${m.kategori})</div>
            ${m.tingkat_bahaya ? `<div style="font-size:11px;color:#4B5563;margin-bottom:4px;"><b>Bahaya:</b> <span style="font-weight:750;color:${m.tingkat_bahaya === "kritis" ? "#EF4444" : m.tingkat_bahaya === "tinggi" ? "#F97316" : m.tingkat_bahaya === "sedang" ? "#EAB308" : "#10B981"};">${m.tingkat_bahaya.toUpperCase()}</span></div>` : ""}
            
            ${m.source === "manual" ? `
            <div style="border-top:1px solid #E5E7EB;padding-top:8px;margin-top:8px;display:flex;flex-direction:column;gap:6px;">
              <button class="edit-marker-btn" data-id="${m.id}" style="width:100%;display:inline-flex;align-items:center;justify-content:center;gap:4px;background:#EFF6FF;color:#2563EB;border:1px solid #93C5FD;padding:6px 8px;border-radius:6px;font-size:10px;font-weight:700;cursor:pointer;transition:all 0.2s;">
                ✏️ Edit Jalur
              </button>
              <button class="delete-marker-btn" data-id="${m.id}" style="width:100%;display:inline-flex;align-items:center;justify-content:center;gap:4px;background:#FEF2F2;color:#DC2626;border:1px solid #FCA5A5;padding:6px 8px;border-radius:6px;font-size:10px;font-weight:700;cursor:pointer;transition:all 0.2s;">
                🗑️ Hapus Jalur
              </button>
            </div>
            ` : ""}
          </div>
        `, { closeButton: true });
      } else {
        // Render Standard Marker
        const isPos = m.source === "pos_pengungsian" || m.kategori?.toUpperCase().replace(/ /g, "_") === "POS_PENGUNGSIAN";
        let markerIcon;

        if (isPos) {
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

        const marker = L.marker([m.lat, m.lng], { icon: markerIcon });
        
        // Tambahkan Radius Area Bahaya / Dampak (Kecuali Pos Pengungsian)
        if (!isPos && m.radius && Number(m.radius) > 0) {
          const radiusMeters = Number(m.radius);
          L.circle([m.lat, m.lng], {
            radius: radiusMeters,
            color: color,
            fillColor: color,
            fillOpacity: 0.12,
            weight: 1.5,
            dashArray: "3, 5"
          }).addTo(layerGroupRef.current!);
        }

        if (m.source === "manual") {
          // No immediate click handler to edit, let popup open normally
        }

        let popupContent = "";

        if (isPos) {
          popupContent = `
            <div style="min-width:200px;font-family:system-ui,sans-serif;padding:2px;">
              <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;">
                <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${color};"></span>
                <span style="font-weight:700;font-size:13px;color:#1F2937;">${m.label || "Pos Pengungsian"}</span>
              </div>
              <div style="font-size:11px;color:#4B5563;margin-bottom:4px;"><b>Kategori:</b> POS PENGUNGSIAN</div>
              <div style="font-size:11px;color:#4B5563;margin-bottom:4px;"><b>Status:</b> <span style="font-weight:750;color:${m.status === 'aktif' ? '#10B981' : m.status === 'penuh' ? '#EF4444' : '#3B82F6'};">${(m.status || 'standby').toUpperCase()}</span></div>
              <div style="font-size:11px;color:#4B5563;margin-bottom:4px;"><b>Kapasitas:</b> <b>${m.terisi || 0} / ${m.kapasitas || 0} Jiwa</b></div>
              <div style="margin-top:6px;font-size:10px;color:#9CA3AF;font-family:monospace;margin-bottom:6px;">${m.lat.toFixed(6)}, ${m.lng.toFixed(6)}</div>
              
              <div style="border-top:1px solid #E5E7EB;padding-top:8px;margin-top:8px;">
                <a href="/admin/pos-pengungsian/${m.id}/edit" style="display:flex;align-items:center;justify-content:center;gap:4px;background:#F5F3FF;color:#7C3AED;border:1px solid #C084FC;padding:6px 8px;border-radius:6px;font-size:10px;font-weight:700;text-decoration:none;cursor:pointer;transition:all 0.2s;text-align:center;">
                  ✏️ Edit Pos Pengungsian
                </a>
              </div>
            </div>
          `;
        } else {
          popupContent = `
            <div style="min-width:180px;font-family:system-ui,sans-serif;padding:2px;">
              <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;">
                <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${color};"></span>
                <span style="font-weight:700;font-size:13px;color:#1F2937;">${m.label || "Marker Bencana"}</span>
              </div>
              <div style="font-size:11px;color:#4B5563;margin-bottom:4px;"><b>Kategori:</b> ${m.kategori}</div>
              ${m.tingkat_bahaya ? `<div style="font-size:11px;color:#4B5563;margin-bottom:4px;"><b>Bahaya:</b> <span style="font-weight:750;color:${m.tingkat_bahaya === "kritis" ? "#EF4444" : m.tingkat_bahaya === "tinggi" ? "#F97316" : m.tingkat_bahaya === "sedang" ? "#EAB308" : "#10B981"};">${m.tingkat_bahaya.toUpperCase()}</span></div>` : ""}
              ${m.radius ? `<div style="font-size:11px;color:#4B5563;margin-bottom:4px;"><b>Radius Dampak:</b> ±${m.radius} meter</div>` : ""}
              <div style="margin-top:6px;font-size:10px;color:#9CA3AF;font-family:monospace;margin-bottom:6px;">${m.lat.toFixed(6)}, ${m.lng.toFixed(6)}</div>
              
              ${m.source === "manual" ? `
              <div style="border-top:1px solid #E5E7EB;padding-top:8px;margin-top:8px;display:flex;flex-direction:column;gap:6px;">
                <button class="edit-marker-btn" data-id="${m.id}" style="width:100%;display:inline-flex;align-items:center;justify-content:center;gap:4px;background:#EFF6FF;color:#2563EB;border:1px solid #93C5FD;padding:6px 8px;border-radius:6px;font-size:10px;font-weight:700;cursor:pointer;transition:all 0.2s;">
                  ✏️ Edit Marker
                </button>
                <button class="delete-marker-btn" data-id="${m.id}" style="width:100%;display:inline-flex;align-items:center;justify-content:center;gap:4px;background:#FEF2F2;color:#DC2626;border:1px solid #FCA5A5;padding:6px 8px;border-radius:6px;font-size:10px;font-weight:700;cursor:pointer;transition:all 0.2s;">
                  🗑️ Hapus Marker
                </button>
              </div>
              ` : ""}
            </div>
          `;
        }

        marker.bindPopup(popupContent, { closeButton: true });
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
      mapRef.current.setView(clickedCoord, 14, { animate: true });
      const icon = L.divIcon({
        html: `<div style="width:20px;height:20px;border-radius:50%;background:#10B981;border:3px solid white;box-shadow:0 0 0 2px #10B981;animation:pulse 1.5s infinite;"></div>
               <style>@keyframes pulse{0%{transform:scale(1);opacity:1}70%{transform:scale(1.5);opacity:.5}100%{transform:scale(1);opacity:1}}</style>`,
        className: "",
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });
      
      const marker = L.marker(clickedCoord, { icon }).addTo(mapRef.current);
      
      const guidePopup = `
        <div style="font-family:system-ui,-apple-system,sans-serif;padding:4px;min-width:160px;">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;">
            <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#10B981;box-shadow:0 0 4px #10B981;"></span>
            <span style="font-weight:700;font-size:12px;color:#1F2937;">📍 Titik Koordinat</span>
          </div>
          <p style="margin:0 0 6px 0;font-size:11px;color:#4B5563;line-height:1.4;">
            Koordinat ini siap diproses untuk pembuatan marker baru.
          </p>
          <div style="font-size:9px;color:#9CA3AF;font-family:monospace;margin-bottom:6px;">
            ${clickedCoord[0].toFixed(6)}, ${clickedCoord[1].toFixed(6)}
          </div>
        </div>
      `;
      marker.bindPopup(guidePopup, { closeButton: false }).openPopup();
      
      marker.on("popupclose", () => {
        if (onDeselectMarkerRef.current) {
          onDeselectMarkerRef.current();
        }
      });
  
      clickMarkerRef.current = marker;
    }
  }, [clickedCoord]);

  // Handle map center panning with pulsing radar highlight for Kecamatan
  useEffect(() => {
    if (!mapRef.current) return;
    if (panMarkerRef.current) {
      panMarkerRef.current.remove();
      panMarkerRef.current = null;
    }

    if (panToCoord) {
      mapRef.current.setView(panToCoord, 13, { animate: true });
      
      const radarIcon = L.divIcon({
        html: `<div style="width:24px;height:24px;border-radius:50%;background:#8B5CF6;opacity:0.3;border:2.5px solid #8B5CF6;animation:radar 2s infinite;"></div>
               <style>@keyframes radar{0%{transform:scale(0.5);opacity:0.8}100%{transform:scale(3.5);opacity:0}}</style>`,
        className: "",
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });
      
      const marker = L.marker(panToCoord, { icon: radarIcon, interactive: false }).addTo(mapRef.current);
      panMarkerRef.current = marker;
      
      // Auto clear radar marker after 5 seconds so it doesn't clutter the map
      const timer = setTimeout(() => {
        if (panMarkerRef.current === marker) {
          marker.remove();
          panMarkerRef.current = null;
        }
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [panToCoord]);

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
