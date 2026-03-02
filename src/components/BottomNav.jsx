const TABS = [
  { key: 'resistor', label: 'Resistor' },
  { key: 'smdr', label: 'SMD R' },
  { key: 'smdc', label: 'SMD Cap' },
];

function BottomNav({ activeTab, onChange }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 border-t border-cyan-300/10 bg-bg-900/80 px-3 py-3 backdrop-blur-xl">
      <div className="mx-auto grid w-full max-w-lg grid-cols-3 gap-2">
        {TABS.map((tab) => {
          const active = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onChange(tab.key)}
              className={`rounded-2xl px-3 py-3 text-sm font-semibold transition-all ${
                active
                  ? 'bg-gradient-to-r from-neon-cyan/25 to-neon-blue/20 text-cyan-100 shadow-neon'
                  : 'bg-white/5 text-slate-300'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export default BottomNav;
