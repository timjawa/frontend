"use client";

import React, { useState } from "react";
import { Dropdown } from "@/components/ui/dropdown/Dropdown";
import { DropdownItem } from "@/components/ui/dropdown/DropdownItem";
import { HiEllipsisVertical, HiOutlineEye, HiOutlineTrash } from "react-icons/hi2";

export default function PengaduanTableAction({ id }: { id: number }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="dropdown-toggle p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
      >
        <HiEllipsisVertical className="w-5 h-5" />
      </button>

      <Dropdown isOpen={isOpen} onClose={() => setIsOpen(false)} className="w-40 right-0 top-full">
        <div className="py-1">
          <DropdownItem tag="a" href={`/admin/pengaduan/${id}`} className="flex items-center gap-2">
            <HiOutlineEye className="w-4 h-4" />
            Detail
          </DropdownItem>
          <DropdownItem tag="button" onClick={() => console.log('Delete', id)} className="flex items-center gap-2 text-rose-500 hover:text-rose-600 hover:bg-rose-50">
            <HiOutlineTrash className="w-4 h-4" />
            Hapus
          </DropdownItem>
        </div>
      </Dropdown>
    </div>
  );
}
