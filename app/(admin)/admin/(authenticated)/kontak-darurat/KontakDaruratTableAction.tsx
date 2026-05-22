"use client";

import React, { useState } from "react";
import { Dropdown } from "@/components/ui/dropdown/Dropdown";
import { DropdownItem } from "@/components/ui/dropdown/DropdownItem";
import {
  HiEllipsisVertical,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineExclamationTriangle,
} from "react-icons/hi2";

const getApiBase = () => process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' && ["localhost", "127.0.0.1"].includes(window.location.hostname) ? `${window.location.protocol}//${window.location.hostname}:8000/api` : "https://api.jembersiaga.my.id/api");

interface Props {
  id: string;
  onDeleted?: (id: string) => void;
}

export default function KontakDaruratTableAction({ id, onDeleted }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDeleteConfirm = async () => {
    setDeleting(true);
    setDeleteError(null);
    try {
      const token = localStorage.getItem("auth_token");
      
      const getCookie = (name: string) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return decodeURIComponent(parts.pop()?.split(';').shift() || '');
        return '';
      };
      const xsrfToken = getCookie('XSRF-TOKEN');

      const res = await fetch(`${getApiBase()}/kontak-darurat/${id}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "X-XSRF-TOKEN": xsrfToken,
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.message || "Gagal menghapus kontak darurat.");
      }

      setShowConfirm(false);
      onDeleted?.(id);
    } catch (err: unknown) {
      setDeleteError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="relative inline-block text-left">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="dropdown-toggle p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
        >
          <HiEllipsisVertical className="w-5 h-5" />
        </button>

        <Dropdown isOpen={isOpen} onClose={() => setIsOpen(false)} className="w-40 right-0 top-full z-50">
          <div className="py-1">
            <DropdownItem tag="a" href={`/admin/kontak-darurat/${id}/edit`} className="flex items-center gap-2">
              <HiOutlinePencil className="w-4 h-4" />
              Edit
            </DropdownItem>
            <DropdownItem
              tag="button"
              onClick={() => {
                setIsOpen(false);
                setShowConfirm(true);
                setDeleteError(null);
              }}
              className="flex items-center gap-2 text-rose-500 hover:text-rose-600 hover:bg-rose-50"
            >
              <HiOutlineTrash className="w-4 h-4" />
              Hapus
            </DropdownItem>
          </div>
        </Dropdown>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => !deleting && setShowConfirm(false)}
          />

          <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm p-6 border border-gray-100 dark:border-gray-800 animate-in fade-in zoom-in-95">
            <div className="flex flex-col items-center text-center gap-3 mb-5">
              <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center">
                <HiOutlineExclamationTriangle className="w-7 h-7 text-red-500" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">Hapus Kontak?</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Tindakan ini tidak dapat dibatalkan. Data kontak darurat akan dihapus permanen.
                </p>
              </div>
            </div>

            {deleteError && (
              <div className="mb-4 px-3 py-2.5 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs text-center">
                {deleteError}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-red-600 rounded-xl hover:bg-red-700 active:scale-95 transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {deleting ? (
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <HiOutlineTrash className="w-4 h-4" />
                )}
                {deleting ? "Menghapus..." : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
