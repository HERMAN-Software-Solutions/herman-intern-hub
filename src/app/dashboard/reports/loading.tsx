export default function ReportsLoading() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl animate-pulse">
      <div className="mb-8">
        <div className="h-8 bg-slate-200 rounded w-44" />
        <div className="h-4 bg-slate-100 rounded w-72 mt-3" />
      </div>

      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-xl p-5 flex justify-between gap-4">
            <div className="flex-1 space-y-2">
              <div className="h-5 bg-slate-200 rounded w-64" />
              <div className="h-4 bg-slate-100 rounded w-full" />
              <div className="h-3 bg-slate-100 rounded w-40" />
            </div>
            <div className="h-10 bg-slate-100 rounded-lg w-32 flex-shrink-0" />
          </div>
        ))}
      </div>
    </div>
  )
}