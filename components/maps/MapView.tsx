"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { bencanaData, type StatusBencana, type JenisBencana } from "@/data/floodData";
import { kecamatanData } from "@/data/kecamatanData";

// Warna garis berdasarkan STATUS (danger/warning/safe)
function getColor(status: StatusBencana): string {
  const warna = {
    danger:  "#ef4444",
    warning: "#f59e0b",
    safe:    "#22c55e",
  };
  return warna[status];
}

// Emoji/label berdasarkan JENIS bencana — untuk popup
function getIkonBencana(jenis: JenisBencana): string {
  const ikon = {
    banjir:        "🌊 Banjir",
    longsor:       "⛰️ Longsor",
    kebakaran:     "🔥 Kebakaran",
    angin_kencang: "💨 Angin Kencang",
  };
  return ikon[jenis];
}

function toGeoJSON(data: typeof bencanaData) {
  return {
    type: "FeatureCollection" as const,
    features: data.map((item) => ({
      type: "Feature" as const,
      properties: {
        nama_jalan:    item.nama_jalan,
        jenis_bencana: item.jenis_bencana,
        status:        item.status,
        keterangan:    item.keterangan,
        diperbarui:    item.diperbarui,
      },
      geometry: {
        type: "LineString" as const,
        coordinates: item.koordinat,
      },
    })),
  };
}

export default function MapView() {
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (mapRef.current) return;
    
    let isMounted = true; // Penanda bahwa komponen aktif dalam siklus kehidupannya

    // Batas koordinat untuk Kabupaten Jember (Estimasi Bounding Box)
    const jemberBounds = L.latLngBounds(
      L.latLng(-8.55, 113.20), // Barat Daya (South-West)
      L.latLng(-7.90, 114.15)  // Timur Laut (North-East)
    );

    const map = L.map("map", {
      maxBounds: jemberBounds,
      maxBoundsViscosity: 1.0, 
      minZoom: 12,             
      scrollWheelZoom: true,  
    }).setView([-8.1600, 113.7195], 16); // Fokus tajam ke titik koordinat asli Jl. Mastrip

    
    mapRef.current = map;

    // Peta Dasar (Basemap) OpenStreetMap Standar
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    // Mengambil batas wilayah administrasi Jember dari file jember.json
    fetch("/jember.json")
      .then((res) => res.json())
      .then((data) => {
        // Cek jika useEffect ini sudah di-cleanup oleh React,
        if (!isMounted) return;
        
        if (data && data.geometry) {
          const geoJsonFeature: GeoJSON.Feature = {
            type: "Feature",
            geometry: data.geometry,
            properties: { name: "Kabupaten Jember" }
          };

          L.geoJSON(geoJsonFeature, {
            style: {
              color: "#3b82f6", // Warna garis batas (biru)
              weight: 3,        
              opacity: 0.6,     
              fillColor: "#3b82f6",
              fillOpacity: 0.03, 
              dashArray: "6, 6", 
            },
            interactive: false 
          }).addTo(map);
        }
      })
      .catch((err) => console.error("Gagal memuat batas wilayah Jember:", err));

    // ========================================================
    // Outline tebal warna putih (White Halo) agar warna Merah menyala
    // ========================================================
    L.geoJSON(toGeoJSON(bencanaData), {
      style: () => ({
        color: "#ffffff", // Selalu pakai outline putih murni (paling efektif pisahkan dari warna peta)
        weight: 10,   
        opacity: 1.0,
      }),
      interactive: false, 
    }).addTo(map);

    // Render garis sesungguhnya di atasnya
    L.geoJSON(toGeoJSON(bencanaData), {
      style: (feature) => ({
        color:   getColor(feature?.properties.status),
        weight:  6,
        opacity: 1.0,
        lineCap: "round", // Ujung garis dibuat membulat lebih rapi
      }),
      onEachFeature: (feature, layer) => {
        const p = feature.properties;
        layer.bindPopup(`
          <div style="min-width:180px">
            <b style="font-size:14px">${p.nama_jalan}</b><br/>
            <hr style="margin:6px 0"/>
            Jenis      : <b>${getIkonBencana(p.jenis_bencana)}</b><br/>
            Status     : <b>${p.status.toUpperCase()}</b><br/>
            Keterangan : ${p.keterangan}<br/>
            Update     : ${p.diperbarui}
          </div>
        `);
      },
    }).addTo(map);

    // ========================================================
    // Merender Titik Lokasi Peta per Kecamatan (Status Point)
    // ========================================================
    kecamatanData.forEach((kec) => {
      const isDanger = kec.status === "danger";
      const isWarning = kec.status === "warning";
      
      const pinColor = getColor(kec.status);
      
      // Mengatur ukuran dynamic berdasarkan keparahan (heatmap effect)
      const radiusSize = isDanger ? 12 : isWarning ? 9 : 6;

      const circle = L.circleMarker(kec.koordinat, {
        radius: radiusSize,
        fillColor: pinColor,
        color: isDanger ? "#991b1b" : pinColor, // Border lebih gelap kalau bahaya
        weight: isDanger ? 2 : 1,
        opacity: 0.8,
        fillOpacity: isDanger ? 0.7 : 0.5,
      }).addTo(map);

      // Tooltip sederhana saat di-hover
      circle.bindTooltip(
        `<div style="text-align:center;">
           <b style="font-size: 13px;">Kec. ${kec.nama}</b><br/>
           <span style="color:${pinColor}; font-weight:bold">${kec.status.toUpperCase()}</span>
         </div>`,
        { direction: "top", offset: [0, -radiusSize], className: "bg-white/95 backdrop-blur-sm px-2 py-1 border-0 shadow-md" }
      );

      // Popup detail saat diklik
      const iconDesc = kec.jenis_bencana ? getIkonBencana(kec.jenis_bencana) : "✅ Kondusif";
      circle.bindPopup(`
        <div style="min-width: 170px;">
          <h3 style="margin:0; font-size:15px; color:#1f2937">📍 Kecamatan <b>${kec.nama}</b></h3>
          <hr style="margin:8px 0; border:0; border-top:1px solid #e5e7eb"/>
          <div style="font-size:13px; line-height: 1.6; color:#4b5563">
            <b>Status:</b> <span style="color: white; background: ${pinColor}; padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: bold; margin-left: 4px;">${kec.status.toUpperCase()}</span><br/>
            <b>Pantauan:</b> ${iconDesc}<br/>
            <b>Info:</b> <i>"${kec.keterangan}"</i>
          </div>
        </div>
      `);
    });

    return () => {
      isMounted = false; // Tandai bahwa useEffect versi ini sudah "mati"
      map.remove();
      mapRef.current = null;
    };
  }, []);

  return <div id="map" className="w-full h-full z-0" style={{ minHeight: "400px" }} />;
}
