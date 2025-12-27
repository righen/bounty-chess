'use client';

import { House, Users, GameController, Trophy, UploadSimple, DownloadSimple, ArrowCounterClockwise, SignOut } from 'phosphor-react';

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
        sidebarOpen ? '-translate-x-full lg:translate-x-0' : 'lg:-translate-x-full'
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
              className={`flex items-center gap-3 py-2.5 px-4 !text-white cursor-pointer rounded-lg font-medium transition-all duration-200 hover:bg-white/10 w-full ${
                view === 'players' ? 'bg-white/10' : 'bg-transparent'
              }`}
            >
              <Users className="w-[22px] h-[22px] text-brand-secondary" />
              <span className="text-sm">Manage Players</span>
            </button>
          </li>
          <li>
            <button
              onClick={() => onViewChange('leaderboard')}
              className={`flex items-center gap-3 py-2.5 px-4 !text-white cursor-pointer rounded-lg font-medium transition-all duration-200 hover:bg-white/10 w-full ${
                view === 'leaderboard' ? 'bg-white/10' : 'bg-transparent'
              }`}
            >
              <Trophy className="w-[22px] h-[22px] text-brand-secondary" />
              <span className="text-sm">Leaderboard</span>
            </button>
          </li>
          <li>
            <button
              onClick={() => onViewChange('round')}
              className={`flex items-center gap-3 py-2.5 px-4 !text-white cursor-pointer rounded-lg font-medium transition-all duration-200 hover:bg-white/10 w-full ${
                view === 'round' ? 'bg-white/10' : 'bg-transparent'
              }`}
            >
              <GameController className="w-[22px] h-[22px] text-brand-secondary" />
              <span className="text-sm">Current Round</span>
            </button>
          </li>
          <li>
            <button
              onClick={() => onViewChange('prizes')}
              className={`flex items-center gap-3 py-2.5 px-4 !text-white cursor-pointer rounded-lg font-medium transition-all duration-200 hover:bg-white/10 w-full ${
                view === 'prizes' ? 'bg-white/10' : 'bg-transparent'
              }`}
            >
              <House className="w-[22px] h-[22px] text-brand-secondary" />
              <span className="text-sm">Prizes</span>
            </button>
          </li>
          <li>
            <button
              onClick={onImport}
              className="flex items-center gap-3 py-2.5 px-4 !text-white cursor-pointer rounded-lg font-medium transition-all duration-200 hover:bg-white/10 w-full bg-transparent"
            >
              <UploadSimple className="w-[22px] h-[22px] text-brand-secondary" />
              <span className="text-sm">Import Data</span>
            </button>
          </li>
          <li>
            <button
              onClick={onExport}
              className="flex items-center gap-3 py-2.5 px-4 !text-white cursor-pointer rounded-lg font-medium transition-all duration-200 hover:bg-white/10 w-full bg-transparent"
            >
              <DownloadSimple className="w-[22px] h-[22px] text-brand-secondary" />
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
            <ArrowCounterClockwise className="w-[22px] h-[22px]" />
            <span className="text-sm">Reset Tournament</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
