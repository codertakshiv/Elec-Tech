const DIGIT_COLORS = [
  ["black", 0, "#000000"],
  ["brown", 1, "#6b3e26"],
  ["red", 2, "#d62828"],
  ["orange", 3, "#f57c00"],
  ["yellow", 4, "#ffcc00"],
  ["green", 5, "#2a9d53"],
  ["blue", 6, "#1d4ed8"],
  ["violet", 7, "#7b2cbf"],
  ["gray", 8, "#828282"],
  ["white", 9, "#f5f5f5"]
];

const MULTIPLIERS = [["silver", -2, "#c0c0c0"], ["gold", -1, "#c79e3d"], ...DIGIT_COLORS];
const TOLERANCES = [
  ["brown", 1, "#6b3e26"],
  ["red", 2, "#d62828"],
  ["green", 0.5, "#2a9d53"],
  ["blue", 0.25, "#1d4ed8"],
  ["violet", 0.1, "#7b2cbf"],
  ["gray", 0.05, "#828282"],
  ["gold", 5, "#c79e3d"],
  ["silver", 10, "#c0c0c0"]
];
const TEMP_COEFF = [
  ["brown", 100, "#6b3e26"],
  ["red", 50, "#d62828"],
  ["orange", 15, "#f57c00"],
  ["yellow", 25, "#ffcc00"],
  ["blue", 10, "#1d4ed8"],
  ["violet", 5, "#7b2cbf"]
];

const digitMap = Object.fromEntries(DIGIT_COLORS.map(([n, v, h]) => [n, { value: v, hex: h }]));
const multMap = Object.fromEntries(MULTIPLIERS.map(([n, v, h]) => [n, { value: v, hex: h }]));
const tolMap = Object.fromEntries(TOLERANCES.map(([n, v, h]) => [n, { value: v, hex: h }]));
const tempMap = Object.fromEntries(TEMP_COEFF.map(([n, v, h]) => [n, { value: v, hex: h }]));

const EIA96_VALUES = [
  100, 102, 105, 107, 110, 113, 115, 118, 121, 124, 127, 130,
  133, 137, 140, 143, 147, 150, 154, 158, 162, 165, 169, 174,
  178, 182, 187, 191, 196, 200, 205, 210, 215, 221, 226, 232,
  237, 243, 249, 255, 261, 267, 274, 280, 287, 294, 301, 309,
  316, 324, 332, 340, 348, 357, 365, 374, 383, 392, 402, 412,
  422, 432, 442, 453, 464, 475, 487, 499, 511, 523, 536, 549,
  562, 576, 590, 604, 619, 634, 649, 665, 681, 698, 715, 732,
  750, 768, 787, 806, 825, 845, 866, 887, 909, 931, 953, 976
];

const EIA96_MULT = {
  Z: 0.001,
  Y: 0.01,
  R: 0.01,
  X: 0.1,
  S: 0.1,
  A: 1,
  B: 10,
  H: 10,
  C: 100,
  D: 1000,
  E: 10000,
  F: 100000
};

const toolButtons = document.querySelectorAll(".tool-btn");
const panels = document.querySelectorAll(".panel");

const bandCountEl = document.getElementById("bandCount");
const bandSelectorsEl = document.getElementById("bandSelectors");
const resistorPreviewEl = document.getElementById("resistorPreview");
const decodeResultEl = document.getElementById("decodeResult");

const encBandCountEl = document.getElementById("encBandCount");
const encToleranceEl = document.getElementById("encTolerance");
const resValueEl = document.getElementById("resValue");
const resUnitEl = document.getElementById("resUnit");
const encodeBtnEl = document.getElementById("encodeBtn");
const encodeResultEl = document.getElementById("encodeResult");
const valueToColorToggleEl = document.getElementById("valueToColorToggle");
const valueToColorContentEl = document.getElementById("valueToColorContent");
const valueToColorArrowEl = document.getElementById("valueToColorArrow");

const smdResFormatEl = document.getElementById("smdResFormat");
const smdResCodeEl = document.getElementById("smdResCode");
const smdResDecodeEl = document.getElementById("smdResDecode");
const smdResResultEl = document.getElementById("smdResResult");
const smdResTopCodeEl = document.getElementById("smdResTopCode");

const smdCapFormatEl = document.getElementById("smdCapFormat");
const smdCapCodeEl = document.getElementById("smdCapCode");
const smdCapDecodeEl = document.getElementById("smdCapDecode");
const smdCapResultEl = document.getElementById("smdCapResult");
const smdCapTopCodeEl = document.getElementById("smdCapTopCode");

function fmt(num, digits = 4) {
  if (!Number.isFinite(num)) return "-";
  if (Math.abs(num) >= 1e6 || (Math.abs(num) > 0 && Math.abs(num) < 1e-3)) return num.toExponential(3);
  return Number(num.toPrecision(digits)).toString();
}

function formatOhms(ohms) {
  const abs = Math.abs(ohms);
  if (abs >= 1e9) return `${fmt(ohms / 1e9)} Gohm`;
  if (abs >= 1e6) return `${fmt(ohms / 1e6)} Mohm`;
  if (abs >= 1e3) return `${fmt(ohms / 1e3)} kohm`;
  return `${fmt(ohms)} ohm`;
}

function formatCapFromPf(pf) {
  if (!Number.isFinite(pf)) return "-";
  const nf = pf / 1000;
  const uf = pf / 1e6;
  if (uf >= 1) return `${fmt(uf)} uF (${fmt(nf)} nF)`;
  if (nf >= 1) return `${fmt(nf)} nF (${fmt(pf)} pF)`;
  return `${fmt(pf)} pF`;
}

function makeSelect(options, id) {
  const sel = document.createElement("select");
  sel.id = id;
  options.forEach(([name, value]) => {
    const opt = document.createElement("option");
    opt.value = name;
    opt.textContent = `${name} (${value})`;
    sel.appendChild(opt);
  });
  return sel;
}

function bandLabels(count) {
  if (count === 3) return ["1st Digit", "2nd Digit", "Multiplier"];
  if (count === 4) return ["1st Digit", "2nd Digit", "Multiplier", "Tolerance"];
  if (count === 5) return ["1st Digit", "2nd Digit", "3rd Digit", "Multiplier", "Tolerance"];
  return ["1st Digit", "2nd Digit", "3rd Digit", "Multiplier", "Tolerance", "Temp Coeff"];
}

function optionsForBand(count, idx) {
  const isDigit = count <= 4 ? idx < 2 : idx < 3;
  const isMultiplier = count <= 4 ? idx === 2 : idx === 3;
  const isTolerance = (count === 4 && idx === 3) || ((count === 5 || count === 6) && idx === 4);
  const isTemp = count === 6 && idx === 5;

  if (isDigit) return DIGIT_COLORS;
  if (isMultiplier) return MULTIPLIERS;
  if (isTolerance) return TOLERANCES;
  if (isTemp) return TEMP_COEFF;
  return DIGIT_COLORS;
}

function renderDecodeSelectors() {
  const count = Number(bandCountEl.value);
  bandSelectorsEl.innerHTML = "";

  bandLabels(count).forEach((label, i) => {
    const box = document.createElement("div");
    box.className = "band-select";
    const title = document.createElement("p");
    title.textContent = label;
    const sel = makeSelect(optionsForBand(count, i), `band-${i}`);
    sel.addEventListener("change", calculateDecode);
    box.appendChild(title);
    box.appendChild(sel);
    bandSelectorsEl.appendChild(box);
  });

  calculateDecode();
}

function calculateDecode() {
  const count = Number(bandCountEl.value);
  const picks = [...Array(count)].map((_, i) => document.getElementById(`band-${i}`).value);
  const digitCount = count <= 4 ? 2 : 3;

  const digits = picks.slice(0, digitCount).map((name) => digitMap[name].value).join("");
  const multiplierPow = multMap[picks[digitCount]].value;
  const nominal = Number(digits) * (10 ** multiplierPow);

  let text = `Resistance: ${formatOhms(nominal)}`;
  if (count >= 4) text += ` | Tolerance: +/-${tolMap[picks[digitCount + 1]].value}%`;
  if (count === 6) text += ` | Temp Coeff: ${tempMap[picks[5]].value} ppm/K`;

  decodeResultEl.textContent = text;
  renderPreview(picks);
}

function renderPreview(colorNames) {
  resistorPreviewEl.innerHTML = "";
  const count = colorNames.length;
  const start = 18;
  const end = 82;
  const step = count > 1 ? (end - start) / (count - 1) : 0;

  colorNames.forEach((name, i) => {
    const color = digitMap[name]?.hex || multMap[name]?.hex || tolMap[name]?.hex || tempMap[name]?.hex || "#000";
    const band = document.createElement("span");
    band.className = "band";
    band.style.left = `${start + step * i}%`;
    band.style.background = color;
    resistorPreviewEl.appendChild(band);
  });
}

function fillToleranceSelect() {
  encToleranceEl.innerHTML = "";
  TOLERANCES.forEach(([name, value]) => {
    const opt = document.createElement("option");
    opt.value = name;
    opt.textContent = `${name} (+/-${value}%)`;
    encToleranceEl.appendChild(opt);
  });
  encToleranceEl.value = "gold";
}

function findDigitsAndMultiplier(ohms, digitsCount) {
  for (let pow = -2; pow <= 9; pow += 1) {
    const scaled = ohms / (10 ** pow);
    if (scaled < 10 ** (digitsCount - 1) || scaled >= 10 ** digitsCount) continue;
    if (Math.abs(scaled - Math.round(scaled)) < 1e-9) {
      return { digits: String(Math.round(scaled)).padStart(digitsCount, "0"), pow };
    }
  }
  return null;
}

function encodeValueToColors() {
  const base = Number(resValueEl.value);
  const factor = Number(resUnitEl.value);
  const bands = Number(encBandCountEl.value);
  const tolName = encToleranceEl.value;

  if (!Number.isFinite(base) || base <= 0) {
    encodeResultEl.textContent = "Enter a valid resistance value.";
    return;
  }

  const ohms = base * factor;
  const digitsCount = bands === 4 ? 2 : 3;
  const out = findDigitsAndMultiplier(ohms, digitsCount);
  if (!out) {
    encodeResultEl.textContent = "Value cannot be represented exactly in selected band format.";
    return;
  }

  const multName = MULTIPLIERS.find(([, p]) => p === out.pow)?.[0];
  if (!multName) {
    encodeResultEl.textContent = "Could not find matching multiplier color.";
    return;
  }

  const colors = out.digits.split("").map((d) => DIGIT_COLORS[Number(d)][0]);
  colors.push(multName, tolName);
  renderPreview(colors);

  encodeResultEl.textContent = `Color code: ${colors.join(" - ")} | ${formatOhms(ohms)} +/-${tolMap[tolName].value}%`;
}

function parseRNotation(code) {
  if (!/^[\dRr.]+$/.test(code)) return NaN;
  const val = Number(code.replace(/r/gi, "."));
  return Number.isFinite(val) ? val : NaN;
}

function decodeSmdResistor() {
  const format = smdResFormatEl.value;
  const raw = smdResCodeEl.value.trim().toUpperCase();
  smdResTopCodeEl.textContent = raw || "---";

  if (!raw) {
    smdResResultEl.textContent = "Enter resistor marking code.";
    return;
  }

  if (raw.includes("R")) {
    const rv = parseRNotation(raw);
    if (!Number.isFinite(rv)) {
      smdResResultEl.textContent = "Invalid R decimal resistor code.";
      return;
    }
    smdResResultEl.textContent = `Resistance: ${formatOhms(rv)} (R-decimal code)`;
    return;
  }

  if (format === "3") {
    if (!/^\d{3}$/.test(raw)) {
      smdResResultEl.textContent = "3-digit format requires exactly 3 digits.";
      return;
    }
    const ohms = Number(raw.slice(0, 2)) * (10 ** Number(raw[2]));
    smdResResultEl.textContent = `Resistance: ${formatOhms(ohms)} (3-digit EIA)`;
    return;
  }

  if (format === "4") {
    if (!/^\d{4}$/.test(raw)) {
      smdResResultEl.textContent = "4-digit format requires exactly 4 digits.";
      return;
    }
    const ohms = Number(raw.slice(0, 3)) * (10 ** Number(raw[3]));
    smdResResultEl.textContent = `Resistance: ${formatOhms(ohms)} (4-digit EIA)`;
    return;
  }

  if (!/^\d{2}[A-Z]$/.test(raw)) {
    smdResResultEl.textContent = "EIA-96 format is 2 digits + 1 letter (example: 24C).";
    return;
  }

  const idx = Number(raw.slice(0, 2));
  const letter = raw[2];
  const base = EIA96_VALUES[idx - 1];
  const mult = EIA96_MULT[letter];

  if (!base || !mult) {
    smdResResultEl.textContent = "Invalid EIA-96 code or multiplier letter.";
    return;
  }

  const ohms = base * mult;
  smdResResultEl.textContent = `Resistance: ${formatOhms(ohms)} (EIA-96, base ${base} x ${mult})`;
}

function decodeSmdCapacitor() {
  const format = smdCapFormatEl.value;
  const raw = smdCapCodeEl.value.trim().toUpperCase();
  smdCapTopCodeEl.textContent = raw || "---";

  if (!raw) {
    smdCapResultEl.textContent = "Enter capacitor marking code.";
    return;
  }

  if (format === "r") {
    const rv = parseRNotation(raw);
    if (!Number.isFinite(rv)) {
      smdCapResultEl.textContent = "Invalid decimal capacitor code.";
      return;
    }
    smdCapResultEl.textContent = `Capacitance: ${formatCapFromPf(rv)} (R-decimal in pF)`;
    return;
  }

  if (format === "3") {
    if (!/^\d{3}$/.test(raw)) {
      smdCapResultEl.textContent = "3-digit capacitor format requires exactly 3 digits.";
      return;
    }
    const pf = Number(raw.slice(0, 2)) * (10 ** Number(raw[2]));
    smdCapResultEl.textContent = `Capacitance: ${formatCapFromPf(pf)} (3-digit EIA)`;
    return;
  }

  if (!/^\d{4}$/.test(raw)) {
    smdCapResultEl.textContent = "4-digit capacitor format requires exactly 4 digits.";
    return;
  }

  const pf = Number(raw.slice(0, 3)) * (10 ** Number(raw[3]));
  smdCapResultEl.textContent = `Capacitance: ${formatCapFromPf(pf)} (4-digit EIA)`;
}

function switchTool(name) {
  toolButtons.forEach((btn) => btn.classList.toggle("active", btn.dataset.tool === name));
  panels.forEach((panel) => panel.classList.toggle("active", panel.dataset.panel === name));
}

function setValueToColorOpen(isOpen) {
  valueToColorToggleEl.setAttribute("aria-expanded", String(isOpen));
  valueToColorContentEl.classList.toggle("open", isOpen);
  valueToColorArrowEl.style.transform = isOpen ? "rotate(180deg)" : "rotate(0deg)";
  valueToColorContentEl.style.maxHeight = isOpen ? `${valueToColorContentEl.scrollHeight}px` : "0px";
}

toolButtons.forEach((btn) => {
  btn.addEventListener("click", () => switchTool(btn.dataset.tool));
});

bandCountEl.addEventListener("change", renderDecodeSelectors);
encodeBtnEl.addEventListener("click", encodeValueToColors);
smdResDecodeEl.addEventListener("click", decodeSmdResistor);
smdCapDecodeEl.addEventListener("click", decodeSmdCapacitor);
valueToColorToggleEl.addEventListener("click", () => {
  const isOpen = valueToColorToggleEl.getAttribute("aria-expanded") === "true";
  setValueToColorOpen(!isOpen);
});

window.addEventListener("resize", () => {
  if (valueToColorToggleEl.getAttribute("aria-expanded") === "true") {
    valueToColorContentEl.style.maxHeight = `${valueToColorContentEl.scrollHeight}px`;
  }
});

smdResCodeEl.addEventListener("input", () => {
  smdResTopCodeEl.textContent = smdResCodeEl.value.trim().toUpperCase() || "---";
});

smdCapCodeEl.addEventListener("input", () => {
  smdCapTopCodeEl.textContent = smdCapCodeEl.value.trim().toUpperCase() || "---";
});

fillToleranceSelect();
renderDecodeSelectors();
setValueToColorOpen(false);
switchTool("resistor");
