"use client";

import { HiChatBubbleLeftRight, HiXMark } from "react-icons/hi2";
import { forwardRef } from "react";

interface ToggleButtonProps {
  isOpen: boolean;
  onClick: () => void;
  bottomOffset?: number;
}

const ToggleButton = forwardRef<HTMLButtonElement, ToggleButtonProps>(
  ({ isOpen, onClick, bottomOffset = 32 }, ref) => {
    return (
      <button
        ref={ref}
        onClick={onClick}
        aria-label={isOpen ? "Tutup chat" : "Buka asisten chat"}
        style={{ bottom: `${bottomOffset}px` }}
        className="fixed right-8 w-14 h-14 min-w-[44px] min-h-[44px] bg-[#1f2a56] hover:bg-[#2d3f7a] rounded-full shadow-lg flex items-center justify-center transition-all duration-300 z-50"
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

ToggleButton.displayName = "ToggleButton";

export default ToggleButton;
