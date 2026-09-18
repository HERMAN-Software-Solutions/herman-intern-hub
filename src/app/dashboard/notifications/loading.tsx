export default function NotificationsLoading() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl animate-pulse">
      <div className="mb-8">
        <div className="h-8 bg-slate-200 rounded w-44" />
        <div className="h-4 bg-slate-100 rounded w-64 mt-3" />
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="p-4 flex gap-3">
            <div className="w-2 h-2 bg-slate-200 rounded-full mt-2 flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-slate-200 rounded w-3/4" />
              <div className="h-3 bg-slate-100 rounded w-1/2" />
              <div className="h-2 bg-slate-100 rounded w-24" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}