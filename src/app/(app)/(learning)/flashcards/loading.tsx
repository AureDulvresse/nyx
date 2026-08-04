import { PageLoadingSkeleton } from '@/components/common/PageLoadingSkeleton'

export default function Loading() {
  return <PageLoadingSkeleton variant="grid" count={6} />
}
