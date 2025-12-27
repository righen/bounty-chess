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
    <div className="space-y-6">
      {/* Add/Edit Form */}
      {isAdding ? (
        <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
          <h3 className="text-xl font-bold mb-4">
            {editingId ? 'Edit Player' : 'Add New Player'}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Player Number (auto-generated if empty)
              </label>
              <input
                type="number"
                value={formData.id}
                onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                disabled={editingId !== null}
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white
                  focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Auto"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white
                  focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., John"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.surname}
                onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white
                  focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Doe"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Birth Date (DD/MM/YYYY) <span className="text-yellow-500 text-xs">(Optional - can be added later)</span>
              </label>
              <input
                type="text"
                value={formData.birthdate}
                onChange={(e) => setFormData({ ...formData, birthdate: e.target.value })}
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white
                  focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 15/05/2000"
              />
              <p className="text-xs text-gray-400 mt-1">
                💡 Leave empty if unknown. Age-based protections won't apply until birthdate is added.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Address
              </label>
              <input
                type="text"
                value={formData.currentAddress}
                onChange={(e) => setFormData({ ...formData, currentAddress: e.target.value })}
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white
                  focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Quatre Bornes"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Meal Preference
              </label>
              <select
                value={formData.meal}
                onChange={(e) => setFormData({ ...formData, meal: e.target.value })}
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white
                  focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Normal</option>
                <option value="Normal">Normal</option>
                <option value="Veg">Vegetarian</option>
                <option value="Vegan">Vegan</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Gender <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white
                  focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="M">Male</option>
                <option value="F">Female</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={editingId ? handleUpdate : handleAdd}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded
                transition-colors"
            >
              {editingId ? 'Update Player' : 'Add Player'}
            </button>
            <button
              onClick={resetForm}
              className="flex-1 bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-6 rounded
                transition-colors"
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
            className={`font-bold py-3 px-6 rounded transition-colors ${
              tournamentStarted
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            + Add New Player
          </button>
        </div>
      )}

      {/* Warning for missing birthdates */}
      {playersWithoutBirthdate > 0 && !tournamentStarted && (
        <div className="bg-yellow-900/30 border border-yellow-700 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <h4 className="font-bold text-yellow-400 mb-1">
                {playersWithoutBirthdate} {playersWithoutBirthdate === 1 ? 'player' : 'players'} missing birthdate
              </h4>
              <p className="text-sm text-yellow-200">
                These players won't receive age-based bounty protections (U12, U16) until birthdates are added.
                Click "Edit" to add missing birthdates before starting the tournament.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Players List */}
      <div className="bg-gray-800 rounded-lg overflow-hidden shadow-xl">
        <div className="p-4 bg-gray-700 border-b border-gray-600">
          <h3 className="text-lg font-bold">
            Players List ({players.length} players)
            {playersWithoutBirthdate > 0 && (
              <span className="ml-2 text-sm text-yellow-400">
                ({playersWithoutBirthdate} missing birthdate)
              </span>
            )}
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left">ID</th>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Birth Date</th>
                <th className="px-4 py-3 text-center">Age</th>
                <th className="px-4 py-3 text-center">Category</th>
                <th className="px-4 py-3 text-center">Gender</th>
                <th className="px-4 py-3 text-left">Address</th>
                <th className="px-4 py-3 text-left">Meal</th>
                {!tournamentStarted && (
                  <th className="px-4 py-3 text-center">Actions</th>
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
                players.map((player) => (
                  <tr
                    key={player.id}
                    className="border-t border-gray-700 hover:bg-gray-700/50"
                  >
                    <td className="px-4 py-3 text-gray-400">{player.id}</td>
                    <td className="px-4 py-3">
                      <div className="font-semibold">{player.name} {player.surname}</div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {player.birthdate ? (
                        <span className="text-gray-400">{player.birthdate}</span>
                      ) : (
                        <span className="text-yellow-500 flex items-center gap-1">
                          <span>⚠️</span>
                          <span className="font-semibold">Missing</span>
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-sm font-semibold ${
                        player.age < 10 ? 'text-blue-400' :
                        player.age < 16 ? 'text-green-400' :
                        'text-gray-400'
                      }`}>
                        {player.age > 0 ? player.age : '-'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {player.age > 0 ? (
                        <span className={`text-xs px-2 py-1 rounded font-semibold ${getAgeCategory(player.age).color}`}>
                          {getAgeCategory(player.age).label}
                        </span>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-sm font-semibold ${
                        player.gender === 'F' ? 'text-pink-400' : 'text-blue-400'
                      }`}>
                        {player.gender === 'F' ? 'Female' : 'Male'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-400">
                      {player.currentAddress || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {player.meal || 'Normal'}
                    </td>
                    {!tournamentStarted && (
                      <td className="px-4 py-3">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => handleEdit(player)}
                            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded
                              transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(player.id)}
                            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded
                              transition-colors"
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
        <div className="bg-yellow-900/50 border border-yellow-700 rounded p-4 text-yellow-200 text-sm">
          ⚠️ Tournament has started. Player editing is disabled. Export data and restart to make changes.
        </div>
      )}
    </div>
  );
}

