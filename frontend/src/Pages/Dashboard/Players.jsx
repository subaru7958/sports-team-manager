import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/api";
import Button from "../../components/Button";
import CreatePlayerModal from "../../components/CreatePlayerModal";
import EditPlayerModal from "../../components/EditPlayerModal";
import PlayerDetailsModal from "../../components/PlayerDetailsModal";

const Players = () => {
    const { team } = useAuth();
    const primaryColor = team?.primaryColor || "#13ecc8";
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [selectedPlayer, setSelectedPlayer] = useState(null);
    const [activeTab, setActiveTab] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const fetchPlayers = async () => {
            try {
                const response = await api.get("/players/my");
                if (response.data.success) {
                    setPlayers(response.data.players);
                }
            } catch (err) {
                console.error("Failed to fetch players", err);
            } finally {
                setLoading(false);
            }
        };
        fetchPlayers();
    }, []);

    const handlePlayerCreated = (newPlayer) => {
        setPlayers([...players, newPlayer]);
    };

    const handlePlayerUpdated = (updatedPlayer) => {
        setPlayers(players.map(p => p._id === updatedPlayer._id ? updatedPlayer : p));
        if (selectedPlayer?._id === updatedPlayer._id) {
            setSelectedPlayer(updatedPlayer);
        }
    };

    const handleDeletePlayer = async (id) => {
        if (!window.confirm("Are you sure you want to delete this athlete? This action cannot be undone.")) return;

        try {
            const response = await api.delete(`/players/${id}`);
            if (response.data.success) {
                setPlayers(players.filter(p => p._id !== id));
            }
        } catch (err) {
            console.error("Failed to delete player", err);
            alert("Error: Could not delete athlete.");
        }
    };

    const getPlayerName = (player) => {
        if (player.fullName) return player.fullName;
        if (player.firstName && player.lastName) return `${player.firstName} ${player.lastName}`;
        return "Unknown Player";
    };

    const getDisciplineIcon = (discipline) => {
        const disc = discipline?.toLowerCase() || '';
        if (disc.includes('foot')) return 'sports_soccer';
        if (disc.includes('basket')) return 'sports_basketball';
        if (disc.includes('volley')) return 'sports_volleyball';
        if (disc.includes('tennis')) return 'sports_tennis';
        if (disc.includes('swim')) return 'pool';
        if (disc.includes('hand')) return 'sports_handball';
        return 'sports_score';
    };

    const getInitials = (name) => {
        if (!name) return "--";
        return name
            .split(' ')
            .filter(n => n.length > 0)
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    const handleViewDetails = (player) => {
        setSelectedPlayer(player);
        setIsDetailsModalOpen(true);
    };

    const handleOpenEdit = (player) => {
        setSelectedPlayer(player);
        setIsEditModalOpen(true);
    };

    // Filtering logic
    const filteredPlayers = activeTab === "all"
        ? players
        : players.filter(p => p.discipline?.toLowerCase() === activeTab.toLowerCase());

    // Search filtering
    const searchFilteredPlayers = searchQuery
        ? filteredPlayers.filter(p => 
            p.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.discipline?.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : filteredPlayers;

    const disciplines = team?.disciplines || [];

    return (
        <div className="flex-1 flex flex-col w-full max-w-[1400px] mx-auto px-4 lg:px-10 py-5 font-display text-[#111817]">
            {/* Breadcrumbs */}
            <div className="flex flex-wrap gap-2 py-2">
                <span className="text-[#618983] text-sm font-medium">Organization</span>
                <span className="text-[#618983] text-sm font-medium">/</span>
                <span className="text-[#111817] text-sm font-medium">Athlete Roster</span>
            </div>

            {/* Page Heading */}
            <div className="flex flex-wrap justify-between items-end gap-3 py-6">
                <div className="flex min-w-72 flex-col gap-2">
                    <h1 className="text-[#111817] text-4xl font-black leading-tight tracking-[-0.033em]">Athlete Roster</h1>
                    <p className="text-[#618983] text-base font-normal">Full database of registered athletes across your organization's disciplines.</p>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center justify-center rounded-2xl h-14 px-8 text-[#111817] text-base font-bold transition-all hover:shadow-xl active:scale-95"
                    style={{ backgroundColor: primaryColor }}
                >
                    <span className="material-symbols-outlined mr-2">person_add</span>
                    Register Player
                </button>
            </div>

            {/* Discipline Tabs */}
            <div className="pb-6 border-b border-slate-100">
                <div className="flex gap-8 overflow-x-auto no-scrollbar">
                    <button
                        onClick={() => setActiveTab("all")}
                        className={`flex items-center gap-2 border-b-[3px] pb-3 pt-4 transition-all ${activeTab === "all" ? "border-primary text-[#111817]" : "border-transparent text-[#618983] hover:text-[#111817]"}`}
                        style={{ borderBottomColor: activeTab === "all" ? primaryColor : "transparent" }}
                    >
                        <span className="material-symbols-outlined text-xl">grid_view</span>
                        <p className="text-sm font-bold tracking-[0.015em] whitespace-nowrap">All Athletes</p>
                    </button>
                    {disciplines.map(d => (
                        <button
                            key={d}
                            onClick={() => setActiveTab(d.toLowerCase())}
                            className={`flex items-center gap-2 border-b-[3px] pb-3 pt-4 transition-all ${activeTab === d.toLowerCase() ? "border-primary text-[#111817]" : "border-transparent text-[#618983] hover:text-[#111817]"}`}
                            style={{ borderBottomColor: activeTab === d.toLowerCase() ? primaryColor : "transparent" }}
                        >
                            <span className="material-symbols-outlined text-xl">{getDisciplineIcon(d)}</span>
                            <p className="text-sm font-bold tracking-[0.015em] whitespace-nowrap capitalize">{d}</p>
                        </button>
                    ))}
                </div>
            </div>

            {/* Search Bar */}
            <div className="mt-6 mb-4">
                <div className="relative max-w-md">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                    <input
                        type="text"
                        placeholder="Search athletes by name, category or discipline..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-12 pl-12 pr-4 rounded-xl border border-slate-200 bg-white text-sm font-medium outline-none focus:ring-2 focus:ring-offset-0"
                        style={{ "--tw-ring-color": primaryColor + "30" }}
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex-1 flex items-center justify-center py-20">
                    <div className="w-12 h-12 border-4 border-slate-200 border-t-primary rounded-full animate-spin" style={{ borderTopColor: primaryColor }}></div>
                </div>
            ) : players.length > 0 ? (
                <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden mt-6">
                    {searchFilteredPlayers.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/50">
                                        <th className="px-6 py-5 text-xs font-black text-[#618983] uppercase tracking-widest border-b border-slate-100">Athlete</th>
                                        <th className="px-6 py-5 text-xs font-black text-[#618983] uppercase tracking-widest border-b border-slate-100">Discipline</th>
                                        <th className="px-6 py-5 text-xs font-black text-[#618983] uppercase tracking-widest border-b border-slate-100">Category</th>
                                        <th className="px-6 py-5 text-xs font-black text-[#618983] uppercase tracking-widest border-b border-slate-100">Contact</th>
                                        <th className="px-6 py-5 text-xs font-black text-[#618983] uppercase tracking-widest border-b border-slate-100 text-center">Physicals</th>
                                        <th className="px-6 py-5 text-xs font-black text-[#618983] uppercase tracking-widest border-b border-slate-100 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {searchFilteredPlayers.map((player) => (
                                        <tr key={player._id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="size-10 rounded-xl flex items-center justify-center text-[#111817] font-black text-sm shrink-0 shadow-sm overflow-hidden bg-slate-100" style={{ backgroundColor: player.image ? 'white' : primaryColor }}>
                                                        {player.image ? (
                                                            <img src={player.image} alt={getPlayerName(player)} className="w-full h-full object-cover" />
                                                        ) : (
                                                            getInitials(getPlayerName(player))
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col min-w-0">
                                                        <span className="text-[#111817] font-bold truncate">{getPlayerName(player)}</span>
                                                        <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">ID: {player._id.substring(18, 24)}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="material-symbols-outlined text-lg" style={{ color: primaryColor }}>{getDisciplineIcon(player.discipline)}</span>
                                                    <span className="text-[#111817] text-sm font-bold capitalize">{player.discipline}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-3 py-1 rounded-lg bg-slate-100 text-[#111817] text-xs font-bold capitalize">
                                                    {player.category}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-slate-500 text-sm font-medium">{player.phone || '---'}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-center gap-4">
                                                    <div className="flex flex-col items-center">
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase leading-none mb-1">Ht</span>
                                                        <span className="text-[#111817] text-sm font-bold">{player.height ? `${player.height}cm` : '--'}</span>
                                                    </div>
                                                    <div className="w-px h-6 bg-slate-100"></div>
                                                    <div className="flex flex-col items-center">
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase leading-none mb-1">Wt</span>
                                                        <span className="text-[#111817] text-sm font-bold">{player.weight ? `${player.weight}kg` : '--'}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleViewDetails(player)}
                                                        className="h-9 px-4 rounded-xl bg-slate-100 text-slate-600 text-xs font-black hover:bg-slate-200 transition-all uppercase tracking-wider"
                                                    >
                                                        Details
                                                    </button>
                                                    <button
                                                        onClick={() => handleOpenEdit(player)}
                                                        className="size-9 rounded-xl border border-slate-100 flex items-center justify-center text-slate-300 hover:text-primary hover:bg-primary/5 transition-all outline-none"
                                                    >
                                                        <span className="material-symbols-outlined text-lg">edit</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeletePlayer(player._id)}
                                                        className="size-9 rounded-xl border border-slate-100 flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all outline-none"
                                                    >
                                                        <span className="material-symbols-outlined text-lg">delete</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="py-20 text-center">
                            <div className="size-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="material-symbols-outlined text-3xl text-slate-300">search_off</span>
                            </div>
                            <h3 className="text-lg font-bold text-slate-900">No athletes found for this discipline</h3>
                            <p className="text-slate-500 text-sm">Try selecting a different filter or register a new player.</p>
                        </div>
                    )}

                    {/* Table Footer */}
                    <div className="px-6 py-4 bg-slate-50/30 flex justify-between items-center text-xs text-slate-400 font-bold uppercase tracking-widest">
                        <span>Showing {filteredPlayers.length} athletes</span>
                        <div className="flex gap-4">
                            <span className="flex items-center gap-1"><div className="size-2 rounded-full" style={{ backgroundColor: primaryColor }}></div> Active Profiles</span>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center bg-white p-12 rounded-[2.5rem] border border-slate-100 shadow-sm text-center max-w-2xl mx-auto my-10 animate-in fade-in zoom-in duration-500">
                    <div className="size-24 rounded-full flex items-center justify-center mx-auto mb-8 relative" style={{ backgroundColor: `${primaryColor}15` }}>
                        <div className="absolute inset-0 rounded-full animate-ping opacity-20" style={{ backgroundColor: primaryColor }}></div>
                        <span className="material-symbols-outlined text-5xl relative z-10" style={{ color: primaryColor }}>group_add</span>
                    </div>
                    <h2 className="text-3xl font-black text-[#111817] mb-4 font-display leading-tight">Build Your Organization</h2>
                    <p className="text-slate-500 max-w-sm mx-auto mb-10 font-medium leading-relaxed">
                        Your roster is currently empty. Register your athletes to start managing their technical profiles and medical sheets.
                    </p>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="px-10 h-16 rounded-2xl text-[#111817] font-extrabold transition-all shadow-xl active:scale-95 flex items-center gap-3 text-lg hover:shadow-primary/20"
                        style={{ backgroundColor: primaryColor }}
                    >
                        <span className="material-symbols-outlined font-bold">person_add</span>
                        Start Registration
                    </button>
                </div>
            )}

            <CreatePlayerModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onPlayerCreated={handlePlayerCreated}
            />

            <EditPlayerModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                player={selectedPlayer}
                onPlayerUpdated={handlePlayerUpdated}
            />

            <PlayerDetailsModal
                isOpen={isDetailsModalOpen}
                onClose={() => setIsDetailsModalOpen(false)}
                player={selectedPlayer}
                onEditTrigger={() => {
                    setIsDetailsModalOpen(false);
                    setIsEditModalOpen(true);
                }}
            />
        </div>
    );
};

export default Players;
