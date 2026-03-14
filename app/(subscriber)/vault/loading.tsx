export default function VaultLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-4 h-4 rounded-full bg-cream-300" />
          <div className="w-24 h-3 rounded-full bg-cream-300" />
        </div>
        <div className="w-48 h-8 rounded-lg bg-cream-300 mb-2 mt-2" />
        <div className="w-64 h-4 rounded-full bg-cream-300" />
      </div>

      {/* Categories Skeleton */}
      <div className="space-y-10">
        {[1, 2].map(section => (
          <section key={section}>
            <div className="w-40 h-6 rounded-lg bg-cream-300 mb-4" />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {[1, 2, 3].map(card => (
                <div key={card} className="h-48 rounded-3xl bg-white border border-cream-200 shadow-soft p-5">
                  <div className="w-10 h-10 rounded-xl bg-cream-200 mb-3" />
                  <div className="w-3/4 h-4 rounded-full bg-cream-300 mb-2" />
                  <div className="w-1/2 h-3 rounded-full bg-cream-200" />
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
