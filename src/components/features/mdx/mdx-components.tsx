import Image from 'next/image'
import { isValidElement, type ReactElement, type ReactNode } from 'react'
import { Alert01Icon, Shield02Icon, Idea01Icon, AlertCircleIcon, Legal01Icon } from 'hugeicons-react'
import { cn } from '@/lib/utils/cn'
import { MermaidDiagram } from './MermaidDiagram'

function Callout({
  children,
  icon: Icon,
  colorClass,
  label,
}: {
  children: ReactNode
  icon: React.ComponentType<{ size?: number; className?: string }>
  colorClass: string
  label: string
}) {
  return (
    <div className={cn('my-6 rounded-lg border-l-4 bg-surface p-4', colorClass)}>
      <div className="flex items-center gap-2 text-sm font-semibold">
        <Icon size={18} />
        {label}
      </div>
      <div className="mt-2 text-sm text-text-secondary [&>p]:m-0">{children}</div>
    </div>
  )
}

export const CehCallout = ({ children }: { children: ReactNode }) => (
  <Callout icon={Alert01Icon} colorClass="border-red text-red" label="CEH / OSCP">
    {children}
  </Callout>
)

export const AuditCallout = ({ children }: { children: ReactNode }) => (
  <Callout icon={Shield02Icon} colorClass="border-green text-green" label="Audit / Conformité">
    {children}
  </Callout>
)

export const TipCallout = ({ children }: { children: ReactNode }) => (
  <Callout icon={Idea01Icon} colorClass="border-blue text-blue" label="Astuce">
    {children}
  </Callout>
)

export const WarningCallout = ({ children }: { children: ReactNode }) => (
  <Callout icon={AlertCircleIcon} colorClass="border-orange text-orange" label="Attention">
    {children}
  </Callout>
)

export const LegalCallout = ({ children }: { children: ReactNode }) => (
  <Callout icon={Legal01Icon} colorClass="border-orange text-orange" label="Cadre légal">
    {children}
  </Callout>
)

export function Figure({
  src,
  alt,
  caption,
  width = 800,
  height = 450,
}: {
  src: string
  alt: string
  caption?: string
  width?: number
  height?: number
}) {
  return (
    <figure className="my-6">
      <div className="overflow-hidden rounded-lg border border-border">
        <Image src={src} alt={alt} width={width} height={height} className="h-auto w-full" />
      </div>
      {caption && <figcaption className="mt-2 text-center text-sm text-text-secondary">{caption}</figcaption>}
    </figure>
  )
}

export function CompareTable({
  titleA,
  titleB,
  rows,
}: {
  titleA: string
  titleB: string
  rows: { a: string; b: string }[]
}) {
  return (
    <div className="my-6 overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr>
            <th className="border-b border-border bg-blue/10 p-3 text-left text-blue">{titleA}</th>
            <th className="border-b border-border bg-red/10 p-3 text-left text-red">{titleB}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              <td className="border-b border-border p-3 text-text-secondary last:border-0">{row.a}</td>
              <td className="border-b border-border p-3 text-text-secondary last:border-0">{row.b}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function Steps({
  steps,
}: {
  steps: { title: string; description: string; code?: string }[]
}) {
  return (
    <ol className="my-6 space-y-4">
      {steps.map((step, i) => (
        <li key={i} className="flex gap-4">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-nyx text-sm font-semibold text-white">
            {i + 1}
          </span>
          <div className="flex-1">
            <p className="font-medium text-text-primary">{step.title}</p>
            <p className="mt-1 text-sm text-text-secondary">{step.description}</p>
            {step.code && (
              <pre className="mt-2 overflow-x-auto rounded-md bg-background p-3 text-sm text-green">
                <code>{step.code}</code>
              </pre>
            )}
          </div>
        </li>
      ))}
    </ol>
  )
}

export function AttackDefenseTable({
  rows,
}: {
  rows: { phase: string; attack: string; defense: string }[]
}) {
  return (
    <div className="my-6 overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr>
            <th className="border-b border-border bg-surface p-3 text-left text-text-primary">Phase</th>
            <th className="border-b border-border bg-red/10 p-3 text-left text-red">Attaque</th>
            <th className="border-b border-border bg-green/10 p-3 text-left text-green">Défense</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              <td className="border-b border-border p-3 font-medium text-text-primary last:border-0">{row.phase}</td>
              <td className="border-b border-border p-3 text-text-secondary last:border-0">{row.attack}</td>
              <td className="border-b border-border p-3 text-text-secondary last:border-0">{row.defense}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function getTextContent(node: ReactNode): string {
  if (typeof node === 'string') return node
  if (typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(getTextContent).join('')
  if (isValidElement(node)) return getTextContent((node.props as { children?: ReactNode }).children)
  return ''
}

function CodeBlock({ children }: { children: ReactNode }) {
  const child = children as ReactElement<{ className?: string; children?: ReactNode }>
  const className = isValidElement(child) ? (child.props.className ?? '') : ''

  if (/language-mermaid/.test(className)) {
    return <MermaidDiagram source={getTextContent(child.props.children)} />
  }

  return <pre>{children}</pre>
}

export const MDX_COMPONENTS = {
  CehCallout,
  AuditCallout,
  TipCallout,
  WarningCallout,
  LegalCallout,
  Figure,
  CompareTable,
  Steps,
  AttackDefenseTable,
  pre: CodeBlock,
  table: ({ children }: { children: ReactNode }) => (
    <div className="my-6 overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">{children}</table>
    </div>
  ),
}
