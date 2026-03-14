'use client'

import { ErrorBoundary } from '@/components/ui/ErrorBoundary'

export default function StudioError() {
  return (
    <div className="min-h-screen bg-cream p-6 flex flex-col items-center justify-center">
      <div className="w-full max-w-lg">
        <ErrorBoundary>
          {/* Force error boundary to show by passing an intentionally bad component if needed, 
              but in Next.js this error.tsx will act as its own boundary hook. 
              We'll use our custom component for consistency. */}
          <div className="p-4 rounded-xl bg-white shadow-soft">
            <h2 className="text-xl font-lexend text-terracotta-700 mb-2">Studio Error</h2>
            <p className="font-inter text-sage-600">
              There was a problem loading the creator studio or generating your curriculum.
            </p>
          </div>
        </ErrorBoundary>
      </div>
    </div>
  )
}
