"use client";
import React from "react";

type WaterStatus = "normal" | "siaga" | "waspada" | "bahaya";
type RiskStatus = "aman" | "waspada" | "siaga" | "bahaya";

interface TinggiAirItem {
  nama_pos: string;
  kecamatan: string;
  tinggi_air: number;
  status: WaterStatus;
  waktu: string;
}

interface PrediksiItem {
  kecamatan: string;
  skor_risiko: number;
  status: RiskStatus;
}

const tinggiAirData: TinggiAirItem[] = [
  { nama_pos: "Pos Bedadung Hulu", kecamatan: "Arjasa", tinggi_air: 3.42, status: "waspada", waktu: "20:00" },
  { nama_pos: "Pos Tanggul", kecamatan: "Tanggul", tinggi_air: 1.85, status: "normal", waktu: "20:00" },
  { nama_pos: "Pos Mayang", kecamatan: "Mayang", tinggi_air: 4.71, status: "siaga", waktu: "19:45" },
  { nama_pos: "Pos Ambulu", kecamatan: "Ambulu", tinggi_air: 5.90, status: "bahaya", waktu: "19:30" },
];

const prediksiData: PrediksiItem[] = [
  { kecamatan: "Tempurejo", skor_risiko: 87.4, status: "bahaya" },
  { kecamatan: "Silo", skor_risiko: 73.1, status: "siaga" },
  { kecamatan: "Ambulu", skor_risiko: 66.8, status: "siaga" },
  { kecamatan: "Mayang", skor_risiko: 54.2, status: "waspada" },
  { kecamatan: "Kaliwates", skor_risiko: 28.9, status: "aman" },
];

const waterStatusCfg: Record<WaterStatus, { label: string; class: string; bar: string }> = {
  normal: { label: "Normal", class: "text-green-600 bg-green-100 dark:bg-green-500/15 dark:text-green-400", bar: "bg-green-500" },
  siaga: { label: "Siaga", class: "text-amber-600 bg-amber-100 dark:bg-amber-500/15 dark:text-amber-400", bar: "bg-amber-500" },
  waspada: { label: "Waspada", class: "text-orange-600 bg-orange-100 dark:bg-orange-500/15 dark:text-orange-400", bar: "bg-orange-500" },
  bahaya: { label: "Bahaya", class: "text-red-600 bg-red-100 dark:bg-red-500/15 dark:text-red-400", bar: "bg-red-500" },
};

const riskStatusCfg: Record<RiskStatus, { bar: string; text: string }> = {
  aman: { bar: "bg-green-400", text: "text-green-600 dark:text-green-400" },
  waspada: { bar: "bg-amber-400", text: "text-amber-600 dark:text-amber-400" },
  siaga: { bar: "bg-orange-500", text: "text-orange-600 dark:text-orange-400" },
  bahaya: { bar: "bg-red-500", text: "text-red-600 dark:text-red-400" },
};

export default function MonitoringPanel() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
      {/* ── Tinggi Air ── */}
      <div className="rounded-2xl border border-gray-200 bg-white px-5 pt-5 pb-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Tinggi Muka Air
            </h3>
            <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">Pos pemantauan aktif</p>
          </div>
          <span className="text-2xl">💧</span>
        </div>

        <ul className="space-y-3">
          {tinggiAirData.map((item) => {
            const cfg = waterStatusCfg[item.status];
            const pct = Math.min((item.tinggi_air / 7) * 100, 100);
            return (
              <li key={item.nama_pos} className="rounded-xl border border-gray-100 bg-gray-50 p-3.5 dark:border-gray-700 dark:bg-white/[0.02]">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-gray-800 dark:text-white/90">
                      {item.nama_pos}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Kec. {item.kecamatan} • Update {item.waktu}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${cfg.class}`}>
                      {cfg.label}
                    </span>
                    <span className="text-sm font-bold text-gray-800 dark:text-white/90">
                      {item.tinggi_air.toFixed(2)} m
                    </span>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${cfg.bar}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* ── Prediksi Banjir ── */}
      <div className="rounded-2xl border border-gray-200 bg-white px-5 pt-5 pb-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Prediksi Risiko Banjir
            </h3>
            <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">Skor risiko per kecamatan (0–100)</p>
          </div>
          <span className="text-2xl">🌊</span>
        </div>

        <ul className="space-y-3.5">
          {prediksiData.map((item) => {
            const cfg = riskStatusCfg[item.status];
            return (
              <li key={item.kecamatan}>
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Kec. {item.kecamatan}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-semibold capitalize ${cfg.text}`}>
                      {item.status}
                    </span>
                    <span className="text-sm font-bold text-gray-800 dark:text-white/90">
                      {item.skor_risiko}
                    </span>
                  </div>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${cfg.bar}`}
                    style={{ width: `${item.skor_risiko}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-gray-100 pt-4 dark:border-gray-800">
          {(["aman", "waspada", "siaga", "bahaya"] as RiskStatus[]).map((s) => (
            <div key={s} className="flex items-center gap-1.5">
              <span className={`h-2 w-2 rounded-full ${riskStatusCfg[s].bar}`} />
              <span className="text-xs capitalize text-gray-500 dark:text-gray-400">{s}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
