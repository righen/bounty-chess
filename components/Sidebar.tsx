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
      className={`fixed flex flex-col top-0 left-0 p-4 bg-brand-primary h-screen transition-all duration-300 ease-in-out z-[99999] w-[290px] ${
        sidebarOpen ? 'translate-x-0 lg:translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="flex flex-col h-full">
        {/* Logo - matching Score360 style */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-white text-center">
            BOUNTY <span className="text-brand-secondary">CHESS</span>
          </h1>
        </div>

        {/* Navigation Menu - matching Score360 exactly */}
        <ul className="flex flex-col gap-4 flex-1">
          <li>
            <button
              onClick={() => onViewChange('players')}
              className={`flex items-center gap-3 py-2.5 px-4 !text-white cursor-pointer rounded-lg font-medium transition-all duration-200 hover:bg-white/10 w-full text-left ${
                view === 'players' ? 'bg-white/10' : 'bg-transparent'
              }`}
            >
              <svg className="w-[22px] h-[22px] text-brand-secondary" fill="currentColor" viewBox="0 0 256 256">
                <path d="M117.25,157.92a60,60,0,1,0-66.5,0A95.83,95.83,0,0,0,3.53,195.63a8,8,0,1,0,13.4,8.74,80,80,0,0,1,134.14,0,8,8,0,0,0,13.4-8.74A95.83,95.83,0,0,0,117.25,157.92ZM40,108a44,44,0,1,1,44,44A44.05,44.05,0,0,1,40,108Zm210.14,98.7a8,8,0,0,1-11.07-2.33A79.83,79.83,0,0,0,172,168a8,8,0,0,1,0-16,44,44,0,1,0-16.34-84.87,8,8,0,1,1-5.94-14.85,60,60,0,0,1,55.53,105.64,95.83,95.83,0,0,1,47.22,37.71A8,8,0,0,1,250.14,206.7Z"></path>
              </svg>
              <span className="text-sm">Manage Players</span>
            </button>
          </li>
          <li>
            <button
              onClick={() => onViewChange('leaderboard')}
              className={`flex items-center gap-3 py-2.5 px-4 !text-white cursor-pointer rounded-lg font-medium transition-all duration-200 hover:bg-white/10 w-full text-left ${
                view === 'leaderboard' ? 'bg-white/10' : 'bg-transparent'
              }`}
            >
              <svg className="w-[22px] h-[22px] text-brand-secondary" fill="currentColor" viewBox="0 0 256 256">
                <path d="M232,64H208V56a16,16,0,0,0-16-16H168a16,16,0,0,0-16,16v8H104V56A16,16,0,0,0,88,40H64A16,16,0,0,0,48,56v8H24A16,16,0,0,0,8,80V192a16,16,0,0,0,16,16H232a16,16,0,0,0,16-16V80A16,16,0,0,0,232,64ZM88,56h0V176H64V56Zm80,0h0V176H104V56Zm64,136H24V80H48v96a16,16,0,0,0,16,16H192a16,16,0,0,0,16-16V80h24Z"></path>
              </svg>
              <span className="text-sm">Leaderboard</span>
            </button>
          </li>
          <li>
            <button
              onClick={() => onViewChange('round')}
              className={`flex items-center gap-3 py-2.5 px-4 !text-white cursor-pointer rounded-lg font-medium transition-all duration-200 hover:bg-white/10 w-full text-left ${
                view === 'round' ? 'bg-white/10' : 'bg-transparent'
              }`}
            >
              <svg className="w-[22px] h-[22px] text-brand-secondary" fill="currentColor" viewBox="0 0 256 256">
                <path d="M176,112H152a8,8,0,0,1,0-16h24a8,8,0,0,1,0,16Zm-72-16H96V88a8,8,0,0,0-16,0v8H72a8,8,0,0,0,0,16h8v8a8,8,0,0,0,16,0v-8h8a8,8,0,0,0,0-16Zm128,48A104.12,104.12,0,0,1,128,248,104,104,0,0,1,59.52,46,8,8,0,0,1,68.7,56,24,24,0,1,0,103.29,80.8a8,8,0,0,1,15.43,4.21,40,40,0,1,1-67.17-43,86,86,0,0,0-5.9,6.61,8,8,0,0,1-13.22-9A103.93,103.93,0,1,1,232,144Z"></path>
              </svg>
              <span className="text-sm">Current Round</span>
            </button>
          </li>
          <li>
            <button
              onClick={() => onViewChange('prizes')}
              className={`flex items-center gap-3 py-2.5 px-4 !text-white cursor-pointer rounded-lg font-medium transition-all duration-200 hover:bg-white/10 w-full text-left ${
                view === 'prizes' ? 'bg-white/10' : 'bg-transparent'
              }`}
            >
              <svg className="w-[22px] h-[22px] text-brand-secondary" fill="currentColor" viewBox="0 0 256 256">
                <path d="M219.31,108.68l-80-80a16,16,0,0,0-22.62,0l-80,80A15.87,15.87,0,0,0,32,120v96a8,8,0,0,0,8,8H216a8,8,0,0,0,8-8V120A15.87,15.87,0,0,0,219.31,108.68ZM208,208H48V120l80-80,80,80Z"></path>
              </svg>
              <span className="text-sm">Prizes</span>
            </button>
          </li>
          <li>
            <button
              onClick={onImport}
              className="flex items-center gap-3 py-2.5 px-4 !text-white cursor-pointer rounded-lg font-medium transition-all duration-200 hover:bg-white/10 w-full bg-transparent text-left"
            >
              <svg className="w-[22px] h-[22px] text-brand-secondary" fill="currentColor" viewBox="0 0 256 256">
                <path d="M176,112H152a8,8,0,0,1,0-16h24a8,8,0,0,1,0,16Zm-72-16H96V88a8,8,0,0,0-16,0v8H72a8,8,0,0,0,0,16h8v8a8,8,0,0,0,16,0v-8h8a8,8,0,0,0,0-16Zm128,48A104.12,104.12,0,0,1,128,248a104.12,104.12,0,0,1-73.81-176.19,8,8,0,0,1,11.31,11.31A88,88,0,1,0,216,144a8,8,0,0,1,16,0Z"></path>
              </svg>
              <span className="text-sm">Import Data</span>
            </button>
          </li>
          <li>
            <button
              onClick={onExport}
              className="flex items-center gap-3 py-2.5 px-4 !text-white cursor-pointer rounded-lg font-medium transition-all duration-200 hover:bg-white/10 w-full bg-transparent text-left"
            >
              <svg className="w-[22px] h-[22px] text-brand-secondary" fill="currentColor" viewBox="0 0 256 256">
                <path d="M216,112v96a16,16,0,0,1-16,16H56a16,16,0,0,1-16-16V112A16,16,0,0,1,56,96H80a8,8,0,0,1,0,16H56v96H200V112H176a8,8,0,0,1,0-16h24A16,16,0,0,1,216,112ZM93.66,69.66,120,43.31V136a8,8,0,0,0,16,0V43.31l26.34,26.35a8,8,0,0,0,11.32-11.32l-40-40a8,8,0,0,0-11.32,0l-40,40A8,8,0,0,0,93.66,69.66Z"></path>
              </svg>
              <span className="text-sm">Export Data</span>
            </button>
          </li>
        </ul>

        {/* Bottom Section - matching Score360 with user info */}
        <div className="border-t border-white/10 pt-4 mt-4">
          {/* Tournament Info */}
          <div className="px-4 py-2 mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-brand-secondary rounded-lg flex items-center justify-center text-brand-primary font-bold text-lg">
                {tournamentStarted ? currentRound : '0'}
              </div>
              <div className="flex-1">
                <p className="text-white text-sm font-medium truncate">Round {currentRound}/{totalRounds}</p>
                <p className="text-white/70 text-xs truncate">{playersCount} Players</p>
              </div>
            </div>
          </div>

          {/* Reset Button - matching Score360 logout style */}
          <button 
            onClick={onReset}
            className="flex items-center gap-3 w-full py-2.5 px-4 text-white bg-white/10 hover:bg-white/15 cursor-pointer rounded-lg transition-all"
          >
            <svg className="w-[22px] h-[22px]" fill="currentColor" viewBox="0 0 256 256">
              <path d="M240,56v48a8,8,0,0,1-8,8H184a8,8,0,0,1,0-16H211.4L184.81,71.64l-.25-.24a80,80,0,1,0-1.67,114.78,8,8,0,0,1,11,11.63A95.44,95.44,0,0,1,128,224h-1.32A96,96,0,1,1,195.75,60L224,85.8V56a8,8,0,1,1,16,0Z"></path>
            </svg>
            <span className="text-sm">Reset Tournament</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
