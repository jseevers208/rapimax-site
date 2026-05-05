import {
  MAX_TERM_MONTHS,
  MIN_DOWN_PAYMENT_PERCENT,
  REFERENCE_ANNUAL_RATE
} from './constants.js';

const currencyFormatters = {
  USD: new Intl.NumberFormat('es-CR', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }),
  CRC: new Intl.NumberFormat('es-CR', {
    style: 'currency',
    currency: 'CRC',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  })
};

export const parseNumber = (value) => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  if (typeof value !== 'string') return 0;

  const normalized = value.replace(/[^\d.,-]/g, '').replace(/,/g, '');
  const parsed = Number.parseFloat(normalized);

  return Number.isFinite(parsed) ? parsed : 0;
};

export const formatCurrency = (amount, currency = 'USD') =>
  currencyFormatters[currency]?.format(Number.isFinite(amount) ? amount : 0) ?? `${amount}`;

export const formatPercent = (rate) => `${(rate * 100).toFixed(2)}%`;

export const getMinimumDownPayment = (vehicleValue) =>
  Math.max(parseNumber(vehicleValue) * MIN_DOWN_PAYMENT_PERCENT, 0);

const calculateMonthlyPayment = ({
  financedAmount,
  termMonths,
  annualRate = REFERENCE_ANNUAL_RATE
}) => {
  const principal = Math.max(parseNumber(financedAmount), 0);
  const months = Math.min(Math.max(Number.parseInt(termMonths, 10) || 0, 0), MAX_TERM_MONTHS);

  if (!principal || !months) return 0;

  const monthlyRate = annualRate / 12;

  if (!monthlyRate) return principal / months;

  return (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months));
};

export const calculateQuote = ({
  vehicleValue,
  downPayment,
  termMonths,
  annualRate = REFERENCE_ANNUAL_RATE
}) => {
  const value = Math.max(parseNumber(vehicleValue), 0);
  const prima = Math.max(parseNumber(downPayment), 0);
  const financedAmount = Math.max(value - prima, 0);
  const minimumDownPayment = getMinimumDownPayment(value);
  const monthlyPayment = calculateMonthlyPayment({
    financedAmount,
    termMonths,
    annualRate
  });

  return {
    vehicleValue: value,
    downPayment: prima,
    financedAmount,
    minimumDownPayment,
    monthlyPayment,
    annualRate
  };
};
