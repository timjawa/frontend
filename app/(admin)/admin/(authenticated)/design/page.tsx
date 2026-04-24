"use client";

import React from "react";
import {
  HiOutlineDocumentText,
  HiOutlineExclamationTriangle,
  HiOutlineCheckCircle,
  HiOutlineUserGroup,
  HiPlus,
  HiArrowDownTray,
  HiMagnifyingGlass,
  HiEllipsisVertical,
} from "react-icons/hi2";
import AdminCard from "@/components/admin/ui/AdminCard";
import AdminBadge from "@/components/admin/ui/AdminBadge";
import AdminDropdown from "@/components/admin/ui/AdminDropdown";
import AdminButton from "@/components/admin/ui/AdminButton";
import AdminInput from "@/components/admin/ui/AdminInput";
import {
  MockBarChart,
  MockDonutChart,
  RechartsLineChart,
} from "@/components/admin/ui/MockChart";

/* ------------------------------------------------------------------ */
/*  SECTION HEADER — setiap bagian menggunakan ini sebagai judul       */
/* ------------------------------------------------------------------ */
function SectionTitle({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-3">
        <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-[#1B2E4B] to-[#2A4365] text-white text-xs font-bold shadow-md">
          {number}
        </span>
        <h2 className="text-xl font-bold text-[#1B2E4B]">{title}</h2>
      </div>
      <p className="text-sm text-slate-400 mt-2 ml-11">{description}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  TABEL DUMMY — lebih banyak row utk demo pagination                */
/* ------------------------------------------------------------------ */
const tableRows = [
  { id: "LP-260401", name: "Budi Santoso", cat: "Banjir", kec: "Kaliwates", date: "23 Apr 2026", status: "Baru", sv: "default" as const },
  { id: "LP-260402", name: "Siti Aminah", cat: "Pohon Tumbang", kec: "Sumbersari", date: "23 Apr 2026", status: "Diverifikasi", sv: "info" as const },
  { id: "LP-260403", name: "Agus Pratama", cat: "Tanah Longsor", kec: "Panti", date: "22 Apr 2026", status: "Selesai", sv: "success" as const },
  { id: "LP-260404", name: "Dewi Lestari", cat: "Kebakaran", kec: "Patrang", date: "21 Apr 2026", status: "Ditolak", sv: "danger" as const },
  { id: "LP-260405", name: "Rudi Hartono", cat: "Banjir", kec: "Ambulu", date: "20 Apr 2026", status: "Baru", sv: "default" as const },
];

/* ================================================================== */
/*  DESIGN SYSTEM PAGE                                                 */
/* ================================================================== */
export default function DesignSystemPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100/60 to-blue-50/40">
      {/* ── HERO HEADER ── */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#1B2E4B] to-[#2A4365] text-white">
        {/* deco circles */}
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/5" />
        <div className="absolute top-10 left-1/3 w-40 h-40 rounded-full bg-white/5" />
        <div className="absolute -bottom-10 right-1/4 w-56 h-56 rounded-full bg-white/[0.03]" />

        <div className="relative z-10 max-w-6xl mx-auto px-6 py-16">
          <p className="text-blue-200 text-sm font-medium tracking-widest uppercase mb-3">
            Jember Siaga
          </p>
          <h1 className="text-4xl font-extrabold tracking-tight">
            Dashboard Design System
          </h1>
          <p className="text-blue-200/80 mt-3 max-w-xl leading-relaxed">
            Panduan visual seluruh komponen UI yang digunakan di halaman Admin.
            Scroll ke bawah untuk mereview setiap elemen sebelum dirakit menjadi
            dashboard sesungguhnya.
          </p>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="max-w-6xl mx-auto px-6 -mt-6 pb-20 space-y-14">
        {/* ===== 1. STAT CARDS ===== */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
            <SectionTitle
              number="01"
              title="Stat Cards"
              description="Kartu ringkasan utama yang tampil di bagian atas dashboard."
            />
            <AdminDropdown
              label="Periode"
              options={["Hari Ini", "Minggu Ini", "Bulan Ini", "Tahun Ini"]}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <AdminCard
              title="Total Laporan"
              value="1,248"
              icon={HiOutlineDocumentText}
              color="blue"
              trend={{ value: 12, isPositive: true }}
            />
            <AdminCard
              title="Menunggu Verifikasi"
              value="34"
              icon={HiOutlineExclamationTriangle}
              color="amber"
              trend={{ value: 5, isPositive: false }}
            />
            <AdminCard
              title="Laporan Selesai"
              value="1,082"
              icon={HiOutlineCheckCircle}
              color="green"
              trend={{ value: 18, isPositive: true }}
            />
            <AdminCard
              title="Pengguna Aktif"
              value="8,591"
              icon={HiOutlineUserGroup}
              color="indigo"
            />
          </div>
        </section>

        {/* ===== 2. CHARTS ===== */}
        <section>
          <SectionTitle
            number="02"
            title="Charts & Diagrams"
            description="Visualisasi data bencana, cuaca, dan statistik."
          />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2">
              <MockBarChart />
            </div>
            <MockDonutChart />
          </div>
          <div className="mt-5">
            <RechartsLineChart />
          </div>
        </section>

        {/* ===== 3. BADGES ===== */}
        <section>
          <SectionTitle
            number="03"
            title="Status Badges"
            description="Lencana untuk menandai status laporan dan level peringatan."
          />
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl ring-1 ring-slate-100 p-6 shadow-sm">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
              Tanpa dot
            </p>
            <div className="flex flex-wrap gap-3 mb-6">
              <AdminBadge variant="default">Baru</AdminBadge>
              <AdminBadge variant="info">Diverifikasi</AdminBadge>
              <AdminBadge variant="success">Selesai</AdminBadge>
              <AdminBadge variant="warning">Siaga</AdminBadge>
              <AdminBadge variant="danger">Ditolak</AdminBadge>
            </div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
              Dengan dot indicator
            </p>
            <div className="flex flex-wrap gap-3">
              <AdminBadge variant="default" dot>Baru</AdminBadge>
              <AdminBadge variant="info" dot>Diverifikasi</AdminBadge>
              <AdminBadge variant="success" dot>Selesai</AdminBadge>
              <AdminBadge variant="warning" dot>Siaga</AdminBadge>
              <AdminBadge variant="danger" dot>Ditolak</AdminBadge>
            </div>
          </div>
        </section>

        {/* ===== 4. BUTTONS ===== */}
        <section>
          <SectionTitle
            number="04"
            title="Buttons"
            description="Tombol aksi dengan gradient, shadow, dan micro-animation."
          />
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl ring-1 ring-slate-100 p-6 shadow-sm space-y-6">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
                Variant
              </p>
              <div className="flex flex-wrap gap-3 items-center">
                <AdminButton variant="primary" icon={<HiPlus className="w-4 h-4" />}>
                  Tambah Data
                </AdminButton>
                <AdminButton variant="secondary" icon={<HiArrowDownTray className="w-4 h-4" />}>
                  Export
                </AdminButton>
                <AdminButton variant="outline">Batal</AdminButton>
                <AdminButton variant="danger">Hapus</AdminButton>
                <AdminButton variant="ghost">Detail</AdminButton>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
                Sizes
              </p>
              <div className="flex flex-wrap gap-3 items-center">
                <AdminButton size="sm" variant="primary">
                  Small
                </AdminButton>
                <AdminButton size="md" variant="primary">
                  Medium
                </AdminButton>
                <AdminButton size="lg" variant="primary">
                  Large
                </AdminButton>
              </div>
            </div>
          </div>
        </section>

        {/* ===== 5. FORM INPUTS ===== */}
        <section>
          <SectionTitle
            number="05"
            title="Form Inputs"
            description="Berbagai tipe input: teks, email, password, textarea, dan file upload."
          />
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl ring-1 ring-slate-100 p-6 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <AdminInput
                label="Nama Lengkap"
                placeholder="Masukkan nama lengkap"
                helpText="Gunakan nama asli sesuai KTP."
              />
              <AdminInput
                label="Email"
                type="email"
                placeholder="nama@email.com"
              />
              <AdminInput
                label="Password"
                type="password"
                placeholder="••••••••"
                error="Password minimal 8 karakter."
                defaultValue="123"
              />
              <AdminInput
                label="Pencarian"
                type="text"
                placeholder="Cari laporan..."
              />
              <div className="md:col-span-2">
                <AdminInput
                  label="Deskripsi Bencana"
                  type="textarea"
                  placeholder="Ceritakan kronologi kejadian secara singkat..."
                />
              </div>
              <div className="md:col-span-2">
                <AdminInput
                  label="Upload Bukti Foto / Video"
                  type="file"
                  accept="image/*, video/*"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ===== 6. DATA TABLE + PAGINATION ===== */}
        <section>
          <SectionTitle
            number="06"
            title="Data Table"
            description="Tabel data laporan dengan pagination dan aksi."
          />
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl ring-1 ring-slate-100 shadow-sm overflow-hidden">
            {/* Table header bar */}
            <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-[#1B2E4B]">
                Laporan Terbaru
              </h3>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Cari laporan..."
                    className="pl-9 pr-4 py-2 text-sm rounded-xl bg-slate-50 ring-1 ring-slate-200 focus:ring-2 focus:ring-[#1B2E4B] focus:bg-white outline-none transition-all w-52"
                  />
                </div>
                <AdminButton size="sm" variant="outline">
                  Filter
                </AdminButton>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-50/80">
                    <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                      ID
                    </th>
                    <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Pelapor
                    </th>
                    <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Kategori
                    </th>
                    <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Kecamatan
                    </th>
                    <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Tanggal
                    </th>
                    <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Status
                    </th>
                    <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400 text-right">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tableRows.map((row) => (
                    <tr
                      key={row.id}
                      className="hover:bg-blue-50/40 transition-colors"
                    >
                      <td className="px-6 py-4 font-semibold text-[#1B2E4B]">
                        {row.id}
                      </td>
                      <td className="px-6 py-4 text-slate-700">{row.name}</td>
                      <td className="px-6 py-4 text-slate-700">{row.cat}</td>
                      <td className="px-6 py-4 text-slate-500">{row.kec}</td>
                      <td className="px-6 py-4 text-slate-400">{row.date}</td>
                      <td className="px-6 py-4">
                        <AdminBadge variant={row.sv} dot>
                          {row.status}
                        </AdminBadge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors">
                          <HiEllipsisVertical className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-slate-100 bg-slate-50/50">
              <p className="text-sm text-slate-500">
                Menampilkan{" "}
                <span className="font-semibold text-slate-700">1–5</span> dari{" "}
                <span className="font-semibold text-slate-700">24</span> data
              </p>
              <div className="flex items-center gap-1.5">
                <button
                  className="px-3 py-1.5 rounded-lg text-sm font-medium border border-slate-200 text-slate-400 bg-white cursor-not-allowed opacity-50"
                  disabled
                >
                  ← Sebelumnya
                </button>
                {[1, 2, 3].map((n) => (
                  <button
                    key={n}
                    className={`w-9 h-9 rounded-lg text-sm font-semibold transition-colors ${
                      n === 1
                        ? "bg-[#1B2E4B] text-white shadow-md shadow-[#1B2E4B]/20"
                        : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {n}
                  </button>
                ))}
                <span className="px-1 text-slate-300">…</span>
                <button className="w-9 h-9 rounded-lg text-sm font-semibold bg-white text-slate-600 border border-slate-200 hover:bg-slate-50">
                  8
                </button>
                <button className="px-3 py-1.5 rounded-lg text-sm font-medium border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 transition-colors">
                  Selanjutnya →
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
