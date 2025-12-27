'use client';

interface NavigationProps {
  view: 'setup' | 'leaderboard' | 'round' | 'players' | 'prizes';
  onViewChange: (view: 'setup' | 'leaderboard' | 'round' | 'players' | 'prizes') => void;
  onReset: () => void;
  onExport: () => void;
  onImport: () => void;
}

export default function Navigation({ view, onViewChange, onReset, onExport, onImport }: NavigationProps) {
  return (
    <nav className="bg-gray-800 border-b border-gray-700 sticky top-16 md:top-20 z-40">
      <div className="container mx-auto px-2 sm:px-4">
        {/* Main navigation tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 py-3">
          <button
            onClick={() => onViewChange('players')}
            className={`px-4 sm:px-6 py-3 sm:py-3.5 rounded-lg transition-all font-semibold text-sm sm:text-base min-w-[100px] ${
              view === 'players'
                ? 'bg-blue-600 text-white shadow-lg scale-105'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600 active:scale-95'
            }`}
          >
            <span className="mr-1">👥</span>
            <span className="hidden sm:inline">Manage </span>
            Players
          </button>
          <button
            onClick={() => onViewChange('leaderboard')}
            className={`px-4 sm:px-6 py-3 sm:py-3.5 rounded-lg transition-all font-semibold text-sm sm:text-base min-w-[110px] ${
              view === 'leaderboard'
                ? 'bg-blue-600 text-white shadow-lg scale-105'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600 active:scale-95'
            }`}
          >
            <span className="mr-1">🏆</span>
            Leaderboard
          </button>
          <button
            onClick={() => onViewChange('round')}
            className={`px-4 sm:px-6 py-3 sm:py-3.5 rounded-lg transition-all font-semibold text-sm sm:text-base min-w-[100px] ${
              view === 'round'
                ? 'bg-blue-600 text-white shadow-lg scale-105'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600 active:scale-95'
            }`}
          >
            <span className="mr-1">♟️</span>
            <span className="hidden sm:inline">Current </span>
            Round
          </button>
          <button
            onClick={() => onViewChange('prizes')}
            className={`px-4 sm:px-6 py-3 sm:py-3.5 rounded-lg transition-all font-semibold text-sm sm:text-base min-w-[90px] ${
              view === 'prizes'
                ? 'bg-blue-600 text-white shadow-lg scale-105'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600 active:scale-95'
            }`}
          >
            <span className="mr-1">🎖️</span>
            Prizes
          </button>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center justify-center gap-2 pb-3">
          <button
            onClick={onImport}
            className="px-4 sm:px-5 py-2.5 sm:py-3 bg-purple-600 hover:bg-purple-700 active:scale-95 text-white rounded-lg transition-all font-semibold text-sm sm:text-base shadow-md"
          >
            <span className="mr-1">📥</span>
            <span className="hidden sm:inline">Import </span>
            Data
          </button>
          <button
            onClick={onExport}
            className="px-4 sm:px-5 py-2.5 sm:py-3 bg-green-600 hover:bg-green-700 active:scale-95 text-white rounded-lg transition-all font-semibold text-sm sm:text-base shadow-md"
          >
            <span className="mr-1">📤</span>
            <span className="hidden sm:inline">Export </span>
            Data
          </button>
          <button
            onClick={onReset}
            className="px-4 sm:px-5 py-2.5 sm:py-3 bg-red-600 hover:bg-red-700 active:scale-95 text-white rounded-lg transition-all font-semibold text-sm sm:text-base shadow-md"
          >
            <span className="mr-1">🔄</span>
            <span className="hidden sm:inline">Reset </span>
            Tournament
          </button>
        </div>
      </div>
    </nav>
  );
}
