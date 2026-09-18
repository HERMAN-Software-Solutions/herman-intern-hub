export default function DocumentsLoading() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl animate-pulse">
      <div className="mb-8">
        <div className="h-8 bg-slate-200 rounded w-40" />
        <div className="h-4 bg-slate-100 rounded w-80 mt-3" />
      </div>

      <div className="h-11 bg-slate-100 rounded-lg mb-3" />
      <div className="flex gap-2 mb-6 pb-2 border-b border-slate-200">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-8 bg-slate-100 rounded w-24" />
        ))}
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="bg-slate-50 h-10" />
        {[...Array(6)].map((_, i) => (
          <div key={i} className="border-t border-slate-100 px-4 py-3 flex gap-4 items-center">
            <div className="w-4 h-4 bg-slate-100 rounded" />
            <div className="h-5 bg-slate-100 rounded-full w-24" />
            <div className="h-4 bg-slate-100 rounded flex-1" />
            <div className="h-4 bg-slate-100 rounded w-24" />
          </div>
        ))}
      </div>
    </div>
  )
}