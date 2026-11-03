import type { ReactNode } from 'react';

/** A small toggle button; the active one is filled navy. */
export function Chip({ active, onClick, className = 'px-2.5 py-1 text-xs font-semibold', children }: { active: boolean; onClick: () => void; className?: string; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`${className} border transition-colors ${
        active ? 'bg-ledger-navy text-white border-ledger-navy' : 'bg-white text-ledger-navy/70 border-ledger-rule hover:border-ledger-navy/40'
      }`}
    >
      {children}
    </button>
  );
}
