export default function ProjectsLoading() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl animate-pulse">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <div className="h-8 bg-slate-200 rounded w-40" />
          <div className="h-4 bg-slate-100 rounded w-72 mt-3" />
        </div>
        <div className="h-10 bg-slate-200 rounded-lg w-36" />
      </div>

      <div className="flex gap-2 mb-6 pb-2 border-b border-slate-200">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-8 bg-slate-100 rounded w-20" />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-6 bg-slate-100 rounded-full w-20" />
              <div className="h-4 bg-slate-100 rounded w-4" />
            </div>
            <div className="h-5 bg-slate-200 rounded w-3/4" />
            <div className="h-3 bg-slate-100 rounded w-full" />
            <div className="h-3 bg-slate-100 rounded w-2/3" />
            <div className="pt-3 border-t border-slate-100 flex gap-4">
              <div className="h-3 bg-slate-100 rounded w-24" />
              <div className="h-3 bg-slate-100 rounded w-24" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}