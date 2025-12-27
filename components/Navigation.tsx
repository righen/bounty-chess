'use client';

interface NavigationProps {
  view: 'setup' | 'leaderboard' | 'round' | 'players' | 'prizes';
  onViewChange: (view: 'setup' | 'leaderboard' | 'round' | 'players' | 'prizes') => void;
  onReset: () => void;
  onExport: () => void;
  onImport: () => void;
}

export default function Navigation({ view, onViewChange, onReset, onExport, onImport }: NavigationProps) {
  const navItems = [
    { id: 'players' as const, icon: '👥', label: 'Players' },
    { id: 'leaderboard' as const, icon: '🏆', label: 'Leaderboard' },
    { id: 'round' as const, icon: '♟️', label: 'Round' },
    { id: 'prizes' as const, icon: '🎖️', label: 'Prizes' },
  ];

  return (
    <nav className="sticky top-20 md:top-24 z-40 bg-[#1a1f2e] border-b border-[#2a2f3e]">
      <div className="container-custom">
        {/* Main Navigation */}
        <div className="flex items-center justify-between py-4">
          <div className="flex gap-1 md:gap-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`
                  px-4 md:px-6 py-2.5 md:py-3 rounded-lg font-semibold transition-all
                  ${view === item.id
                    ? 'bg-[#8b5cf6] text-white shadow-lg shadow-purple-500/20'
                    : 'text-[#94a3b8] hover:text-[#e2e8f0] hover:bg-[#2a2f3e]'
                  }
                `}
              >
                <span className="mr-2 text-lg">{item.icon}</span>
                <span className="hidden sm:inline">{item.label}</span>
              </button>
            ))}
          </div>

          {/* Actions - Dropdown on mobile */}
          <div className="relative group">
            <button className="btn btn-ghost px-3 py-2 md:px-4">
              <span className="text-lg">⚙️</span>
              <span className="hidden md:inline ml-2">Actions</span>
              <svg className="w-4 h-4 ml-1 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            <div className="absolute right-0 mt-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
              <div className="card py-2 shadow-xl">
                <button
                  onClick={onImport}
                  className="w-full px-4 py-2.5 text-left hover:bg-[#2a2f3e] transition-colors flex items-center gap-3"
                >
                  <span className="text-lg">📥</span>
                  <span>Import Data</span>
                </button>
                <button
                  onClick={onExport}
                  className="w-full px-4 py-2.5 text-left hover:bg-[#2a2f3e] transition-colors flex items-center gap-3"
                >
                  <span className="text-lg">📤</span>
                  <span>Export Data</span>
                </button>
                <div className="border-t border-[#2a2f3e] my-1"></div>
                <button
                  onClick={onReset}
                  className="w-full px-4 py-2.5 text-left hover:bg-[#2a2f3e] transition-colors flex items-center gap-3 text-[#ef4444]"
                >
                  <span className="text-lg">🔄</span>
                  <span>Reset Tournament</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
