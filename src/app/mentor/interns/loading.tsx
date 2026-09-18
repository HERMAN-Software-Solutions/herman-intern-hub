export default function MentorInternsLoading() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl animate-pulse">
      <div className="mb-8">
        <div className="h-8 bg-slate-200 rounded w-40" />
        <div className="h-4 bg-slate-100 rounded w-72 mt-3" />
      </div>

      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-xl p-5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="flex justify-between gap-3">
                <div className="h-4 bg-slate-200 rounded w-40" />
                <div className="h-5 bg-slate-100 rounded-full w-20" />
              </div>
              <div className="h-3 bg-slate-100 rounded w-48" />
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="h-3 bg-slate-100 rounded w-16" />
                <div className="h-3 bg-slate-100 rounded w-16" />
                <div className="h-3 bg-slate-100 rounded w-16" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}