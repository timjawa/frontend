import React from "react";

interface AdminBadgeProps {
  children: React.ReactNode;
  variant?: "success" | "warning" | "danger" | "info" | "default" | "brand";
  dot?: boolean;
}

export default function AdminBadge({
  children,
  variant = "default",
  dot = false,
}: AdminBadgeProps) {
  const styles = {
    success: "bg-emerald-50 text-emerald-700 ring-emerald-600/10 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20",
    warning: "bg-amber-50 text-amber-700 ring-amber-600/10 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/20",
    danger: "bg-rose-50 text-rose-700 ring-rose-600/10 dark:bg-rose-500/10 dark:text-rose-400 dark:ring-rose-500/20",
    info: "bg-sky-50 text-sky-700 ring-sky-600/10 dark:bg-sky-500/10 dark:text-sky-400 dark:ring-sky-500/20",
    default: "bg-slate-100 text-slate-600 ring-slate-500/10 dark:bg-slate-800 dark:text-slate-400 dark:ring-slate-700",
    brand: "bg-brand-50 text-brand-700 ring-brand-600/10 dark:bg-brand-500/10 dark:text-brand-400 dark:ring-brand-500/20",
  };

  const dotColors = {
    success: "bg-emerald-500",
    warning: "bg-amber-500",
    danger: "bg-rose-500",
    info: "bg-sky-500",
    default: "bg-slate-400",
    brand: "bg-brand-500",
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
