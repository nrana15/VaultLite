import { useMemo, useState } from 'react';

interface CredentialItem {
  id: string;
  service: string;
  username: string;
  password: string;
  notes?: string;
  updatedAt: string;
}

const storageKey = 'vaultlite.credentials';

function loadItems(): CredentialItem[] {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CredentialItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveItems(items: CredentialItem[]) {
  localStorage.setItem(storageKey, JSON.stringify(items));
}

function uid() {
  return `cred-${Math.random().toString(36).slice(2, 10)}`;
}

export function CredentialVault() {
  const [items, setItems] = useState<CredentialItem[]>(() => loadItems());
  const [service, setService] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [notes, setNotes] = useState('');
  const [query, setQuery] = useState('');
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (i) =>
        i.service.toLowerCase().includes(q) ||
        i.username.toLowerCase().includes(q) ||
        (i.notes ?? '').toLowerCase().includes(q),
    );
  }, [items, query]);

  const update = (next: CredentialItem[]) => {
    setItems(next);
    saveItems(next);
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-800">Credential Vault</h3>
      <p className="mt-1 text-xs text-slate-500">Store service login details locally for quick lookup.</p>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <input value={service} onChange={(e) => setService(e.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="Service (e.g. AWS)" />
        <input value={username} onChange={(e) => setUsername(e.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="Username / Email" />
        <input value={password} onChange={(e) => setPassword(e.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="Password / token" />
        <input value={notes} onChange={(e) => setNotes(e.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="Notes" />
      </div>
      <button
        onClick={() => {
          if (!service.trim() || !username.trim() || !password.trim()) return;
          const now = new Date().toISOString();
          update([
            { id: uid(), service: service.trim(), username: username.trim(), password, notes: notes.trim(), updatedAt: now },
            ...items,
          ]);
          setService('');
          setUsername('');
          setPassword('');
          setNotes('');
        }}
        className="mt-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white"
      >
        Save Credential
      </button>

      <div className="mt-4">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          placeholder="Search service, username, notes..."
        />
      </div>

      <div className="mt-3 space-y-2">
        {visible.map((item) => (
          <article key={item.id} className="rounded-lg border border-slate-200 p-2 text-sm">
            <div className="flex items-center justify-between gap-2">
              <p className="font-medium text-slate-800">{item.service}</p>
              <p className="text-xs text-slate-500">{new Date(item.updatedAt).toLocaleString()}</p>
            </div>
            <p className="text-xs text-slate-600">{item.username}</p>
            <p className="mt-1 font-mono text-xs text-slate-700">
              {revealed[item.id] ? item.password : '••••••••••••'}
            </p>
            {item.notes ? <p className="mt-1 text-xs text-slate-500">{item.notes}</p> : null}

            <div className="mt-2 flex flex-wrap gap-2 text-xs">
              <button
                onClick={() => setRevealed((prev) => ({ ...prev, [item.id]: !prev[item.id] }))}
                className="rounded border border-slate-300 px-2 py-1 hover:bg-slate-50"
              >
                {revealed[item.id] ? 'Hide' : 'Show'}
              </button>
              <button
                onClick={async () => {
                  await navigator.clipboard.writeText(item.password);
                }}
                className="rounded border border-slate-300 px-2 py-1 hover:bg-slate-50"
              >
                Copy Password
              </button>
              <button
                onClick={() => update(items.filter((i) => i.id !== item.id))}
                className="rounded border border-rose-300 px-2 py-1 text-rose-700 hover:bg-rose-50"
              >
                Delete
              </button>
            </div>
          </article>
        ))}
        {visible.length === 0 ? <p className="text-xs text-slate-500">No credentials saved.</p> : null}
      </div>
    </section>
  );
}
