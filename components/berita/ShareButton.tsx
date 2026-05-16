"use client";

import { useState } from "react";
import { HiShare, HiCheck } from "react-icons/hi2";

export default function ShareButton() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const url = window.location.href;
    
    // Modern Clipboard API (requires Secure Context / HTTPS)
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        return;
      } catch (err) {
        console.error("Modern copy failed, trying fallback...", err);
      }
    }

    // Fallback for non-secure contexts (HTTP/IP Address)
    try {
      const textArea = document.createElement("textarea");
      textArea.value = url;
      textArea.style.position = "fixed";
      textArea.style.left = "-9999px";
      textArea.style.top = "0";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand("copy");
      document.body.removeChild(textArea);
      
      if (successful) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      console.error("Fallback copy failed: ", err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="p-2.5 bg-white/90 backdrop-blur-sm border border-slate-200 rounded-full hover:bg-white transition-all text-slate-600 shadow-sm hover:shadow-md active:scale-95"
      title="Salin URL"
    >
      {copied ? (
        <HiCheck className="text-green-600 w-5 h-5" />
      ) : (
        <HiShare className="w-5 h-5" />
      )}
    </button>
  );
}
