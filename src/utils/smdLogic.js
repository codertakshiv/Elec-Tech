const EIA96_BASE = [
  100, 102, 105, 107, 110, 113, 115, 118, 121, 124, 127, 130, 133, 137, 140, 143, 147, 150, 154,
  158, 162, 165, 169, 174, 178, 182, 187, 191, 196, 200, 205, 210, 215, 221, 226, 232, 237, 243,
  249, 255, 261, 267, 274, 280, 287, 294, 301, 309, 316, 324, 332, 340, 348, 357, 365, 374, 383,
  392, 402, 412, 422, 432, 442, 453, 464, 475, 487, 499, 511, 523, 536, 549, 562, 576, 590, 604,
  619, 634, 649, 665, 681, 698, 715, 732, 750, 768, 787, 806, 825, 845, 866, 887, 909, 931, 953,
  976,
];

const EIA96_MULTIPLIER = {
  Z: 0.001,
  Y: 0.01,
  R: 0.01,
  X: 0.1,
  S: 0.1,
  A: 1,
  B: 10,
  H: 10,
  C: 100,
  D: 1_000,
  E: 10_000,
  F: 100_000,
};

export function decodeSmdResistor(rawCode) {
  const code = (rawCode || '').trim().toUpperCase();
  if (!code) return null;

  if (/^\d{3}$/.test(code)) {
    const sig = Number(code.slice(0, 2));
    const exp = Number(code[2]);
    const ohms = sig * 10 ** exp;
    return {
      type: '3-digit',
      code,
      ohms,
      breakdown: `${sig} x 10^${exp}`,
    };
  }

  if (/^\d{4}$/.test(code)) {
    const sig = Number(code.slice(0, 3));
    const exp = Number(code[3]);
    const ohms = sig * 10 ** exp;
    return {
      type: '4-digit',
      code,
      ohms,
      breakdown: `${sig} x 10^${exp}`,
    };
  }

  if (/^\d{2}[A-Z]$/.test(code)) {
    const index = Number(code.slice(0, 2));
    const letter = code[2];
    const base = EIA96_BASE[index - 1];
    const multiplier = EIA96_MULTIPLIER[letter];

    if (!base || !multiplier) return null;
    const ohms = base * multiplier;
    return {
      type: 'EIA-96',
      code,
      ohms,
      breakdown: `${base} x ${multiplier}`,
    };
  }

  return null;
}

export function decodeSmdCapacitor(rawCode) {
  const code = (rawCode || '').trim();
  if (!/^\d{3}$/.test(code)) return null;

  const sig = Number(code.slice(0, 2));
  const exp = Number(code[2]);
  const pF = sig * 10 ** exp;

  return {
    code,
    pF,
    nF: pF / 1_000,
    uF: pF / 1_000_000,
    breakdown: `${sig} x 10^${exp} pF`,
  };
}

export function formatResistorUnits(ohms) {
  if (ohms >= 1_000_000) return `${trim(ohms / 1_000_000)} MΩ`;
  if (ohms >= 1_000) return `${trim(ohms / 1_000)} KΩ`;
  return `${trim(ohms)} Ω`;
}

export function formatCapValue(value) {
  return Number(value.toFixed(6)).toString();
}

function trim(value) {
  return Number(value.toFixed(3)).toString();
}
