export default function DocumentsLoading() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl animate-pulse">
      <div className="mb-8">
        <div className="h-8 bg-slate-200 rounded w-44" />
        <div className="h-4 bg-slate-100 rounded w-80 mt-3" />
      </div>

      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-100 rounded-lg flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-slate-200 rounded w-2/3" />
              <div className="h-3 bg-slate-100 rounded w-1/2" />
            </div>
            <div className="h-8 bg-slate-100 rounded-lg w-24" />
          </div>
        ))}
      </div>
    </div>
  )
}