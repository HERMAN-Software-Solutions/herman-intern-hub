export default function MentorReviewsLoading() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl animate-pulse">
      <div className="mb-8">
        <div className="h-8 bg-slate-200 rounded w-56" />
        <div className="h-4 bg-slate-100 rounded w-80 mt-3" />
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {[0, 1].map((i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 space-y-2">
            <div className="h-3 bg-slate-100 rounded w-24" />
            <div className="h-7 bg-slate-200 rounded w-12" />
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="flex gap-2">
                <div className="h-4 bg-slate-200 rounded w-40" />
                <div className="h-5 bg-slate-100 rounded-full w-24" />
              </div>
              <div className="h-3 bg-slate-100 rounded w-48" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}