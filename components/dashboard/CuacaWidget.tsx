"use client";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { MoreDotIcon } from "@/icons";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { useState } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

// Data dummy riwayat cuaca 7 hari terakhir per kecamatan
const dummyHistoricalData: Record<string, { tanggal: string, suhu_avg: number, hujan_avg: number }[]> = {
  "Kaliwates": [
    { tanggal: "2026-05-01", suhu_avg: 29.5, hujan_avg: 5.0 },
    { tanggal: "2026-05-02", suhu_avg: 30.1, hujan_avg: 12.0 },
    { tanggal: "2026-05-03", suhu_avg: 28.5, hujan_avg: 45.0 },
    { tanggal: "2026-05-04", suhu_avg: 27.0, hujan_avg: 60.0 },
    { tanggal: "2026-05-05", suhu_avg: 26.5, hujan_avg: 20.0 },
    { tanggal: "2026-05-06", suhu_avg: 29.0, hujan_avg: 0.0 },
    { tanggal: "2026-05-07", suhu_avg: 31.0, hujan_avg: 0.0 },
  ],
  "Sumbersari": [
    { tanggal: "2026-05-01", suhu_avg: 28.5, hujan_avg: 10.0 },
    { tanggal: "2026-05-02", suhu_avg: 29.0, hujan_avg: 15.0 },
    { tanggal: "2026-05-03", suhu_avg: 27.5, hujan_avg: 50.0 },
    { tanggal: "2026-05-04", suhu_avg: 26.5, hujan_avg: 55.0 },
    { tanggal: "2026-05-05", suhu_avg: 26.0, hujan_avg: 25.0 },
    { tanggal: "2026-05-06", suhu_avg: 28.0, hujan_avg: 5.0 },
    { tanggal: "2026-05-07", suhu_avg: 30.0, hujan_avg: 0.0 },
  ],
  "Patrang": [
    { tanggal: "2026-05-01", suhu_avg: 27.5, hujan_avg: 20.0 },
    { tanggal: "2026-05-02", suhu_avg: 28.0, hujan_avg: 25.0 },
    { tanggal: "2026-05-03", suhu_avg: 26.5, hujan_avg: 60.0 },
    { tanggal: "2026-05-04", suhu_avg: 25.5, hujan_avg: 65.0 },
    { tanggal: "2026-05-05", suhu_avg: 25.0, hujan_avg: 35.0 },
    { tanggal: "2026-05-06", suhu_avg: 27.0, hujan_avg: 10.0 },
    { tanggal: "2026-05-07", suhu_avg: 29.0, hujan_avg: 5.0 },
  ],
  "Ambulu": [
    { tanggal: "2026-05-01", suhu_avg: 30.5, hujan_avg: 0.0 },
    { tanggal: "2026-05-02", suhu_avg: 31.0, hujan_avg: 5.0 },
    { tanggal: "2026-05-03", suhu_avg: 29.5, hujan_avg: 30.0 },
    { tanggal: "2026-05-04", suhu_avg: 28.5, hujan_avg: 40.0 },
    { tanggal: "2026-05-05", suhu_avg: 28.0, hujan_avg: 15.0 },
    { tanggal: "2026-05-06", suhu_avg: 30.0, hujan_avg: 0.0 },
    { tanggal: "2026-05-07", suhu_avg: 32.0, hujan_avg: 0.0 },
  ],
};

export default function CuacaWidget() {
  const [isOpen, setIsOpen] = useState(false);
  
  const kecamatanList = Object.keys(dummyHistoricalData);
  const [selectedKecamatan, setSelectedKecamatan] = useState<string>(kecamatanList[0]);

  const currentData = dummyHistoricalData[selectedKecamatan] || [];
  
  // Format tanggal (contoh: "02 Mei")
  const DAYS = currentData.map(d => {
    const date = new Date(d.tanggal);
    return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
  });
  
  const suhuData = currentData.map(d => d.suhu_avg);
  const curahHujanData = currentData.map(d => d.hujan_avg);

  const options: ApexOptions = {
    colors: ["#f79009", "#0ea5e9"], // Orange untuk suhu, Biru untuk hujan
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "area",
      height: 315,
      toolbar: { show: false },
    },
    stroke: {
      curve: "smooth",
      width: [3, 0],
    },
    fill: {
      type: ["solid", "gradient"],
      opacity: [1, 0.4],
      gradient: {
        shadeIntensity: 1,
        inverseColors: false,
        opacityFrom: 0.5,
        opacityTo: 0,
        stops: [0, 90, 100]
      }
    },
    labels: DAYS,
    markers: {
      size: [4, 0],
    },
    xaxis: {
      type: "category",
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        style: { colors: "#64748b" }
      }
    },
    yaxis: [
      {
        title: {
          text: "Suhu (°C)",
          style: { color: "#f79009", fontWeight: 600 }
        },
        labels: {
          style: { colors: "#f79009" }
        }
      },
      {
        opposite: true,
        title: {
          text: "Curah Hujan (mm)",
          style: { color: "#0ea5e9", fontWeight: 600 }
        },
        labels: {
          style: { colors: "#0ea5e9" }
        }
      }
    ],
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "left",
      fontFamily: "Outfit",
    },
    grid: {
      borderColor: "#f1f5f9",
      strokeDashArray: 4,
    },
    tooltip: {
      theme: "light",
      shared: true,
      intersect: false,
      y: [
        { formatter: (y) => (y !== undefined ? `${y} °C` : y) },
        { formatter: (y) => (y !== undefined ? `${y} mm` : y) }
      ]
    }
  };

  const series = [
    {
      name: "Suhu Rata-rata",
      type: "line",
      data: suhuData
    },
    {
      name: "Curah Hujan",
      type: "area",
      data: curahHujanData
    }
  ];

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 pb-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Statistik Cuaca 7 Hari Terakhir
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Riwayat suhu dan curah hujan {selectedKecamatan ? `di Kecamatan ${selectedKecamatan}` : "Kabupaten Jember"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Dropdown Kecamatan */}
          {kecamatanList.length > 0 && (
            <select
              value={selectedKecamatan}
              onChange={(e) => setSelectedKecamatan(e.target.value)}
              className="rounded-lg border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              {kecamatanList.map((kec) => (
                <option key={kec} value={kec}>{kec}</option>
              ))}
            </select>
          )}

          <div className="relative inline-block ml-2">
            <button onClick={() => setIsOpen(!isOpen)} className="dropdown-toggle">
              <MoreDotIcon className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300" />
            </button>
            <Dropdown isOpen={isOpen} onClose={() => setIsOpen(false)} className="w-40 p-2">
              <DropdownItem
                onItemClick={() => setIsOpen(false)}
                className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
              >
                Unduh PDF
              </DropdownItem>
            </Dropdown>
          </div>
        </div>
      </div>

      <div className="max-w-full flex-1 overflow-x-auto overflow-y-hidden custom-scrollbar mt-4 flex flex-col justify-end">
        <div className="-ml-5 min-w-[650px] xl:min-w-full pl-2 h-[315px] relative">
          {currentData.length > 0 ? (
            <ReactApexChart options={options} series={series} type="line" height={315} />
          ) : (
            <div className="flex h-[315px] items-center justify-center text-gray-500">
              Belum ada data cuaca historis untuk kecamatan ini.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
