export function WeatherCardsSkeleton() {
  return (
    <section className="py-8" style={{ backgroundColor: "#F3F8FF" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div className="h-8 w-48 bg-slate-200 rounded animate-pulse"></div>
          <div className="flex gap-2">
            <div className="w-10 h-10 rounded-full bg-slate-200 animate-pulse"></div>
            <div className="w-10 h-10 rounded-full bg-slate-200 animate-pulse"></div>
          </div>
        </div>
        <div className="flex gap-4 overflow-x-auto hide-scrollbar py-4">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-[220px] h-[200px] rounded-2xl p-5 bg-slate-200 animate-pulse"
              style={{ backgroundColor: "#DFEAF6" }}
            >
               <div className="flex justify-between items-start mb-8">
                 <div className="h-4 w-20 bg-slate-300 rounded animate-pulse"></div>
                 <div className="h-3 w-10 bg-slate-300 rounded animate-pulse"></div>
               </div>
               <div className="flex justify-center mb-8">
                  <div className="w-[80px] h-[80px] bg-slate-300 rounded-full animate-pulse"></div>
               </div>
               <div className="mx-auto h-4 w-24 bg-slate-300 rounded animate-pulse mt-2"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


