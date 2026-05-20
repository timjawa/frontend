"use client";
import { MoreDotIcon } from "@/icons";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { useState, useEffect, useRef } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { fetchHistoricalWeather, refreshRealtimeWeather } from "@/services/weather";
import { HiArrowPath } from "react-icons/hi2";

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

  // Get data for selected kecamatan, sorted by date
  const currentData = (historicalData[selectedKecamatan] || [])
    .sort((a, b) => b.tanggal.localeCompare(a.tanggal)); // Mengurutkan dari tanggal terbaru

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

      <div className="mt-6 flex-1 overflow-auto rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
          <thead className="sticky top-0 bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-800 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3 border-b border-gray-200 dark:border-gray-700 font-semibold">Tanggal</th>
              <th scope="col" className="px-6 py-3 border-b border-gray-200 dark:border-gray-700 font-semibold text-center">Suhu (°C)</th>
              <th scope="col" className="px-6 py-3 border-b border-gray-200 dark:border-gray-700 font-semibold text-center">Curah Hujan (mm)</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={3} className="px-6 py-10 text-center">
                  <div className="flex flex-col items-center justify-center gap-2 text-gray-400">
                    <HiArrowPath className="w-6 h-6 animate-spin text-gray-300" />
                    <span className="text-sm">Memuat data cuaca...</span>
                  </div>
                </td>
              </tr>
            ) : currentData.length > 0 ? (
              currentData.map((d, i) => (
                <tr key={i} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800">
                  <td className="px-6 py-3 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                    {new Date(d.tanggal).toLocaleDateString('id-ID', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-3 text-center">{d.suhu_avg}</td>
                  <td className="px-6 py-3 text-center">{d.hujan_avg}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="px-6 py-10 text-center">
                  <div className="flex flex-col items-center justify-center gap-2 text-gray-500">
                    <span className="text-sm">Belum ada data riwayat cuaca untuk kecamatan ini.</span>
                    <span className="text-xs text-gray-400">Data riwayat akan terisi otomatis setiap kali cuaca realtime diperbarui.</span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
