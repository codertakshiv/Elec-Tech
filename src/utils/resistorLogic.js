export const RESISTOR_COLORS = [
  { name: 'Black', hex: '#0b0b0f', digit: 0, multiplier: 1 },
  { name: 'Brown', hex: '#5c3a21', digit: 1, multiplier: 10, tolerance: 1 },
  { name: 'Red', hex: '#c62828', digit: 2, multiplier: 100, tolerance: 2 },
  { name: 'Orange', hex: '#ef6c00', digit: 3, multiplier: 1_000 },
  { name: 'Yellow', hex: '#f9a825', digit: 4, multiplier: 10_000 },
  { name: 'Green', hex: '#2e7d32', digit: 5, multiplier: 100_000, tolerance: 0.5 },
  { name: 'Blue', hex: '#1565c0', digit: 6, multiplier: 1_000_000, tolerance: 0.25 },
  { name: 'Violet', hex: '#6a1b9a', digit: 7, multiplier: 10_000_000, tolerance: 0.1 },
  { name: 'Grey', hex: '#757575', digit: 8, multiplier: 100_000_000, tolerance: 0.05 },
  { name: 'White', hex: '#eceff1', digit: 9, multiplier: 1_000_000_000 },
  { name: 'Gold', hex: '#d4af37', multiplier: 0.1, tolerance: 5 },
  { name: 'Silver', hex: '#b0bec5', multiplier: 0.01, tolerance: 10 },
];

const byName = Object.fromEntries(RESISTOR_COLORS.map((c) => [c.name, c]));

const DIGIT_COLORS = RESISTOR_COLORS.filter((c) => Number.isInteger(c.digit));
const MULTIPLIER_COLORS = RESISTOR_COLORS.filter((c) => c.multiplier !== undefined);
const TOLERANCE_COLORS = RESISTOR_COLORS.filter((c) => c.tolerance !== undefined);

export function getBandLabels(bandCount) {
  return bandCount === 5
    ? ['1st Digit', '2nd Digit', '3rd Digit', 'Multiplier', 'Tolerance']
    : ['1st Digit', '2nd Digit', 'Multiplier', 'Tolerance'];
}

export function getBandOptions(bandCount, index) {
  if (bandCount === 5) {
    if (index < 3) return DIGIT_COLORS;
    if (index === 3) return MULTIPLIER_COLORS;
    return TOLERANCE_COLORS;
  }

  if (index < 2) return DIGIT_COLORS;
  if (index === 2) return MULTIPLIER_COLORS;
  return TOLERANCE_COLORS;
}

export function decodeResistor(bandCount, selectedBands) {
  const required = bandCount;
  if (!selectedBands || selectedBands.length !== required || selectedBands.some((v) => !v)) {
    return null;
  }

  const bands = selectedBands.map((name) => byName[name]);
  if (bands.some((b) => !b)) return null;

  const sigDigits = bandCount === 5 ? [bands[0].digit, bands[1].digit, bands[2].digit] : [bands[0].digit, bands[1].digit];
  const multiplier = bandCount === 5 ? bands[3].multiplier : bands[2].multiplier;
  const tolerance = bandCount === 5 ? bands[4].tolerance : bands[3].tolerance;

  if (sigDigits.some((d) => d === undefined) || multiplier === undefined || tolerance === undefined) {
    return null;
  }

  const significantValue = Number(sigDigits.join(''));
  const ohms = significantValue * multiplier;
  const formula = `${sigDigits.join('')} x ${multiplier}`;

  return {
    ohms,
    tolerance,
    formula,
    significantValue,
    multiplier,
    digits: sigDigits,
  };
}

export function formatOhms(ohms) {
  if (ohms >= 1_000_000) return `${trim(ohms / 1_000_000)} MΩ`;
  if (ohms >= 1_000) return `${trim(ohms / 1_000)} KΩ`;
  return `${trim(ohms)} Ω`;
}

function trim(value) {
  return Number(value.toFixed(3)).toString();
}
