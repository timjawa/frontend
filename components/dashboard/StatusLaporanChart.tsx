"use client";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";
import { useState, useEffect } from "react";
import { fetchLaporanStats } from "@/services/dashboard";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

const initialStatusData = [
  { label: "Selesai", value: 0, color: "#10b981" },
  { label: "Diverifikasi", value: 0, color: "#465fff" },
  { label: "Baru", value: 0, color: "#f97316" },
  { label: "Ditolak", value: 0, color: "#ef4444" },
];

export default function StatusLaporanChart() {
  const [statusData, setStatusData] = useState(initialStatusData);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const stats = await fetchLaporanStats();
        
        setStatusData([
          { label: "Selesai", value: stats.selesai, color: "#10b981" },
          { label: "Diverifikasi", value: stats.diverifikasi, color: "#465fff" },
          { label: "Baru", value: stats.baru, color: "#f97316" },
          { label: "Ditolak", value: stats.ditolak, color: "#ef4444" },
        ]);
        setTotal(stats.total);
      } catch (error) {
        console.error("Gagal mengambil status laporan:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);
  const options: ApexOptions = {
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "donut",
      height: 240,
      sparkline: { enabled: false },
    },
    colors: statusData.map((d) => d.color),
    labels: statusData.map((d) => d.label),
    legend: { show: false },
    dataLabels: { enabled: false },
    stroke: { width: 3, colors: ["#fff"] },
    plotOptions: {
      pie: {
        donut: {
          size: "68%",
          labels: {
            show: true,
            total: {
              show: true,
              label: "Total",
              fontSize: "13px",
              fontFamily: "Outfit, sans-serif",
              color: "#667085",
              formatter: () => total.toLocaleString("id-ID"),
            },
            value: {
              show: true,
              fontSize: "24px",
              fontWeight: 700,
              fontFamily: "Outfit, sans-serif",
              color: "#1d2939",
            },
          },
        },
      },
    },
    tooltip: {
      y: { formatter: (val) => `${val} laporan` },
    },
  };

  return (
    <div className="flex flex-col h-full rounded-2xl border border-gray-200 bg-white px-4 pt-4 pb-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-5 sm:pt-5">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
        Status Laporan
      </h3>
      <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
        Distribusi status seluruh laporan bencana
      </p>

      <div className="flex items-center justify-center mt-2">
        {loading ? (
           <div className="flex items-center justify-center h-[220px] w-[220px]">
              <span className="text-gray-400 text-sm">Memuat chart...</span>
           </div>
        ) : (
          <ReactApexChart
            options={options}
            series={statusData.map((d) => d.value)}
            type="donut"
            height={220}
            width={220}
          />
        )}
      </div>

      <ul className="mt-auto pt-4 space-y-2.5 border-t border-gray-100 dark:border-gray-800">
        {statusData.map((d) => (
          <li key={d.label} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
                style={{ backgroundColor: d.color }}
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">{d.label}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-800 dark:text-white/90">
                {d.value.toLocaleString("id-ID")}
              </span>
              <span className="text-xs text-gray-400">
                ({total > 0 ? ((d.value / total) * 100).toFixed(1) : 0}%)
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
