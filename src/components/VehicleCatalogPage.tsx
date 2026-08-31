'use client';

import React from 'react';
import {
  ShieldCheck,
  Bike,
  Gauge,
  Zap,
  CheckCircle2,
  Lock,
  ArrowRight,
  TrendingUp,
  Fuel,
  Award,
} from 'lucide-react';

interface VehicleCatalogPageProps {
  onCalculateLoan: () => void;
  isLoanAuthorized: boolean;
  onReset: () => void;
}

export const VehicleCatalogPage: React.FC<VehicleCatalogPageProps> = ({
  onCalculateLoan,
  isLoanAuthorized,
  onReset,
}) => {
  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 animate-in fade-in duration-200">
      
      {/* Vehicle Product Presentation Hero */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left Column: Visual Mock & Badge (6 Cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 p-8 text-white aspect-[4/3] flex flex-col justify-between overflow-hidden shadow-xl border border-slate-700">
            
            {/* Top Badges */}
            <div className="flex items-center justify-between z-10">
              <span className="px-3 py-1 rounded-full bg-red-600/90 text-white text-[11px] font-black tracking-wider uppercase">
                HyperSport 2026 Edition
              </span>
              <span className="text-xs text-slate-300 font-mono flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Verified Dealership
              </span>
            </div>

            {/* Center Vehicle Emblem / Graphic */}
            <div className="my-auto flex flex-col items-center justify-center space-y-2 z-10">
              <div className="w-24 h-24 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-2xl">
                <Bike className="w-14 h-14 text-white" />
              </div>
              <div className="text-center">
                <div className="text-lg font-black tracking-tight">Panigale V4 R Superbike</div>
                <div className="text-xs text-slate-400 font-mono">998cc Desmosedici Stradale • 218 HP</div>
              </div>
            </div>

            {/* Spec Ribbon */}
            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/10 text-center z-10">
              <div>
                <div className="text-xs font-bold text-white">2.8s</div>
                <div className="text-[10px] text-slate-400">0-100 km/h</div>
              </div>
              <div>
                <div className="text-xs font-bold text-white">315 km/h</div>
                <div className="text-[10px] text-slate-400">Top Speed</div>
              </div>
              <div>
                <div className="text-xs font-bold text-white">167 kg</div>
                <div className="text-[10px] text-slate-400">Dry Weight</div>
              </div>
            </div>

            {/* Background Glow */}
            <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-red-600/20 rounded-full blur-3xl pointer-events-none" />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span className="flex items-center gap-1">
              <Award className="w-4 h-4 text-slate-400" />
              Euro 5+ Homologated
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Fuel className="w-4 h-4 text-slate-400" />
              16L Carbon Fuel Cell
            </span>
            <span>•</span>
            <span>Zero Odometer • In Showroom</span>
          </div>
        </div>

        {/* Right Column: Pricing & Financing Action (6 Cols) */}
        <div className="lg:col-span-6 space-y-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
              <span>Apex Performance Series</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Apex V4 R Carbon Superbike
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Factory racing setup with titanium Akrapovič exhaust, dry slipper clutch, and forged Marchesini magnesium wheels.
            </p>
          </div>

          {/* Pricing Box */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-xs text-slate-500 font-medium">Ex-Showroom Price</span>
                <div className="text-3xl sm:text-4xl font-black text-slate-900">
                  ₹15,00,000.00
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                Financing Available
              </span>
            </div>

            <div className="pt-3 border-t border-slate-200 grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-500">Advertised Loan Rate:</span>
                <div className="font-bold text-slate-800">10.0% Flat APR</div>
              </div>
              <div>
                <span className="text-slate-500">Standard Tenure:</span>
                <div className="font-bold text-slate-800">36 Months (3 Years)</div>
              </div>
            </div>
          </div>

          {/* Point-of-Sale Hook Notice */}
          <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200/80 text-xs text-indigo-900 space-y-1">
            <div className="flex items-center gap-2 font-bold">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              <span>CommitGuard Behavioral "Time vs. Debt" Hook</span>
            </div>
            <p className="text-[11px] leading-relaxed text-indigo-800/90">
              Clicking below halts the financing flow to compare the total wealth loss of borrowing ₹15L today versus compounding an inflation-adjusted purchase goal.
            </p>
          </div>

          {/* Primary Action Button: "Calculate Auto Loan" */}
          <div className="space-y-2">
            <button
              id="btn-calculate-auto-loan"
              onClick={onCalculateLoan}
              className="w-full py-4 px-6 rounded-2xl bg-slate-900 hover:bg-black text-white text-sm font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 group active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
              <Zap className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
              <span>Calculate Auto Loan & Financing Terms</span>
              <ArrowRight className="w-4 h-4 ml-1 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </button>
            <div className="text-center text-[10px] text-slate-400">
              Triggers the CommitGuard Pre-Commitment Interceptor before loan authorization.
            </div>
          </div>

        </div>

      </div>

      {/* Confirmation State if user proceeded */}
      {isLoanAuthorized && (
        <div className="max-w-xl mx-auto p-8 rounded-2xl bg-white border border-emerald-200 shadow-xl text-center space-y-4 animate-in zoom-in-95 duration-200">
          <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Vehicle Financing Simulation Reviewed
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            The customer was presented with the full <strong>₹2.42L Interest Burn</strong> trade-off vs <strong>Sovereign/Equity Compounding</strong> before committing capital.
          </p>
          <button
            onClick={onReset}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition-all shadow"
          >
            Reset Vehicle Simulation
          </button>
        </div>
      )}

    </div>
  );
};
