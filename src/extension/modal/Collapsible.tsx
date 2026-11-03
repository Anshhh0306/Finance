import { useState, type ReactNode } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface CollapsibleProps {
  title: ReactNode;
  icon?: ReactNode;
  /** Short figure shown next to the title while collapsed, e.g. "25.24% APR". */
  badge?: ReactNode;
  /** "section" rows sit in the details list; "nested" rows sit inside a section. */
  variant?: 'section' | 'nested';
  className?: string;
  children: ReactNode;
}

export function Collapsible({ title, icon, badge, variant = 'section', className = 'space-y-3', children }: CollapsibleProps) {
  const [open, setOpen] = useState(false);
  const nested = variant === 'nested';
  const Chevron = open ? ChevronUp : ChevronDown;
  return (
    <div className={nested ? 'border-t border-ledger-rule pt-1' : undefined}>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className={
          nested
            ? 'w-full py-2 flex items-center justify-between text-xs font-semibold text-ledger-navy/70 hover:text-ledger-navy transition-colors'
            : 'w-full px-3.5 py-2.5 flex items-center justify-between text-sm font-semibold text-ledger-navy hover:bg-ledger-paper/60 transition-colors'
        }
      >
        <span className={`flex items-center ${nested ? 'gap-1.5' : 'gap-2'}`}>
          {icon}
          {title}
          {badge}
        </span>
        <Chevron className={nested ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
      </button>
      {open && <div className={`${nested ? 'pb-1' : 'px-3.5 pb-3.5'} ${className}`}>{children}</div>}
    </div>
  );
}
