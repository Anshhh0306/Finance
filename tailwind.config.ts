import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/extension/**/*.{ts,tsx}'],
  theme: {
    extend: {
      // "Bank passbook" palette: ink on paper, named by what each colour means on a ledger.
      colors: {
        ledger: {
          navy: '#0B1D3A', // ink, primary text
          paper: '#F5F1E6', // page background
          debit: '#8B1E1E', // costs, "Costly" verdicts
          credit: '#1F6F4A', // savings, "Best value" verdicts
          seal: '#C9A227', // brand accent, used sparingly
          rule: '#D8D2C0', // hairline dividers
        },
      },
    },
  },
  plugins: [],
};

export default config;
