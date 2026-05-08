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

export function SiagaMetrics() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 xl:grid-cols-4">
      {metrics.map((m, i) => (
        <div
          key={i}
          className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6"
        >
          <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
            {m.icon}
          </div>
          <div className="flex items-end justify-between mt-5">
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">{m.label}</span>
              <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
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
