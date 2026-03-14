export default function DayLoading() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="w-16 h-4 rounded-full bg-cream-300 mb-1" />
          <div className="w-48 h-8 rounded-lg bg-cream-300" />
        </div>
        <div className="w-10 h-10 rounded-full bg-cream-200 border border-cream-300" />
      </div>

      {/* Cards Skeleton */}
      <div className="space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white rounded-3xl p-6 shadow-soft border border-cream-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-cream-200" />
              <div>
                <div className="w-24 h-4 rounded-full bg-cream-300 mb-2" />
                <div className="w-48 h-5 rounded-lg bg-cream-300" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="w-full h-4 rounded-full bg-cream-200" />
              <div className="w-11/12 h-4 rounded-full bg-cream-200" />
              <div className="w-4/5 h-4 rounded-full bg-cream-200" />
            </div>
            <div className="mt-4 flex gap-2">
              <div className="w-20 h-6 rounded-full bg-cream-200" />
              <div className="w-24 h-6 rounded-full bg-cream-200" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
