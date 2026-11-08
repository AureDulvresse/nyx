import { PageLoadingSkeleton } from '@/components/common/PageLoadingSkeleton'

export default function Loading(): React.JSX.Element {
  return <PageLoadingSkeleton variant="grid" count={9} />
}
