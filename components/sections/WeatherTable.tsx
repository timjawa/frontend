"use client";

import { useState } from "react";
import { weatherPredictions, getWeatherIcon } from "@/data/dummyData";

const tabs = ["Hari Ini", "Besok", "Lusa"];
const timeLabels = [
  { key: "pagi", label: "Pagi", time: "06:00" },
  { key: "siang", label: "Siang", time: "12:00" },
  { key: "sore", label: "Sore", time: "15:00" },
  { key: "malam", label: "Malam", time: "18:00" },
  { key: "dini_hari", label: "Dini Hari", time: "00:00" },
];

export default function WeatherTable() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <section className="py-10 bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-primary mb-6">
          Prediksi Cuaca
        </h2>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {tabs.map((tab, i) => (
            <button
              key={tab}
              onClick={() => setActiveTab(i)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                activeTab === i
                  ? "bg-primary text-white shadow-md"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-border"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-primary text-white">
                  <th className="text-left px-5 py-3.5 text-sm font-semibold sticky left-0 bg-primary z-10 min-w-[140px]">
                    Kecamatan
                  </th>
                  {timeLabels.map((t) => (
                    <th
                      key={t.key}
                      className="text-center px-4 py-3.5 text-sm font-semibold min-w-[130px]"
                    >
                      <div>{t.label}</div>
                      <div className="text-xs font-normal text-white/70">
                        {t.time}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {weatherPredictions.map((row, idx) => (
                  <tr
                    key={row.kecamatan}
                    className={`border-b border-border/50 hover:bg-accent/30 transition-colors ${
                      idx % 2 === 0 ? "bg-white" : "bg-slate-50/50"
                    }`}
                  >
                    <td className="px-5 py-4 font-semibold text-primary text-sm sticky left-0 bg-inherit z-10">
                      {row.kecamatan}
                    </td>
                    {timeLabels.map((t) => {
                      const data = row[t.key as keyof typeof row] as {
                        suhu: string;
                        cuaca: string;
                        icon: string;
                      };
                      const IconComp = getWeatherIcon(data.icon);
                      return (
                        <td
                          key={t.key}
                          className="px-4 py-4 text-center"
                        >
                          <div className="flex flex-col items-center gap-1">
                            <IconComp className="text-secondary text-2xl" />
                            <span className="font-bold text-primary text-sm">
                              {data.suhu}
                            </span>
                            <span className="text-xs text-slate-500 leading-tight">
                              {data.cuaca}
                            </span>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
