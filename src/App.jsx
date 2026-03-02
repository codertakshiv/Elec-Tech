import { useEffect, useState } from 'react';
import BottomNav from './components/BottomNav';
import ResistorDecoder from './components/ResistorDecoder';
import SmdCapDecoder from './components/SmdCapDecoder';
import SmdResistorDecoder from './components/SmdResistorDecoder';

function App() {
  const [activeTab, setActiveTab] = useState('resistor');
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState(() => {
    const stored = localStorage.getItem('electech-history');
    if (!stored) return [];
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  });
  const [installPromptEvent, setInstallPromptEvent] = useState(null);

  useEffect(() => {
    const initial = setTimeout(() => setLoading(false), 850);

    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setInstallPromptEvent(event);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      clearTimeout(initial);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const saveResult = ({ feature, input, output }) => {
    setHistory((prev) => {
      const next = [
        { feature, input, output, timestamp: new Date().toISOString() },
        ...prev,
      ].slice(0, 5);
      localStorage.setItem('electech-history', JSON.stringify(next));
      return next;
    });
  };

  const installPwa = async () => {
    if (!installPromptEvent) return;
    installPromptEvent.prompt();
    await installPromptEvent.userChoice;
    setInstallPromptEvent(null);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-900 text-cyan-100">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-neon-cyan/20 border-t-neon-cyan" />
          <p className="mt-4 text-sm tracking-[0.2em] text-cyan-200/90">ELECTECH LOADING</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-grid px-4 pb-28 pt-5 text-slate-100">
      <div className="mx-auto w-full max-w-lg">
        <header className="glass-card mb-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold text-cyan-100">ElecTech</h1>
              <p className="text-xs text-slate-300">Mobile Electronics Decoder Toolkit</p>
            </div>
            <button
              type="button"
              disabled={!installPromptEvent}
              onClick={installPwa}
              className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
                installPromptEvent
                  ? 'bg-gradient-to-r from-neon-cyan/30 to-neon-blue/30 text-cyan-100 animate-pulseGlow'
                  : 'bg-white/10 text-slate-400'
              }`}
            >
              Install
            </button>
          </div>
        </header>

        {activeTab === 'resistor' && <ResistorDecoder onSaveResult={saveResult} />}
        {activeTab === 'smdr' && <SmdResistorDecoder onSaveResult={saveResult} />}
        {activeTab === 'smdc' && <SmdCapDecoder onSaveResult={saveResult} />}

        <section className="glass-card mt-4">
          <p className="panel-title">Recent Results</p>
          {!history.length && (
            <p className="mt-2 text-sm text-slate-400">No saved values yet.</p>
          )}
          <div className="mt-2 space-y-2">
            {history.map((item, index) => (
              <div key={`${item.timestamp}-${index}`} className="rounded-xl bg-white/5 px-3 py-2">
                <p className="text-xs text-cyan-300">{item.feature}</p>
                <p className="text-sm text-slate-100">{item.input}</p>
                <p className="text-sm text-slate-300">{item.output}</p>
              </div>
            ))}
          </div>
        </section>

        <p className="mt-4 pb-2 text-center text-xs text-slate-300">
          Made with <span className="text-red-500">❤️</span> by Takshiv Kashyap
        </p>
      </div>

      <BottomNav activeTab={activeTab} onChange={setActiveTab} />
    </div>
  );
}

export default App;
