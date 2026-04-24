import React from "react";

export function MockBarChart() {
  const data = [
    { label: "Jan", value: 30, color: "from-blue-400 to-blue-500" },
    { label: "Feb", value: 45, color: "from-blue-400 to-blue-500" },
    { label: "Mar", value: 25, color: "from-blue-400 to-blue-500" },
    { label: "Apr", value: 60, color: "from-indigo-400 to-indigo-500" },
    { label: "Mei", value: 40, color: "from-blue-400 to-blue-500" },
    { label: "Jun", value: 70, color: "from-indigo-400 to-indigo-500" },
    { label: "Jul", value: 55, color: "from-blue-400 to-blue-500" },
    { label: "Agu", value: 35, color: "from-blue-400 to-blue-500" },
    { label: "Sep", value: 48, color: "from-blue-400 to-blue-500" },
    { label: "Okt", value: 65, color: "from-indigo-400 to-indigo-500" },
    { label: "Nov", value: 50, color: "from-blue-400 to-blue-500" },
    { label: "Des", value: 42, color: "from-blue-400 to-blue-500" },
  ];

  const maxVal = Math.max(...data.map((d) => d.value));

  return (
    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm ring-1 ring-slate-100 w-full h-[340px] flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-bold text-[#1B2E4B]">
            Tren Laporan Bencana
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Laporan per bulan — Tahun 2026
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-extrabold text-[#1B2E4B]">565</p>
          <p className="text-xs text-emerald-600 font-semibold">
            ↑ 12% dari 2025
          </p>
        </div>
      </div>

      {/* Y-axis labels + bars */}
      <div className="flex-1 flex gap-1.5">
        <div className="flex flex-col justify-between text-xs text-slate-400 pr-2 py-1">
          <span>70</span>
          <span>35</span>
          <span>0</span>
        </div>
        <div className="flex-1 relative">
          {/* Horizontal grid lines */}
          <div className="absolute inset-0 flex flex-col justify-between py-1">
            <div className="border-t border-dashed border-slate-100" />
            <div className="border-t border-dashed border-slate-100" />
            <div className="border-t border-slate-200" />
          </div>
          {/* Bars */}
          <div className="relative z-10 flex items-end justify-between h-full gap-1.5 pb-1">
            {data.map((item, idx) => (
              <div
                key={idx}
                className="flex-1 flex flex-col items-center group cursor-pointer"
                style={{ height: "100%" }}
              >
                <div className="flex-1 flex items-end w-full">
                  <div
                    className={`w-full bg-gradient-to-t ${item.color} rounded-t-lg opacity-80 group-hover:opacity-100 transition-all duration-200 relative`}
                    style={{ height: `${(item.value / maxVal) * 100}%` }}
                  >
                    {/* Tooltip */}
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#1B2E4B] text-white text-[10px] py-1 px-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg">
                      {item.value} laporan
                    </div>
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 mt-2 font-medium">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function MockDonutChart() {
  const segments = [
    { label: "Banjir", pct: 45, color: "#3B82F6" },
    { label: "Longsor", pct: 25, color: "#F59E0B" },
    { label: "Kebakaran", pct: 15, color: "#EF4444" },
    { label: "Lainnya", pct: 15, color: "#10B981" },
  ];

  // conic-gradient
  let cumulPct = 0;
  const gradientStops = segments
    .map((s) => {
      const start = cumulPct;
      cumulPct += s.pct;
      return `${s.color} ${start}% ${cumulPct}%`;
    })
    .join(", ");

  return (
    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm ring-1 ring-slate-100 w-full h-[340px] flex flex-col">
      <h3 className="text-base font-bold text-[#1B2E4B]">Kategori Bencana</h3>
      <p className="text-xs text-slate-400 mt-0.5">Distribusi laporan</p>

      <div className="flex-1 flex items-center justify-center">
        <div className="relative">
          <div
            className="w-44 h-44 rounded-full shadow-inner"
            style={{ background: `conic-gradient(${gradientStops})` }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-28 h-28 bg-white rounded-full flex flex-col items-center justify-center shadow-sm">
                <span className="text-3xl font-extrabold text-[#1B2E4B]">
                  120
                </span>
                <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                  Total
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-auto">
        {segments.map((s) => (
          <div
            key={s.label}
            className="flex items-center gap-1.5 text-xs text-slate-600"
          >
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: s.color }}
            />
            <span className="font-medium">{s.label}</span>
            <span className="text-slate-400">{s.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function RechartsLineChart() {
  // This component must be rendered client-side because Recharts uses browser APIs
  // Wrap it in dynamic import with ssr:false in the page that uses it
  const {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
  } = require("recharts");

  const data = [
    { hari: "Sen", suhu: 28 },
    { hari: "Sel", suhu: 31 },
    { hari: "Rab", suhu: 29 },
    { hari: "Kam", suhu: 33 },
    { hari: "Jum", suhu: 30 },
    { hari: "Sab", suhu: 34 },
    { hari: "Min", suhu: 32 },
  ];

  return (
    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm ring-1 ring-slate-100 w-full h-[340px] flex flex-col overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-[#1B2E4B]">
            Cuaca Mingguan
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Suhu rata-rata (°C) minggu ini
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-extrabold text-[#1B2E4B]">31°C</p>
          <p className="text-xs text-slate-400">rata-rata</p>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorSuhu" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" vertical={false} />
            <XAxis
              dataKey="hari"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "#94a3b8", fontWeight: 500 }}
              dy={8}
            />
            <YAxis
              domain={[26, 36]}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              tickFormatter={(v: number) => `${v}°`}
            />
            <Tooltip
              contentStyle={{
                background: "#1B2E4B",
                border: "none",
                borderRadius: "12px",
                color: "white",
                fontSize: "12px",
                fontWeight: 600,
                boxShadow: "0 10px 25px rgba(27,46,75,0.3)",
              }}
              itemStyle={{ color: "white" }}
              labelStyle={{ color: "#93c5fd", fontWeight: 500, fontSize: "11px", marginBottom: "2px" }}
              formatter={(value: number) => [`${value}°C`, "Suhu"]}
              cursor={{ stroke: "#3B82F6", strokeWidth: 1, strokeDasharray: "4 4" }}
            />
            <Area
              type="monotone"
              dataKey="suhu"
              stroke="#3B82F6"
              strokeWidth={2.5}
              fill="url(#colorSuhu)"
              dot={{ r: 4, fill: "white", stroke: "#3B82F6", strokeWidth: 2 }}
              activeDot={{ r: 6, fill: "#3B82F6", stroke: "white", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

