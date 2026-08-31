import React from 'react';

interface SymbolProps {
  className?: string;
  size?: number;
}

// 1. Money Transfer Symbol: Circular red button with Rupee symbol and bidirectional arrows
export const MoneyTransferSymbol: React.FC<SymbolProps> = ({ className = "w-6 h-6", size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
    <path d="M12 6v2" />
    <path d="M12 16v2" />
  </svg>
);

// 2. BHIM UPI Symbol: Distinctive dual-triangle lightning UPI glyph
export const BhimUpiSymbol: React.FC<SymbolProps> = ({ className = "w-6 h-6", size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <polygon points="13 2 4 14 11 14 9 22 20 10 13 10 13 2" />
  </svg>
);

// 3. Mobile Recharge Symbol: Smartphone with Rupee symbol inside
export const MobileRechargeSymbol: React.FC<SymbolProps> = ({ className = "w-6 h-6", size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
    <path d="M12 18h.01" />
    <path d="M10 7h4" />
    <path d="M10 10h4" />
    <path d="M10 7v7" />
  </svg>
);

// 4. Fixed Deposit / Recurring Deposit (FD/RD) Symbol: Safe locker with lock emblem
export const FdRdSymbol: React.FC<SymbolProps> = ({ className = "w-6 h-6", size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="18" height="18" x="3" y="3" rx="2" />
    <circle cx="12" cy="12" r="3" />
    <path d="M12 15v2" />
  </svg>
);

// 5. Bill Pay Symbol: Invoice document with outgoing arrow
export const BillPaySymbol: React.FC<SymbolProps> = ({ className = "w-6 h-6", size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

// 6. Debit Card Symbol: Chip card with magnetic strip & contactless indicator
export const DebitCardSymbol: React.FC<SymbolProps> = ({ className = "w-6 h-6", size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="20" height="14" x="2" y="5" rx="2" />
    <line x1="2" x2="22" y1="10" y2="10" />
    <line x1="6" x2="10" y1="15" y2="15" />
  </svg>
);

// 7. Account Statement Symbol: Receipt ledger with bullet rows
export const AccountStatementSymbol: React.FC<SymbolProps> = ({ className = "w-6 h-6", size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" />
    <path d="M14 8H8" />
    <path d="M16 12H8" />
    <path d="M13 16H8" />
  </svg>
);

// 8. OneTrack / CommitGuard Health Symbol: Hand interacting with credit score widget
export const OneTrackSymbol: React.FC<SymbolProps> = ({ className = "w-6 h-6", size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="18" height="14" x="3" y="3" rx="2" />
    <path d="m9 10 2 2 4-4" />
    <path d="M12 17v4" />
    <path d="M8 21h8" />
  </svg>
);

// 9. QR Scan Floating Symbol: Viewfinder bracket with QR squares
export const QrScanSymbol: React.FC<SymbolProps> = ({ className = "w-6 h-6", size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 7V5a2 2 0 0 1 2-2h2" />
    <path d="M17 3h2a2 2 0 0 1 2 2v2" />
    <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
    <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
    <rect x="7" y="7" width="3" height="3" fill="currentColor" />
    <rect x="14" y="7" width="3" height="3" fill="currentColor" />
    <rect x="7" y="14" width="3" height="3" fill="currentColor" />
    <path d="M14 14h3v3h-3z" fill="currentColor" />
  </svg>
);
