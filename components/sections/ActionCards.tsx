import { actionTips } from "@/data/dummyData";

export default function ActionCards() {
  return (
    <section className="py-12 bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-primary mb-2">
            Hal yang Harus Dilakukan
          </h2>
          <p className="text-slate-500 text-sm max-w-2xl mx-auto">
            Panduan lengkap untuk menghadapi bencana banjir di wilayah Kabupaten
            Jember
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {actionTips.map((tip, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-border p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">{tip.icon}</span>
                <h3 className="font-bold text-primary text-base group-hover:text-secondary transition-colors">
                  {tip.title}
                </h3>
              </div>
              <ul className="space-y-2.5">
                {tip.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600">
                    <span className="w-5 h-5 rounded-full bg-secondary/10 text-secondary flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
