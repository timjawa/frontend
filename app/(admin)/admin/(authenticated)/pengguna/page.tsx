"use client";

import React, { useState, useEffect } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import AdminBadge from "@/components/admin/ui/AdminBadge";
import PenggunaTableAction from "./PenggunaTableAction";
import {
  HiMagnifyingGlass,
  HiOutlineUsers,
  HiOutlineUserCircle,
  HiOutlineShieldCheck,
  HiOutlineCheckBadge,
  HiOutlineXCircle,
  HiOutlineEnvelope,
  HiOutlinePhone,
} from "react-icons/hi2";
import api from "@/lib/api";

const roleConfig = {
  masyarakat: { label: "Masyarakat", variant: "info" as const },
  admin_bpbd: { label: "Admin BPBD", variant: "warning" as const },
  super_admin: { label: "Super Admin", variant: "success" as const },
};

function Avatar({ name, foto }: { name: string; foto: string | null }) {
  if (foto) {
    return <img src={foto} alt={name} className="w-9 h-9 rounded-full object-cover" />;
  }
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase() || "?";
  const colors = ["bg-blue-500", "bg-purple-500", "bg-emerald-500", "bg-orange-500", "bg-rose-500", "bg-indigo-500"];
  const color = colors[name.charCodeAt(0) % colors.length] || colors[0];
  return (
    <div className={`w-9 h-9 rounded-full ${color} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
      {initials}
    </div>
  );
}

export default function PenggunaPage() {
  const [data, setData] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination & Filters
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<any>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    // Reset page ke 1 setiap kali filter/search berubah
    setPage(1);
    const delayDebounceFn = setTimeout(() => {
      fetchData(1);
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [search, filterRole]);

  useEffect(() => {
    // Saat ganti halaman, jangan debounce
    fetchData(page);
  }, [page]);

  const fetchData = async (currentPage: number) => {
    setLoading(true);
    try {
      const response = await api.get("/api/admin/pengguna", {
        params: {
          page: currentPage,
          search: search,
          role: filterRole,
        },
      });
      setData(response.data.data);
      setMeta({
        current_page: response.data.current_page,
        last_page: response.data.last_page,
        total: response.data.total,
        from: response.data.from,
        to: response.data.to,
      });
      setError(null);
    } catch (err: any) {
      console.error("Gagal mengambil data pengguna:", err);
      const errorMsg = err.response?.data?.message || err.message || "Unknown error";
      setError(`Terjadi kesalahan saat memuat data pengguna: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get("/api/admin/pengguna/stats");
      setStats(response.data);
    } catch (err) {
      console.error("Gagal mengambil statistik pengguna:", err);
    }
  };

  const handleToggleComplete = () => {
    fetchData(page);
    fetchStats();
  };

  const pages = meta ? Array.from({length:meta.last_page},(_,i)=>i+1) : [];

  return (
    <div>
      <PageBreadcrumb pageTitle="Pengguna JESI" />

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03] flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-500/10 shrink-0">
            <HiOutlineUsers className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Total Pengguna</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">{loading && !stats ? "—" : stats?.total ?? 0}</p>
          </div>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03] flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 shrink-0">
            <HiOutlineCheckBadge className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Akun Aktif</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">{loading && !stats ? "—" : stats?.aktif ?? 0}</p>
          </div>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03] flex items-center gap-4">
          <div className="p-3 rounded-xl bg-orange-50 dark:bg-orange-500/10 shrink-0">
            <HiOutlineShieldCheck className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Admin BPBD</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">{loading && !stats ? "—" : stats?.admin ?? 0}</p>
          </div>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03] flex items-center gap-4">
          <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-500/10 shrink-0">
            <HiOutlineUserCircle className="w-5 h-5 text-purple-500" />
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Masyarakat</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">{loading && !stats ? "—" : stats?.masyarakat ?? 0}</p>
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-3 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-8">
        <div className="bg-white/80 dark:bg-gray-900/50 backdrop-blur-sm rounded-2xl ring-1 ring-slate-100 dark:ring-gray-800 shadow-sm overflow-hidden">
          
          {/* Table Header Bar */}
          <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 dark:border-gray-800">
            <div>
              <h3 className="text-base font-bold text-[#1B2E4B] dark:text-white">Daftar Pengguna</h3>
              <p className="text-xs text-slate-400 dark:text-gray-500 mt-0.5">Kelola akun admin dan masyarakat yang terdaftar</p>
            </div>
            <div className="flex items-center gap-2.5 flex-wrap">
              {/* Filter Role */}
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="py-2 px-3 text-sm rounded-lg bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-slate-600 dark:text-gray-300"
              >
                <option value="all">Semua Role</option>
                <option value="masyarakat">Masyarakat</option>
                <option value="admin_bpbd">Admin BPBD</option>
                <option value="super_admin">Super Admin</option>
              </select>
              {/* Search */}
              <div className="relative">
                <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-gray-500" />
                <input
                  type="text"
                  placeholder="Cari pengguna..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 pr-4 py-2 text-sm rounded-lg bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 focus:bg-white dark:focus:bg-gray-900 outline-none transition-all w-48 text-gray-700 dark:text-gray-200"
                />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-gray-800/50">
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-gray-500 w-12 text-center">No</th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-gray-500">Nama Lengkap</th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-gray-500">Kontak</th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-gray-500">Role & Status</th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-gray-500 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-gray-800">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      {Array.from({ length: 5 }).map((__, j) => (
                        <td key={j} className="px-6 py-4">
                          <div className="h-4 bg-slate-100 dark:bg-gray-800 rounded-md w-full" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : error ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-red-500">
                      <HiOutlineXCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>{error}</p>
                    </td>
                  </tr>
                ) : data.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400 dark:text-gray-500">
                      <HiOutlineUsers className="w-10 h-10 mx-auto mb-2 text-slate-300 dark:text-gray-600" />
                      <p>Tidak ada data pengguna ditemukan.</p>
                    </td>
                  </tr>
                ) : (
                  data.map((user, idx) => (
                    <tr key={user.id} className="hover:bg-blue-50/40 dark:hover:bg-gray-800/40 transition-colors">
                      <td className="px-6 py-4 text-center text-slate-500 dark:text-gray-400 font-medium">
                        {meta ? (meta.from ?? 1) + idx : idx + 1}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-lg shrink-0">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-[#1B2E4B] dark:text-gray-200">{user.name}</div>
                            <div className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">Terdaftar {new Date(user.created_at).toLocaleDateString('id-ID')}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-slate-600 dark:text-gray-300 mb-1">
                          <HiOutlineEnvelope className="w-4 h-4 text-slate-400 dark:text-gray-500" />
                          <span>{user.email}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-600 dark:text-gray-300 text-xs">
                          <HiOutlinePhone className="w-3.5 h-3.5 text-slate-400 dark:text-gray-500" />
                          <span>{user.no_telepon || <span className="italic text-slate-400 dark:text-gray-600">Belum diatur</span>}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col items-start gap-2">
                          <AdminBadge variant={roleConfig[user.role as keyof typeof roleConfig]?.variant || "default"}>
                            {roleConfig[user.role as keyof typeof roleConfig]?.label || user.role}
                          </AdminBadge>
                          <div className={`text-xs font-medium flex items-center gap-1 ${user.is_active ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400 dark:text-gray-500"}`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${user.is_active ? "bg-emerald-500" : "bg-slate-300 dark:bg-gray-600"}`} />
                            {user.is_active ? "Aktif" : "Nonaktif"}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <PenggunaTableAction id={user.id} isActive={user.is_active} onToggleComplete={handleToggleComplete} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-slate-100 dark:border-gray-800 bg-slate-50/50 dark:bg-gray-800/30">
            <p className="text-sm text-slate-500 dark:text-gray-400">
              {meta && meta.from != null ? (
                <>
                  Menampilkan <span className="font-semibold text-slate-700 dark:text-gray-200">{meta.from}–{meta.to}</span> dari{" "}
                  <span className="font-semibold text-slate-700 dark:text-gray-200">{meta.total}</span> data
                </>
              ) : (
                "Memuat data..."
              )}
            </p>
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={!meta || page <= 1}
                className="px-3 py-1.5 rounded-lg text-sm font-medium border border-slate-200 dark:border-gray-700 text-slate-600 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                ← Sebelumnya
              </button>
              {pages.slice(Math.max(0, page - 3), page + 2).map((n) => (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={`w-9 h-9 rounded-lg text-sm font-semibold transition-colors ${
                    n === page
                      ? "bg-[#1B2E4B] text-white shadow-md shadow-[#1B2E4B]/20"
                      : "bg-white dark:bg-gray-800 text-slate-600 dark:text-gray-300 border border-slate-200 dark:border-gray-700 hover:bg-slate-50 dark:hover:bg-gray-700"
                  }`}
                >
                  {n}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={!meta || page >= meta.last_page}
                className="px-3 py-1.5 rounded-lg text-sm font-medium border border-slate-200 dark:border-gray-700 text-slate-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Selanjutnya →
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
