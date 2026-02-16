import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import { useSeason } from '../context/SeasonContext';
import { useGroupResources } from '../hooks/useGroupResources';

const EditGroupModal = ({ isOpen, onClose, group, onSubmit }) => {
    const { team } = useAuth();
    const { selectedSeason } = useSeason();
    const primaryColor = team?.primaryColor || "#13ecc8";

    const [formData, setFormData] = useState({
        name: '',
        category: '',
        coaches: [],
        players: []
    });

    const { availableCoaches, availablePlayers, availableCategories, loading: resourcesLoading } = useGroupResources(isOpen ? selectedSeason : null);

    const [submitting, setSubmitting] = useState(false);
    const [validationError, setValidationError] = useState('');

    const [coachSearch, setCoachSearch] = useState('');
    const [playerSearch, setPlayerSearch] = useState('');

    useEffect(() => {
        if (isOpen && group) {
            setFormData({
                name: group.name || '',
                category: group.category || '',
                coaches: group.coaches?.map(c => c._id || c) || [],
                players: group.players?.map(p => p._id || p) || []
            });
        }
    }, [isOpen, group]);

    const handleCoachToggle = (coachId) => {
        setFormData(prev => ({
            ...prev,
            coaches: prev.coaches.includes(coachId)
                ? prev.coaches.filter(id => id !== coachId)
                : [...prev.coaches, coachId]
        }));
    };

    const handlePlayerToggle = (playerId) => {
        setFormData(prev => ({
            ...prev,
            players: prev.players.includes(playerId)
                ? prev.players.filter(id => id !== playerId)
                : [...prev.players, playerId]
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (formData.coaches.length === 0) {
            setValidationError('Please assign at least one coach to the group');
            return;
        }

        const updatedGroupData = {
            ...formData,
            seasonId: selectedSeason._id,
            discipline: selectedSeason.discipline
        };

        setValidationError('');
        setSubmitting(true);

        onSubmit(updatedGroupData, group._id)
            .then(() => {
                onClose();
            })
            .catch((err) => {
                console.error("Failed to update group", err);
                setValidationError('Failed to update group. Please try again.');
            })
            .finally(() => {
                setSubmitting(false);
            });
    };

    const getDisciplineIcon = (discipline) => {
        const disc = discipline?.toLowerCase() || '';
        if (disc.includes('foot')) return 'sports_soccer';
        if (disc.includes('basket')) return 'sports_basketball';
        if (disc.includes('volley')) return 'sports_volleyball';
        if (disc.includes('tennis')) return 'sports_tennis';
        if (disc.includes('swim')) return 'pool';
        return 'sports_score';
    };

    if (!isOpen) return null;

    const selectedCoaches = availableCoaches.filter(c => formData.coaches.includes(c._id));
    const selectedPlayers = availablePlayers.filter(p => formData.players.includes(p._id));



    // Filter coaches and players based on search
    const filteredCoaches = availableCoaches.filter(coach =>
        coach.fullName.toLowerCase().includes(coachSearch.toLowerCase())
    );
    const filteredPlayers = availablePlayers.filter(player =>
        player.fullName.toLowerCase().includes(playerSearch.toLowerCase())
    );

    // Main Edit Form
    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-[640px] rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Modal Header */}
                <div className="flex items-center justify-between px-8 py-6 border-b border-slate-200">
                    <h3 className="text-2xl font-black text-[#111817] tracking-tight">Edit Season Group</h3>
                    <button onClick={onClose} className="text-[#608a8a] hover:text-[#111817] transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Modal Body */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
                    <div className="px-8 py-6">
                        {/* Context Section */}
                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="flex flex-col gap-1">
                                <p className="text-[#608a8a] text-xs font-bold uppercase tracking-wider">Season</p>
                                <div className="flex items-center gap-2 text-[#111817]">
                                    <span className="material-symbols-outlined text-lg">calendar_today</span>
                                    <p className="text-sm font-medium">{selectedSeason?.name}</p>
                                </div>
                            </div>
                            <div className="flex flex-col gap-1">
                                <p className="text-[#608a8a] text-xs font-bold uppercase tracking-wider">Discipline</p>
                                <div className="flex items-center gap-2 text-[#111817]">
                                    <span className="material-symbols-outlined text-lg">{getDisciplineIcon(selectedSeason?.discipline)}</span>
                                    <p className="text-sm font-medium capitalize">{selectedSeason?.discipline}</p>
                                </div>
                            </div>
                        </div>

                        {/* Group Details */}
                        <div className="flex flex-col gap-6">
                            {/* Group Name */}
                            <div className="flex flex-col gap-2">
                                <label className="text-[#111817] text-base font-bold">Group Name</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full h-14 px-4 rounded-lg border border-slate-200 bg-white text-[#111817] focus:ring-2 focus:ring-offset-0 focus:border-transparent transition-all"
                                    style={{ "--tw-ring-color": primaryColor }}
                                    placeholder="e.g. Elite Squad, Group A"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

                            {/* Category */}
                            {availableCategories.length > 0 && (
                                <div className="flex flex-col gap-2">
                                    <label className="text-[#111817] text-base font-bold">Category</label>
                                    <select
                                        required
                                        className="w-full h-14 px-4 rounded-lg border border-slate-200 bg-white text-[#111817] focus:ring-2 focus:ring-offset-0 focus:border-transparent transition-all font-medium"
                                        style={{ "--tw-ring-color": primaryColor }}
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    >
                                        <option value="" disabled>Select Category</option>
                                        {availableCategories.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Assign Coaches */}
                            <div className="flex flex-col gap-3">
                                <div className="flex items-center justify-between">
                                    <label className="text-[#111817] text-base font-bold">Assign Coaches</label>
                                    <span className="text-xs text-red-500 font-medium">* Required</span>
                                </div>

                                {/* Selected Coaches Chips */}
                                {selectedCoaches.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {selectedCoaches.map(coach => (
                                            <div key={coach._id} className="flex items-center gap-2 px-3 py-1.5 rounded-full border" style={{ backgroundColor: `${primaryColor}10`, borderColor: `${primaryColor}30` }}>
                                                <div className="size-6 rounded-full bg-slate-200 overflow-hidden">
                                                    {coach.image ? (
                                                        <img src={coach.image} alt={coach.fullName} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-white text-xs" style={{ backgroundColor: primaryColor }}>
                                                            {coach.fullName.charAt(0)}
                                                        </div>
                                                    )}
                                                </div>
                                                <span className="text-sm font-semibold text-[#111817]">{coach.fullName}</span>
                                                <button type="button" onClick={() => handleCoachToggle(coach._id)} className="hover:opacity-70" style={{ color: primaryColor }}>
                                                    <span className="material-symbols-outlined text-lg">close</span>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Coach Search Input */}
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#608a8a]">search</span>
                                    <input
                                        type="text"
                                        className="w-full h-12 pl-11 pr-4 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:ring-1 focus:ring-offset-0 focus:border-transparent"
                                        style={{ "--tw-ring-color": primaryColor }}
                                        placeholder="Search coaches..."
                                        value={coachSearch}
                                        onChange={(e) => setCoachSearch(e.target.value)}
                                    />
                                </div>

                                {/* Available Coaches List */}
                                <div className="border border-slate-200 rounded-lg max-h-48 overflow-y-auto">
                                    {resourcesLoading ? (
                                        <div className="py-8 text-center text-slate-400 text-sm">Loading coaches...</div>
                                    ) : filteredCoaches.length > 0 ? (
                                        <div className="divide-y divide-slate-100">
                                            {filteredCoaches.map(coach => (
                                                <label key={coach._id} className="flex items-center gap-3 p-3 hover:bg-slate-50 cursor-pointer transition-colors">
                                                    <input
                                                        type="checkbox"
                                                        className="rounded border-slate-300 focus:ring-offset-0"
                                                        style={{ color: primaryColor, "--tw-ring-color": primaryColor }}
                                                        checked={formData.coaches.includes(coach._id)}
                                                        onChange={() => handleCoachToggle(coach._id)}
                                                    />
                                                    <div className="size-10 rounded-lg bg-slate-200 overflow-hidden">
                                                        {coach.image ? (
                                                            <img src={coach.image} alt={coach.fullName} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-white" style={{ backgroundColor: primaryColor }}>
                                                                <span className="material-symbols-outlined text-base">person</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-sm font-semibold text-[#111817]">{coach.fullName}</p>
                                                        <p className="text-xs text-[#608a8a]">{coach.specialty}</p>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="py-8 text-center text-slate-400 text-sm">No coaches found</div>
                                    )}
                                </div>
                            </div>

                            {/* Assign Players */}
                            <div className="flex flex-col gap-3">
                                <label className="text-[#111817] text-base font-bold">Assign Players</label>

                                {/* Selected Players Chips */}
                                {selectedPlayers.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {selectedPlayers.slice(0, 8).map(player => (
                                            <div key={player._id} className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full">
                                                <div className="size-6 rounded-full bg-white border border-slate-200 overflow-hidden">
                                                    {player.image ? (
                                                        <img src={player.image} alt={player.fullName} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-[#111817] text-xs font-black">
                                                            {player.fullName.charAt(0)}
                                                        </div>
                                                    )}
                                                </div>
                                                <span className="text-sm font-medium text-[#111817]">{player.fullName}</span>
                                                <button type="button" onClick={() => handlePlayerToggle(player._id)} className="text-[#608a8a] hover:text-red-500">
                                                    <span className="material-symbols-outlined text-lg">close</span>
                                                </button>
                                            </div>
                                        ))}
                                        {selectedPlayers.length > 8 && (
                                            <div className="flex items-center justify-center px-2 text-xs font-bold text-[#608a8a]">
                                                + {selectedPlayers.length - 8} more
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Player Search Input */}
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#608a8a]">search</span>
                                    <input
                                        type="text"
                                        className="w-full h-12 pl-11 pr-4 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:ring-1 focus:ring-offset-0 focus:border-transparent"
                                        style={{ "--tw-ring-color": primaryColor }}
                                        placeholder="Search athletes..."
                                        value={playerSearch}
                                        onChange={(e) => setPlayerSearch(e.target.value)}
                                    />
                                </div>

                                {/* Available Players List */}
                                <div className="border border-slate-200 rounded-lg max-h-48 overflow-y-auto">
                                    {resourcesLoading ? (
                                        <div className="py-8 text-center text-slate-400 text-sm">Loading athletes...</div>
                                    ) : filteredPlayers.length > 0 ? (
                                        <div className="divide-y divide-slate-100">
                                            {filteredPlayers.map(player => (
                                                <label key={player._id} className="flex items-center gap-3 p-3 hover:bg-slate-50 cursor-pointer transition-colors">
                                                    <input
                                                        type="checkbox"
                                                        className="rounded border-slate-300 focus:ring-offset-0"
                                                        style={{ color: primaryColor, "--tw-ring-color": primaryColor }}
                                                        checked={formData.players.includes(player._id)}
                                                        onChange={() => handlePlayerToggle(player._id)}
                                                    />
                                                    <div className="size-10 rounded-lg bg-slate-200 overflow-hidden">
                                                        {player.image ? (
                                                            <img src={player.image} alt={player.fullName} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-white" style={{ backgroundColor: primaryColor }}>
                                                                <span className="material-symbols-outlined text-base">person</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-sm font-semibold text-[#111817]">{player.fullName}</p>
                                                        <p className="text-xs text-[#608a8a]">{player.category}</p>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="py-8 text-center text-slate-400 text-sm">No athletes found</div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Pro Tip */}
                        <div className="mt-8 p-4 rounded-lg flex items-start gap-3" style={{ backgroundColor: `${primaryColor}05`, borderWidth: '1px', borderColor: `${primaryColor}20` }}>
                            <span className="material-symbols-outlined" style={{ color: primaryColor }}>info</span>
                            <p className="text-xs text-[#111817] leading-relaxed">
                                <span className="font-bold">Pro Tip:</span> Groups allow you to schedule separate training sessions and track specific performance metrics for this unit. Ensure at least one primary coach is assigned.
                            </p>
                        </div>

                        {/* Validation Error */}
                        {validationError && (
                            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                                <span className="material-symbols-outlined text-red-500">error</span>
                                <p className="text-xs text-red-700 font-medium">{validationError}</p>
                            </div>
                        )}
                    </div>

                    {/* Modal Footer */}
                    <div className="px-8 py-6 border-t border-slate-200 flex items-center justify-end gap-4 bg-slate-50">
                        <div className="flex items-center gap-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-6 py-3 text-sm font-bold text-[#111817] hover:bg-slate-200 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting || formData.coaches.length === 0}
                                className="flex items-center gap-2 px-8 py-3 text-[#111817] text-sm font-bold rounded-lg shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{ backgroundColor: primaryColor, boxShadow: `0 10px 25px ${primaryColor}20` }}
                            >
                                <span className="material-symbols-outlined text-xl">save</span>
                                {submitting ? 'Updating...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditGroupModal;
