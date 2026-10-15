const EASTERN = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

export type DigitStyle = 'western' | 'eastern';

export const toDigits = (text: string, style: DigitStyle): string =>
  style === 'eastern' ? text.replace(/[0-9]/g, (d) => EASTERN[Number(d)] ?? d) : text.replace(/[٠-٩]/g, (d) => String(EASTERN.indexOf(d)));

/** Format a number with a thin grouping space (Algerian style: 10 000) */
export const formatNumber = (n: number, decimals = 0, style: DigitStyle = 'western'): string => {
  const fixed = n.toFixed(decimals);
  const [int, dec] = fixed.split('.');
  const grouped = (int ?? '0').replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return toDigits(dec ? `${grouped}.${dec}` : grouped, style);
};
