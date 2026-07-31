import {
  Globe02Icon,
  SecuredNetworkIcon,
  IncognitoIcon,
  Search01Icon,
  UserGroupIcon,
  LockIcon,
  DashboardBrowsingIcon,
  ChartBarLineIcon,
  GlobalSearchIcon,
} from 'hugeicons-react'
import type { LabCategory } from '@/domain'

export const LAB_CATEGORY_CONFIG: Record<
  LabCategory,
  { icon: typeof Globe02Icon; color: string; bg: string; label: string }
> = {
  web: { icon: Globe02Icon, color: 'text-blue', bg: 'bg-blue/15', label: 'Web' },
  network: { icon: SecuredNetworkIcon, color: 'text-teal', bg: 'bg-teal/15', label: 'Réseau' },
  exploitation: { icon: IncognitoIcon, color: 'text-red', bg: 'bg-red/15', label: 'Exploitation' },
  dfir: { icon: Search01Icon, color: 'text-orange', bg: 'bg-orange/15', label: 'DFIR' },
  ad: { icon: UserGroupIcon, color: 'text-purple', bg: 'bg-purple/15', label: 'Active Directory' },
  crypto: { icon: LockIcon, color: 'text-yellow-400', bg: 'bg-yellow-400/15', label: 'Cryptographie' },
  soc: { icon: DashboardBrowsingIcon, color: 'text-red', bg: 'bg-red/15', label: 'SOC' },
  ds: { icon: ChartBarLineIcon, color: 'text-pink-400', bg: 'bg-pink-400/15', label: 'Data Science' },
  osint: { icon: GlobalSearchIcon, color: 'text-purple', bg: 'bg-purple/15', label: 'OSINT' },
}
