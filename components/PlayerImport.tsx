'use client';

import { useState } from 'react';
import { Player } from '@/types';
import { parseCSV, initializePlayers } from '@/lib/utils';

interface PlayerImportProps {
  onPlayersImported: (players: Player[]) => void;
}

export default function PlayerImport({ onPlayersImported }: PlayerImportProps) {
  const [csvText, setCsvText] = useState('');
  const [error, setError] = useState('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvText(text);
    };
    reader.readAsText(file);
  };

  const handleImport = () => {
    try {
      setError('');
      
      if (!csvText.trim()) {
        setError('Please paste or upload CSV data');
        return;
      }

      const rawPlayers = parseCSV(csvText);
      
      if (rawPlayers.length === 0) {
        setError('No players found in CSV');
        return;
      }

      const players = initializePlayers(rawPlayers);
      onPlayersImported(players);
    } catch (err) {
      setError(`Error parsing CSV: ${err}`);
    }
  };

  const handleLoadSample = async () => {
    try {
      const response = await fetch('/tournament-players.csv');
      const text = await response.text();
      setCsvText(text);
    } catch (err) {
      setError('Could not load sample data');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-2 sm:px-4">
      <div className="bg-gray-800 rounded-lg p-4 sm:p-6 md:p-8 shadow-xl">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 text-blue-400 text-center sm:text-left">
          📥 Import Players
        </h2>
        
        {/* Upload Section */}
        <div className="mb-6">
          <label className="block text-lg sm:text-xl font-bold mb-3 text-gray-300">
            📁 Upload CSV File
          </label>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="w-full text-base sm:text-lg text-gray-300 p-3 sm:p-4 bg-gray-700 border-2 border-gray-600 rounded-lg
              file:mr-4 file:py-3 file:px-6 file:rounded-lg file:border-0
              file:text-base file:font-bold file:bg-blue-600 file:text-white
              hover:file:bg-blue-700 file:cursor-pointer file:transition-all file:active:scale-95 file:shadow-md
              cursor-pointer"
          />
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 border-t-2 border-gray-600"></div>
          <span className="text-gray-400 font-bold text-lg">OR</span>
          <div className="flex-1 border-t-2 border-gray-600"></div>
        </div>

        {/* Paste Section */}
        <div className="mb-6">
          <label className="block text-lg sm:text-xl font-bold mb-3 text-gray-300">
            📝 Paste CSV Data
          </label>
          <textarea
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            placeholder="Paste your CSV data here..."
            className="w-full h-48 sm:h-56 md:h-64 p-4 bg-gray-700 border-2 border-gray-600 rounded-lg
              text-sm sm:text-base font-mono focus:outline-none focus:ring-4 focus:ring-blue-500
              placeholder:text-gray-500"
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/50 border-2 border-red-700 rounded-lg text-red-200 font-semibold text-base sm:text-lg">
            ⚠️ {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <button
            onClick={handleLoadSample}
            className="w-full bg-gray-600 hover:bg-gray-500 active:scale-95 text-white font-bold 
              py-4 sm:py-5 px-6 rounded-lg transition-all text-base sm:text-lg md:text-xl shadow-lg"
          >
            🎯 Load Sample (37 Players)
          </button>
          <button
            onClick={handleImport}
            className="w-full bg-green-600 hover:bg-green-700 active:scale-95 text-white font-bold 
              py-4 sm:py-5 px-6 rounded-lg transition-all text-base sm:text-lg md:text-xl shadow-lg"
          >
            ✓ Import Players
          </button>
        </div>

        {/* Info Box */}
        <div className="bg-blue-900/30 border-2 border-blue-700 rounded-lg p-4 sm:p-5">
          <h3 className="font-bold text-lg sm:text-xl mb-3 text-blue-300">
            ℹ️ CSV Format Guide
          </h3>
          <p className="text-gray-300 mb-3 text-base sm:text-lg leading-relaxed">
            <strong>Expected columns:</strong> Player N°, Name, Surname, Birth date (DD/MM/YYYY), 
            Current address, Meal, Payment proof, Transfer Name
          </p>
          <p className="text-yellow-200 font-semibold text-base sm:text-lg">
            💡 <strong>Tip:</strong> Birth date is optional! You can add it later using "Manage Players" - 
            perfect for last-minute registrations!
          </p>
        </div>
      </div>
    </div>
  );
}
