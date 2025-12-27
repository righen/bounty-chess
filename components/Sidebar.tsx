'use client';

interface SidebarProps {
  sidebarOpen: boolean;
  view: 'setup' | 'leaderboard' | 'round' | 'players' | 'prizes';
  onViewChange: (view: 'setup' | 'leaderboard' | 'round' | 'players' | 'prizes') => void;
  onReset: () => void;
  onExport: () => void;
  onImport: () => void;
  tournamentStarted: boolean;
  playersCount: number;
  currentRound: number;
  totalRounds: number;
}

export default function Sidebar({
  sidebarOpen,
  view,
  onViewChange,
  onReset,
  onExport,
  onImport,
  tournamentStarted,
  playersCount,
  currentRound,
  totalRounds,
}: SidebarProps) {
  const navItems = [
    { id: 'players' as const, icon: '👥', label: 'Manage Players' },
    { id: 'leaderboard' as const, icon: '🏆', label: 'Leaderboard' },
    { id: 'round' as const, icon: '♟️', label: 'Current Round' },
    { id: 'prizes' as const, icon: '🎖️', label: 'Prizes' },
  ];

  const NavItem = ({ item }: { item: typeof navItems[0] }) => (
    <button
      onClick={() => onViewChange(item.id)}
      className={`flex items-center gap-3 w-full py-2.5 px-4 rounded-lg transition-all ${
        view === item.id
          ? 'bg-[#ffcc33] text-[#373542]'
          : 'text-white hover:bg-white/10'
      }`}
    >
      <span className="text-[22px]">{item.icon}</span>
      <span className="text-sm font-medium">{item.label}</span>
    </button>
  );

  return (
    <aside
      className={`fixed flex flex-col top-0 left-0 p-4 pt-23 lg:pt-4 bg-[#373542] h-screen transition-all duration-300 ease-in-out z-[99999] w-[290px] ${
        sidebarOpen ? "-translate-x-full lg:translate-x-0" : "lg:-translate-x-full"
      }`}
    >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#ffcc33] text-center">
            🎯 Bounty Chess
          </h1>
        </div>

        {/* Tournament Stats */}
        {tournamentStarted && (
          <div className="mb-6 p-4 bg-white/10 rounded-lg">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-white/70">
                <span>Players:</span>
                <span className="font-semibold text-white">{playersCount}</span>
              </div>
              <div className="flex justify-between text-white/70">
                <span>Round:</span>
                <span className="font-semibold text-white">
                  {currentRound}/{totalRounds}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Menu */}
        <ul className="flex flex-col gap-4 flex-1">
          {navItems.map((item) => (
            <li key={item.id}>
              <NavItem item={item} />
            </li>
          ))}
        </ul>

        {/* Actions Section */}
        <div className="border-t border-white/10 pt-4 mt-4">
          <div className="flex flex-col gap-2 mb-4">
            <button
              onClick={onImport}
              className="flex items-center gap-3 w-full py-2.5 px-4 text-white bg-white/10 hover:bg-white/15 cursor-pointer rounded-lg transition-all"
            >
              <span className="text-lg">📥</span>
              <span className="text-sm">Import Data</span>
            </button>
            <button
              onClick={onExport}
              className="flex items-center gap-3 w-full py-2.5 px-4 text-white bg-white/10 hover:bg-white/15 cursor-pointer rounded-lg transition-all"
            >
              <span className="text-lg">📤</span>
              <span className="text-sm">Export Data</span>
            </button>
            <button
              onClick={onReset}
              className="flex items-center gap-3 w-full py-2.5 px-4 text-white bg-white/10 hover:bg-white/15 cursor-pointer rounded-lg transition-all"
            >
              <span className="text-lg">🔄</span>
              <span className="text-sm">Reset Tournament</span>
            </button>
          </div>

          {/* Footer */}
          <div className="text-center text-xs text-white/50 mt-4">
            <p>B4 Chess Club</p>
            <p className="mt-1">Tournament System</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

