/**
 * CommitGuard - Neutral Reference Directory
 * Unranked, objective public rates and direct official net banking / regulatory portals.
 * Zero sponsored rankings. Zero affiliate kickbacks.
 */

import { DirectoryRateCard } from './types';

export const NEUTRAL_RATE_DIRECTORY: DirectoryRateCard[] = [
  {
    id: 'sbi',
    institutionName: 'State Bank of India (SBI)',
    institutionType: 'PUBLIC_BANK',
    oneYearFdRate: 6.80,
    twoYearFdRate: 7.00,
    prematurePenaltyPercent: 0.50,
    seniorCitizenBonusPercent: 0.50,
    officialDirectPortalUrl: 'https://bank.sbi/web/personal-banking/investments-deposits/deposits/fixed-deposit',
    lastVerifiedDate: 'August 2024',
  },
  {
    id: 'hdfc',
    institutionName: 'HDFC Bank',
    institutionType: 'PRIVATE_BANK',
    oneYearFdRate: 6.60,
    twoYearFdRate: 7.00,
    prematurePenaltyPercent: 1.00,
    seniorCitizenBonusPercent: 0.50,
    officialDirectPortalUrl: 'https://www.hdfcbank.com/personal/save/deposits/fixed-deposit',
    lastVerifiedDate: 'August 2024',
  },
  {
    id: 'icici',
    institutionName: 'ICICI Bank',
    institutionType: 'PRIVATE_BANK',
    oneYearFdRate: 6.70,
    twoYearFdRate: 7.20,
    prematurePenaltyPercent: 1.00,
    seniorCitizenBonusPercent: 0.50,
    officialDirectPortalUrl: 'https://www.icicibank.com/personal-banking/deposits/fixed-deposit',
    lastVerifiedDate: 'August 2024',
  },
  {
    id: 'rbi_tbill_91d',
    institutionName: 'Government of India 91-Day T-Bill (RBI Retail Direct)',
    institutionType: 'SOVEREIGN',
    oneYearFdRate: 6.85,
    twoYearFdRate: 7.05,
    prematurePenaltyPercent: 0.00,
    seniorCitizenBonusPercent: 0.00,
    officialDirectPortalUrl: 'https://rbiretaildirect.org.in',
    lastVerifiedDate: 'August 2024',
  },
  {
    id: 'equitas_sfb',
    institutionName: 'Equitas Small Finance Bank',
    institutionType: 'SMALL_FINANCE_BANK',
    oneYearFdRate: 8.20,
    twoYearFdRate: 8.50,
    prematurePenaltyPercent: 1.00,
    seniorCitizenBonusPercent: 0.50,
    officialDirectPortalUrl: 'https://www.equitasbank.com/fixed-deposits',
    lastVerifiedDate: 'August 2024',
  },
  {
    id: 'liquid_fund_benchmark',
    institutionName: 'Overnight / Liquid Mutual Fund Category Average',
    institutionType: 'SOVEREIGN',
    oneYearFdRate: 6.75,
    twoYearFdRate: 6.75,
    prematurePenaltyPercent: 0.00,
    seniorCitizenBonusPercent: 0.00,
    officialDirectPortalUrl: 'https://www.amfiindia.com',
    lastVerifiedDate: 'August 2024',
  },
];
