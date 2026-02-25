import { useEffect, useRef, useState } from 'react';
import { getSecurityConfig, setVaultPassword, verifyVaultPassword } from '../../services/security';

export function VaultLock() {
  const [enabled, setEnabled] = useState(!!getSecurityConfig()?.enabled);
  const [inactivityMin, setInactivityMin] = useState(5);
  const [password, setPassword] = useState('');
  const [unlockPassword, setUnlockPassword] = useState('');
  const [locked, setLocked] = useState(false);
  const [message, setMessage] = useState('');
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    const cfg = getSecurityConfig();
    if (!cfg?.enabled) return;

    const reset = () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => setLocked(true), cfg.inactivityMs);
    };

    const events = ['mousemove', 'keydown', 'mousedown', 'touchstart'];
    events.forEach((e) => window.addEventListener(e, reset));
    reset();

    return () => {
      events.forEach((e) => window.removeEventListener(e, reset));
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [enabled]);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-800">Vault Lock</h3>
      <p className="mt-1 text-xs text-slate-500">Optional local password lock + inactivity auto-lock.</p>

      {locked ? (
        <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 p-3">
          <p className="text-sm font-medium text-rose-700">Vault is locked</p>
          <input
            type="password"
            value={unlockPassword}
            onChange={(e) => setUnlockPassword(e.target.value)}
            className="mt-2 w-full rounded-lg border border-rose-200 px-3 py-2 text-sm"
            placeholder="Enter password to unlock"
          />
          <button
            onClick={async () => {
              const ok = await verifyVaultPassword(unlockPassword);
              if (ok) {
                setLocked(false);
                setUnlockPassword('');
                setMessage('Unlocked.');
              } else {
                setMessage('Invalid password.');
              }
            }}
            className="mt-2 rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white"
          >
            Unlock
          </button>
        </div>
      ) : null}

      <div className="mt-3 space-y-2">
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
          Enable vault lock
        </label>

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          placeholder="Set/Update password"
        />

        <div className="flex items-center gap-2">
          <input
            type="number"
            min={1}
            max={120}
            value={inactivityMin}
            onChange={(e) => setInactivityMin(Number(e.target.value) || 5)}
            className="w-24 rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
          <span className="text-sm text-slate-600">minutes inactivity auto-lock</span>
        </div>

        <button
          onClick={async () => {
            if (!enabled) {
              setMessage('Lock disabled (UI-only).');
              return;
            }
            if (!password.trim()) {
              setMessage('Password required.');
              return;
            }
            await setVaultPassword(password, inactivityMin * 60 * 1000);
            setMessage('Vault lock configured.');
            setPassword('');
          }}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white"
        >
          Save Security Settings
        </button>

        {message ? <p className="text-xs text-slate-600">{message}</p> : null}
      </div>
    </section>
  );
}
