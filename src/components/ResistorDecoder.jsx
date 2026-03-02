import { useMemo, useState } from 'react';
import {
  decodeResistor,
  formatOhms,
  getBandLabels,
  getBandOptions,
} from '../utils/resistorLogic';

function ResistorDecoder({ onSaveResult }) {
  const [bandCount, setBandCount] = useState(4);
  const [selectedBands, setSelectedBands] = useState(Array(4).fill(''));
  const labels = useMemo(() => getBandLabels(bandCount), [bandCount]);
  const result = useMemo(
    () => decodeResistor(bandCount, selectedBands),
    [bandCount, selectedBands],
  );

  const handleBandCount = (count) => {
    setBandCount(count);
    setSelectedBands(Array(count).fill(''));
  };

  const clearAll = () => setSelectedBands(Array(bandCount).fill(''));

  const resultText = result
    ? `${formatOhms(result.ohms)} (+/-${result.tolerance}%)`
    : '';

  const copyResult = async () => {
    if (!resultText) return;
    await navigator.clipboard.writeText(`ElecTech Resistor: ${resultText}`);
  };

  const saveResult = () => {
    if (!result) return;
    onSaveResult({
      feature: 'Resistor',
      input: `${bandCount}-band: ${selectedBands.join(' / ')}`,
      output: resultText,
    });
  };

  return (
    <section className="space-y-4 animate-tabIn">
      <header className="glass-card">
        <p className="panel-title">Resistor Color Code Decoder</p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {[4, 5].map((count) => (
            <button
              key={count}
              type="button"
              onClick={() => handleBandCount(count)}
              className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${
                bandCount === count
                  ? 'bg-gradient-to-r from-neon-cyan/25 to-neon-blue/25 text-cyan-100 shadow-neon'
                  : 'bg-white/5 text-slate-200'
              }`}
            >
              {count}-Band
            </button>
          ))}
        </div>
      </header>

      {labels.map((label, idx) => (
        <div key={label} className="glass-card">
          <p className="mb-2 text-sm text-slate-200">{label}</p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {getBandOptions(bandCount, idx).map((color) => {
              const selected = selectedBands[idx] === color.name;
              return (
                <button
                  key={color.name}
                  type="button"
                  onClick={() =>
                    setSelectedBands((prev) =>
                      prev.map((value, i) => (i === idx ? color.name : value)),
                    )
                  }
                  className={`min-w-[72px] rounded-xl border px-3 py-3 text-xs font-medium transition ${
                    selected
                      ? 'border-cyan-300 shadow-neon ring-1 ring-cyan-200/60'
                      : 'border-white/10'
                  }`}
                  style={{ backgroundColor: `${color.hex}` }}
                >
                  <span
                    className={`drop-shadow ${
                      ['Yellow', 'White', 'Silver', 'Gold'].includes(color.name)
                        ? 'text-slate-900'
                        : 'text-white'
                    }`}
                  >
                    {color.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <div className="glass-card">
        <p className="panel-title">Result</p>
        {!result && (
          <p className="mt-2 text-sm text-slate-400">
            Select all bands to decode resistance.
          </p>
        )}

        {result && (
          <div className="mt-3 space-y-1 text-sm text-slate-100">
            <p>
              <span className="text-cyan-300">Resistance:</span> {formatOhms(result.ohms)}
            </p>
            <p>
              <span className="text-cyan-300">Ohms:</span> {result.ohms} Ω
            </p>
            <p>
              <span className="text-cyan-300">KΩ:</span> {(result.ohms / 1_000).toFixed(3)}
            </p>
            <p>
              <span className="text-cyan-300">MΩ:</span> {(result.ohms / 1_000_000).toFixed(6)}
            </p>
            <p>
              <span className="text-cyan-300">Tolerance:</span> +/-{result.tolerance}%
            </p>
            <p>
              <span className="text-cyan-300">Formula:</span> {result.formula}
            </p>
          </div>
        )}

        <div className="mt-4 grid grid-cols-3 gap-2">
          <button className="btn-secondary" type="button" onClick={copyResult}>
            Copy
          </button>
          <button className="btn-secondary" type="button" onClick={clearAll}>
            Clear
          </button>
          <button className="btn-primary" type="button" onClick={saveResult}>
            Save
          </button>
        </div>
      </div>
    </section>
  );
}

export default ResistorDecoder;
