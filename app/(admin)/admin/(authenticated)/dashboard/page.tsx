import type { Metadata } from "next";
import React from "react";
import { SiagaMetrics } from "@/components/dashboard/SiagaMetrics";
import LaporanTrendChart from "@/components/dashboard/LaporanTrendChart";
import StatusLaporanChart from "@/components/dashboard/StatusLaporanChart";
import PeringkatanDiniPanel from "@/components/dashboard/PeringkatanDiniPanel";
import LaporanTerbaruTable from "@/components/dashboard/LaporanTerbaruTable";

export const metadata: Metadata = {
  title: "Dashboard Admin | Jember Siaga",
  description:
    "Dashboard administrasi Jember Siaga – Sistem Informasi Cuaca & Kebencanaan Kabupaten Jember",
};

export default function DashboardPage() {
  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">

      {/* ── Metric Cards ── */}
      <div className="col-span-12">
        <SiagaMetrics />
      </div>

      {/* ── Trend Chart ── */}
      <div className="col-span-12 xl:col-span-8">
        <LaporanTrendChart />
      </div>

      {/* ── Status Donut ── */}
      <div className="col-span-12 xl:col-span-4">
        <StatusLaporanChart />
      </div>

      {/* ── Peringatan Dini ── */}
      <div className="col-span-12">
        <PeringkatanDiniPanel />
      </div>

      {/* ── Laporan Terbaru ── */}
      <div className="col-span-12">
        <LaporanTerbaruTable />
      </div>

    </div>
  );
}
