'use client'

import { useEffect, useRef, useState } from 'react'

let mermaidModule: Promise<typeof import('mermaid')> | null = null
function loadMermaid() {
  if (!mermaidModule) mermaidModule = import('mermaid')
  return mermaidModule
}

let renderCount = 0

export function MermaidDiagram({ source }: { source: string }) {
  const [svg, setSvg] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    loadMermaid()
      .then(async ({ default: mermaid }) => {
        mermaid.initialize({
          startOnLoad: false,
          theme: 'dark',
          securityLevel: 'strict',
          fontFamily: 'var(--font-geist-sans), sans-serif',
          themeVariables: {
            background: '#0d1117',
            primaryColor: '#7c3aed',
            primaryTextColor: '#e6edf3',
            primaryBorderColor: '#a371f7',
            secondaryColor: '#161b22',
            secondaryTextColor: '#e6edf3',
            secondaryBorderColor: '#30363d',
            tertiaryColor: '#0d1117',
            lineColor: '#58a6ff',
            textColor: '#e6edf3',
            mainBkg: '#161b22',
            nodeBorder: '#30363d',
            clusterBkg: '#161b22',
            edgeLabelBackground: '#0d1117',
            actorBkg: '#161b22',
            actorBorder: '#30363d',
            actorTextColor: '#e6edf3',
            signalColor: '#58a6ff',
            signalTextColor: '#e6edf3',
          },
        })

        const id = `mermaid-diagram-${renderCount++}`
        const { svg: renderedSvg } = await mermaid.render(id, source)
        if (!cancelled) setSvg(renderedSvg)
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Erreur de rendu du diagramme')
      })

    return () => {
      cancelled = true
    }
  }, [source])

  if (error) {
    return (
      <div className="my-6 rounded-lg border border-red/30 bg-red/5 p-4 text-sm text-red">
        Impossible d&apos;afficher ce diagramme ({error}). Source :
        <pre className="mt-2 overflow-x-auto rounded bg-background p-3 text-xs text-text-secondary">{source}</pre>
      </div>
    )
  }

  if (!svg) {
    return <div className="my-6 h-48 w-full animate-pulse rounded-lg border border-border bg-surface" />
  }

  // The rendered content is Mermaid's own SVG output compiled from course/lab markdown we author
  // ourselves (never user-submitted), matching the same trust boundary as MDXRenderer's `blockJS`.
  return (
    <div
      className="my-6 flex justify-center overflow-x-auto rounded-lg border border-border bg-surface p-6 [&_svg]:mx-auto [&_svg]:max-w-full"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}
