"use client";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface DropdownProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({
  isOpen,
  onClose,
  children,
  className = "",
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const anchorRef = useRef<HTMLSpanElement>(null);
  const [mounted, setMounted] = useState(false);
  const [style, setStyle] = useState<React.CSSProperties>({ opacity: 0 });

  useEffect(() => {
    setMounted(true);
  }, []);

  const updatePosition = () => {
    if (isOpen && anchorRef.current && dropdownRef.current && anchorRef.current.parentElement) {
      const parentRect = anchorRef.current.parentElement.getBoundingClientRect();
      const dropdownRect = dropdownRef.current.getBoundingClientRect();
      
      const isRightAligned = className.includes('right-0');
      
      let top = parentRect.bottom + window.scrollY + 8;
      let left = parentRect.left + window.scrollX;
      
      if (isRightAligned) {
         left = parentRect.right + window.scrollX - dropdownRect.width;
      }
      
      // Flip up if no space below and enough space above
      const spaceBelow = window.innerHeight - parentRect.bottom;
      if (spaceBelow < dropdownRect.height + 20 && parentRect.top > dropdownRect.height + 20) {
        top = parentRect.top + window.scrollY - dropdownRect.height - 8;
      }

      setStyle({
        position: 'absolute',
        top: `${top}px`,
        left: `${left}px`,
        opacity: 1,
      });
    }
  };

  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => {
        updatePosition();
      });
      
      window.addEventListener('resize', updatePosition);
      document.addEventListener('scroll', updatePosition, true);
      
      return () => {
        window.removeEventListener('resize', updatePosition);
        document.removeEventListener('scroll', updatePosition, true);
      };
    } else {
      setStyle({ opacity: 0 });
    }
  }, [isOpen, className]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && dropdownRef.current.contains(event.target as Node)) {
        return;
      }
      if (anchorRef.current && anchorRef.current.parentElement?.contains(event.target as Node)) {
        return;
      }
      if ((event.target as HTMLElement).closest('.dropdown-toggle')) {
        return;
      }
      
      onClose();
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  if (!isOpen) return null;

  const sanitizedClassName = className
    .replace(/\b(absolute|right-0|top-full|mt-2|mt-\[.*?\]|z-40)\b/g, '')
    .trim();

  const content = (
    <div
      ref={dropdownRef}
      style={style}
      className={`z-[100] rounded-xl border border-gray-200 bg-white shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark ${sanitizedClassName}`}
    >
      {children}
    </div>
  );

  return (
    <>
      <span ref={anchorRef} style={{ display: 'none' }} aria-hidden="true" />
      {mounted ? createPortal(content, document.body) : null}
    </>
  );
};
