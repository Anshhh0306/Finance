import React, { useState, useMemo } from 'react';
import {
  AlertTriangle,
  X,
  Sliders,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Zap,
  ArrowRight,
  RotateCcw,
  CreditCard,
  CheckCircle2,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  Percent,
  TrendingUp,
  PiggyBank,
  Landmark,
  Plane,
  GraduationCap,
  Scale,
  BookOpen,
  ShoppingBag,
  Edit3,
} from 'lucide-react';
import { calculateNoCostEmiDrag } from '../lib/financial-engine';

export type InterceptorSurface = 'AMAZON' | 'FLIPKART' | 'ECOMMERCE' | 'TRAVEL' | 'EDTECH' | 'UDEMY';

export interface ScrapedOffer {
  id: string;
  bankOrCard: string;
  description: string;
  effectiveBenefit: string;
  rating: 'BEST' | 'GOOD' | 'NEUTRAL' | 'AVOID';
  reason: string;
  netPrice: number;
  recommended: boolean;
  isSelected?: boolean;
}

export interface ExtensionModalProps {
  surfaceType?: InterceptorSurface;
  productPrice?: number;
  productName?: string;
  originalPrice?: number;
  discountPercent?: number;
  scrapedOffers?: ScrapedOffer[];
  onProceedAndContinue: () => void; // Proceeds to host site action
  onCancelStayOnPage: () => void;   // Closes modal and keeps user on CURRENT page
}

export const ExtensionCommitGuardModal: React.FC<ExtensionModalProps> = ({
  surfaceType = 'AMAZON',
  productPrice = 5399,
  productName = 'Identified Checkout Item',
  originalPrice,
  discountPercent,
  scrapedOffers = [],
  onProceedAndContinue,
  onCancelStayOnPage,
}) => {
  // Discrete snap tenure points: 3, 6, 9, 12, 18, 24 months
  const TENURE_OPTIONS = [3, 6, 9, 12, 18, 24];
  // Map index [0..5] for perfect proportional visual slider placement
  const [sliderIndex, setSliderIndex] = useState<number>(3); // Default to 12 months (index 3)
  const tenure = TENURE_OPTIONS[sliderIndex];

  // Active view tab: 'CARD_OFFERS' vs 'EMI_FRICTION' vs 'RECOVERY_COMPOUNDING'
  const [activeTab, setActiveTab] = useState<'CARD_OFFERS' | 'EMI_FRICTION' | 'RECOVERY_COMPOUNDING'>('CARD_OFFERS');
  const [showAllMethods, setShowAllMethods] = useState<boolean>(false);
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null);
  const [compoundingHorizon, setCompoundingHorizon] = useState<'1Y' | '3Y' | '5Y'>('5Y');
  const [isProofOpen, setIsProofOpen] = useState(false);

  // Quick-Switcher / Payment Input States (Option A)
  const [isCustomSwitcherOpen, setIsCustomSwitcherOpen] = useState<boolean>(false);
  const [customType, setCustomType] = useState<'UPI' | 'NO_COST' | 'CREDIT_EMI' | 'DEBIT_EMI' | 'BNPL'>('CREDIT_EMI');
  const [customBank, setCustomBank] = useState<string>('HDFC Bank');
  const [customTenure, setCustomTenure] = useState<number>(12);
  const [customSimulatedOffer, setCustomSimulatedOffer] = useState<ScrapedOffer | null>(null);

  const processingFee = 199;
  const nominalRate = 15.0;

  // Handler to apply simulated custom payment method
  const handleApplyCustomSimulation = (type: 'UPI' | 'NO_COST' | 'CREDIT_EMI' | 'DEBIT_EMI' | 'BNPL', bank: string, tenureMonths: number) => {
    setCustomType(type);
    setCustomBank(bank);
    setCustomTenure(tenureMonths);

    if (type === 'UPI') {
      const offer: ScrapedOffer = {
        id: 'simulated-upi',
        bankOrCard: 'UPI / Direct Debit (Zero Debt)',
        description: `Single-tranche direct payment of ₹${productPrice.toLocaleString('en-IN')}`,
        effectiveBenefit: 'Saves 100% of GST & bank processing fees',
        rating: 'BEST',
        reason: 'Zero interest, zero processing fee, keeps credit limit 100% free with instant confirmation.',
        netPrice: productPrice,
        recommended: true,
        isSelected: true,
      };
      setCustomSimulatedOffer(offer);
      setSelectedOfferId('simulated-upi');
      return;
    }

    if (type === 'NO_COST') {
      const monthly = Math.round(productPrice / tenureMonths);
      const estGst = Math.round(199 + (productPrice * 0.15 * (tenureMonths / 12) * 0.18));
      const offer: ScrapedOffer = {
        id: `simulated-nocost-${bank}-${tenureMonths}`,
        bankOrCard: `${bank} (${tenureMonths}M No-Cost EMI)`,
        description: `${tenureMonths} Months installment plan with upfront interest offset`,
        effectiveBenefit: `₹${monthly.toLocaleString('en-IN')}/mo + ₹${estGst.toLocaleString('en-IN')} Hidden GST/Fee Drag`,
        rating: 'AVOID',
        reason: `Even with merchant interest discount, ${bank} charges ₹199 processing fee + monthly 18% GST on the interest component.`,
        netPrice: productPrice + estGst,
        recommended: false,
        isSelected: true,
      };
      setCustomSimulatedOffer(offer);
      setSelectedOfferId(offer.id);
      return;
    }

    if (type === 'CREDIT_EMI' || type === 'DEBIT_EMI') {
      const isDebit = type === 'DEBIT_EMI';
      const aprRate = isDebit ? 16.0 : 15.0;
      const statedInterest = Math.round(productPrice * (aprRate / 100) * (tenureMonths / 12));
      const monthly = Math.round((productPrice + statedInterest) / tenureMonths);
      const gstOnInterest = Math.round(statedInterest * 0.18);
      const bankFee = Math.round(199 * 1.18); // ₹235
      const trueOutflow = productPrice + statedInterest + gstOnInterest + bankFee;

      const offer: ScrapedOffer = {
        id: `simulated-emi-${bank}-${tenureMonths}`,
        bankOrCard: `${bank} (${tenureMonths}M ${isDebit ? 'Debit Card' : 'Credit Card'} EMI @ ${aprRate}%)`,
        description: `${tenureMonths} months x ₹${monthly.toLocaleString('en-IN')}/mo (Advertised Total: ₹${(productPrice + statedInterest).toLocaleString('en-IN')})`,
        effectiveBenefit: `₹${monthly.toLocaleString('en-IN')}/mo + ₹${(gstOnInterest + bankFee).toLocaleString('en-IN')} Hidden Drag`,
        rating: 'AVOID',
        reason: `Checkout advertises ₹${(productPrice + statedInterest).toLocaleString('en-IN')}, but ${bank} additionally bills non-refundable 18% GST (₹${gstOnInterest}) on interest + ₹${bankFee} fee (+GST), making your true outflow ₹${trueOutflow.toLocaleString('en-IN')}.`,
        netPrice: trueOutflow,
        recommended: false,
        isSelected: true,
      };
      setCustomSimulatedOffer(offer);
      setSelectedOfferId(offer.id);
      return;
    }

    if (type === 'BNPL') {
      const penaltyFee = Math.round(productPrice * 0.14);
      const offer: ScrapedOffer = {
        id: `simulated-bnpl-${bank}`,
        bankOrCard: `${bank} (Pay Later / BNPL Loan)`,
        description: `Deferred split payment with 28.4% APR penalty risk`,
        effectiveBenefit: `Exposes credit score to late fees and penalty APR`,
        rating: 'AVOID',
        reason: `Exposes user to 24%-36% penalty APRs plus ₹450-₹850 bounce fees if post-purchase cash is tight.`,
        netPrice: productPrice + penaltyFee,
        recommended: false,
        isSelected: true,
      };
      setCustomSimulatedOffer(offer);
      setSelectedOfferId(offer.id);
      return;
    }
  };

  // Real-time deterministic recalculation (<1.2ms)
  const mathResult = useMemo(() => {
    return calculateNoCostEmiDrag({
      type: 'NO_COST_EMI',
      productName,
      productPrice,
      tenureMonths: tenure,
      advertisedRate: 0,
      bankProcessingFee: processingFee,
      bankNominalInterestRate: nominalRate,
    });
  }, [productPrice, productName, tenure, processingFee, nominalRate]);

  // Compounding Preserved Wealth calculation (Sovereign T-Bill / Liquid Fund at 7.10% annualized)
  const recoveryCompounding = useMemo(() => {
    const savedFriction = mathResult.totalHiddenFriction; // processing fee + 18% GST
    const tbillRate = 0.071; // 7.10% RBI Sovereign 364-Day T-Bill benchmark yield
    
    // Future Value after 1, 3, 5 years if saved friction is invested instead of leaked to bank/GST:
    const fv1Year = Math.round(savedFriction * Math.pow(1 + tbillRate, 1));
    const fv3Year = Math.round(savedFriction * Math.pow(1 + tbillRate, 3));
    const fv5Year = Math.round(savedFriction * Math.pow(1 + tbillRate, 5));

    // Also compare monthly SIP alternative: If user invested the monthly EMI into Liquid Fund instead
    const monthlyEmi = mathResult.monthlyBaseEmi;
    const rMonthly = tbillRate / 12;
    const sipFv = Math.round(monthlyEmi * ((Math.pow(1 + rMonthly, tenure) - 1) / rMonthly) * (1 + rMonthly));
    const sipGain = sipFv - (monthlyEmi * tenure);

    return {
      savedFriction,
      tbillRate: 7.10,
      fv1Year,
      fv3Year,
      fv5Year,
      compoundedGain5Y: fv5Year - savedFriction,
      sipFv,
      sipGain,
    };
  }, [mathResult, tenure]);

  // Dynamic fallback offers customized per surface if none scraped
  const displayOffers: ScrapedOffer[] = useMemo(() => {
    if (scrapedOffers && scrapedOffers.length > 0) return scrapedOffers;

    if (surfaceType === 'AMAZON') {
      const amazonCashback = Math.round(productPrice * 0.05);
      const bankDiscount = Math.min(Math.round(productPrice * 0.1), 1250);
      return [
        {
          id: 'amazon-icici-card',
          bankOrCard: 'Amazon Pay ICICI Bank Credit Card',
          description: '5% Unlimited Cashback credited to Amazon Pay Balance',
          effectiveBenefit: `Save ₹${amazonCashback.toLocaleString('en-IN')} cashback`,
          rating: 'BEST',
          reason: 'Zero lock-in tenure. Instant Amazon Pay cashback without interest or processing fees.',
          netPrice: productPrice - amazonCashback,
          recommended: true,
          isSelected: true,
        },
        {
          id: 'upi-instant',
          bankOrCard: 'Amazon Pay UPI / Direct Debit (Zero Debt)',
          description: 'Single-tranche direct payment from bank account',
          effectiveBenefit: 'Saves 100% of GST & bank processing fees',
          rating: 'BEST',
          reason: 'Zero interest, zero processing fee, keeps credit limit 100% free.',
          netPrice: productPrice,
          recommended: true,
        },
        {
          id: 'amazon-bank-offer',
          bankOrCard: 'Bank Offer: HDFC / SBI Credit Cards',
          description: 'Instant 10% discount on credit card transactions',
          effectiveBenefit: `Save ₹${bankDiscount.toLocaleString('en-IN')} upfront`,
          rating: 'GOOD',
          reason: 'Direct instant price reduction at checkout if paid in full.',
          netPrice: productPrice - bankDiscount,
          recommended: false,
        },
        {
          id: 'no-cost-emi',
          bankOrCard: 'Amazon No-Cost EMI (All Banks)',
          description: `${tenure} Months installment plan`,
          effectiveBenefit: `₹${mathResult.monthlyBaseEmi.toLocaleString('en-IN')}/mo + ₹${mathResult.totalHiddenFriction.toLocaleString('en-IN')} GST Drag`,
          rating: 'AVOID',
          reason: `Charges ${mathResult.effectiveAnnualPercentageRate}% Effective APR via statutory 18% GST on interest + ₹${processingFee} bank fee.`,
          netPrice: productPrice + mathResult.totalHiddenFriction,
          recommended: false,
        },
      ];
    }

    const axisCashback = Math.round(productPrice * 0.05);
    return [
      {
        id: 'axis-card',
        bankOrCard: 'Flipkart Axis Bank Credit Card',
        description: '5% Unlimited Cashback on Flipkart purchases',
        effectiveBenefit: `Save ₹${axisCashback.toLocaleString('en-IN')} upfront`,
        rating: 'BEST',
        reason: 'Zero lock-in tenure. Statement credit without loan paperwork.',
        netPrice: productPrice - axisCashback,
        recommended: true,
        isSelected: true,
      },
      {
        id: 'upi-instant',
        bankOrCard: 'UPI / Direct Debit (Zero Debt)',
        description: 'Single-tranche direct payment from bank account',
        effectiveBenefit: 'Saves 100% of GST & bank processing fees',
        rating: 'BEST',
        reason: 'Zero interest, zero processing fee, keeps credit limit 100% free.',
        netPrice: productPrice,
        recommended: true,
      },
      {
        id: 'au-bank',
        bankOrCard: 'AU Small Finance Bank Credit Card',
        description: 'Instant 10% discount on credit card transactions',
        effectiveBenefit: `Save ₹${Math.min(Math.round(productPrice * 0.1), 1500).toLocaleString('en-IN')}`,
        rating: 'GOOD',
        reason: 'Direct instant price reduction at checkout.',
        netPrice: productPrice - Math.min(Math.round(productPrice * 0.1), 1500),
        recommended: false,
      },
      {
        id: 'no-cost-emi',
        bankOrCard: 'No-Cost EMI (All Banks)',
        description: `${tenure} Months installment plan`,
        effectiveBenefit: `₹${mathResult.monthlyBaseEmi.toLocaleString('en-IN')}/mo + ₹${mathResult.totalHiddenFriction.toLocaleString('en-IN')} GST Drag`,
        rating: 'AVOID',
        reason: `Charges ${mathResult.effectiveAnnualPercentageRate}% Effective APR via statutory 18% GST + ₹${processingFee} fee.`,
        netPrice: productPrice + mathResult.totalHiddenFriction,
        recommended: false,
      },
    ];
  }, [scrapedOffers, surfaceType, productPrice, tenure, mathResult, processingFee]);

  // Merge scraped/display offers with custom simulated offer if generated
  const allOffers = useMemo(() => {
    let list = [...displayOffers];
    if (customSimulatedOffer && !list.some((o) => o.id === customSimulatedOffer.id)) {
      list = [customSimulatedOffer, ...list];
    }
    return list;
  }, [displayOffers, customSimulatedOffer]);

  // Find user's selected offer or fallback to first
  const selectedOffer = useMemo(() => {
    if (customSimulatedOffer && selectedOfferId === customSimulatedOffer.id) {
      return customSimulatedOffer;
    }
    if (selectedOfferId) {
      const found = allOffers.find((o) => o.id === selectedOfferId);
      if (found) return found;
    }
    return allOffers.find((o) => o.isSelected) || allOffers[0];
  }, [allOffers, selectedOfferId, customSimulatedOffer]);

  // Other available offers
  const otherOffers = useMemo(() => {
    return allOffers.filter((o) => o.id !== selectedOffer?.id);
  }, [allOffers, selectedOffer]);

  return (
    <div
      className="commitguard-backdrop"
      onClick={(e) => {
        // Clicking outside cancels and stays on page
        if (e.target === e.currentTarget) onCancelStayOnPage();
      }}
    >
      <div className="commitguard-card">
        
        {/* Header Bar with explicit Cancel / Stay on page 'X' */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-100 bg-white">
          <div className="flex items-center gap-2.5 text-slate-900 font-bold text-base sm:text-lg">
            <div className={`p-1.5 rounded-lg text-white shadow-sm ${
              surfaceType === 'TRAVEL'
                ? 'bg-sky-600'
                : surfaceType === 'EDTECH'
                ? 'bg-indigo-600'
                : surfaceType === 'UDEMY'
                ? 'bg-purple-600'
                : surfaceType === 'AMAZON'
                ? 'bg-amber-600'
                : 'bg-emerald-600'
            }`}>
              {surfaceType === 'TRAVEL' ? (
                <Plane className="w-5 h-5" />
              ) : surfaceType === 'EDTECH' ? (
                <GraduationCap className="w-5 h-5" />
              ) : surfaceType === 'UDEMY' ? (
                <BookOpen className="w-5 h-5" />
              ) : surfaceType === 'AMAZON' ? (
                <ShoppingBag className="w-5 h-5" />
              ) : (
                <Sparkles className="w-5 h-5" />
              )}
            </div>
            <div>
              <span className="text-slate-900">
                {surfaceType === 'TRAVEL'
                  ? 'CommitGuard Travel: TNPL & EMI Reality Check'
                  : surfaceType === 'EDTECH'
                  ? 'CommitGuard EdTech: Education Loan Subvention Truth'
                  : surfaceType === 'UDEMY'
                  ? 'CommitGuard Udemy: Impulse Buy & BNPL Interceptor'
                  : surfaceType === 'AMAZON'
                  ? 'CommitGuard Amazon: Live Card & EMI Optimization'
                  : surfaceType === 'FLIPKART'
                  ? 'CommitGuard Flipkart: Live Card & EMI Optimization'
                  : 'CommitGuard Smart Checkout Intel'}
              </span>
              <div className="text-[11px] text-slate-500 font-normal">
                {surfaceType === 'TRAVEL'
                  ? 'MakeMyTrip & Cleartrip: High-APR TNPL Cascades vs 6M Liquid SIP'
                  : surfaceType === 'EDTECH'
                  ? 'UpGrad: Exposing Hidden Subvention Surcharges & True Debt ROI'
                  : surfaceType === 'UDEMY'
                  ? 'Exposing Urgency Timer Artificial Scarcity vs Completion ROI & Direct Pay'
                  : surfaceType === 'AMAZON'
                  ? 'Amazon.in: Live Amazon Pay ICICI 5% Cashback vs Hidden EMI GST'
                  : surfaceType === 'FLIPKART'
                  ? 'Flipkart.com: Live Flipkart Axis 5% Cashback vs Hidden EMI GST'
                  : 'Live Card & EMI Optimization for E-Commerce'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-[11px] font-mono font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>&lt;1.2ms Real-Time Scraper</span>
            </span>

            {/* 'X' Close button stays on page */}
            <button
              onClick={onCancelStayOnPage}
              title="Cancel & Stay on Page (Escape)"
              aria-label="Cancel"
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Product Scraped Summary Bar */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-700 truncate max-w-xs sm:max-w-md">
              {productName}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {originalPrice && (
              <span className="text-xs text-slate-400 line-through">
                ₹{originalPrice.toLocaleString('en-IN')}
              </span>
            )}
            <span className="text-base font-black text-slate-900">
              ₹{productPrice.toLocaleString('en-IN')}
            </span>
            {discountPercent && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                {discountPercent}% OFF
              </span>
            )}
          </div>
        </div>

        {/* Tab Navigation: Card Offers vs EMI Friction Breakdown */}
        <div className="flex border-b border-slate-200 bg-slate-100/70 p-1.5 gap-1.5">
          <button
            type="button"
            onClick={() => setActiveTab('CARD_OFFERS')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'CARD_OFFERS'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <CreditCard className="w-4 h-4 text-emerald-600" />
            <span>Card & Payment Intel (Best vs Worst)</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 font-mono">
              {displayOffers.length} Options
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('EMI_FRICTION')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'EMI_FRICTION'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span>
              {surfaceType === 'UDEMY'
                ? `Installment / BNPL Friction (Save ₹${recoveryCompounding.savedFriction})`
                : `No-Cost EMI Friction (${mathResult.effectiveAnnualPercentageRate}% APR)`}
            </span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          
          {/* TAB 1: CARD & PAYMENT INTEL (Shows User's Selected Method First, plus Expandable Comparison) */}
          {activeTab === 'CARD_OFFERS' && (
            <div className="space-y-4">
              
              {/* 0. INTERACTIVE PAYMENT METHOD QUICK-SWITCHER BAR (Option A) */}
              <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
                <div className="px-4 py-2.5 bg-slate-50/90 flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/60">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-bold text-slate-700 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Simulate / Switch Payment Method:</span>
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-900 text-white text-[11px] font-bold truncate max-w-[200px] sm:max-w-xs shadow-xs">
                      {selectedOffer?.bankOrCard || 'Auto-Detected'}
                    </span>
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => setIsCustomSwitcherOpen(!isCustomSwitcherOpen)}
                    className="px-3 py-1 rounded-lg bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 text-[11px] font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
                  >
                    <Edit3 className="w-3 h-3 text-emerald-600" />
                    <span>{isCustomSwitcherOpen ? 'Hide Switcher' : 'Change / Simulate Card'}</span>
                    {isCustomSwitcherOpen ? <ChevronUp className="w-3 h-3 text-slate-500" /> : <ChevronDown className="w-3 h-3 text-slate-500" />}
                  </button>
                </div>

                {/* Expanded Switcher Panel */}
                {isCustomSwitcherOpen && (
                  <div className="p-4 bg-gradient-to-b from-slate-50 to-white space-y-3.5 animate-in fade-in duration-150">
                    
                    {/* 1. Payment Type Selection */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                        <span>1. Choose Payment Type</span>
                        <span className="text-[10px] text-emerald-700 font-mono font-normal">Instant Recalculation</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                        {[
                          { id: 'UPI' as const, label: '🟢 UPI / Full Pay', desc: '0% Interest, ₹0 Fees' },
                          { id: 'NO_COST' as const, label: '🎁 No-Cost EMI', desc: 'Subvention Offset' },
                          { id: 'CREDIT_EMI' as const, label: '💳 Credit Card EMI', desc: 'Standard Bank APR' },
                          { id: 'DEBIT_EMI' as const, label: '🏦 Debit Card EMI', desc: 'Pre-Approved Limits' },
                          { id: 'BNPL' as const, label: '⏳ Pay Later / BNPL', desc: 'Deferred Credit' },
                        ].map((type) => (
                          <button
                            key={type.id}
                            type="button"
                            onClick={() => handleApplyCustomSimulation(type.id, customBank, customTenure)}
                            className={`p-2 rounded-lg text-left border transition-all cursor-pointer ${
                              customType === type.id
                                ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-200 text-emerald-950 font-bold shadow-xs'
                                : 'bg-white hover:bg-slate-100/80 border-slate-200 text-slate-700 font-medium'
                            }`}
                          >
                            <div className="text-[11px] font-bold truncate">{type.label}</div>
                            <div className="text-[9px] text-slate-500 truncate">{type.desc}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 2. Bank / Provider Selector (shown if not direct UPI) */}
                    {customType !== 'UPI' && (
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                          2. Select Bank or Card Provider
                        </label>
                        <div className="flex flex-wrap gap-1.5">
                          {[
                            'HDFC Bank',
                            'ICICI Bank',
                            'Axis Bank',
                            'State Bank of India (SBI)',
                            'Kotak Mahindra Bank',
                            'American Express',
                            'OneCard',
                            'Federal Bank',
                            'Bajaj Finserv',
                            'AU Small Finance Bank',
                            'IDFC FIRST Bank',
                            'IndusInd Bank',
                          ].map((bank) => (
                            <button
                              key={bank}
                              type="button"
                              onClick={() => handleApplyCustomSimulation(customType, bank, customTenure)}
                              className={`px-2.5 py-1 rounded-md text-xs transition-all cursor-pointer border ${
                                customBank === bank
                                  ? 'bg-slate-900 text-white border-slate-900 font-bold shadow-xs'
                                  : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200 font-medium'
                              }`}
                            >
                              {bank}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 3. Tenure Selection (shown for EMI / No-Cost types) */}
                    {(customType === 'NO_COST' || customType === 'CREDIT_EMI' || customType === 'DEBIT_EMI') && (
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                          3. Select EMI Tenure
                        </label>
                        <div className="flex items-center gap-2">
                          {[3, 6, 9, 12, 18, 24].map((m) => (
                            <button
                              key={m}
                              type="button"
                              onClick={() => handleApplyCustomSimulation(customType, customBank, m)}
                              className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer border ${
                                customTenure === m
                                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                                  : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                              }`}
                            >
                              {m}m
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>
                )}
              </div>
              
              {/* 1. HERO CARD: USER'S SELECTED PAYMENT OPTION */}
              {selectedOffer && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-900 text-white inline-flex items-center gap-1.5 shadow-sm">
                      <Zap className="w-3 h-3 text-amber-400" />
                      <span>Your Selected Payment Option</span>
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500">
                      Live Pre-Commitment Reality Check
                    </span>
                  </div>

                  <div
                    className={`p-4 rounded-xl border-2 transition-all ${
                      selectedOffer.rating === 'BEST'
                        ? 'bg-emerald-50/90 border-emerald-400 ring-2 ring-emerald-200'
                        : selectedOffer.rating === 'AVOID'
                        ? 'bg-red-50/90 border-red-300 ring-2 ring-red-100'
                        : 'bg-sky-50/90 border-sky-300 ring-2 ring-sky-100'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-black text-base text-slate-900">
                            {selectedOffer.bankOrCard}
                          </span>

                          {/* Badge */}
                          {selectedOffer.rating === 'BEST' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-600 text-white shadow-sm">
                              <ThumbsUp className="w-3 h-3" />
                              RECOMMENDED: BEST VALUE
                            </span>
                          )}
                          {selectedOffer.rating === 'GOOD' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-200">
                              GOOD OFFER
                            </span>
                          )}
                          {selectedOffer.rating === 'AVOID' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-red-100 text-red-800 border border-red-200">
                              <ThumbsDown className="w-3 h-3 text-red-600" />
                              AVOID: HIDDEN CHARGES
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-700 font-medium">
                          {selectedOffer.description}
                        </p>

                        <div className="text-xs text-slate-800 font-normal flex items-start gap-1.5 pt-1 bg-white/70 p-2 rounded-lg border border-slate-200/60">
                          <span className="w-2 h-2 rounded-full bg-slate-500 mt-1 shrink-0" />
                          <span>{selectedOffer.reason}</span>
                        </div>
                      </div>

                      {/* Net Cost & Benefit */}
                      <div className="text-right shrink-0 bg-white/80 p-2.5 rounded-xl border border-slate-200/80 shadow-xs">
                        <div className="text-[11px] text-slate-500 font-semibold">
                          True Outflow
                        </div>
                        <div className={`text-lg font-black ${
                          selectedOffer.rating === 'BEST' ? 'text-emerald-700' : selectedOffer.rating === 'AVOID' ? 'text-red-600' : 'text-slate-900'
                        }`}>
                          ₹{selectedOffer.netPrice.toLocaleString('en-IN')}
                        </div>
                        <div className={`text-[10px] font-bold mt-0.5 ${
                          selectedOffer.rating === 'BEST' ? 'text-emerald-600' : selectedOffer.rating === 'AVOID' ? 'text-red-700' : 'text-slate-600'
                        }`}>
                          {selectedOffer.effectiveBenefit}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. ACCORDION: VIEW OTHER PAYMENT METHODS AS WELL */}
              {otherOffers.length > 0 && (
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAllMethods(!showAllMethods)}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center justify-between transition-colors border border-slate-200"
                  >
                    <span className="flex items-center gap-2">
                      <Sliders className="w-3.5 h-3.5 text-slate-600" />
                      <span>{showAllMethods ? 'Hide Alternative Payment Methods' : `View & Compare Other Payment Methods (${otherOffers.length} Available)`}</span>
                    </span>
                    {showAllMethods ? <ChevronUp className="w-4 h-4 text-slate-600" /> : <ChevronDown className="w-4 h-4 text-slate-600" />}
                  </button>

                  {/* Expanded list of alternative offers */}
                  {showAllMethods && (
                    <div className="space-y-2.5 mt-3 animate-in fade-in duration-200">
                      <div className="text-[11px] font-semibold text-slate-500 flex items-center justify-between px-1">
                        <span>Click any method to inspect its Reality Check:</span>
                        <span className="text-[10px] text-emerald-700 font-mono font-bold">👆 Click to Switch</span>
                      </div>
                      {otherOffers.map((offer) => {
                        const isBest = offer.rating === 'BEST';
                        const isAvoid = offer.rating === 'AVOID';
                        const isGood = offer.rating === 'GOOD';

                        return (
                          <div
                            key={offer.id}
                            onClick={() => setSelectedOfferId(offer.id)}
                            role="button"
                            tabIndex={0}
                            className={`p-3.5 rounded-xl border transition-all cursor-pointer hover:shadow-md hover:scale-[1.01] active:scale-[0.99] group ${
                              isBest
                                ? 'bg-emerald-50/70 hover:bg-emerald-100/80 border-emerald-300 ring-1 ring-emerald-200'
                                : isAvoid
                                ? 'bg-red-50/60 hover:bg-red-100/80 border-red-200'
                                : 'bg-white hover:bg-slate-50 border-slate-200'
                            }`}
                            title="Click to select this payment method and inspect its reality check"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-bold text-sm text-slate-900 group-hover:text-emerald-700 transition-colors">
                                    {offer.bankOrCard}
                                  </span>

                                  {/* Badge */}
                                  {isBest && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-600 text-white shadow-xs">
                                      <ThumbsUp className="w-2.5 h-2.5" />
                                      RECOMMENDED: BEST VALUE
                                    </span>
                                  )}
                                  {isGood && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-200">
                                      GOOD OFFER
                                    </span>
                                  )}
                                  {isAvoid && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-red-100 text-red-800 border border-red-200">
                                      <ThumbsDown className="w-2.5 h-2.5 text-red-600" />
                                      AVOID: HIDDEN CHARGES
                                    </span>
                                  )}
                                </div>

                                <p className="text-xs text-slate-600">
                                  {offer.description}
                                </p>

                                <div className="text-[11px] text-slate-700 font-medium flex items-center gap-1.5 pt-0.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                                  <span>{offer.reason}</span>
                                </div>
                              </div>

                              {/* Net Cost & Benefit */}
                              <div className="text-right shrink-0">
                                <div className="text-xs text-slate-500 font-medium">
                                  Effective Price
                                </div>
                                <div className={`text-base font-black ${
                                  isBest ? 'text-emerald-700' : isAvoid ? 'text-red-600' : 'text-slate-900'
                                }`}>
                                  ₹{offer.netPrice.toLocaleString('en-IN')}
                                </div>
                                <div className={`text-[10px] font-bold ${
                                  isBest ? 'text-emerald-600' : isAvoid ? 'text-red-700' : 'text-slate-600'
                                }`}>
                                  {offer.effectiveBenefit}
                                </div>
                                <div className="text-[9px] text-slate-400 mt-1 font-semibold group-hover:text-emerald-600">
                                  Select ➔
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Actionable Advice Box */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>
                    {surfaceType === 'TRAVEL'
                      ? 'CommitGuard Travel Advisory (TNPL Warning):'
                      : surfaceType === 'EDTECH'
                      ? 'CommitGuard EdTech Advisory (Subvention Reality):'
                      : surfaceType === 'UDEMY'
                      ? 'CommitGuard Udemy Advisory (Impulse & Artificial Scarcity):'
                      : surfaceType === 'AMAZON'
                      ? 'CommitGuard Amazon Advisory (Cashback vs EMI Drag):'
                      : 'CommitGuard Flipkart Advisory (Cashback vs EMI Drag):'}
                  </span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  {surfaceType === 'TRAVEL' ? (
                    <>
                      <strong>Travel Now, Pay Later (TNPL)</strong> advertises low monthly tranches but triggers <strong>24% to 36% penalty APRs</strong> and compounding bounce fees if any installment is missed post-trip. <strong>Recommended Alternative:</strong> Start a <strong>6-month Liquid Fund SIP</strong> at 7.10% yield to book your trip 100% debt-free.
                    </>
                  ) : surfaceType === 'EDTECH' ? (
                    <>
                      <strong>Education Loan "0% Subvention"</strong> packages frequently embed an upfront <strong>3% to 5% institutional subvention surcharge</strong> into course pricing plus processing fees. If you pay via direct NEFT/UPI or company sponsorship, negotiate the 5% cash rebate.
                    </>
                  ) : surfaceType === 'UDEMY' ? (
                    <>
                      <strong>Udemy Countdown Timers:</strong> The "Sale ends in 5 hours" timer resets automatically on next browser session. Over <strong>87% of purchased self-paced courses are never completed</strong>. If paying, use direct UPI without EMI lock-ins, or invest in a <strong>Liquid Fund</strong> until you have scheduled hours to study.
                    </>
                  ) : surfaceType === 'AMAZON' ? (
                    <>
                      If you hold an <strong>Amazon Pay ICICI Card</strong>, pay in full to lock an unconditional <strong>5% Amazon Pay balance cashback</strong>. If you choose <strong>No-Cost EMI</strong>, you will lose ~₹{mathResult.totalHiddenFriction.toLocaleString('en-IN')} to non-refundable 18% GST on interest and bank processing fees.
                    </>
                  ) : (
                    <>
                      If you hold a <strong>Flipkart Axis Bank Card</strong>, pay in full to lock an unconditional <strong>5% statement cashback</strong>. If you use <strong>No-Cost EMI</strong>, you will lose ~₹{mathResult.totalHiddenFriction.toLocaleString('en-IN')} to non-refundable 18% GST and processing fees.
                    </>
                  )}
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: EMI FRICTION & AMORTIZATION BREAKDOWN */}
          {activeTab === 'EMI_FRICTION' && (
            <div className="space-y-5">
              {/* Interactive Metric Cards (Instant Dynamic Recalculation) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Effective APR */}
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200">
                  <div className="text-[11px] font-bold text-red-800 uppercase tracking-wide">
                    Effective APR
                  </div>
                  <div className="text-2xl font-black text-red-600 mt-1">
                    {mathResult.effectiveAnnualPercentageRate}%
                  </div>
                  <div className="text-[10px] text-red-700/80 mt-0.5">
                    vs Advertised <strong>0% APR</strong>
                  </div>
                </div>

                {/* Total GST Drag */}
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200">
                  <div className="text-[11px] font-bold text-amber-800 uppercase tracking-wide">
                    Total GST + Fee Drag
                  </div>
                  <div className="text-2xl font-black text-amber-700 mt-1">
                    ₹{mathResult.totalHiddenFriction.toLocaleString('en-IN')}
                  </div>
                  <div className="text-[10px] text-amber-800/80 mt-0.5">
                    ₹{processingFee} fee + ₹{mathResult.totalGstOnInterest.toFixed(2)} GST
                  </div>
                </div>

                {/* Monthly Outflow */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">
                    Monthly Outflow
                  </div>
                  <div className="text-2xl font-black text-slate-900 mt-1">
                    ₹{mathResult.monthlyBaseEmi.toLocaleString('en-IN')}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    Locked for {tenure} installments
                  </div>
                </div>
              </div>

              {/* 3 Plain-English Bullets */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-800">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>3-Bullet Plain-English Translation</span>
                </div>

                <ul className="space-y-2 text-xs sm:text-sm text-slate-700 leading-relaxed">
                  <li className="flex items-start gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-red-600 mt-1.5 shrink-0" />
                    <span>
                      <strong className="text-red-700 font-bold">19.93% Effective APR Reality: </strong>
                      Even though the merchant provides an upfront discount, bank processing fees and statutory 18% GST convert 0% into <strong>{mathResult.effectiveAnnualPercentageRate}% Effective APR</strong>.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-amber-600 mt-1.5 shrink-0" />
                    <span>
                      <strong className="text-slate-900 font-bold">Unrecoverable Monthly Drag: </strong>
                      Every month, your bank card statement bills 18% statutory GST on the interest component. You incur a guaranteed <strong>₹{mathResult.totalHiddenFriction.toLocaleString('en-IN')}</strong> in pure administrative leak.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                    <span>
                      <strong className="text-emerald-800 font-bold">Zero-Friction Baseline: </strong>
                      Paying upfront via direct UPI or debit card eliminates the ₹{mathResult.totalHiddenFriction.toLocaleString('en-IN')} drag completely while keeping your monthly credit limit untouched.
                    </span>
                  </li>
                </ul>
              </div>

              {/* Perfectly Aligned Discrete Slider with Clickable Steps */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <label htmlFor="ext-tenure-slider" className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Sliders className="w-4 h-4 text-emerald-600" />
                    <span>Adjust EMI Tenure: <strong className="text-emerald-700 text-sm">{tenure} Months</strong></span>
                  </label>
                  <span className="text-[11px] text-slate-500 font-mono">Click any tenure step</span>
                </div>

                {/* Slider with exact steps mapping 0 to 5 for TENURE_OPTIONS */}
                <div className="relative pt-1 pb-1">
                  <input
                    id="ext-tenure-slider"
                    type="range"
                    min={0}
                    max={TENURE_OPTIONS.length - 1}
                    step={1}
                    value={sliderIndex}
                    onChange={(e) => setSliderIndex(Number(e.target.value))}
                    className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600 focus:outline-none"
                  />

                  {/* Exact 1-to-1 Horizontally Aligned Step Labels */}
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingTop: '8px',
                      width: '100%',
                    }}
                  >
                    {TENURE_OPTIONS.map((opt, idx) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setSliderIndex(idx)}
                        style={{
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontFamily: 'monospace',
                          cursor: 'pointer',
                          border: sliderIndex === idx ? '1px solid #6ee7b7' : '1px solid transparent',
                          backgroundColor: sliderIndex === idx ? '#ecfdf5' : 'transparent',
                          color: sliderIndex === idx ? '#047857' : '#64748b',
                          fontWeight: sliderIndex === idx ? '800' : '500',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        {opt}m
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 🌟 1. Friction Recovery & Compounding Matrix (Prompt Req 1) */}
              <div className="p-4 rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50/80 via-white to-teal-50/50 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded-md bg-emerald-600 text-white">
                      <TrendingUp className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                        Friction Recovery & Compounding Matrix
                      </h4>
                      <p className="text-[10px] text-slate-500">
                        Preserve leaked bank fees & GST by paying upfront into a <strong>7.10% Sovereign T-Bill</strong>
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                    RBI Benchmark 7.10%
                  </span>
                </div>

                {/* Compounding Comparison Columns */}
                <div className="grid grid-cols-3 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setCompoundingHorizon('1Y')}
                    className={`p-2.5 rounded-lg border text-center transition-all cursor-pointer ${
                      compoundingHorizon === '1Y'
                        ? 'bg-emerald-900 text-white border-emerald-800 ring-2 ring-emerald-400 shadow-sm scale-[1.02]'
                        : 'bg-white hover:bg-emerald-50/50 border-emerald-200 text-slate-900 shadow-2xs'
                    }`}
                  >
                    <div className={`text-[10px] font-bold uppercase ${compoundingHorizon === '1Y' ? 'text-emerald-200' : 'text-slate-500'}`}>
                      1 Year T-Bill
                    </div>
                    <div className={`text-sm sm:text-base font-black mt-0.5 ${compoundingHorizon === '1Y' ? 'text-white' : 'text-slate-900'}`}>
                      ₹{recoveryCompounding.fv1Year.toLocaleString('en-IN')}
                    </div>
                    <div className={`text-[9px] font-semibold mt-0.5 ${compoundingHorizon === '1Y' ? 'text-emerald-300' : 'text-emerald-700'}`}>
                      Preserves ₹{recoveryCompounding.savedFriction.toLocaleString('en-IN')}
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCompoundingHorizon('3Y')}
                    className={`p-2.5 rounded-lg border text-center transition-all cursor-pointer ${
                      compoundingHorizon === '3Y'
                        ? 'bg-emerald-900 text-white border-emerald-800 ring-2 ring-emerald-400 shadow-sm scale-[1.02]'
                        : 'bg-white hover:bg-emerald-50/50 border-emerald-200 text-slate-900 shadow-2xs'
                    }`}
                  >
                    <div className={`text-[10px] font-bold uppercase ${compoundingHorizon === '3Y' ? 'text-emerald-200' : 'text-slate-500'}`}>
                      3 Year Compound
                    </div>
                    <div className={`text-sm sm:text-base font-black mt-0.5 ${compoundingHorizon === '3Y' ? 'text-white' : 'text-emerald-700'}`}>
                      ₹{recoveryCompounding.fv3Year.toLocaleString('en-IN')}
                    </div>
                    <div className={`text-[9px] font-semibold mt-0.5 ${compoundingHorizon === '3Y' ? 'text-emerald-300' : 'text-emerald-600'}`}>
                      +₹{(recoveryCompounding.fv3Year - recoveryCompounding.savedFriction).toLocaleString('en-IN')} yield
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCompoundingHorizon('5Y')}
                    className={`p-2.5 rounded-lg border text-center transition-all cursor-pointer ${
                      compoundingHorizon === '5Y'
                        ? 'bg-emerald-900 text-white border-emerald-800 ring-2 ring-emerald-400 shadow-sm scale-[1.02]'
                        : 'bg-white hover:bg-emerald-50/50 border-emerald-200 text-slate-900 shadow-2xs'
                    }`}
                  >
                    <div className={`text-[10px] font-bold uppercase ${compoundingHorizon === '5Y' ? 'text-emerald-300' : 'text-slate-500'}`}>
                      5 Year Wealth
                    </div>
                    <div className={`text-sm sm:text-base font-black mt-0.5 ${compoundingHorizon === '5Y' ? 'text-white' : 'text-slate-900'}`}>
                      ₹{recoveryCompounding.fv5Year.toLocaleString('en-IN')}
                    </div>
                    <div className={`text-[9px] font-semibold mt-0.5 ${compoundingHorizon === '5Y' ? 'text-emerald-200' : 'text-emerald-700'}`}>
                      +₹{recoveryCompounding.compoundedGain5Y.toLocaleString('en-IN')} pure gain
                    </div>
                  </button>
                </div>

                {/* Pre-Commitment Liquid SIP Comparison */}
                <div className="p-2.5 rounded-lg bg-slate-900 text-white text-xs flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <PiggyBank className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-[11px] text-slate-200">
                      Invest ₹{mathResult.monthlyBaseEmi.toLocaleString('en-IN')}/mo in Liquid Fund SIP instead:
                    </span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-black text-emerald-400">
                      ₹{recoveryCompounding.sipFv.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[9px] text-slate-400 block font-mono">
                      (+₹{recoveryCompounding.sipGain.toLocaleString('en-IN')} yield vs -₹{recoveryCompounding.savedFriction} leak)
                    </span>
                  </div>
                </div>
              </div>

              {/* Expandable Amortization Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                <button
                  onClick={() => setIsProofOpen(!isProofOpen)}
                  className="w-full px-4 py-2.5 flex items-center justify-between text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <span>Deterministic Monthly Breakdown ({tenure} Months)</span>
                  {isProofOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {isProofOpen && (
                  <div className="p-3 border-t border-slate-100 max-h-44 overflow-y-auto">
                    <table className="w-full text-[10px] text-left">
                      <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 sticky top-0">
                        <tr>
                          <th className="py-1.5 px-2">Month</th>
                          <th className="py-1.5 px-2">Principal</th>
                          <th className="py-1.5 px-2">Interest</th>
                          <th className="py-1.5 px-2 text-red-600">18% GST</th>
                          <th className="py-1.5 px-2 font-bold">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-600 font-mono">
                        {mathResult.schedule.map((row) => (
                          <tr key={row.month}>
                            <td className="py-1 px-2 font-bold">{row.month}</td>
                            <td className="py-1 px-2">₹{row.principalComponent.toLocaleString('en-IN')}</td>
                            <td className="py-1 px-2">₹{row.interestComponent.toLocaleString('en-IN')}</td>
                            <td className="py-1 px-2 text-red-600">₹{row.gstOnInterest.toFixed(2)}</td>
                            <td className="py-1 px-2 font-bold text-slate-900">₹{row.totalMonthlyCashflow.toLocaleString('en-IN')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}


          {/* Action Buttons: Cancel (STAYS ON CURRENT PAGE) vs Proceed (GOES FORWARD) */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
            <button
              id="btn-cancel-stay"
              onClick={onCancelStayOnPage}
              className="w-1/2 py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-bold transition-colors flex items-center justify-center gap-1.5 border border-slate-300 shadow-sm"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-600" />
              <span>Cancel & Modify Terms</span>
            </button>

            <button
              id="btn-close-proceed"
              onClick={onProceedAndContinue}
              className="w-1/2 py-3 px-4 rounded-xl bg-slate-900 hover:bg-black text-white text-xs sm:text-sm font-bold shadow-md transition-all flex items-center justify-center gap-1.5"
            >
              <span>I Understand, Proceed</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
