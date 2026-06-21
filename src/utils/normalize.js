const FA = '۰۱۲۳۴۵۶۷۸۹';
const EN = '0123456789';

export function toEn(str) {
  if (!str) return '';
  return String(str).replace(/[۰-۹]/g, d => EN[FA.indexOf(d)]);
}

export function toFa(str) {
  if (!str) return '';
  return String(str).replace(/[0-9]/g, d => FA[EN.indexOf(d)]);
}

// Normalize both sides to English for comparison
export function normDigits(str) {
  return toEn(str);
}
