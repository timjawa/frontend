"use client";

import { HiPaperAirplane } from "react-icons/hi2";

interface SendButtonProps {
  onClick: () => void;
  disabled: boolean;
}

export default function SendButton({ onClick, disabled }: SendButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label="Kirim pesan"
      className="w-10 h-10 min-w-[44px] min-h-[44px] rounded-lg bg-[#3B82F6] hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors duration-200"
    >
      <HiPaperAirplane className="text-white text-lg" />
    </button>
  );
}
