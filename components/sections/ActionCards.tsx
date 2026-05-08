import Image from "next/image";
import { actionTips } from "@/data/dummyData";

// Render text with **bold** markers (e.g., **JeSi**)
function renderBoldText(text: string) {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <span key={i} className="font-bold text-primary">
          {part.slice(2, -2)}
        </span>
      );
    }
    return part;
  });
}

export default function ActionCards() {
  return (
    <section className="py-12" style={{ backgroundColor: '#F3F8FF' }}>
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
              className="relative overflow-hidden rounded-2xl border border-blue-100 p-7 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
              style={{ backgroundColor: '#DFEAF6' }}
            >
              {/* Shield watermarks at corners */}
              <Image
                src="/icons/shield.svg"
                alt=""
                width={100}
                height={100}
                className="absolute -top-4 -right-4 pointer-events-none select-none"
                aria-hidden="true"
              />
              <Image
                src="/icons/shield.svg"
                alt=""
                width={120}
                height={120}
                className="absolute -bottom-6 -left-6 pointer-events-none select-none"
                aria-hidden="true"
              />

              {/* Title */}
              <h3 className="font-bold text-primary text-lg text-center mb-5 relative z-10 group-hover:text-secondary transition-colors">
                {tip.title}
              </h3>

              {/* Numbered list */}
              <ol className="space-y-3 relative z-10">
                {tip.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-slate-700">
                    <span className="font-semibold text-slate-500 min-w-[20px]">
                      {i + 1}.
                    </span>
                    <span className="leading-relaxed">
                      {renderBoldText(item)}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
