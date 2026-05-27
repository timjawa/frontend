"use client";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";
import { MoreDotIcon } from "@/icons";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { useState, useEffect, useRef } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { fetchHistoricalWeather, refreshRealtimeWeather } from "@/services/weather";
import { HiArrowPath } from "react-icons/hi2";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface DailyEntry {
  tanggal: string;
  suhu_avg: number;
  hujan_avg: number;
}

export default function CuacaWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [historicalData, setHistoricalData] = useState<Record<string, DailyEntry[]>>({});
  const [selectedKecamatan, setSelectedKecamatan] = useState<string>("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchKecamatan, setSearchKecamatan] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async (refreshFromAPI = false) => {
    try {
      setLoading(true);
      if (refreshFromAPI) {
        await refreshRealtimeWeather();
      }
      const res = await fetchHistoricalWeather();

      // Backend returns: { status: "success", data: { "KecamatanName": [{tanggal, suhu_avg, hujan_avg}] } }
      if (res && res.data) {
        setHistoricalData(res.data);
        // Auto-select first kecamatan
        const kecList = Object.keys(res.data).sort();
        if (kecList.length > 0 && !selectedKecamatan) {
          setSelectedKecamatan(kecList[0]);
        }
      }
    } catch (error) {
      console.error("Gagal mengambil data riwayat cuaca:", error);
    } finally {
      setLoading(false);
    }
  };

  // Get unique kecamatan names from the grouped data
  const kecamatanList = Object.keys(historicalData).sort();

  // Get data for selected kecamatan, sorted by date ascending for chart
  const currentData = (historicalData[selectedKecamatan] || [])
    .sort((a, b) => a.tanggal.localeCompare(b.tanggal));

  // Prepare chart data
  const categories = currentData.map((d) =>
    new Date(d.tanggal).toLocaleDateString("id-ID", { day: "2-digit", month: "short" })
  );
  const suhuSeries = currentData.map((d) => d.suhu_avg);
  const hujanSeries = currentData.map((d) => d.hujan_avg);

  const chartOptions: ApexOptions = {
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "area",
      height: 310,
      toolbar: { show: false },
      zoom: { enabled: false },
    },
    colors: ["#f97316", "#3b82f6"],
    dataLabels: { enabled: false },
    stroke: {
      curve: "smooth",
      width: [2.5, 2.5],
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.4,
        opacityTo: 0.05,
        stops: [0, 90, 100],
      },
    },
    xaxis: {
      categories,
      labels: {
        style: {
          colors: "#9ca3af",
          fontSize: "11px",
          fontFamily: "Outfit, sans-serif",
        },
        rotate: -45,
        rotateAlways: currentData.length > 10,
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
      tooltip: { enabled: false },
    },
    yaxis: [
      {
        title: {
          text: "Suhu (°C)",
          style: { color: "#f97316", fontSize: "12px", fontFamily: "Outfit, sans-serif" },
        },
        labels: {
          style: { colors: "#f97316", fontSize: "11px", fontFamily: "Outfit, sans-serif" },
          formatter: (val) => val.toFixed(1),
        },
      },
      {
        opposite: true,
        title: {
          text: "Curah Hujan (mm)",
          style: { color: "#3b82f6", fontSize: "12px", fontFamily: "Outfit, sans-serif" },
        },
        labels: {
          style: { colors: "#3b82f6", fontSize: "11px", fontFamily: "Outfit, sans-serif" },
          formatter: (val) => val.toFixed(1),
        },
      },
    ],
    grid: {
      borderColor: "#f3f4f6",
      strokeDashArray: 4,
      padding: { left: 8, right: 8 },
    },
    legend: {
      position: "top",
      horizontalAlign: "right",
      fontSize: "12px",
      fontFamily: "Outfit, sans-serif",
      markers: { size: 5, shape: "circle" as const },
      labels: { colors: "#6b7280" },
      itemMargin: { horizontal: 12 },
    },
    tooltip: {
      shared: true,
      intersect: false,
      theme: "light",
      y: {
        formatter: (val, opts) =>
          opts?.seriesIndex === 0 ? `${val.toFixed(1)} °C` : `${val.toFixed(1)} mm`,
      },
    },
    markers: {
      size: 0,
      hover: { size: 5 },
    },
  };

  const chartSeries = [
    { name: "Suhu (°C)", data: suhuSeries },
    { name: "Curah Hujan (mm)", data: hujanSeries },
  ];

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 pb-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Statistik Cuaca Harian
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {loading
              ? "Memuat data..."
              : selectedKecamatan
              ? `Riwayat suhu dan curah hujan di Kecamatan ${selectedKecamatan}`
              : "Kabupaten Jember"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Dropdown Kecamatan Searchable */}
          {kecamatanList.length > 0 && (
            <div className="relative" ref={wrapperRef}>
              <input
                type="text"
                placeholder="Cari kecamatan..."
                value={dropdownOpen ? searchKecamatan : selectedKecamatan}
                onFocus={() => {
                  setDropdownOpen(true);
                  setSearchKecamatan(""); // Reset search on focus
                }}
                onChange={(e) => setSearchKecamatan(e.target.value)}
                className="w-48 rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
              {dropdownOpen && (
                <div className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
                  {kecamatanList
                    .filter((kec) => kec.toLowerCase().includes(searchKecamatan.toLowerCase()))
                    .map((kec) => (
                      <div
                        key={kec}
                        className={`cursor-pointer px-3 py-2 text-sm hover:bg-blue-50 dark:hover:bg-gray-700 dark:text-white ${
                          kec === selectedKecamatan ? "bg-blue-50/50 font-semibold text-blue-600 dark:bg-gray-700/50 dark:text-blue-400" : "text-gray-700"
                        }`}
                        onClick={() => {
                          setSelectedKecamatan(kec);
                          setDropdownOpen(false);
                        }}
                      >
                        {kec}
                      </div>
                    ))}
                  {kecamatanList.filter((kec) => kec.toLowerCase().includes(searchKecamatan.toLowerCase())).length === 0 && (
                    <div className="px-3 py-2 text-sm text-gray-500">Tidak ditemukan</div>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="relative inline-block ml-2">
            <button onClick={() => setIsOpen(!isOpen)} className="dropdown-toggle">
              <MoreDotIcon className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300" />
            </button>
            <Dropdown isOpen={isOpen} onClose={() => setIsOpen(false)} className="w-40 p-2">
              <DropdownItem
                onItemClick={() => {
                  setIsOpen(false);
                  loadData(true);
                }}
                className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
              >
                Refresh Data
              </DropdownItem>
            </Dropdown>
          </div>
        </div>
      </div>

      {/* Chart Area */}
      <div className="mt-4 flex-1">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-[310px] gap-2 text-gray-400">
            <HiArrowPath className="w-6 h-6 animate-spin text-gray-300" />
            <span className="text-sm">Memuat data cuaca...</span>
          </div>
        ) : currentData.length > 0 ? (
          <ReactApexChart
            options={chartOptions}
            series={chartSeries}
            type="area"
            height={310}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-[310px] gap-2 text-gray-500">
            <span className="text-sm">Belum ada data riwayat cuaca untuk kecamatan ini.</span>
            <span className="text-xs text-gray-400">Data riwayat akan terisi otomatis setiap kali cuaca realtime diperbarui.</span>
          </div>
        )}
      </div>
    </div>
  );
}
