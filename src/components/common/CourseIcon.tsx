import {
  AiCloud01Icon,
  ApiIcon,
  ArtificialIntelligence01Icon,
  BookOpen01Icon,
  BrainIcon,
  Calculator01Icon,
  ChartBarLineIcon,
  CodeIcon,
  ComputerTerminal01Icon,
  DashboardBrowsingIcon,
  Database01Icon,
  DocumentValidationIcon,
  Globe02Icon,
  GridTableIcon,
  IncognitoIcon,
  Infinity01Icon,
  JusticeScale01Icon,
  Layers01Icon,
  LockComputerIcon,
  LockIcon,
  Search01Icon,
  SecuredNetworkIcon,
  ServerStack01Icon,
  Shield01Icon,
  ShieldKeyIcon,
  UserGroupIcon,
} from 'hugeicons-react'
import type { ComponentType, CSSProperties } from 'react'

type IconComponent = ComponentType<{ size?: number; className?: string; style?: CSSProperties }>

/**
 * Explicit whitelist of the icons referenced by `Course.icon` (see prisma/seed.ts).
 * A namespace import (`import * as Icons`) would pull the entire hugeicons library into every
 * client bundle that renders a course icon. Add new names here when a course uses a new icon.
 */
const ICON_MAP: Record<string, IconComponent> = {
  AiCloud01Icon,
  ApiIcon,
  ArtificialIntelligence01Icon,
  BookOpen01Icon,
  BrainIcon,
  Calculator01Icon,
  ChartBarLineIcon,
  CodeIcon,
  ComputerTerminal01Icon,
  DashboardBrowsingIcon,
  Database01Icon,
  DocumentValidationIcon,
  Globe02Icon,
  GridTableIcon,
  IncognitoIcon,
  Infinity01Icon,
  JusticeScale01Icon,
  Layers01Icon,
  LockComputerIcon,
  LockIcon,
  Search01Icon,
  SecuredNetworkIcon,
  ServerStack01Icon,
  Shield01Icon,
  ShieldKeyIcon,
  UserGroupIcon,
}

/** Renders the hugeicons icon named by `Course.icon`, falling back to a book. */
export function CourseIcon({
  name,
  size,
  className,
  style,
}: {
  name: string
  size?: number
  className?: string
  style?: CSSProperties
}): React.JSX.Element {
  const Icon = ICON_MAP[name] ?? BookOpen01Icon
  return <Icon size={size} className={className} style={style} />
}
