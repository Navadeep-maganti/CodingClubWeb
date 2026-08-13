export default function BlogLoading() {
  return (
    <main className="min-h-screen relative">
      {/* Skeleton hero */}
      <div className="pt-32 pb-12 px-4 relative z-10">
        <div className="max-w-7xl mx-auto text-center">
          <div className="animate-pulse h-8 w-48 mx-auto mb-6 bg-white/5 rounded-full" />
          <div className="animate-pulse h-12 w-3/4 mx-auto mb-6 bg-white/5 rounded-xl" />
          <div className="animate-pulse h-6 w-1/2 mx-auto bg-white/5 rounded-lg" />
        </div>
      </div>

      {/* Skeleton featured */}
      <div className="px-4 mb-20 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse h-96 rounded-3xl bg-white/5" />
        </div>
      </div>

      {/* Skeleton cards */}
      <div className="px-4 pb-20 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="glass-strong rounded-2xl overflow-hidden border border-white/10">
                <div className="h-52 bg-white/5 animate-pulse" />
                <div className="p-6">
                  <div className="h-5 w-3/4 bg-white/5 rounded mb-3 animate-pulse" />
                  <div className="h-4 w-full bg-white/5 rounded mb-2 animate-pulse" />
                  <div className="h-4 w-2/3 bg-white/5 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
