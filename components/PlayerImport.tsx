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
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg p-6 md:p-8 shadow-xl border border-gray-200">
        <h2 className="text-3xl font-bold mb-6 text-brand-primary">
          📥 Import Players
        </h2>
        
        {/* Upload Section */}
        <div className="mb-6">
          <label className="block text-lg font-semibold mb-3 text-gray-700">
            📁 Upload CSV File
          </label>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="w-full text-base text-gray-700 p-3 bg-gray-50 border-2 border-gray-200 rounded-lg
              file:mr-4 file:py-3 file:px-6 file:rounded-lg file:border-0
              file:text-base file:font-bold file:bg-brand-secondary file:text-brand-primary
              hover:file:bg-yellow-500 file:cursor-pointer file:transition-all file:active:scale-95
              cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-secondary"
          />
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 border-t border-gray-300"></div>
          <span className="text-gray-500 font-semibold text-sm uppercase">OR</span>
          <div className="flex-1 border-t border-gray-300"></div>
        </div>

        {/* Paste Section */}
        <div className="mb-6">
          <label className="block text-lg font-semibold mb-3 text-gray-700">
            📝 Paste CSV Data
          </label>
          <textarea
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            placeholder="Paste your CSV data here..."
            className="w-full h-56 p-4 bg-gray-50 border-2 border-gray-200 rounded-lg
              text-sm font-mono text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-secondary
              placeholder:text-gray-400"
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-300 rounded-lg text-red-700 font-semibold text-base">
            ⚠️ {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <button
            onClick={handleLoadSample}
            className="w-full bg-brand-quinary hover:bg-purple-700 active:scale-95 text-white font-bold 
              py-4 px-6 rounded-lg transition-all text-lg shadow-md"
          >
            🎯 Load Sample (37 Players)
          </button>
          <button
            onClick={handleImport}
            className="w-full bg-brand-secondary hover:bg-yellow-500 active:scale-95 text-brand-primary font-bold 
              py-4 px-6 rounded-lg transition-all text-lg shadow-md"
          >
            ✓ Import Players
          </button>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-5">
          <h3 className="font-bold text-lg mb-3 text-blue-900">
            ℹ️ CSV Format Guide
          </h3>
          <p className="text-gray-700 mb-3 text-base leading-relaxed">
            <strong>Expected columns:</strong> Player N°, Name, Surname, Birth date (DD/MM/YYYY), 
            Current address, Meal, Payment proof, Transfer Name
          </p>
          <p className="text-brand-quinary font-semibold text-base">
            💡 <strong>Tip:</strong> Birth date is optional! You can add it later using "Manage Players" - 
            perfect for last-minute registrations!
          </p>
        </div>
      </div>
    </div>
  );
}
