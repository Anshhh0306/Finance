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
    <div className="w-full max-w-6xl mx-auto space-y-6 animate-in fade-in duration-200">
      
      {/* Prominent Trust Banner */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-5 text-emerald-950 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2 font-bold text-sm text-emerald-900">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <span>Neutral Public Rate Reference Standard</span>
          </div>
          <p className="text-xs text-emerald-800/90 leading-relaxed">
            <strong>Zero sponsored placements • Zero affiliate kickbacks • Alphabetical default ordering</strong>
          </p>
        </div>
        <div className="text-[11px] font-mono px-3 py-1 bg-white rounded-full border border-emerald-300 text-emerald-800 self-start sm:self-auto shrink-0 shadow-sm">
          Verified Public Data • August 2024
        </div>
      </div>

      {/* Directory Table Card */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 border-b border-slate-200 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th
                  onClick={() => handleSort('name')}
                  className="px-5 py-3.5 cursor-pointer hover:text-slate-900 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    Institution
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </th>
                <th className="px-4 py-3.5">Category</th>
                <th
                  onClick={() => handleSort('1yr')}
                  className="px-4 py-3.5 cursor-pointer hover:text-slate-900 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    1-Year Rate
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('penalty')}
                  className="px-4 py-3.5 cursor-pointer hover:text-slate-900 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    Early Exit Penalty
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </th>
                <th className="px-4 py-3.5">Sr. Citizen (+%)</th>
                <th className="px-5 py-3.5 text-right">Direct Official Portal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {sortedData.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4 font-bold text-slate-900">
                    {item.institutionName}
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700">
                      {item.institutionType.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-4 font-black text-emerald-600 text-sm">
                    {item.oneYearFdRate.toFixed(2)}%
                  </td>
                  <td className="px-4 py-4 font-semibold text-red-600">
                    {item.prematurePenaltyPercent.toFixed(2)}%
                  </td>
                  <td className="px-4 py-4 text-slate-500 font-mono">
                    +{item.seniorCitizenBonusPercent.toFixed(2)}%
                  </td>
                  <td className="px-5 py-4 text-right">
                    <a
                      href={item.officialDirectPortalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-bold text-slate-800 hover:text-emerald-700 hover:underline"
                    >
                      <span>Direct Official Portal</span>
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
