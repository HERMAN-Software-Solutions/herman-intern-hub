export default function ProjectsLoading() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl animate-pulse">
      <div className="mb-8">
        <div className="h-8 bg-slate-200 rounded w-44" />
        <div className="h-4 bg-slate-100 rounded w-64 mt-3" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-xl p-6 space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-6 bg-slate-100 rounded-full w-20" />
              <div className="h-3 bg-slate-100 rounded w-16" />
            </div>
            <div className="h-5 bg-slate-200 rounded w-3/4" />
            <div className="h-3 bg-slate-100 rounded w-full" />
            <div className="h-3 bg-slate-100 rounded w-2/3" />
            <div className="pt-3 border-t border-slate-100 flex gap-3">
              <div className="h-3 bg-slate-100 rounded w-24" />
              <div className="h-3 bg-slate-100 rounded w-20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}