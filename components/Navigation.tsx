'use client';

interface NavigationProps {
  view: 'setup' | 'leaderboard' | 'round' | 'players' | 'prizes';
  onViewChange: (view: 'setup' | 'leaderboard' | 'round' | 'players' | 'prizes') => void;
  onReset: () => void;
  onExport: () => void;
}

export default function Navigation({ view, onViewChange, onReset, onExport }: NavigationProps) {
  return (
    <nav className="bg-gray-800 border-b border-gray-700">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-3">
          <div className="flex space-x-2">
            <button
              onClick={() => onViewChange('players')}
              className={`px-4 py-2 rounded transition-colors ${
                view === 'players'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              👥 Manage Players
            </button>
            <button
              onClick={() => onViewChange('leaderboard')}
              className={`px-4 py-2 rounded transition-colors ${
                view === 'leaderboard'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              🏆 Leaderboard
            </button>
            <button
              onClick={() => onViewChange('round')}
              className={`px-4 py-2 rounded transition-colors ${
                view === 'round'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              ♟️ Current Round
            </button>
            <button
              onClick={() => onViewChange('prizes')}
              className={`px-4 py-2 rounded transition-colors ${
                view === 'prizes'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              🎖️ Prizes
            </button>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={onExport}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
            >
              Export Data
            </button>
            <button
              onClick={onReset}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
            >
              Reset Tournament
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

