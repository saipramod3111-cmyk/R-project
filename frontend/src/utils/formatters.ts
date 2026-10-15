// frontend/src/utils/formatters.ts

/**
 * Safely converts any value (number, single-item array from R, string, null, undefined)
 * into a valid JavaScript number.
 */
export const toNumber = (val: any, fallback = 0): number => {
  if (val === null || val === undefined) return fallback;
  if (Array.isArray(val)) {
    return val.length > 0 ? toNumber(val[0], fallback) : fallback;
  }
  const n = Number(val);
  return isNaN(n) ? fallback : n;
};

/**
 * Safely formats any value with toFixed without ever crashing.
 */
export const toFixed = (val: any, digits = 2, fallback = '0'): string => {
  try {
    const num = toNumber(val, NaN);
    if (isNaN(num)) return fallback;
    return num.toFixed(digits);
  } catch {
    return fallback;
  }
};

/**
 * Formats a ratio (0.766) into percentage string ('76.6%').
 */
export const toPercent = (val: any, digits = 1): string => {
  const num = toNumber(val);
  return `${(num * 100).toFixed(digits)}%`;
};
