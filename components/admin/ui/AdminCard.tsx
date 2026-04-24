import React from "react";
import { IconType } from "react-icons";

interface AdminCardProps {
  title: string;
  value: string | number;
  icon: IconType;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: "blue" | "amber" | "green" | "red" | "indigo";
}

const colorMap = {
  blue: {
    gradient: "from-blue-500 to-blue-600",
    iconBg: "bg-white/20",
    ring: "ring-blue-400/30",
  },
  amber: {
    gradient: "from-amber-400 to-amber-500",
    iconBg: "bg-white/20",
    ring: "ring-amber-400/30",
  },
  green: {
    gradient: "from-emerald-500 to-emerald-600",
    iconBg: "bg-white/20",
    ring: "ring-emerald-400/30",
  },
  red: {
    gradient: "from-rose-500 to-rose-600",
    iconBg: "bg-white/20",
    ring: "ring-rose-400/30",
  },
  indigo: {
    gradient: "from-indigo-500 to-indigo-600",
    iconBg: "bg-white/20",
    ring: "ring-indigo-400/30",
  },
};

export default function AdminCard({
  title,
  value,
  icon: Icon,
  trend,
  color = "blue",
}: AdminCardProps) {
  const c = colorMap[color];

  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${c.gradient} p-6 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 ring-1 ${c.ring}`}
    >
      {/* Decorative circle */}
      <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/10" />
      <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-white/5" />

      <div className="relative z-10 flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-white/80">{title}</p>
          <h3 className="text-3xl font-extrabold mt-1 tracking-tight">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl ${c.iconBg} backdrop-blur-sm`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>

      {trend && (
        <div className="relative z-10 mt-4 flex items-center text-sm">
          <span
            className={`inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded-full text-xs ${
              trend.isPositive
                ? "bg-white/20 text-white"
                : "bg-white/20 text-white"
            }`}
          >
            {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
          </span>
          <span className="text-white/70 ml-2 text-xs">dari bulan lalu</span>
        </div>
      )}
    </div>
  );
}
