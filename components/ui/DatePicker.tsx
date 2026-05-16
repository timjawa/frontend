"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  HiChevronLeft,
  HiChevronRight,
  HiOutlineCalendar,
} from "react-icons/hi";

const DAYS_ID = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const MONTHS_ID = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

interface DatePickerProps {
  value: string; // "YYYY-MM-DD"
  onChange: (value: string) => void;
  id?: string;
  minDate?: string; // "YYYY-MM-DD" — earliest selectable date
  maxDate?: string; // "YYYY-MM-DD" — latest selectable date
}

export default function DatePicker({ value, onChange, id, minDate, maxDate }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(() => {
    const d = value ? new Date(value + "T00:00:00") : new Date();
    return d.getMonth();
  });
  const [viewYear, setViewYear] = useState(() => {
    const d = value ? new Date(value + "T00:00:00") : new Date();
    return d.getFullYear();
  });
  const [animDir, setAnimDir] = useState<"left" | "right" | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  // Close on outside click
  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  // Sync viewMonth/viewYear when value changes externally
  useEffect(() => {
    if (value) {
      const d = new Date(value + "T00:00:00");
      setViewMonth(d.getMonth());
      setViewYear(d.getFullYear());
    }
  }, [value]);

  const prevMonth = useCallback(() => {
    setAnimDir("right");
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
    setTimeout(() => setAnimDir(null), 250);
  }, [viewMonth]);

  const nextMonth = useCallback(() => {
    setAnimDir("left");
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
    setTimeout(() => setAnimDir(null), 250);
  }, [viewMonth]);

  const goToToday = useCallback(() => {
    setViewMonth(today.getMonth());
    setViewYear(today.getFullYear());
    onChange(todayStr);
    setIsOpen(false);
  }, [today, todayStr, onChange]);

  // Build calendar grid
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

  const calendarDays: {
    day: number;
    dateStr: string;
    isCurrentMonth: boolean;
    isToday: boolean;
    isSelected: boolean;
    isDisabled: boolean;
  }[] = [];

  // Previous month trailing days
  for (let i = firstDay - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i;
    const m = viewMonth === 0 ? 11 : viewMonth - 1;
    const y = viewMonth === 0 ? viewYear - 1 : viewYear;
    const dateStr = `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    calendarDays.push({
      day: d,
      dateStr,
      isCurrentMonth: false,
      isToday: dateStr === todayStr,
      isSelected: dateStr === value,
      isDisabled: (minDate && dateStr < minDate) || (maxDate && dateStr > maxDate) ? true : false,
    });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    calendarDays.push({
      day: d,
      dateStr,
      isCurrentMonth: true,
      isToday: dateStr === todayStr,
      isSelected: dateStr === value,
      isDisabled: (minDate && dateStr < minDate) || (maxDate && dateStr > maxDate) ? true : false,
    });
  }

  // Next month leading days
  const remaining = 42 - calendarDays.length;
  for (let d = 1; d <= remaining; d++) {
    const m = viewMonth === 11 ? 0 : viewMonth + 1;
    const y = viewMonth === 11 ? viewYear + 1 : viewYear;
    const dateStr = `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    calendarDays.push({
      day: d,
      dateStr,
      isCurrentMonth: false,
      isToday: dateStr === todayStr,
      isSelected: dateStr === value,
      isDisabled: (minDate && dateStr < minDate) || (maxDate && dateStr > maxDate) ? true : false,
    });
  }

  const selectDate = (dateStr: string, disabled: boolean) => {
    if (disabled) return;
    onChange(dateStr);
    setIsOpen(false);
  };

  // Format display value
  const displayValue = value
    ? new Date(value + "T00:00:00").toLocaleDateString("id-ID", {
        weekday: "short",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Pilih tanggal";

  return (
    <div ref={containerRef} className="relative" id={id}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`
          group flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium
          transition-all duration-300 ease-out cursor-pointer
          ${
            isOpen
              ? "bg-primary text-white shadow-lg shadow-primary/25 scale-[1.02]"
              : "bg-white text-slate-700 border border-slate-200 shadow-sm hover:border-secondary/50 hover:shadow-md hover:shadow-secondary/10"
          }
        `}
      >
        <span
          className={`
          flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-300
          ${isOpen ? "bg-white/20" : "bg-secondary/10 group-hover:bg-secondary/20"}
        `}
        >
          <HiOutlineCalendar
            className={`text-lg transition-colors duration-300 ${isOpen ? "text-white" : "text-secondary"}`}
          />
        </span>
        <span className="tracking-wide">{displayValue}</span>
        <svg
          className={`w-4 h-4 transition-transform duration-300 ${isOpen ? "rotate-180" : ""} ${isOpen ? "text-white/70" : "text-slate-400"}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Calendar Dropdown */}
      <div
        className={`
        absolute top-full left-0 mt-2 z-50
        transition-all duration-300 ease-out origin-top-left
        ${isOpen ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 -translate-y-2 pointer-events-none"}
      `}
      >
        <div className="w-[320px] bg-white rounded-2xl shadow-2xl shadow-slate-900/15 border border-slate-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-primary-light p-4">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={prevMonth}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-white/70 hover:text-white hover:bg-white/15 transition-all duration-200 active:scale-90"
                aria-label="Bulan sebelumnya"
              >
                <HiChevronLeft className="text-xl" />
              </button>

              <div className="text-center">
                <h3 className="text-white font-semibold text-[15px] tracking-wide">
                  {MONTHS_ID[viewMonth]}
                </h3>
                <p className="text-white/60 text-xs font-medium">{viewYear}</p>
              </div>

              <button
                type="button"
                onClick={nextMonth}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-white/70 hover:text-white hover:bg-white/15 transition-all duration-200 active:scale-90"
                aria-label="Bulan berikutnya"
              >
                <HiChevronRight className="text-xl" />
              </button>
            </div>
          </div>

          {/* Day Labels */}
          <div className="grid grid-cols-7 px-3 pt-3 pb-1">
            {DAYS_ID.map((day) => (
              <div
                key={day}
                className="text-center text-[11px] font-semibold text-slate-400 uppercase tracking-wider py-1"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div
            ref={calendarRef}
            className={`grid grid-cols-7 px-3 pb-2 ${
              animDir === "left"
                ? "animate-slide-left"
                : animDir === "right"
                  ? "animate-slide-right"
                  : ""
            }`}
          >
            {calendarDays.map((cell, i) => (
              <button
                key={i}
                type="button"
                onClick={() => selectDate(cell.dateStr, cell.isDisabled)}
                disabled={cell.isDisabled}
                className={`
                  relative w-full aspect-square flex items-center justify-center
                  text-sm rounded-xl transition-all duration-200 m-[1px]
                  ${
                    cell.isDisabled
                      ? "text-slate-200 cursor-not-allowed"
                      : cell.isSelected
                        ? "bg-secondary text-white font-bold shadow-md shadow-secondary/30 scale-105"
                        : cell.isToday
                          ? "bg-secondary/10 text-secondary font-bold ring-1 ring-secondary/30"
                          : cell.isCurrentMonth
                            ? "text-slate-700 hover:bg-slate-100 hover:scale-105 font-medium"
                            : "text-slate-300 hover:bg-slate-50 hover:text-slate-400"
                  }
                  active:scale-95
                `}
              >
                {cell.day}
                {cell.isToday && !cell.isSelected && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-secondary rounded-full" />
                )}
              </button>
            ))}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50/50">
            <button
              type="button"
              onClick={goToToday}
              className="text-xs font-semibold text-secondary hover:text-secondary-light transition-colors duration-200 flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-secondary/10"
            >
              <span className="w-1.5 h-1.5 bg-secondary rounded-full" />
              Hari Ini
            </button>
            <span className="text-[11px] text-slate-400 font-medium">
              {MONTHS_ID[today.getMonth()]} {today.getFullYear()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
