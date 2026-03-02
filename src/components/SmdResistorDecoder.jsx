import { useMemo, useState } from 'react';
import { decodeSmdResistor, formatResistorUnits } from '../utils/smdLogic';

function SmdResistorDecoder({ onSaveResult }) {
  const [code, setCode] = useState('');
  const result = useMemo(() => decodeSmdResistor(code), [code]);

  const copyResult = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(
      `ElecTech SMD Resistor: ${result.code} = ${formatResistorUnits(result.ohms)}`,
    );
  };

  const clearAll = () => setCode('');

  const saveResult = () => {
    if (!result) return;
    onSaveResult({
      feature: 'SMD Resistor',
      input: result.code,
      output: `${formatResistorUnits(result.ohms)} (${result.type})`,
    });
  };

  return (
    <section className="space-y-4 animate-tabIn">
      <header className="glass-card">
        <p className="panel-title">SMD Resistor Code Decoder</p>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          maxLength={4}
          placeholder="Enter code (103, 1002, 01C)"
          className="mt-3 w-full rounded-xl border border-cyan-200/20 bg-bg-800/70 px-4 py-3 text-base text-slate-100 outline-none transition focus:border-cyan-300"
        />
        <p className="mt-2 text-xs text-slate-400">
          Supports 3-digit, 4-digit and EIA-96 formats.
        </p>
      </header>

      <div className="glass-card">
        <p className="panel-title">3D Preview</p>
        <div className="component-stage mt-4">
          <span className="smd-pad" />
          <div className="smd-chip resistor">
            <span className="smd-chip-mark">{code || '---'}</span>
          </div>
          <span className="smd-pad" />
        </div>
        <p className="mt-3 text-center text-xs text-slate-300">
          {result ? `${formatResistorUnits(result.ohms)} (${result.type})` : 'Enter SMD resistor code to sync the marking and value.'}
        </p>
      </div>

      <div className="glass-card">
        <p className="panel-title">Result</p>
        {!code && <p className="mt-2 text-sm text-slate-400">Type an SMD code to decode.</p>}
        {code && !result && (
          <p className="mt-2 text-sm text-rose-300">
            Invalid code. Example values: `472`, `1002`, `01C`.
          </p>
        )}
        {result && (
          <div className="mt-3 space-y-1 text-sm text-slate-100">
            <p>
              <span className="text-cyan-300">Type:</span> {result.type}
            </p>
            <p>
              <span className="text-cyan-300">Resistance:</span>{' '}
              {formatResistorUnits(result.ohms)}
            </p>
            <p>
              <span className="text-cyan-300">Ohms:</span> {result.ohms} Ω
            </p>
            <p>
              <span className="text-cyan-300">KΩ:</span> {(result.ohms / 1_000).toFixed(3)}
            </p>
            <p>
              <span className="text-cyan-300">MΩ:</span>{' '}
              {(result.ohms / 1_000_000).toFixed(6)}
            </p>
            <p>
              <span className="text-cyan-300">Breakdown:</span> {result.breakdown}
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

export default SmdResistorDecoder;
