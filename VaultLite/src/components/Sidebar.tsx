import { BookOpen, Database, BarChart3, Settings } from 'lucide-react';

export type NavTab = 'Vault' | 'Review' | 'Analytics' | 'Settings';

const nav: Array<{ label: NavTab; icon: typeof Database }> = [
  { label: 'Vault', icon: Database },
  { label: 'Review', icon: BookOpen },
  { label: 'Analytics', icon: BarChart3 },
  { label: 'Settings', icon: Settings },
];

interface SidebarProps {
  activeTab: NavTab;
  onSelect: (tab: NavTab) => void;
}

export function Sidebar({ activeTab, onSelect }: SidebarProps) {
  return (
    <aside className="w-56 border-r border-slate-200 bg-white p-4">
      <h1 className="mb-6 text-lg font-semibold">VaultLite</h1>
      <nav className="space-y-2">
        {nav.map(({ label, icon: Icon }) => {
          const isActive = activeTab === label;
          return (
            <button
              key={label}
              onClick={() => onSelect(label)}
              className={`flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition ${
                isActive ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
