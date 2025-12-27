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

  const sampleCSV = `Player N°,Name,Surname,Birth date,Current address,Meal,Payment proof,Transfer Name
1,Aayush,Aashish,03/12/2010,Quatre Bornes,Veg,ok,Aashish Ranganathan
2,Jordan,Agathe,01/11/2001,Goodlands,,ok,Agathe Annick
3,Manusha,Aubeeluck,30/01/2002,Clementia,Normal,ok,Manusha Aubeeluck
4,Rama,Baloonuck,20/08/1978,Vacoas,Normal,ok,Rama Baloonuck
5,Lovenah,Beharry,24/12/1986,Quatre Bornes,Normal,ok,Beehary Parnay
6,Romain,Brugette,06/06/2006,,Normal,ok,Romain Brugette
7,Anya,Burbach,24/06/2006,Quatre Bornes,Normal,ok,Bruno Burbach
8,Brunel,Burbach,10/11/2008,Quatre Bornes,Normal,ok,Bruno Burbach
9,Bruno,Burbach,27/09/1959,Quatre Bornes,Normal,ok,Bruno Burbach
10,Akhilesh,Dhoorah,22/06/2023,Cottage,Normal,ok,Akilesh choorah
11,Harishav,Emrit,07/07/2011,Dagotiere,Normal,ok,Rishi Emrit
12,Aarav,Gungah,14/11/2013,,,ok,Aarav Gungah
13,Mikhael,Hardy,27/09/2004,Quatre Bornes,Normal,ok,Noah Hardy
14,Jean Hugues,Jugganaigooloo,19/04/2000,Curepipe,Normal,ok,Jean Hugues Jagganaigooloo
15,Stephane,Lam,18/02/2001,Vacoas,Normal,ok,Stephane Lam
16,Meryl,Li Shing Hiung,17/11/2003,Coromandel,Normal,ok,Meryl Shing
17,Keshavi,Meenowa,14/04/2012,Notre-Dame,Normal,ok,Keshavi Meenowa
18,Vanji,Motee,18/08/2014,Quatre Bornes,Normal,ok,Vanji Motee
19,Raees,Mungur,19/03/2007,Mahebourg,Normal,ok,Raees Mungur
20,Krishna,Nagarajen,23/03/1989,Helvetia,,ok,Krishna Samoo
21,Pascal,Permal,20/10/1983,St-Julien,,ok,Krishna Samoo
22,Loganatha,Pillay,16/04/2010,Bon Acceuil,Veg,ok,KOUJALI P JAGAMBRUM
23,Bhavish,Ramtale,09/11/1994,Triolet,Normal,ok,Bhavish Ramtale
24,Randrasheak,Randhay,26/11/2013,Rose Hill,Normal,ok,Rhitisheak Randhay
25,Rhitisheak,Randhay,03/01/2001,Rose Hill,Normal,ok,Rhitisheak Randhay
26,Dinay,Reetoo,23/02/1978,Ebene,Normal,ok,dinay Reetoo
27,Sahil,Reetoo,18/04/2011,Ebene,Veg,ok,dinay Reetoo
28,Shanaya,Reetoo,11/03/2013,Ebene,Veg,ok,dinay Reetoo
29,Bhavish,Sanassee,11/05/2001,Quatre Bornes,Normal,ok,Bhavish Sanassee
30,Krishay,Seebundhun,,,ok,Pravesh Seebundhun
31,Pravesh,Seebundhun,,,ok,Pravesh Seebundhun
32,Rayan,Sockalingum,01/12/2013,Castel,Veg,ok,Kevin Sokalingum
33,Keshav,Sooroojabally,29/07/2011,Vacoas,Normal,ok,Rishi Emrit
34,Luvlesh,Sunkur,19/06/1990,Triolet,Normal,ok,Havish Julah Sunkur
35,Nandkeshwar,Sunkur,03/03/1959,Triolet,Normal,ok,Havish Julah Sunkur
36,Arnaud,Felix,27/09/1985,Quatre Bornes,Normal,ok,Arnaud Felix
37,Vicken,Sawmynaden,29/09/1995,Quartier Militaire,Normal,ok,`;

  const handleLoadSample = () => {
    setCsvText(sampleCSV);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
        <h2 className="text-2xl font-bold mb-4">Import Players</h2>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Upload CSV File
          </label>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="block w-full text-sm text-gray-400
              file:mr-4 file:py-2 file:px-4
              file:rounded file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-600 file:text-white
              hover:file:bg-blue-700
              cursor-pointer"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Or Paste CSV Data
          </label>
          <textarea
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            placeholder={sampleCSV}
            className="w-full h-64 p-3 bg-gray-700 border border-gray-600 rounded
              text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded text-red-200">
            {error}
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={handleLoadSample}
            className="flex-1 bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-6 rounded
              transition-colors"
          >
            Load Sample Data (37 Players)
          </button>
          <button
            onClick={handleImport}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded
              transition-colors"
          >
            Import Players & Start Tournament
          </button>
        </div>

        <div className="mt-6 p-4 bg-gray-700 rounded text-sm">
          <h3 className="font-semibold mb-2">CSV Format:</h3>
          <p className="text-gray-300 mb-3">
            Expected columns: Player N°, Name, Surname, Birth date (DD/MM/YYYY), 
            Current address, Meal, Payment proof, Transfer Name
          </p>
          <div className="mt-3 p-3 bg-blue-900/30 border border-blue-700 rounded">
            <p className="text-blue-200 text-sm">
              💡 <strong>Tip:</strong> After importing, you can add more players manually 
              using the "Manage Players" interface - perfect for last-minute registrations!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

