"use client";

import React, { useState } from "react";
import { Dropdown } from "@/components/ui/dropdown/Dropdown";
import { DropdownItem } from "@/components/ui/dropdown/DropdownItem";
import { HiEllipsisVertical, HiOutlineEye } from "react-icons/hi2";

export default function PrediksiTableAction({ id }: { id: string }) {
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
          <DropdownItem tag="a" href={`/admin/cuaca/prediksi/${id}`} className="flex items-center gap-2">
            <HiOutlineEye className="w-4 h-4" />
            Detail
          </DropdownItem>
        </div>
      </Dropdown>
    </div>
  );
}
