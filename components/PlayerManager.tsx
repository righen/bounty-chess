'use client';

import { useState } from 'react';
import { Player } from '@/types';
import { calculateAge, guessGender, formatBounty, getCriminalStatusColor, getAgeCategory } from '@/lib/utils';

interface PlayerManagerProps {
  players: Player[];
  onPlayersUpdate: (players: Player[]) => void;
  tournamentStarted: boolean;
}

export default function PlayerManager({ players, onPlayersUpdate, tournamentStarted }: PlayerManagerProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  // Count players without birthdates
  const playersWithoutBirthdate = players.filter(p => !p.birthdate || p.birthdate.trim() === '').length;
  
  // Form fields
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    surname: '',
    birthdate: '',
    currentAddress: '',
    meal: '',
    gender: 'M',
  });

  const resetForm = () => {
    setFormData({
      id: '',
      name: '',
      surname: '',
      birthdate: '',
      currentAddress: '',
      meal: '',
      gender: 'M',
    });
    setIsAdding(false);
    setEditingId(null);
  };

  const handleAdd = () => {
    // Validate required fields
    if (!formData.name || !formData.surname) {
      alert('Name and Surname are required!');
      return;
    }

    // Generate ID if not provided
    let playerId = formData.id ? parseInt(formData.id) : 0;
    if (!playerId || players.some(p => p.id === playerId)) {
      playerId = Math.max(0, ...players.map(p => p.id)) + 1;
    }

    const newPlayer: Player = {
      id: playerId,
      name: formData.name,
      surname: formData.surname,
      birthdate: formData.birthdate,
      currentAddress: formData.currentAddress,
      meal: formData.meal,
      paymentProof: 'ok',
      transferName: `${formData.name} ${formData.surname}`,
      age: formData.birthdate ? calculateAge(formData.birthdate) : 0,
      gender: (formData.gender as 'M' | 'F') || 'M',
      bounty: 20,
      hasSheriffBadge: true,
      criminalStatus: 'normal',
      wins: 0,
      losses: 0,
      draws: 0,
      opponentIds: [],
    };

    onPlayersUpdate([...players, newPlayer]);
    resetForm();
  };

  const handleEdit = (player: Player) => {
    setEditingId(player.id);
    setFormData({
      id: player.id.toString(),
      name: player.name,
      surname: player.surname,
      birthdate: player.birthdate,
      currentAddress: player.currentAddress,
      meal: player.meal,
      gender: player.gender,
    });
    setIsAdding(true);
  };

  const handleUpdate = () => {
    if (!formData.name || !formData.surname) {
      alert('Name and Surname are required!');
      return;
    }

    const updatedPlayers = players.map(p => {
      if (p.id === editingId) {
        return {
          ...p,
          name: formData.name,
          surname: formData.surname,
          birthdate: formData.birthdate,
          currentAddress: formData.currentAddress,
          meal: formData.meal,
          age: formData.birthdate ? calculateAge(formData.birthdate) : 0,
          gender: (formData.gender as 'M' | 'F') || 'M',
        };
      }
      return p;
    });

    onPlayersUpdate(updatedPlayers);
    resetForm();
  };

  const handleDelete = (playerId: number) => {
    if (confirm('Are you sure you want to delete this player?')) {
      onPlayersUpdate(players.filter(p => p.id !== playerId));
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Add/Edit Form */}
      {isAdding ? (
        <div className="bg-white rounded-lg p-6 shadow-xl border border-gray-200">
          <h3 className="text-2xl font-bold mb-6 text-brand-primary">
            {editingId ? '✏️ Edit Player' : '➕ Add New Player'}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                Player Number (auto-generated if empty)
              </label>
              <input
                type="number"
                value={formData.id}
                onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                disabled={editingId !== null}
                className="w-full p-3 bg-gray-50 border-2 border-gray-200 rounded-lg text-gray-800
                  focus:outline-none focus:ring-2 focus:ring-brand-secondary disabled:bg-gray-100"
                placeholder="Auto"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-3 bg-gray-50 border-2 border-gray-200 rounded-lg text-gray-800
                  focus:outline-none focus:ring-2 focus:ring-brand-secondary"
                placeholder="e.g., John"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.surname}
                onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
                className="w-full p-3 bg-gray-50 border-2 border-gray-200 rounded-lg text-gray-800
                  focus:outline-none focus:ring-2 focus:ring-brand-secondary"
                placeholder="e.g., Doe"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                Birth Date (DD/MM/YYYY) <span className="text-brand-quinary text-xs">(Optional)</span>
              </label>
              <input
                type="text"
                value={formData.birthdate}
                onChange={(e) => setFormData({ ...formData, birthdate: e.target.value })}
                className="w-full p-3 bg-gray-50 border-2 border-gray-200 rounded-lg text-gray-800
                  focus:outline-none focus:ring-2 focus:ring-brand-secondary"
                placeholder="e.g., 15/05/2000"
              />
              <p className="text-xs text-gray-500 mt-1">
                💡 Leave empty if unknown. Can be added later.
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                Address
              </label>
              <input
                type="text"
                value={formData.currentAddress}
                onChange={(e) => setFormData({ ...formData, currentAddress: e.target.value })}
                className="w-full p-3 bg-gray-50 border-2 border-gray-200 rounded-lg text-gray-800
                  focus:outline-none focus:ring-2 focus:ring-brand-secondary"
                placeholder="e.g., Quatre Bornes"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                Meal Preference
              </label>
              <select
                value={formData.meal}
                onChange={(e) => setFormData({ ...formData, meal: e.target.value })}
                className="w-full p-3 bg-gray-50 border-2 border-gray-200 rounded-lg text-gray-800
                  focus:outline-none focus:ring-2 focus:ring-brand-secondary"
              >
                <option value="">Normal</option>
                <option value="Normal">Normal</option>
                <option value="Veg">Vegetarian</option>
                <option value="Vegan">Vegan</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                Gender <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full p-3 bg-gray-50 border-2 border-gray-200 rounded-lg text-gray-800
                  focus:outline-none focus:ring-2 focus:ring-brand-secondary"
              >
                <option value="M">Male</option>
                <option value="F">Female</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={editingId ? handleUpdate : handleAdd}
              className="flex-1 bg-brand-secondary hover:bg-yellow-500 text-brand-primary font-bold py-3 px-6 rounded-lg
                transition-all active:scale-95 shadow-md"
            >
              {editingId ? '✓ Update Player' : '✓ Add Player'}
            </button>
            <button
              onClick={resetForm}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-3 px-6 rounded-lg
                transition-all active:scale-95"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex justify-end">
          <button
            onClick={() => setIsAdding(true)}
            disabled={tournamentStarted}
            className={`font-bold py-3 px-6 rounded-lg transition-all shadow-md ${
              tournamentStarted
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-brand-secondary hover:bg-yellow-500 text-brand-primary active:scale-95'
            }`}
          >
            ➕ Add New Player
          </button>
        </div>
      )}

      {/* Warning for missing birthdates */}
      {playersWithoutBirthdate > 0 && !tournamentStarted && (
        <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <h4 className="font-bold text-yellow-800 mb-1">
                {playersWithoutBirthdate} {playersWithoutBirthdate === 1 ? 'player' : 'players'} missing birthdate
              </h4>
              <p className="text-sm text-yellow-700">
                These players won't receive age-based bounty protections (U12, U16) until birthdates are added.
                Click "Edit" to add missing birthdates before starting the tournament.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Players List */}
      <div className="bg-white rounded-lg overflow-hidden shadow-xl border border-gray-200">
        <div className="p-4 bg-gray-100 border-b border-gray-200">
          <h3 className="text-lg font-bold text-brand-primary">
            Players List ({players.length} players)
            {playersWithoutBirthdate > 0 && (
              <span className="ml-2 text-sm text-yellow-600">
                ({playersWithoutBirthdate} missing birthdate)
              </span>
            )}
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-gray-700">
            <thead className="bg-gray-100 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-bold text-gray-800">ID</th>
                <th className="px-4 py-3 text-left font-bold text-gray-800">Name</th>
                <th className="px-4 py-3 text-left font-bold text-gray-800">Birth Date</th>
                <th className="px-4 py-3 text-center font-bold text-gray-800">Age</th>
                <th className="px-4 py-3 text-center font-bold text-gray-800">Category</th>
                <th className="px-4 py-3 text-center font-bold text-gray-800">Gender</th>
                <th className="px-4 py-3 text-left font-bold text-gray-800">Address</th>
                <th className="px-4 py-3 text-left font-bold text-gray-800">Meal</th>
                {!tournamentStarted && (
                  <th className="px-4 py-3 text-center font-bold text-gray-800">Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {players.length === 0 ? (
                <tr>
                  <td colSpan={tournamentStarted ? 8 : 9} className="px-4 py-8 text-center text-gray-400">
                    No players yet. Click "Add New Player" to start.
                  </td>
                </tr>
              ) : (
                players.map((player, idx) => (
                  <tr
                    key={player.id}
                    className={`border-t border-gray-100 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100 transition-colors`}
                  >
                    <td className="px-4 py-3 text-gray-500">{player.id}</td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-gray-800">{player.name} {player.surname}</div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {player.birthdate ? (
                        <span className="text-gray-600">{player.birthdate}</span>
                      ) : (
                        <span className="text-yellow-600 flex items-center gap-1 font-semibold">
                          <span>⚠️</span>
                          <span>Missing</span>
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-gray-600 font-semibold">
                        {player.age > 0 ? player.age : '-'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {player.age > 0 ? (
                        <span className={`text-xs px-2 py-1 rounded font-semibold ${getAgeCategory(player.age).color}`}>
                          {getAgeCategory(player.age).label}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-sm font-semibold ${
                        player.gender === 'F' ? 'text-pink-500' : 'text-blue-500'
                      }`}>
                        {player.gender === 'F' ? 'Female' : 'Male'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {player.currentAddress || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {player.meal || 'Normal'}
                    </td>
                    {!tournamentStarted && (
                      <td className="px-4 py-3">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => handleEdit(player)}
                            className="px-3 py-1 bg-brand-quinary hover:bg-purple-700 text-white text-xs font-bold rounded
                              transition-all active:scale-95"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(player.id)}
                            className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded
                              transition-all active:scale-95"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {tournamentStarted && (
        <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4 text-yellow-800 text-sm font-semibold">
          ⚠️ Tournament has started. Player editing is disabled. Export data and restart to make changes.
        </div>
      )}
    </div>
  );
}
