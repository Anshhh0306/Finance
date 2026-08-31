'use client';

import React from 'react';
import { RotateCcw, ShieldCheck, Sparkles } from 'lucide-react';

interface DemoControllerProps {
  onReset: () => void;
  isInterceptionActive?: boolean;
}

export const DemoController: React.FC<DemoControllerProps> = ({
  onReset,
  isInterceptionActive = false,
}) => {
  return (
    <aside
      aria-label="Hackathon Evaluation Controller"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 animate-in slide-in-from-bottom-5 duration-300"
    >
      <button
        id="btn-reset-demo"
        onClick={onReset}
        title="Instantly clear modal state and replay the checkout interception without refreshing the browser"
        className="group relative flex items-center gap-2.5 px-4 py-3 bg-slate-900 hover:bg-black text-white text-xs sm:text-sm font-bold rounded-full shadow-2xl hover:shadow-emerald-500/20 border border-slate-700/80 transition-all hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-emerald-400"
      >
        {/* Animated pulse indicator when interception is active */}
        <span className="relative flex h-2.5 w-2.5">
          <span
            className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${
              isInterceptionActive
                ? 'bg-amber-400 animate-ping'
                : 'bg-emerald-400 animate-pulse'
            }`}
          />
          <span
            className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
              isInterceptionActive ? 'bg-amber-500' : 'bg-emerald-500'
            }`}
          />
        </span>

        <RotateCcw className="w-4 h-4 text-emerald-400 group-hover:rotate-180 transition-transform duration-500" />
        <span>Reset Hackathon Demo</span>

        <span className="hidden md:inline text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
          Replay Loop
        </span>
      </button>
    </aside>
  );
};
