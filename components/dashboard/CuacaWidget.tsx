"use client";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { MoreDotIcon } from "@/icons";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { useState, useEffect, useRef } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { fetchForecastSummary } from "@/services/weather";
import { HiArrowPath } from "react-icons/hi2";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface SummaryRow {
  id: string;
  kecamatan_id: string;
  tanggal: string;
  suhu_rata: number | null;
  curah_hujan: number | null;
  kecamatan: { id: string; nama: string } | null;
}

export default function CuacaWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [rawData, setRawData] = useState<SummaryRow[]>([]);
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

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetchForecastSummary();
      if (res && res.data) {
        setRawData(res.data);
        // Auto-select first kecamatan
        const kecList = Array.from(new Set(
          res.data.map((d: SummaryRow) => d.kecamatan?.nama).filter(Boolean)
        )) as string[];
        if (kecList.length > 0 && !selectedKecamatan) {
          setSelectedKecamatan(kecList[0]);
        }
      }
    } catch (error) {
      console.error("Gagal mengambil data ringkasan cuaca:", error);
    } finally {
      setLoading(false);
    }
  };

  // Get unique kecamatan names
  const kecamatanList = Array.from(new Set(
    rawData.map((d) => d.kecamatan?.nama).filter(Boolean)
  )) as string[];

  // Filter data for selected kecamatan, sorted by date
  const currentData = rawData
    .filter((d) => d.kecamatan?.nama === selectedKecamatan)
    .sort((a, b) => a.tanggal.localeCompare(b.tanggal));

  // Format tanggal (contoh: "02 Mei")
  const DAYS = currentData.map(d => {
    const date = new Date(d.tanggal);
    return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
  });
  
  const suhuData = currentData.map(d => parseFloat(String(d.suhu_rata ?? 0)));
  const curahHujanData = currentData.map(d => parseFloat(String(d.curah_hujan ?? 0)));

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
                  loadData();
                }}
                className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
              >
                Refresh Data
              </DropdownItem>
            </Dropdown>
          </div>
        </div>
      </div>

      <div className="max-w-full flex-1 overflow-x-auto overflow-y-hidden custom-scrollbar mt-4 flex flex-col justify-end">
        <div className="-ml-5 min-w-[650px] xl:min-w-full pl-2 h-[315px] relative">
          {loading ? (
            <div className="flex h-[315px] items-center justify-center text-gray-400">
              <div className="flex flex-col items-center gap-2">
                <HiArrowPath className="w-6 h-6 animate-spin text-gray-300" />
                <span className="text-sm">Memuat data cuaca...</span>
              </div>
            </div>
          ) : currentData.length > 0 ? (
            <ReactApexChart options={options} series={series} type="line" height={315} />
          ) : (
            <div className="flex h-[315px] items-center justify-center text-gray-500">
              <div className="flex flex-col items-center gap-2">
                <span className="text-sm">Belum ada data ringkasan cuaca untuk kecamatan ini.</span>
                <span className="text-xs text-gray-400">Silakan refresh data Prediksi Cuaca terlebih dahulu.</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
