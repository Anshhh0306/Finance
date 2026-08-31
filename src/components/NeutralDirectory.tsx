'use client';

import React, { useState } from 'react';
import { NEUTRAL_RATE_DIRECTORY } from '@/lib/neutral-directory';
import { ExternalLink, ArrowUpDown, ShieldCheck } from 'lucide-react';

export const NeutralDirectory: React.FC = () => {
  const [sortKey, setSortKey] = useState<'name' | '1yr' | 'penalty'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const handleSort = (key: 'name' | '1yr' | 'penalty') => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const sortedData = [...NEUTRAL_RATE_DIRECTORY].sort((a, b) => {
    if (sortKey === 'name') {
      return sortOrder === 'asc'
        ? a.institutionName.localeCompare(b.institutionName)
        : b.institutionName.localeCompare(a.institutionName);
    }
    if (sortKey === '1yr') {
      return sortOrder === 'asc'
        ? a.oneYearFdRate - b.oneYearFdRate
        : b.oneYearFdRate - a.oneYearFdRate;
    }
    if (sortKey === 'penalty') {
      return sortOrder === 'asc'
        ? a.prematurePenaltyPercent - b.prematurePenaltyPercent
        : b.prematurePenaltyPercent - a.prematurePenaltyPercent;
    }
    return 0;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-white/5">
        <div>
          <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-brand-500" />
            Unranked Neutral Public Rate Reference Directory
          </h3>
          <p className="text-xs text-slate-400">
            Zero sponsored placements • Zero affiliate kickbacks • Alphabetical default ordering
          </p>
        </div>
        <div className="text-[11px] text-slate-500 font-mono">
          Last Verified: August 2024
        </div>
      </div>

      <div className="border border-white/5 rounded-xl overflow-hidden bg-surface-100/60">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-200/80 text-slate-400 border-b border-white/5 font-medium">
              <tr>
                <th
                  onClick={() => handleSort('name')}
                  className="px-4 py-3 cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1">
                    Institution
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="px-3.5 py-3">Category</th>
                <th
                  onClick={() => handleSort('1yr')}
                  className="px-3.5 py-3 cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1">
                    1-Year Rate
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('penalty')}
                  className="px-3.5 py-3 cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1">
                    Early Exit Penalty
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="px-3.5 py-3">Sr. Citizen (+%)</th>
                <th className="px-4 py-3 text-right">Direct Official Portal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {sortedData.map((item) => (
                <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3 font-medium text-white">
                    {item.institutionName}
                  </td>
                  <td className="px-3.5 py-3">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-surface-300 border border-white/5 text-slate-400">
                      {item.institutionType}
                    </span>
                  </td>
                  <td className="px-3.5 py-3 font-mono font-semibold text-accent-emerald">
                    {item.oneYearFdRate.toFixed(2)}%
                  </td>
                  <td className="px-3.5 py-3 font-mono text-accent-amber">
                    {item.prematurePenaltyPercent.toFixed(2)}%
                  </td>
                  <td className="px-3.5 py-3 font-mono text-slate-400">
                    +{item.seniorCitizenBonusPercent.toFixed(2)}%
                  </td>
                  <td className="px-4 py-3 text-right">
                    <a
                      href={item.officialDirectPortalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-brand-500 hover:text-brand-100 font-medium transition-colors"
                    >
                      Visit Direct
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
