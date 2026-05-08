"use client";

import React, { useState } from "react";
import { Dropdown } from "@/components/ui/dropdown/Dropdown";
import { DropdownItem } from "@/components/ui/dropdown/DropdownItem";
import { HiEllipsisVertical, HiOutlineEye, HiOutlinePencil, HiOutlineTrash } from "react-icons/hi2";

export default function FaqTableAction({ 
  id, 
  onDelete 
}: { 
  id: string; 
  onDelete?: () => void; 
}) {
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
          <DropdownItem tag="a" href={`/admin/faq/${id}`} className="flex items-center gap-2">
            <HiOutlineEye className="w-4 h-4" />
            Detail
          </DropdownItem>
          <DropdownItem tag="a" href={`/admin/faq/${id}/edit`} className="flex items-center gap-2">
            <HiOutlinePencil className="w-4 h-4" />
            Edit
          </DropdownItem>
          <DropdownItem tag="button" onClick={() => { onDelete?.(); setIsOpen(false); }} className="flex items-center gap-2 text-rose-500 hover:text-rose-600 hover:bg-rose-50">
            <HiOutlineTrash className="w-4 h-4" />
            Delete
          </DropdownItem>
        </div>
      </Dropdown>
    </div>
  );
}
