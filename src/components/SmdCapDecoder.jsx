import { useMemo, useState } from 'react';
import { decodeSmdCapacitor, formatCapValue } from '../utils/smdLogic';

function SmdCapDecoder({ onSaveResult }) {
  const [code, setCode] = useState('');
  const result = useMemo(() => decodeSmdCapacitor(code), [code]);

  const copyResult = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(
      `ElecTech SMD Capacitor: ${result.code} = ${formatCapValue(result.pF)} pF`,
    );
  };

  const clearAll = () => setCode('');

  const saveResult = () => {
    if (!result) return;
    onSaveResult({
      feature: 'SMD Capacitor',
      input: result.code,
      output: `${formatCapValue(result.pF)} pF`,
    });
  };

  return (
    <section className="space-y-4 animate-tabIn">
      <header className="glass-card">
        <p className="panel-title">SMD Capacitor Code Decoder</p>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          maxLength={3}
          placeholder="Enter 3-digit code (104)"
          className="mt-3 w-full rounded-xl border border-cyan-200/20 bg-bg-800/70 px-4 py-3 text-base text-slate-100 outline-none transition focus:border-cyan-300"
        />
        <p className="mt-2 text-xs text-slate-400">
          Uses standard capacitor notation: first two digits significant, third is multiplier.
        </p>
      </header>

      <div className="glass-card">
        <p className="panel-title">Result</p>
        {!code && <p className="mt-2 text-sm text-slate-400">Type a capacitor code to decode.</p>}
        {code && !result && (
          <p className="mt-2 text-sm text-rose-300">
            Invalid code. Use a 3-digit numeric value like `103` or `104`.
          </p>
        )}
        {result && (
          <div className="mt-3 space-y-1 text-sm text-slate-100">
            <p>
              <span className="text-cyan-300">pF:</span> {formatCapValue(result.pF)} pF
            </p>
            <p>
              <span className="text-cyan-300">nF:</span> {formatCapValue(result.nF)} nF
            </p>
            <p>
              <span className="text-cyan-300">uF:</span> {formatCapValue(result.uF)} uF
            </p>
            <p>
              <span className="text-cyan-300">Formula:</span> {result.breakdown}
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

export default SmdCapDecoder;
