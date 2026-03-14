export default function CalendarLoading() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-4 h-4 rounded-full bg-cream-300" />
          <div className="w-32 h-3 rounded-full bg-cream-300" />
        </div>
        <div className="w-64 h-8 rounded-lg bg-cream-300 mt-2 mb-3" />
        <div className="w-48 h-4 rounded-full bg-cream-300" />
      </div>

      {/* Calendar Grid Skeleton */}
      <div className="bg-white rounded-3xl shadow-soft p-6">
        <div className="grid grid-cols-7 gap-1.5 mb-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={`header-${i}`} className="h-6 mx-auto w-6 rounded-md bg-cream-200" />
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1.5 md:gap-2">
          {Array.from({ length: 35 }).map((_, i) => (
            <div
              key={`cell-${i}`}
              className="aspect-square rounded-2xl bg-cream-200 border border-cream-100"
            />
          ))}
        </div>
      </div>

      {/* Legend Skeleton */}
      <div className="flex flex-wrap gap-4 mt-5">
        <div className="w-16 h-4 rounded-full bg-cream-300" />
        <div className="w-20 h-4 rounded-full bg-cream-300" />
        <div className="w-24 h-4 rounded-full bg-cream-300" />
      </div>
    </div>
  )
}
