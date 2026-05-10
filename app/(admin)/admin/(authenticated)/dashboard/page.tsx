import type { Metadata } from "next";
import React from "react";
import { cookies } from "next/headers";
import { SiagaMetrics } from "@/components/dashboard/SiagaMetrics";
import CuacaWidget from "@/components/dashboard/CuacaWidget";
import StatusLaporanChart from "@/components/dashboard/StatusLaporanChart";
import PeringkatanDiniPanel from "@/components/dashboard/PeringkatanDiniPanel";

export const metadata: Metadata = {
  title: "Dashboard Admin | Jember Siaga",
  description:
    "Dashboard administrasi Jember Siaga – Sistem Informasi Cuaca & Kebencanaan Kabupaten Jember",
};

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const role = cookieStore.get("role")?.value;
  const isBPBD = role === "admin_bpbd";

  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      {/* ── Metric Cards ── */}
      <div className="col-span-12">
        <SiagaMetrics isBPBD={isBPBD} />
      </div>

      {/* ── Cuaca Widget ── */}
      {!isBPBD && (
        <div className="col-span-12 xl:col-span-8">
          <CuacaWidget />
        </div>
      )}

      {/* ── Peringatan Dini (BPBD First) ── */}
      {isBPBD && (
        <div className="col-span-12 xl:col-span-8">
          <PeringkatanDiniPanel />
        </div>
      )}

      {/* ── Status Donut ── */}
      <div className={`col-span-12 xl:col-span-4`}>
        <StatusLaporanChart />
      </div>

      {/* ── Peringatan Dini (Normal Bottom) ── */}
      {!isBPBD && (
        <div className="col-span-12">
          <PeringkatanDiniPanel />
        </div>
      )}
    </div>
  );
}
