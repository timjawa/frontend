import { earlyWarning } from "@/data/dummyData";
import { HiShieldCheck, HiExclamationTriangle } from "react-icons/hi2";

export default function EarlyWarning() {
  const isActive = earlyWarning.active;

  return (
    <section className="py-6 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`rounded-2xl p-6 border-2 ${
            isActive
              ? "bg-red-50 border-red-200"
              : "bg-gradient-to-r from-accent to-blue-50 border-secondary/20"
          }`}
        >
          <div className="flex items-start gap-4">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                isActive ? "bg-red-100" : "bg-secondary/10"
              }`}
            >
              {isActive ? (
                <HiExclamationTriangle className="text-red-600 text-2xl" />
              ) : (
                <HiShieldCheck className="text-secondary text-2xl" />
              )}
            </div>
            <div>
              <h3
                className={`font-bold text-lg mb-1 ${
                  isActive ? "text-red-700" : "text-primary"
                }`}
              >
                {earlyWarning.title}
              </h3>
              <p
                className={`text-sm leading-relaxed ${
                  isActive ? "text-red-600" : "text-slate-600"
                }`}
              >
                {earlyWarning.message}
              </p>
              <p className="text-xs text-slate-400 mt-2">
                Terakhir diperbarui: {earlyWarning.lastUpdate}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
