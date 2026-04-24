import React from "react";

interface AdminInputProps
  extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  label: string;
  error?: string;
  helpText?: string;
  type?: string;
}

export default function AdminInput({
  label,
  error,
  helpText,
  type = "text",
  className = "",
  id,
  ...props
}: AdminInputProps) {
  const inputId =
    id || `input-${label.replace(/\s+/g, "-").toLowerCase()}`;

  const baseInputStyle =
    "block w-full rounded-xl bg-slate-50/80 border-0 px-4 py-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-inset focus:ring-[#1B2E4B] sm:text-sm transition-all duration-200";
  const errorStyle = error
    ? "ring-rose-300 focus:ring-rose-500 bg-rose-50/50"
    : "";

  return (
    <div className={`w-full ${className}`}>
      <label
        htmlFor={inputId}
        className="block text-sm font-semibold text-slate-700 mb-2"
      >
        {label}
      </label>
      {type === "textarea" ? (
        <textarea
          id={inputId}
          className={`${baseInputStyle} ${errorStyle} min-h-[120px] resize-y`}
          {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      ) : type === "file" ? (
        <label
          htmlFor={inputId}
          className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 hover:bg-slate-50 cursor-pointer transition-colors group"
        >
          <div className="flex flex-col items-center">
            <svg
              className="w-8 h-8 text-slate-400 group-hover:text-[#1B2E4B] transition-colors"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z"
              />
            </svg>
            <p className="mt-2 text-sm text-slate-500">
              <span className="font-semibold text-[#1B2E4B]">
                Klik untuk upload
              </span>{" "}
              atau drag and drop
            </p>
            <p className="text-xs text-slate-400 mt-1">
              PNG, JPG, MP4 max. 10MB
            </p>
          </div>
          <input
            id={inputId}
            type="file"
            className="hidden"
            {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
          />
        </label>
      ) : (
        <input
          id={inputId}
          type={type}
          className={`${baseInputStyle} ${errorStyle}`}
          {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
        />
      )}

      {error && (
        <p className="mt-2 text-sm text-rose-600 flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      )}

      {helpText && !error && (
        <p className="mt-2 text-sm text-slate-400">{helpText}</p>
      )}
    </div>
  );
}
