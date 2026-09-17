export default function DashboardLoading() {
  return (
    <div className="p-8 max-w-5xl animate-pulse">
      <div className="h-9 bg-slate-200 rounded w-64" />
      <div className="h-4 bg-slate-100 rounded w-80 mt-3" />

      {/* Mentor card */}
      <div className="mt-6 bg-white border border-slate-200 rounded-xl p-5 flex items-center gap-4">
        <div className="w-12 h-12 bg-slate-200 rounded-full" />
        <div className="flex-1">
          <div className="h-3 bg-slate-100 rounded w-24" />
          <div className="h-4 bg-slate-200 rounded w-40 mt-2" />
        </div>
      </div>

      {/* Today's log */}
      <div className="mt-6 bg-white border border-slate-200 rounded-xl p-6">
        <div className="h-5 bg-slate-200 rounded w-32 mb-3" />
        <div className="h-12 bg-slate-100 rounded" />
      </div>

      {/* Two columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
        {[0, 1].map((i) => (
          <div
            key={i}
            className="bg-white border border-slate-200 rounded-xl p-6"
          >
            <div className="h-5 bg-slate-200 rounded w-32 mb-4" />
            <div className="space-y-3">
              <div className="h-4 bg-slate-100 rounded w-full" />
              <div className="h-4 bg-slate-100 rounded w-3/4" />
              <div className="h-4 bg-slate-100 rounded w-2/3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}