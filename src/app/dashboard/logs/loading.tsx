export default function LogsLoading() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl animate-pulse">
      <div className="mb-8">
        <div className="h-8 bg-slate-200 rounded w-40" />
        <div className="h-4 bg-slate-100 rounded w-80 mt-3" />
      </div>

      {/* Form skeleton */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-8 space-y-4">
        <div className="h-5 bg-slate-200 rounded w-40" />
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="h-4 bg-slate-100 rounded w-16" />
            <div className="h-11 bg-slate-100 rounded-lg" />
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-slate-100 rounded w-24" />
            <div className="h-11 bg-slate-100 rounded-lg" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-slate-100 rounded w-40" />
          <div className="h-20 bg-slate-100 rounded-lg" />
        </div>
        <div className="h-10 bg-slate-200 rounded-lg w-32" />
      </div>

      {/* Week summary */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 mb-8 grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="h-3 bg-slate-100 rounded w-24" />
          <div className="h-6 bg-slate-200 rounded w-20" />
        </div>
        <div className="space-y-2">
          <div className="h-3 bg-slate-100 rounded w-24" />
          <div className="h-6 bg-slate-200 rounded w-12" />
        </div>
      </div>

      {/* History */}
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-4">
            <div className="h-4 bg-slate-200 rounded w-24" />
            <div className="h-4 bg-slate-100 rounded w-12" />
            <div className="h-4 bg-slate-100 rounded flex-1" />
          </div>
        ))}
      </div>
    </div>
  )
}