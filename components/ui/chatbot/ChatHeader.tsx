"use client";

import { HiXMark } from "react-icons/hi2";

interface ChatHeaderProps {
  onClose: () => void;
}

export default function ChatHeader({ onClose }: ChatHeaderProps) {
  return (
    <div className="bg-[#1f2a56] text-white p-4 rounded-t-2xl flex items-center justify-between">
      <h3 className="font-semibold text-lg">Jember Siaga Assistant</h3>
      <button
        onClick={onClose}
        aria-label="Tutup chat"
        className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-lg transition-colors duration-200"
      >
        <HiXMark className="text-xl" />
      </button>
    </div>
  );
}
