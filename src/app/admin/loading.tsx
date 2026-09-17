export default function AdminLoading() {
  return (
    <div className="p-8 max-w-6xl animate-pulse">
      {/* Header */}
      <div className="mb-8">
        <div className="h-9 bg-slate-200 rounded w-48" />
        <div className="h-4 bg-slate-100 rounded w-72 mt-3" />
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="bg-white border border-slate-200 rounded-xl p-5"
          >
            <div className="h-3 bg-slate-100 rounded w-20" />
            <div className="h-8 bg-slate-200 rounded w-12 mt-3" />
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {[0, 1].map((i) => (
          <div
            key={i}
            className="bg-white border border-slate-200 rounded-xl p-6"
          >
            <div className="h-4 bg-slate-200 rounded w-40 mb-2" />
            <div className="h-3 bg-slate-100 rounded w-64 mb-4" />
            <div className="h-56 bg-slate-100 rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}