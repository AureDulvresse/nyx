'use client'

import { useEffect, useState } from 'react'

let mermaidModule: Promise<typeof import('mermaid')> | null = null
function loadMermaid(): Promise<typeof import('mermaid')> {
  if (!mermaidModule) mermaidModule = import('mermaid')
  return mermaidModule
}

let renderCount = 0

// Mermaid computes derived shades from these, so it needs concrete color values rather than
// `var(...)` references — resolve the globals.css tokens at render time instead of duplicating hex.
function getThemeVariables(): Record<string, string> {
  const styles = getComputedStyle(document.documentElement)
  const token = (name: string): string => styles.getPropertyValue(`--${name}`).trim()
  const background = token('background')
  const surface = token('surface')
  const border = token('border')
  const text = token('text-primary')
  const line = token('blue')

  return {
    background,
    primaryColor: token('violet-nyx'),
    primaryTextColor: text,
    primaryBorderColor: token('purple'),
    secondaryColor: surface,
    secondaryTextColor: text,
    secondaryBorderColor: border,
    tertiaryColor: background,
    lineColor: line,
    textColor: text,
    mainBkg: surface,
    nodeBorder: border,
    clusterBkg: surface,
    edgeLabelBackground: background,
    actorBkg: surface,
    actorBorder: border,
    actorTextColor: text,
    signalColor: line,
    signalTextColor: text,
  }
}

export function MermaidDiagram({ source }: { source: string }): React.JSX.Element {
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
          themeVariables: getThemeVariables(),
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
