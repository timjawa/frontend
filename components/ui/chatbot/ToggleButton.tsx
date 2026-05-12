"use client";

import { HiChatBubbleLeftRight, HiXMark } from "react-icons/hi2";
import { forwardRef } from "react";

interface ToggleButtonProps {
  isOpen: boolean;
  onClick: () => void;
}

const ToggleButton = forwardRef<HTMLButtonElement, ToggleButtonProps>(
  ({ isOpen, onClick }, ref) => {
    return (
      <button
        ref={ref}
        onClick={onClick}
        aria-label={isOpen ? "Tutup chat" : "Buka asisten chat"}
        className="fixed bottom-6 right-6 sm:bottom-4 sm:right-4 w-14 h-14 min-w-[44px] min-h-[44px] bg-[#1f2a56] hover:bg-[#1f2a56]/90 rounded-full shadow-lg flex items-center justify-center transition-colors duration-200 z-40"
      >
        {isOpen ? (
          <HiXMark className="text-white text-2xl" />
        ) : (
          <HiChatBubbleLeftRight className="text-white text-2xl" />
        )}
      </button>
    );
  }
);

ToggleButton.displayName = 'ToggleButton';

export default ToggleButton;
