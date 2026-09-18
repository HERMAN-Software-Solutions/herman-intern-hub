export default function DashboardLoading() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl animate-pulse">
      <div className="mb-8">
        <div className="h-8 bg-slate-200 rounded w-64" />
        <div className="h-4 bg-slate-100 rounded w-80 mt-3" />
      </div>

      {/* Mentor card */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-full bg-slate-100" />
        <div className="space-y-2">
          <div className="h-3 bg-slate-100 rounded w-24" />
          <div className="h-4 bg-slate-200 rounded w-40" />
        </div>
      </div>

      {/* Today's log */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6 space-y-3">
        <div className="h-5 bg-slate-200 rounded w-32" />
        <div className="h-12 bg-slate-100 rounded" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {[0, 1].map((i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-xl p-6 space-y-3">
            <div className="h-5 bg-slate-200 rounded w-32" />
            <div className="h-4 bg-slate-100 rounded w-full" />
            <div className="h-4 bg-slate-100 rounded w-3/4" />
            <div className="h-4 bg-slate-100 rounded w-2/3" />
          </div>
        ))}
      </div>
    </div>
  )
}