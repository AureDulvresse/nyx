import { Skeleton } from './Skeleton'

// Shared by every route's loading.tsx — grid matches card-based explorers (courses, labs,
// flashcards, projects), list matches row-based pages (notes, cheatsheet, TP, certifications).
export function PageLoadingSkeleton({ variant = 'grid', count = 6 }: { variant?: 'grid' | 'list'; count?: number }) {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>
      {variant === 'grid' ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: count }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {Array.from({ length: count }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      )}
    </div>
  )
}
