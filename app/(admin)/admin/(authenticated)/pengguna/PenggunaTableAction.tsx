  "use client";

import React, { useState } from "react";
import { Dropdown } from "@/components/ui/dropdown/Dropdown";
import { DropdownItem } from "@/components/ui/dropdown/DropdownItem";
import { HiEllipsisVertical, HiOutlineEye, HiOutlineNoSymbol, HiOutlineCheckCircle, HiOutlineExclamationTriangle } from "react-icons/hi2";
import api from "@/lib/api";

export default function PenggunaTableAction({ id, isActive, onToggleComplete }: { id: string; isActive: boolean; onToggleComplete?: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleToggleConfirm = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      await api.put(`/api/admin/pengguna/${id}/toggle-active`);
      setShowConfirm(false);
      if (onToggleComplete) onToggleComplete();
    } catch (error: any) {
      console.error("Gagal mengubah status pengguna:", error);
      setErrorMsg(error.response?.data?.message || "Gagal mengubah status. Pastikan Anda tidak menonaktifkan akun sendiri.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="relative inline-block text-left">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="dropdown-toggle p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-gray-800 hover:text-slate-700 dark:hover:text-gray-200 transition-colors"
        >
          <HiEllipsisVertical className="w-5 h-5" />
        </button>

        <Dropdown isOpen={isOpen} onClose={() => setIsOpen(false)} className="w-44 right-0 top-full">
          <div className="py-1">
            <DropdownItem tag="a" href={`/admin/pengguna/${id}`} className="flex items-center gap-2">
              <HiOutlineEye className="w-4 h-4" />
              Detail
            </DropdownItem>

            <DropdownItem
              tag="button"
              onClick={() => {
                setIsOpen(false);
                setShowConfirm(true);
                setErrorMsg(null);
              }}
              className={`flex items-center gap-2 ${isActive ? "text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10" : "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-500/10"}`}
            >
              {isActive ? (
                <><HiOutlineNoSymbol className="w-4 h-4" /> Nonaktifkan</>
              ) : (
                <><HiOutlineCheckCircle className="w-4 h-4" /> Aktifkan</>
              )}
            </DropdownItem>
          </div>
        </Dropdown>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => !loading && setShowConfirm(false)}
          />

          {/* Modal */}
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm p-6 border border-gray-100 dark:border-gray-800 animate-in fade-in zoom-in-95">
            <div className="flex flex-col items-center text-center gap-3 mb-5">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${isActive ? 'bg-red-50 dark:bg-red-500/10' : 'bg-emerald-50 dark:bg-emerald-500/10'}`}>
                {isActive ? (
                  <HiOutlineExclamationTriangle className="w-7 h-7 text-red-500" />
                ) : (
                  <HiOutlineCheckCircle className="w-7 h-7 text-emerald-500" />
                )}
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  {isActive ? 'Nonaktifkan Pengguna?' : 'Aktifkan Pengguna?'}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {isActive 
                    ? 'Pengguna ini tidak akan dapat login atau menggunakan sistem sampai diaktifkan kembali.' 
                    : 'Pengguna ini akan diberikan kembali akses penuh untuk login dan menggunakan sistem.'}
                </p>
              </div>
            </div>

            {errorMsg && (
              <div className="mb-4 px-3 py-2.5 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs text-center">
                {errorMsg}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                disabled={loading}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                Batal
              </button>
              <button
                onClick={handleToggleConfirm}
                disabled={loading}
                className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white rounded-xl active:scale-95 transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed ${
                  isActive ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  isActive ? <HiOutlineNoSymbol className="w-4 h-4" /> : <HiOutlineCheckCircle className="w-4 h-4" />
                )}
                {loading ? "Memproses..." : (isActive ? "Ya, Nonaktifkan" : "Ya, Aktifkan")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
