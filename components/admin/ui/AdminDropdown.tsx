"use client";

import React, { useState, useRef, useEffect } from "react";
import { HiChevronDown, HiCheck } from "react-icons/hi";

interface AdminDropdownProps {
  label: string;
  options: string[];
  onSelect?: (option: string) => void;
}

export default function AdminDropdown({
  label,
  options,
  onSelect,
}: AdminDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(options[0]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50 transition-colors"
      >
        <span className="text-slate-400">{label}:</span>
        <span className="text-[#1B2E4B] font-semibold">{selected}</span>
        <HiChevronDown
          className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 z-20 mt-2 w-56 origin-top-right rounded-2xl bg-white p-1.5 shadow-xl ring-1 ring-slate-100 animate-in fade-in slide-in-from-top-2 duration-200">
          {options.map((option) => (
            <button
              key={option}
              onClick={() => {
                setSelected(option);
                setIsOpen(false);
                if (onSelect) onSelect(option);
              }}
              className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm transition-colors ${
                selected === option
                  ? "bg-[#1B2E4B]/5 text-[#1B2E4B] font-semibold"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              {option}
              {selected === option && (
                <HiCheck className="h-4 w-4 text-[#1B2E4B]" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
