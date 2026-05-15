"use client";
import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import AdminBadge from "@/components/admin/ui/AdminBadge";
import { HiMagnifyingGlass, HiPlus, HiOutlineHomeModern, HiOutlineCheckCircle, HiOutlineArrowPath, HiOutlineExclamationTriangle, HiOutlineXCircle, HiOutlineXMark, HiOutlineUsers } from "react-icons/hi2";
import PosPengungsiAction from "./PosPengungsiAction";
import api from "@/lib/api";

const STATUS_OPT = ["standby","aktif","penuh","tutup"] as const;
const ST: Record<string, { label: string; variant: "success"|"info"|"warning"|"danger"|"default" }> = {
  standby:{ label:"Standby", variant:"info" }, aktif:{ label:"Aktif", variant:"success" },
  penuh:  { label:"Penuh",   variant:"warning" }, tutup:{ label:"Tutup", variant:"danger" },
};
const EMPTY = { nama:"", alamat:"", latitude:"", longitude:"", kapasitas:"", terisi:"0", fasilitas:"", status:"standby", penanggung_jawab:"", telepon:"", is_active:true };
const inp = "w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none bg-white";
const lbl = "block text-xs font-medium text-slate-600 mb-1";

export default function PosPengungsiPage() {
  const [data, setData]   = useState<any[]>([]);
  const [meta, setMeta]   = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string|null>(null);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [page, setPage]   = useState(1);

  const fetchStats = useCallback(async () => {
    try { const r = await api.get("/api/pos-pengungsian/stats"); setStats(r.data); } catch {}
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const r = await api.get("/api/pos-pengungsian", { params: { page, per_page:10, search, status: filterStatus } });
      setData(r.data.data);
      setMeta({ current_page:r.data.current_page, last_page:r.data.last_page, total:r.data.total, from:r.data.from, to:r.data.to });
    } catch (e:any) { setError(e.response?.data?.message||"Gagal memuat data."); }
    finally { setLoading(false); }
  }, [page, search, filterStatus]);

  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSearch = () => { setPage(1); setSearch(searchInput); };
  const pages = meta ? Array.from({length:meta.last_page},(_,i)=>i+1) : [];

  return (
    <div>
      <PageBreadcrumb pageTitle="Pos Pengungsian" />

      {/* Stat Cards — same style as kecamatan */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label:"Total Pos",    val: stats?.total,    icon:<HiOutlineHomeModern className="w-5 h-5 text-blue-500" />,           bg:"bg-blue-50 dark:bg-blue-500/10" },
          { label:"Aktif",        val: stats?.aktif,    icon:<HiOutlineCheckCircle className="w-5 h-5 text-emerald-500" />,        bg:"bg-emerald-50 dark:bg-emerald-500/10" },
          { label:"Standby",      val: stats?.standby,  icon:<HiOutlineArrowPath className="w-5 h-5 text-yellow-500" />,          bg:"bg-yellow-50 dark:bg-yellow-500/10" },
          { label:"Penuh / Tutup",val: stats!=null?(stats.penuh+stats.tutup):null, icon:<HiOutlineExclamationTriangle className="w-5 h-5 text-red-500" />, bg:"bg-red-50 dark:bg-red-500/10" },
        ].map(c => (
          <div key={c.label} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03] flex items-center gap-4">
            <div className={`p-3 rounded-xl ${c.bg} shrink-0`}>{c.icon}</div>
            <div>
              <p className="text-xs text-gray-500 mb-0.5">{c.label}</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{loading?"—":(c.val??0)}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-3 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-8">
        <div className="bg-white/80 dark:bg-gray-900/50 backdrop-blur-sm rounded-2xl ring-1 ring-slate-100 dark:ring-gray-800 shadow-sm overflow-hidden">

          {/* Table header bar */}
          <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 dark:border-gray-800">
            <div>
              <h3 className="text-base font-bold text-[#1B2E4B] dark:text-white">Data Pos Pengungsian Jember</h3>
              <p className="text-xs text-slate-400 dark:text-gray-500 mt-0.5">Kelola data shelter dan pos evakuasi bencana</p>
            </div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <select value={filterStatus} onChange={e=>{setFilterStatus(e.target.value);setPage(1);}}
                className="py-2 px-3 text-sm rounded-lg bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 outline-none text-slate-600 dark:text-gray-300">
                <option value="all">Semua Status</option>
                {STATUS_OPT.map(s=><option key={s} value={s}>{ST[s].label}</option>)}
              </select>
              <div className="relative">
                <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-gray-500" />
                <input type="text" placeholder="Cari pos pengungsian..." value={searchInput}
                  onChange={e=>setSearchInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleSearch()}
                  className="pl-9 pr-4 py-2 text-sm rounded-lg bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 focus:bg-white dark:focus:bg-gray-900 outline-none transition-all w-48 text-gray-700 dark:text-gray-200" />
              </div>
              <Link href="/admin/pos-pengungsian/create"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 active:scale-95 transition-all shadow-sm shadow-blue-200 dark:shadow-none whitespace-nowrap">
                <HiPlus className="w-4 h-4" /> Tambah Pos
              </Link>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-gray-800/50">
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-gray-500 w-12 text-center">No</th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-gray-500">Nama Pos</th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-gray-500">Alamat</th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-gray-500">Kapasitas</th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-gray-500">Terisi</th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-gray-500">Penanggung Jawab</th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-gray-500">Status</th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-gray-500 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-gray-800">
                {loading ? Array.from({length:5}).map((_,i)=>(
                  <tr key={i} className="animate-pulse">
                    {Array.from({length:8}).map((__,j)=>(
                      <td key={j} className="px-6 py-4"><div className="h-4 bg-slate-100 dark:bg-gray-800 rounded-md w-full"/></td>
                    ))}
                  </tr>
                )) : error ? (
                  <tr><td colSpan={8} className="px-6 py-12 text-center text-red-500">
                    <HiOutlineXCircle className="w-8 h-8 mx-auto mb-2"/>{error}
                  </td></tr>
                ) : data.length===0 ? (
                  <tr><td colSpan={8} className="px-6 py-12 text-center text-slate-400 dark:text-gray-500">
                    <HiOutlineHomeModern className="w-10 h-10 mx-auto mb-2 text-slate-300 dark:text-gray-600"/>
                    <p>Tidak ada data pos pengungsian ditemukan.</p>
                  </td></tr>
                ) : data.map((pos,idx)=>{
                  const st = ST[pos.status]??{label:pos.status,variant:"default" as const};
                  const pct = pos.kapasitas>0?Math.min(Math.round((pos.terisi/pos.kapasitas)*100),100):0;
                  const bar = pct>=100?"bg-red-500":pct>=75?"bg-orange-400":"bg-emerald-500";
                  return (
                    <tr key={pos.id} className="hover:bg-blue-50/40 dark:hover:bg-gray-800/40 transition-colors">
                      <td className="px-6 py-4 text-center text-slate-500 dark:text-gray-400 font-medium">{meta?(meta.from??1)+idx:idx+1}</td>
                      <td className="px-6 py-4 font-semibold text-[#1B2E4B] dark:text-gray-200">{pos.nama}</td>
                      <td className="px-6 py-4 text-slate-600 dark:text-gray-400 max-w-[160px]">
                        <span className="block truncate text-xs" title={pos.alamat}>{pos.alamat||<span className="text-slate-400 dark:text-gray-600">—</span>}</span>
                      </td>
                      <td className="px-6 py-4 text-slate-700 dark:text-gray-300 font-medium">{(pos.kapasitas??0).toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 min-w-[90px]">
                          <div className="flex-1 h-1.5 bg-slate-100 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div className={`h-full ${bar} rounded-full`} style={{width:`${pct}%`}}/>
                          </div>
                          <span className="text-xs text-slate-500 dark:text-gray-400 whitespace-nowrap">{pos.terisi??0}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-gray-400">{pos.penanggung_jawab||<span className="text-slate-400 dark:text-gray-600">—</span>}</td>
                      <td className="px-6 py-4"><AdminBadge variant={st.variant} dot>{st.label}</AdminBadge></td>
                      <td className="px-6 py-4 text-right">
                        <PosPengungsiAction id={pos.id}
                          onDeleted={()=>{fetchData();fetchStats();}} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-slate-100 dark:border-gray-800 bg-slate-50/50 dark:bg-gray-800/30">
            <p className="text-sm text-slate-500 dark:text-gray-400">
              {meta&&meta.from!=null ? <>Menampilkan <span className="font-semibold text-slate-700 dark:text-gray-200">{meta.from}–{meta.to}</span> dari <span className="font-semibold text-slate-700 dark:text-gray-200">{meta.total}</span> data</> : "Memuat data..."}
            </p>
            <div className="flex items-center gap-1.5 flex-wrap">
              <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={!meta||page<=1}
                className="px-3 py-1.5 rounded-lg text-sm font-medium border border-slate-200 dark:border-gray-700 text-slate-600 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                ← Sebelumnya
              </button>
              {pages.slice(Math.max(0,page-3),page+2).map(n=>(
                <button key={n} onClick={()=>setPage(n)}
                  className={`w-9 h-9 rounded-lg text-sm font-semibold transition-colors ${n===page?"bg-[#1B2E4B] text-white shadow-md shadow-[#1B2E4B]/20":"bg-white dark:bg-gray-800 text-slate-600 dark:text-gray-300 border border-slate-200 dark:border-gray-700 hover:bg-slate-50 dark:hover:bg-gray-700"}`}>
                  {n}
                </button>
              ))}
              <button onClick={()=>setPage(p=>p+1)} disabled={!meta||page>=meta.last_page}
                className="px-3 py-1.5 rounded-lg text-sm font-medium border border-slate-200 dark:border-gray-700 text-slate-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                Selanjutnya →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
