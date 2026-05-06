  "use client";

import React, { useState } from "react";
import { Dropdown } from "@/components/ui/dropdown/Dropdown";
import { DropdownItem } from "@/components/ui/dropdown/DropdownItem";
import { HiEllipsisVertical, HiOutlineEye, HiOutlineNoSymbol, HiOutlineCheckCircle } from "react-icons/hi2";

export default function PenggunaTableAction({ id, isActive }: { id: string; isActive: boolean }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="dropdown-toggle p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
      >
        <HiEllipsisVertical className="w-5 h-5" />
      </button>

      <Dropdown isOpen={isOpen} onClose={() => setIsOpen(false)} className="w-44 right-0 top-full">
        <div className="py-1">
          <DropdownItem tag="a" href={`/admin/pengguna/${id}`} className="flex items-center gap-2">
            <HiOutlineEye className="w-4 h-4" />
            Detail
          </DropdownItem>

          <DropdownItem
            tag="button"
            onClick={() => console.log("Toggle active", id)}
            className={`flex items-center gap-2 ${isActive ? "text-rose-500 hover:text-rose-600 hover:bg-rose-50" : "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"}`}
          >
            {isActive ? (
              <><HiOutlineNoSymbol className="w-4 h-4" /> Nonaktifkan</>
            ) : (
              <><HiOutlineCheckCircle className="w-4 h-4" /> Aktifkan</>
            )}
          </DropdownItem>
        </div>
      </Dropdown>
    </div>
  );
}
