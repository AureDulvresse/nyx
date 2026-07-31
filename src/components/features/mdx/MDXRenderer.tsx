import { MDXRemote } from 'next-mdx-remote/rsc'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeHighlight from 'rehype-highlight'
import { MDX_COMPONENTS } from './mdx-components'

export function MDXRenderer({ source }: { source: string }) {
  return (
    <div className="prose prose-invert max-w-none prose-headings:text-text-primary prose-p:text-text-secondary prose-strong:text-text-primary prose-a:text-blue prose-code:text-teal prose-pre:bg-background prose-pre:border prose-pre:border-border">
      <MDXRemote
        source={source}
        components={MDX_COMPONENTS}
        options={{
          // Course/lab content is authored by us, not user-submitted — safe to allow JS expressions
          // (object/array literals in component props like `rows={[...]}`). blockDangerousJS stays on.
          blockJS: false,
          mdxOptions: {
            remarkPlugins: [remarkGfm],
            rehypePlugins: [rehypeSlug, rehypeAutolinkHeadings, rehypeHighlight],
          },
        }}
      />
    </div>
  )
}
