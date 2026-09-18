export default function TasksLoading() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl animate-pulse">
      <div className="mb-8">
        <div className="h-8 bg-slate-200 rounded w-40" />
        <div className="h-4 bg-slate-100 rounded w-72 mt-3" />
      </div>

      <div className="flex gap-2 mb-6 pb-2 border-b border-slate-200">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-8 bg-slate-100 rounded w-20" />
        ))}
      </div>

      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-xl p-5 flex items-start gap-4">
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-slate-200 rounded w-3/4" />
              <div className="h-3 bg-slate-100 rounded w-full" />
              <div className="h-3 bg-slate-100 rounded w-1/2" />
            </div>
            <div className="h-6 bg-slate-100 rounded-full w-20" />
          </div>
        ))}
      </div>
    </div>
  )
}