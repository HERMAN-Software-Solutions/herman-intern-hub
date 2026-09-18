export default function MentorHomeLoading() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl animate-pulse">
      <div className="mb-8">
        <div className="h-8 bg-slate-200 rounded w-64" />
        <div className="h-4 bg-slate-100 rounded w-56 mt-3" />
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-xl p-5 flex justify-between items-center">
            <div className="space-y-2">
              <div className="h-3 bg-slate-100 rounded w-24" />
              <div className="h-8 bg-slate-200 rounded w-16" />
              <div className="h-3 bg-slate-100 rounded w-20" />
            </div>
            <div className="w-10 h-10 bg-slate-100 rounded-lg" />
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[0, 1].map((i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-xl p-5 space-y-2">
            <div className="h-5 bg-slate-200 rounded w-32" />
            <div className="h-3 bg-slate-100 rounded w-full" />
            <div className="h-3 bg-slate-100 rounded w-3/4" />
          </div>
        ))}
      </div>
    </div>
  )
}