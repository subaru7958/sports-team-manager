import React from 'react';
import { useAuth } from '../context/AuthContext';

const GroupAthletesModal = ({ isOpen, onClose, group }) => {
    const { team } = useAuth();
    const primaryColor = team?.primaryColor || "#13ecc8";

    if (!isOpen || !group) return null;

    const players = group.players || [];

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-4xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between px-8 py-6 border-b border-slate-200">
                    <div>
                        <h3 className="text-2xl font-black text-[#111817] tracking-tight">Athletes in {group.name}</h3>
                        <p className="text-[#608a8a] text-sm font-medium mt-1">{players.length} athlete{players.length !== 1 ? 's' : ''} assigned</p>
                    </div>
                    <button onClick={onClose} className="text-[#608a8a] hover:text-[#111817] transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Table */}
                <div className="flex-1 overflow-y-auto px-8 py-6">
                    {players.length > 0 ? (
                        <div className="overflow-hidden rounded-xl border border-slate-200">
                            <table className="w-full">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-[#608a8a] uppercase tracking-wider">Photo</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-[#608a8a] uppercase tracking-wider">Full Name</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-[#608a8a] uppercase tracking-wider">Category</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-[#608a8a] uppercase tracking-wider">Date of Birth</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {players.map((player) => (
                                        <tr key={player._id || Math.random()} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-4 py-3">
                                                <div className="size-10 rounded-lg overflow-hidden bg-slate-200">
                                                    {player.image ? (
                                                        <img src={player.image} alt={player.fullName} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-white" style={{ backgroundColor: primaryColor }}>
                                                            <span className="material-symbols-outlined text-base">person</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="text-sm font-semibold text-[#111817]">{player.fullName || 'Unknown Player'}</span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-xs font-bold uppercase tracking-wider text-slate-600">
                                                    {player.category || 'N/A'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="text-sm text-[#608a8a] font-medium">
                                                    {player.dateOfBirth ? new Date(player.dateOfBirth).toLocaleDateString() : 'N/A'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="py-16 text-center bg-slate-50 rounded-xl">
                            <div className="size-16 rounded-full bg-white flex items-center justify-center mx-auto mb-4">
                                <span className="material-symbols-outlined text-3xl text-slate-300">person_off</span>
                            </div>
                            <p className="text-sm font-semibold text-slate-500">No athletes assigned to this group yet</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-8 py-6 border-t border-slate-200 flex items-center justify-end gap-4 bg-slate-50">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 text-sm font-bold text-[#111817] hover:bg-slate-200 rounded-lg transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GroupAthletesModal;
