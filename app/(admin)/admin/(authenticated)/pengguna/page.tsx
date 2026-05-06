"use client";

import React, { useState } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import AdminBadge from "@/components/admin/ui/AdminBadge";
import PenggunaTableAction from "./PenggunaTableAction";
import {
  HiMagnifyingGlass,
  HiOutlineUsers,
  HiOutlineUserCircle,
  HiOutlineShieldCheck,
  HiOutlineCheckBadge,
} from "react-icons/hi2";

// ─── Data mock sesuai tabel users ────────────────────────────────────────────
// Kolom: id, name, email, firebase_uid, alamat, no_telepon, foto, role, is_active, created_at
const penggunaData = [
  {
    id: "u1",
    name: "Budi Santoso",
    email: "budi@example.com",
    no_telepon: "081234000001",
    alamat: "Jl. Mawar No.12, Gumukmas",
    foto: null,
    role: "masyarakat" as const,
    is_active: true,
    created_at: "2024-01-15",
  },
  {
    id: "u2",
    name: "Siti Rahayu",
    email: "siti@bpbd.jember.go.id",
    no_telepon: "081234000002",
    alamat: "Jl. Kalisat Utama No.5, Kalisat",
    foto: null,
    role: "admin_bpbd" as const,
    is_active: true,
    created_at: "2023-11-02",
  },
  {
    id: "u3",
    name: "Ahmad Hasan",
    email: "ahmad@example.com",
    no_telepon: "081234000003",
    alamat: "Jl. Ambulu Selatan No.8",
    foto: null,
    role: "masyarakat" as const,
    is_active: false,
    created_at: "2024-02-20",
  },
  {
    id: "u4",
    name: "Dewi Kusuma",
    email: "dewi@bpbd.jember.go.id",
    no_telepon: "081234000004",
    alamat: "Jl. Ahmad Yani No.99, Jember",
    foto: null,
    role: "super_admin" as const,
    is_active: true,
    created_at: "2023-06-10",
  },
  {
    id: "u5",
    name: "Rudi Hartono",
    email: "rudi@example.com",
    no_telepon: null,
    alamat: null,
    foto: null,
    role: "masyarakat" as const,
    is_active: true,
    created_at: "2024-03-05",
  },
  {
    id: "u6",
    name: "Fauzan Amir",
    email: "fauzan@bpbd.jember.go.id",
    no_telepon: "081234000006",
    alamat: "Jl. Mastrip No.14, Jember",
    foto: null,
    role: "admin_bpbd" as const,
    is_active: true,
    created_at: "2023-09-18",
  },
];

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
    .toUpperCase();
  const colors = ["bg-blue-500", "bg-purple-500", "bg-emerald-500", "bg-orange-500", "bg-rose-500", "bg-indigo-500"];
  const color = colors[name.charCodeAt(0) % colors.length];
  return (
    <div className={`w-9 h-9 rounded-full ${color} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
      {initials}
    </div>
  );
}

export default function PenggunaPage() {
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");

  const filtered = penggunaData.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = filterRole === "all" || u.role === filterRole;
    return matchSearch && matchRole;
  });

  const totalAktif = penggunaData.filter((u) => u.is_active).length;
  const totalAdmin = penggunaData.filter((u) => u.role === "admin_bpbd" || u.role === "super_admin").length;
  const totalMasyarakat = penggunaData.filter((u) => u.role === "masyarakat").length;

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
            <p className="text-2xl font-bold text-gray-800 dark:text-white">{penggunaData.length}</p>
          </div>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03] flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 shrink-0">
            <HiOutlineCheckBadge className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Akun Aktif</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">{totalAktif}</p>
          </div>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03] flex items-center gap-4">
          <div className="p-3 rounded-xl bg-orange-50 dark:bg-orange-500/10 shrink-0">
            <HiOutlineShieldCheck className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Admin BPBD</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">{totalAdmin}</p>
          </div>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03] flex items-center gap-4">
          <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-500/10 shrink-0">
            <HiOutlineUserCircle className="w-5 h-5 text-purple-500" />
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Masyarakat</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">{totalMasyarakat}</p>
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-3 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl ring-1 ring-slate-100 shadow-sm overflow-hidden">

          {/* Table Header Bar */}
          <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-[#1B2E4B]">Daftar Pengguna</h3>
              <p className="text-xs text-slate-400 mt-0.5">Kelola akun pengguna aplikasi JESI</p>
            </div>
            <div className="flex items-center gap-2.5 flex-wrap">
              {/* Filter Role */}
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="py-2 px-3 text-sm rounded-lg bg-slate-50 border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-slate-600"
              >
                <option value="all">Semua Role</option>
                <option value="masyarakat">Masyarakat</option>
                <option value="admin_bpbd">Admin BPBD</option>
                <option value="super_admin">Super Admin</option>
              </select>
              {/* Search */}
              <div className="relative">
                <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari nama / email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 pr-4 py-2 text-sm rounded-lg bg-slate-50 border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 focus:bg-white outline-none transition-all w-48"
                />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-slate-50/80">
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400 w-12 text-center">No</th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400">Pengguna</th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400">No. Telepon</th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400">Role</th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400">Status</th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400">Bergabung</th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                      <HiOutlineUsers className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                      <p>Tidak ada pengguna ditemukan.</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((user, index) => {
                    const role = roleConfig[user.role];
                    return (
                      <tr key={user.id} className="hover:bg-blue-50/40 transition-colors">
                        {/* No */}
                        <td className="px-6 py-4 text-center text-slate-500 font-medium">{index + 1}</td>

                        {/* Pengguna */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <Avatar name={user.name} foto={user.foto} />
                            <div>
                              <p className="font-semibold text-[#1B2E4B] dark:text-white text-sm leading-tight">{user.name}</p>
                              <p className="text-xs text-slate-400 mt-0.5">{user.email}</p>
                            </div>
                          </div>
                        </td>

                        {/* No Telepon */}
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                          {user.no_telepon ?? <span className="text-slate-300 italic text-xs">—</span>}
                        </td>

                        {/* Role */}
                        <td className="px-6 py-4">
                          <AdminBadge variant={role.variant}>{role.label}</AdminBadge>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          <AdminBadge variant={user.is_active ? "success" : "danger"} dot>
                            {user.is_active ? "Aktif" : "Nonaktif"}
                          </AdminBadge>
                        </td>

                        {/* Bergabung */}
                        <td className="px-6 py-4 text-sm text-slate-500">{user.created_at}</td>

                        {/* Aksi */}
                        <td className="px-6 py-4 text-right">
                          <PenggunaTableAction id={user.id} isActive={user.is_active} />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-slate-100 bg-slate-50/50">
            <p className="text-sm text-slate-500">
              Menampilkan <span className="font-semibold text-slate-700">1–{filtered.length}</span> dari{" "}
              <span className="font-semibold text-slate-700">{penggunaData.length}</span> pengguna
            </p>
            <div className="flex items-center gap-1.5">
              <button className="px-3 py-1.5 rounded-lg text-sm font-medium border border-slate-200 text-slate-400 bg-white cursor-not-allowed opacity-50" disabled>
                ← Sebelumnya
              </button>
              <button className="w-9 h-9 rounded-lg text-sm font-semibold bg-[#1B2E4B] text-white shadow-md shadow-[#1B2E4B]/20">1</button>
              <button className="px-3 py-1.5 rounded-lg text-sm font-medium border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 transition-colors">
                Selanjutnya →
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
