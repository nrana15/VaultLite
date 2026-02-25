import { useRef, useState } from 'react';
import { exportVaultBundle, importVaultBundle } from './importExportRepository';

export function ImportExportPanel() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState('');

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-800">Import / Export</h3>
      <p className="mt-1 text-xs text-slate-500">Portable zip backup with full restore + FTS rebuild.</p>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          onClick={async () => {
            try {
              const blob = await exportVaultBundle();
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `vaultlite-export-${new Date().toISOString().slice(0, 10)}.zip`;
              a.click();
              URL.revokeObjectURL(url);
              setStatus('Export completed.');
            } catch (e) {
              setStatus(`Export failed: ${e instanceof Error ? e.message : 'unknown error'}`);
            }
          }}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white"
        >
          Export ZIP
        </button>

        <button
          onClick={() => fileRef.current?.click()}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
        >
          Import ZIP
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".zip"
          className="hidden"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            try {
              await importVaultBundle(file);
              setStatus('Import completed. Please reload open views if needed.');
            } catch (err) {
              setStatus(`Import failed: ${err instanceof Error ? err.message : 'unknown error'}`);
            }
          }}
        />
      </div>

      {status ? <p className="mt-2 text-xs text-slate-600">{status}</p> : null}
    </section>
  );
}
