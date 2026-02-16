import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useSeason } from "../../context/SeasonContext";
import api from "../../api/api";
import CreateGroupModal from "../../components/CreateGroupModal";
import EditGroupModal from "../../components/EditGroupModal";
import GroupAthletesModal from "../../components/GroupAthletesModal";
import { useGroupResources } from "../../hooks/useGroupResources";

const Groups = () => {
    const { team } = useAuth();
    const { selectedSeason } = useSeason();
    const primaryColor = team?.primaryColor || "#13ecc8";

    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingGroup, setEditingGroup] = useState(null);
    const [viewingGroupAthletes, setViewingGroupAthletes] = useState(null);

    // Fetch resources once for hydration during optimistic updates
    const { availableCoaches, availablePlayers } = useGroupResources(selectedSeason);

    useEffect(() => {
        if (selectedSeason) {
            fetchGroups();
        }
    }, [selectedSeason]);

    const fetchGroups = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/groups/season/${selectedSeason._id}`);
            if (response.data.success) {
                setGroups(response.data.groups);
            }
        } catch (err) {
            console.error("Failed to fetch groups", err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateGroup = async (groupData) => {
        // 1. Optimistic Update
        const tempId = 'temp-' + Date.now();

        // Hydrate the group data with actual objects for display
        const hydratedCoaches = availableCoaches.filter(c => groupData.coaches.includes(c._id));
        const hydratedPlayers = availablePlayers.filter(p => groupData.players.includes(p._id));

        const optimisticGroup = {
            ...groupData,
            _id: tempId,
            coaches: hydratedCoaches,
            players: hydratedPlayers,
            createdAt: new Date().toISOString(),
            isOptimistic: true
        };

        setGroups(prev => [...prev, optimisticGroup]);
        setIsModalOpen(false);

        // 2. API Call
        try {
            const response = await api.post('/groups', groupData);
            if (response.data.success) {
                // 3. Success: Replace temp group with real one
                setGroups(prev => prev.map(g => g._id === tempId ? response.data.group : g));
                return Promise.resolve();
            }
        } catch (err) {
            console.error("Failed to create group", err);
            // 4. Error: Remove temp group
            setGroups(prev => prev.filter(g => g._id !== tempId));
            return Promise.reject(err);
        }
    };

    const handleDeleteGroup = async (groupId) => {
        if (!window.confirm("Are you sure you want to delete this group?")) return;

        // 1. Snapshot
        const previousGroups = [...groups];

        // 2. Optimistic Update (Immediate Removal)
        setGroups(prev => prev.filter(g => g._id !== groupId));

        // 3. API Call
        try {
            const response = await api.delete(`/groups/${groupId}`);
            if (!response.data.success) {
                // If backend says failure despite 200 OK (unlikely with this API structure but safe)
                throw new Error("Failed to delete");
            }
        } catch (err) {
            console.error("Failed to delete group", err);
            // 4. Error: Revert state
            setGroups(previousGroups);
            alert("Failed to delete group. It has been restored.");
        }
    };

    const handleUpdateGroup = async (groupData, groupId) => {
        // 1. Snapshot previous state
        const previousGroups = [...groups];

        // 2. Optimistic Update
        const hydratedCoaches = availableCoaches.filter(c => groupData.coaches.includes(c._id));
        const hydratedPlayers = availablePlayers.filter(p => groupData.players.includes(p._id));

        const optimisticGroup = {
            ...groupData,
            _id: groupId,
            coaches: hydratedCoaches,
            players: hydratedPlayers,
            updatedAt: new Date().toISOString(),
            isOptimistic: true // Optional: could show a loading indicator on the card
        };

        setGroups(prev => prev.map(g => g._id === groupId ? { ...g, ...optimisticGroup } : g));
        setEditingGroup(null);

        // 3. API Call
        try {
            const response = await api.put(`/groups/${groupId}`, groupData);
            if (response.data.success) {
                // 4. Success: Ensure state matches server (e.g. timestamps)
                setGroups(prev => prev.map(g => g._id === groupId ? response.data.group : g));
                return Promise.resolve();
            }
        } catch (err) {
            console.error("Failed to update group", err);
            // 5. Error: Revert state
            setGroups(previousGroups);
            return Promise.reject(err);
        }
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

    if (!selectedSeason) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
                <div className="size-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                    <span className="material-symbols-outlined text-4xl text-[#618983]">event_busy</span>
                </div>
                <h3 className="text-[#111817] text-xl font-bold mb-2">No active season selected</h3>
                <p className="text-[#618983] max-w-sm">Please enter a season from the Seasons management page to manage its groups.</p>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col w-full max-w-[1200px] mx-auto px-4 lg:px-10 py-5 font-display text-[#111817]">
            {/* Breadcrumbs */}
            <div className="flex flex-wrap gap-2 py-2">
                <span className="text-[#618983] text-sm font-medium">Season Management</span>
                <span className="text-[#618983] text-sm font-medium">/</span>
                <span className="text-[#618983] text-sm font-medium">{selectedSeason.name}</span>
                <span className="text-[#618983] text-sm font-medium">/</span>
                <span className="text-[#111817] text-sm font-medium">Groups</span>
            </div>

            {/* Page Heading */}
            <div className="flex flex-wrap justify-between items-end gap-3 py-6">
                <div className="flex min-w-72 flex-col gap-2">
                    <h1 className="text-[#111817] text-4xl font-black leading-tight tracking-[-0.033em]">Squad Groups</h1>
                    <p className="text-[#618983] text-base font-normal">Organize athletes and staff into specific groups for this season.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center justify-center rounded-2xl h-14 px-8 text-[#111817] text-base font-bold transition-all hover:shadow-xl active:scale-95"
                    style={{ backgroundColor: primaryColor }}
                >
                    <span className="material-symbols-outlined mr-2">add_circle</span>
                    Create Group
                </button>
            </div>

            {loading ? (
                <div className="flex-1 flex items-center justify-center py-20">
                    <div className="w-12 h-12 border-4 border-slate-200 border-t-primary rounded-full animate-spin" style={{ borderTopColor: primaryColor }}></div>
                </div>
            ) : groups.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                    {groups.map((group) => (
                        <div key={group._id} className="bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col group">
                            <div className="p-6 border-b border-slate-100 bg-slate-50/30">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="size-10 rounded-xl flex items-center justify-center text-white shadow-sm" style={{ backgroundColor: primaryColor }}>
                                        <span className="material-symbols-outlined">{getDisciplineIcon(group.discipline)}</span>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteGroup(group._id)}
                                        className="size-8 rounded-lg flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                                    >
                                        <span className="material-symbols-outlined text-lg">delete</span>
                                    </button>
                                </div>
                                <h3 className="text-xl font-black text-[#111817] leading-tight mb-1">{group.name}</h3>
                                <div className="flex items-center gap-2">
                                    <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-100 text-[10px] font-black uppercase tracking-wider text-slate-600">
                                        {group.category}
                                    </span>
                                    <span className="text-[10px] font-bold text-[#618983] uppercase tracking-widest capitalize">{group.discipline}</span>
                                </div>
                            </div>

                            <div className="p-6 flex flex-col gap-4">
                                <div>
                                    <p className="text-[10px] font-black text-[#618983] uppercase tracking-widest mb-3">Technical Staff</p>
                                    <div className="flex flex-col gap-2">
                                        {group.coaches && Array.isArray(group.coaches) && group.coaches.length > 0 ? (
                                            group.coaches.map((coach, idx) => (
                                                <div
                                                    key={coach?._id || idx}
                                                    className="flex items-center gap-3 p-2 rounded-lg bg-slate-50/50 hover:bg-slate-50 transition-all"
                                                >
                                                    <div className="size-9 rounded-lg overflow-hidden shrink-0 bg-slate-200 flex items-center justify-center">
                                                        {coach?.image ? (
                                                            <img src={coach.image} alt={coach.fullName || 'Coach'} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: primaryColor }}>
                                                                <span className="material-symbols-outlined text-white text-base">person</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col overflow-hidden flex-1">
                                                        <span className="text-xs font-bold text-[#111817] truncate leading-tight">{coach?.fullName || 'Coach'}</span>
                                                        <span className="text-[10px] text-slate-500 font-medium truncate">{coach?.specialty || 'Staff'}</span>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="py-3 text-center bg-slate-50/50 rounded-lg">
                                                <span className="text-xs font-medium text-slate-400 italic">No coaches assigned</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-2 pt-4 border-t border-slate-50 flex items-center justify-between">
                                    <button
                                        onClick={() => setViewingGroupAthletes(group)}
                                        className="flex flex-col items-start hover:opacity-70 transition-opacity"
                                    >
                                        <span className="text-xs font-black text-[#111817]">{group.players?.length || 0}</span>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Athletes</span>
                                    </button>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setViewingGroupAthletes(group)}
                                            className="size-9 rounded-xl bg-slate-50 text-slate-400 hover:text-[#111817] hover:bg-slate-100 transition-all flex items-center justify-center"
                                            title="View Athletes"
                                        >
                                            <span className="material-symbols-outlined text-lg">visibility</span>
                                        </button>
                                        <button
                                            onClick={() => setEditingGroup(group)}
                                            className="h-9 px-4 rounded-xl text-[#111817] text-[10px] font-black uppercase tracking-wider hover:brightness-95 transition-all"
                                            style={{ backgroundColor: `${primaryColor}20` }}
                                        >
                                            Manage
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="rounded-[2rem] border-2 border-dashed border-slate-200 p-8 flex flex-col items-center justify-center gap-4 hover:border-primary/40 hover:bg-slate-50/50 transition-all group"
                        style={{ "--hover-border": primaryColor }}
                    >
                        <div className="size-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:text-primary group-hover:bg-white group-hover:shadow-md transition-all">
                            <span className="material-symbols-outlined text-3xl">add_circle</span>
                        </div>
                        <div className="text-center">
                            <p className="font-black text-[#111817]">New Squad Group</p>
                            <p className="text-xs text-[#618983] font-medium">Add another group to this season</p>
                        </div>
                    </button>
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center bg-white p-12 rounded-[2.5rem] border border-slate-100 shadow-sm text-center max-w-2xl mx-auto my-10">
                    <div className="size-24 rounded-full flex items-center justify-center mx-auto mb-8 bg-slate-50 text-slate-200">
                        <span className="material-symbols-outlined text-5xl">groups_3</span>
                    </div>
                    <h2 className="text-3xl font-black mb-4">No Groups Yet</h2>
                    <p className="text-[#618983] max-w-sm mx-auto mb-10 font-medium">
                        Start by creating groups for the {selectedSeason.name} season and assign technical staff.
                    </p>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="px-10 h-16 rounded-2xl text-[#111817] font-extrabold transition-all shadow-xl active:scale-95 flex items-center gap-3 text-lg"
                        style={{ backgroundColor: primaryColor }}
                    >
                        <span className="material-symbols-outlined">add_circle</span>
                        Create First Group
                    </button>
                </div>
            )}

            <CreateGroupModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleCreateGroup}
            />

            <EditGroupModal
                isOpen={!!editingGroup}
                onClose={() => setEditingGroup(null)}
                group={editingGroup}
                onSubmit={handleUpdateGroup}
            />

            <GroupAthletesModal
                isOpen={!!viewingGroupAthletes}
                onClose={() => setViewingGroupAthletes(null)}
                group={viewingGroupAthletes}
            />
        </div>
    );
};

export default Groups;
