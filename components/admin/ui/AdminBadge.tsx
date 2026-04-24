import React from "react";

interface AdminBadgeProps {
  children: React.ReactNode;
  variant?: "success" | "warning" | "danger" | "info" | "default";
  dot?: boolean;
}

export default function AdminBadge({
  children,
  variant = "default",
  dot = false,
}: AdminBadgeProps) {
  const styles = {
    success: "bg-emerald-50 text-emerald-700 ring-emerald-600/10",
    warning: "bg-amber-50 text-amber-700 ring-amber-600/10",
    danger: "bg-rose-50 text-rose-700 ring-rose-600/10",
    info: "bg-sky-50 text-sky-700 ring-sky-600/10",
    default: "bg-slate-100 text-slate-600 ring-slate-500/10",
  };

  const dotColors = {
    success: "bg-emerald-500",
    warning: "bg-amber-500",
    danger: "bg-rose-500",
    info: "bg-sky-500",
    default: "bg-slate-400",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${styles[variant]}`}
    >
      {dot && (
        <span
          className={`h-1.5 w-1.5 rounded-full ${dotColors[variant]}`}
        />
      )}
      {children}
    </span>
  );
}
