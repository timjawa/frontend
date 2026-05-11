"use client";
import React from "react";
import Badge from "../ui/badge/Badge";
import { ArrowUpIcon, ArrowDownIcon, GroupIcon, AlertIcon, BoxIconLine, BoltIcon } from "@/icons";

interface MetricItem {
  icon: React.ReactNode;
  label: string;
  value: string;
  badgeColor: "success" | "error" | "warning";
  badgeValue: string;
  trend: "up" | "down";
}

const metrics: MetricItem[] = [
  {
    icon: <GroupIcon className="text-gray-800 size-6 dark:text-white/90" />,
    label: "Pengguna Terdaftar",
    value: "4.832",
    badgeColor: "success",
    badgeValue: "11.01%",
    trend: "up",
  },
  {
    icon: <BoxIconLine className="text-gray-800 size-6 dark:text-white/90" />,
    label: "Total Laporan Bencana",
    value: "1.248",
    badgeColor: "success",
    badgeValue: "12.5%",
    trend: "up",
  },
  {
    icon: <AlertIcon className="text-gray-800 size-6 dark:text-white/90" />,
    label: "Peringatan Dini Aktif",
    value: "7",
    badgeColor: "error",
    badgeValue: "3 kritis",
    trend: "down",
  },
  {
    icon: <BoltIcon className="text-gray-800 size-6 dark:text-white/90" />,
    label: "Kecamatan Rawan Tinggi",
    value: "5",
    badgeColor: "warning",
    badgeValue: "dari 31",
    trend: "down",
  },
];

const bpbdMetrics: MetricItem[] = [
  {
    icon: <AlertIcon className="text-gray-800 size-6 dark:text-white/90" />,
    label: "Laporan Perlu Verifikasi",
    value: "247",
    badgeColor: "warning",
    badgeValue: "12 Mendesak",
    trend: "up",
  },
  {
    icon: <BoxIconLine className="text-gray-800 size-6 dark:text-white/90" />,
    label: "Laporan Dalam Penanganan",
    value: "389",
    badgeColor: "primary",
    badgeValue: "Tim Lapangan",
    trend: "up",
  },
  {
    icon: <BoltIcon className="text-gray-800 size-6 dark:text-white/90" />,
    label: "Peringatan Status Kritis",
    value: "3",
    badgeColor: "error",
    badgeValue: "Pemeriksaan",
    trend: "up",
  },
  {
    icon: <GroupIcon className="text-gray-800 size-6 dark:text-white/90" />,
    label: "Titik Bencana Aktif",
    value: "14",
    badgeColor: "success",
    badgeValue: "Terpantau",
    trend: "down",
  },
];

interface SiagaMetricsProps {
  isBPBD?: boolean;
}

export function SiagaMetrics({ isBPBD = false }: SiagaMetricsProps) {
  const displayedMetrics = isBPBD ? bpbdMetrics : metrics;

  return (
    <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 xl:grid-cols-4`}>
      {displayedMetrics.map((m, i) => (
        <div
          key={i}
          className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]"
        >
          <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-lg dark:bg-gray-800">
            {m.icon}
          </div>
          <div className="flex items-end justify-between mt-3">
            <div>
              <span className="text-xs text-gray-500 dark:text-gray-400">{m.label}</span>
              <h4 className="mt-1 font-bold text-gray-800 text-xl dark:text-white/90">
                {m.value}
              </h4>
            </div>
            <Badge color={m.badgeColor}>
              {m.trend === "up" ? <ArrowUpIcon /> : <ArrowDownIcon className={`text-${m.badgeColor}-500`} />}
              {m.badgeValue}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  );
}
