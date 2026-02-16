import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/api";
import Button from "../../components/Button";
import CreatePlayerModal from "../../components/CreatePlayerModal";
import EditPlayerModal from "../../components/EditPlayerModal";
import PlayerDetailsModal from "../../components/PlayerDetailsModal";

const AcademyPlayers = () => {
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

    // Academy category - this is the default for academy players
    const ACADEMY_CATEGORY = "academy";

    useEffect(() => {
        const fetchPlayers = async () => {
            try {
                const response = await api.get("/players/my");
                if (response.data.success) {
                    // Filter to only show academy players
                    const academyPlayers = response.data.players.filter(
                        p => p.category?.toLowerCase() === ACADEMY_CATEGORY.toLowerCase()
                    );
                    setPlayers(academyPlayers);
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
        // Ensure the new player is academy category
        const academyPlayer = { ...newPlayer, category: ACADEMY_CATEGORY };
        setPlayers([...players, academyPlayer]);
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
        }
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

    // Pre-select academy category for new players
    const handleCreateClick = () => {
        setSelectedPlayer(null);
        setIsCreateModalOpen(true);
    };

    return (
        <div className="flex-1 flex flex-col w-full max-w-[1400px] mx-auto px-4 lg:px-10 py-5 font-display text-[#111817]">
            {/* Breadcrumbs */}
            <div className="flex flex-wrap gap-2 py-2">
                <span className="text-[#618983] text-sm font-medium">Organization</span>
                <span className="text-[#618983] text-sm font-medium">/</span>
                <span className="text-[#111817] text-sm font-medium">Academies</span>
            </div>

            {/* Page Heading */}
            <div className="flex flex-wrap justify-between items-end gap-3 py-6">
                <div className="flex min-w-72 flex-col gap-2">
                    <h1 className="text-[#111817] text-4xl font-black leading-tight tracking-[-0.033em]">Academy Players</h1>
                    <p className="text-[#618983] text-base font-normal">Manage academy-level athletes in your organization.</p>
                </div>
                <button
                    onClick={handleCreateClick}
                    className="flex items-center justify-center rounded-2xl h-14 px-8 text-[#111817] text-base font-bold transition-all hover:shadow-xl active:scale-95"
                    style={{ backgroundColor: primaryColor }}
                >
                    <span className="material-symbols-outlined mr-2">person_add</span>
                    Register Academy Player
                </button>
            </div>

            {/* Badge showing category filter is active */}
            <div className="mb-4">
                <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
                    <span className="material-symbols-outlined text-sm">school</span>
                    Category: Academy
                </span>
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
                        <p className="text-sm font-bold tracking-[0.015em] whitespace-nowrap">All Academy</p>
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
                        placeholder="Search academy players by name, category or discipline..."
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
                                    <tr className="border-b border-slate-100">
                                        <th className="px-6 py-5 text-xs font-black text-[#618983] uppercase tracking-widest">Athlete</th>
                                        <th className="px-6 py-5 text-xs font-black text-[#618983] uppercase tracking-widest">Discipline</th>
                                        <th className="px-6 py-5 text-xs font-black text-[#618983] uppercase tracking-widest">Category</th>
                                        <th className="px-6 py-5 text-xs font-black text-[#618983] uppercase tracking-widest">Date of Birth</th>
                                        <th className="px-6 py-5 text-xs font-black text-[#618983] uppercase tracking-widest text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {searchFilteredPlayers.map((player) => (
                                        <tr key={player._id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div 
                                                        className="size-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                                                        style={{ backgroundColor: primaryColor }}
                                                    >
                                                        {getInitials(player.fullName)}
                                                    </div>
                                                    <div>
                                                        <p className="text-[#111817] text-sm font-bold">{player.fullName}</p>
                                                        <p className="text-[#618983] text-xs">{player.email || 'No email'}</p>
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
                                                <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold capitalize">
                                                    {player.category || 'Academy'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-[#111817] text-sm font-medium">
                                                    {player.dateOfBirth ? new Date(player.dateOfBirth).toLocaleDateString() : '--'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => handleViewDetails(player)}
                                                        className="p-2 rounded-lg text-[#618983] hover:bg-slate-100 hover:text-[#111817] transition-colors"
                                                    >
                                                        <span className="material-symbols-outlined text-lg">visibility</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleOpenEdit(player)}
                                                        className="p-2 rounded-lg text-[#618983] hover:bg-slate-100 hover:text-[#111817] transition-colors"
                                                    >
                                                        <span className="material-symbols-outlined text-lg">edit</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeletePlayer(player._id)}
                                                        className="p-2 rounded-lg text-[#618983] hover:bg-red-50 hover:text-red-600 transition-colors"
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
                        <div className="flex flex-col items-center justify-center py-20">
                            <span className="material-symbols-outlined text-5xl text-slate-300 mb-4">search_off</span>
                            <h3 className="text-lg font-bold text-slate-900">No academy players found</h3>
                            <p className="text-slate-500 text-sm">Try adjusting your search or filters.</p>
                        </div>
                    )}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2rem] border border-slate-100 shadow-sm mt-6">
                    <span className="material-symbols-outlined text-5xl text-slate-300 mb-4">groups</span>
                    <h3 className="text-lg font-bold text-slate-900">No academy players yet</h3>
                    <p className="text-slate-500 text-sm mb-4">Get started by registering your first academy player.</p>
                    <button
                        onClick={handleCreateClick}
                        className="flex items-center gap-2 px-6 py-2 rounded-xl text-white font-bold text-sm transition-all shadow-lg active:scale-95"
                        style={{ backgroundColor: primaryColor }}
                    >
                        <span className="material-symbols-outlined">person_add</span>
                        Register Academy Player
                    </button>
                </div>
            )}

            {/* Modals */}
            {isCreateModalOpen && (
                <CreatePlayerModal
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                    onPlayerCreated={handlePlayerCreated}
                    defaultCategory={ACADEMY_CATEGORY}
                />
            )}

            {isEditModalOpen && selectedPlayer && (
                <EditPlayerModal
                    isOpen={isEditModalOpen}
                    onClose={() => { setIsEditModalOpen(false); setSelectedPlayer(null); }}
                    player={selectedPlayer}
                    onPlayerUpdated={handlePlayerUpdated}
                />
            )}

            {isDetailsModalOpen && selectedPlayer && (
                <PlayerDetailsModal
                    isOpen={isDetailsModalOpen}
                    onClose={() => { setIsDetailsModalOpen(false); setSelectedPlayer(null); }}
                    player={selectedPlayer}
                />
            )}
        </div>
    );
};

export default AcademyPlayers;
