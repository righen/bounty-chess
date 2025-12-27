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
  return (
    <aside
      className={`fixed flex flex-col top-0 left-0 p-4 bg-[#373542] h-screen transition-all duration-300 ease-in-out z-[99999] w-[290px] ${
        sidebarOpen ? "-translate-x-full lg:translate-x-0" : "lg:-translate-x-full"
      }`}
    >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-[#ffcc33]">
            🎯 Bounty Chess
          </h1>
        </div>

        {/* Tournament Stats */}
        {tournamentStarted && (
          <div className="mb-6 p-3 bg-white/10 rounded-lg">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-white/70">Players:</span>
                <span className="font-semibold text-white">{playersCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/70">Round:</span>
                <span className="font-semibold text-white">{currentRound}/{totalRounds}</span>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Menu */}
        <nav className="flex-1">
          <ul className="flex flex-col gap-2">
            <li>
              <button
                onClick={() => onViewChange('players')}
                className={`flex items-center gap-3 w-full py-2.5 px-4 rounded-lg transition-all text-sm font-medium ${
                  view === 'players'
                    ? 'bg-[#ffcc33] text-[#373542]'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                <span className="text-[20px]">👥</span>
                <span>Manage Players</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => onViewChange('leaderboard')}
                className={`flex items-center gap-3 w-full py-2.5 px-4 rounded-lg transition-all text-sm font-medium ${
                  view === 'leaderboard'
                    ? 'bg-[#ffcc33] text-[#373542]'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                <span className="text-[20px]">🏆</span>
                <span>Leaderboard</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => onViewChange('round')}
                className={`flex items-center gap-3 w-full py-2.5 px-4 rounded-lg transition-all text-sm font-medium ${
                  view === 'round'
                    ? 'bg-[#ffcc33] text-[#373542]'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                <span className="text-[20px]">♟️</span>
                <span>Current Round</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => onViewChange('prizes')}
                className={`flex items-center gap-3 w-full py-2.5 px-4 rounded-lg transition-all text-sm font-medium ${
                  view === 'prizes'
                    ? 'bg-[#ffcc33] text-[#373542]'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                <span className="text-[20px]">🎖️</span>
                <span>Prizes</span>
              </button>
            </li>
          </ul>
        </nav>

        {/* Actions Section */}
        <div className="border-t border-white/10 pt-4 mt-4">
          <div className="flex flex-col gap-2">
            <button
              onClick={onImport}
              className="flex items-center gap-3 w-full py-2.5 px-4 text-white bg-white/10 hover:bg-white/15 rounded-lg transition-all text-sm"
            >
              <span className="text-[18px]">📥</span>
              <span>Import Data</span>
            </button>
            <button
              onClick={onExport}
              className="flex items-center gap-3 w-full py-2.5 px-4 text-white bg-white/10 hover:bg-white/15 rounded-lg transition-all text-sm"
            >
              <span className="text-[18px]">📤</span>
              <span>Export Data</span>
            </button>
            <button
              onClick={onReset}
              className="flex items-center gap-3 w-full py-2.5 px-4 text-white bg-white/10 hover:bg-white/15 rounded-lg transition-all text-sm"
            >
              <span className="text-[18px]">🔄</span>
              <span>Reset Tournament</span>
            </button>
          </div>

          {/* Footer */}
          <div className="text-center text-xs text-white/50 mt-4 pt-4 border-t border-white/10">
            <p>B4 Chess Club</p>
            <p className="mt-1">Tournament System</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
