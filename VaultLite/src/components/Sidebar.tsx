import { BookOpen, Database, BarChart3, Settings } from 'lucide-react';

const nav = [
  { label: 'Vault', icon: Database },
  { label: 'Review', icon: BookOpen },
  { label: 'Analytics', icon: BarChart3 },
  { label: 'Settings', icon: Settings },
];

export function Sidebar() {
  return (
    <aside className="w-56 border-r border-slate-200 bg-white p-4">
      <h1 className="mb-6 text-lg font-semibold">VaultLite</h1>
      <nav className="space-y-2">
        {nav.map(({ label, icon: Icon }) => (
          <button
            key={label}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-100"
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </nav>
    </aside>
  );
}
