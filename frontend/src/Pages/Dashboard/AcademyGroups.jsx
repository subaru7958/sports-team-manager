import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useSeason } from "../../context/SeasonContext";
import api from "../../api/api";

const AcademyGroups = () => {
    const { team } = useAuth();
    const { selectedSeason } = useSeason();
    const primaryColor = team?.primaryColor || "#13ecc8";
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    // Academy category - filter groups by this category
    const ACADEMY_CATEGORY = "academy";

    useEffect(() => {
        const fetchGroups = async () => {
            if (!selectedSeason) {
                setLoading(false);
                return;
            }
            
            try {
                const response = await api.get(`/groups/season/${selectedSeason._id}`);
                if (response.data.success) {
                    // Filter to only show academy groups
                    const academyGroups = response.data.groups.filter(
                        g => g.category?.toLowerCase() === ACADEMY_CATEGORY.toLowerCase()
                    );
                    setGroups(academyGroups);
                }
            } catch (err) {
                console.error("Failed to fetch groups", err);
            } finally {
                setLoading(false);
            }
        };
        fetchGroups();
    }, [selectedSeason]);

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

    // Search filtering
    const searchFilteredGroups = searchQuery
        ? groups.filter(g => 
            g.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            g.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            g.discipline?.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : groups;

    if (!selectedSeason) {
        return (
            <div className="flex-1 flex flex-col w-full max-w-[1400px] mx-auto px-4 lg:px-10 py-5 font-display text-[#111817]">
                <div className="flex flex-wrap gap-2 py-2">
                    <span className="text-[#618983] text-sm font-medium">Organization</span>
                    <span className="text-[#618983] text-sm font-medium">/</span>
                    <span className="text-[#111817] text-sm font-medium">Academies</span>
                </div>

                <div className="flex flex-col justify-between items-end gap-3 py-6">
                    <div className="flex min-w-72 flex-col gap-2">
                        <h1 className="text-[#111817] text-4xl font-black leading-tight tracking-[-0.033em]">Academy Groups</h1>
                        <p className="text-[#618983] text-base font-normal">Manage academy-level groups in your organization.</p>
                    </div>
                </div>

                <div className="flex-1 flex flex-col items-center justify-center py-20 bg-white rounded-[2rem] border border-slate-100 shadow-sm mt-6">
                    <span className="material-symbols-outlined text-5xl text-slate-300 mb-4">calendar_month</span>
                    <h3 className="text-lg font-bold text-slate-900">No Season Selected</h3>
                    <p className="text-slate-500 text-sm">Please select a season from the Seasons page to manage groups.</p>
                </div>
            </div>
        );
    }

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
                    <h1 className="text-[#111817] text-4xl font-black leading-tight tracking-[-0.033em]">Academy Groups</h1>
                    <p className="text-[#618983] text-base font-normal">Manage academy-level groups in your organization.</p>
                </div>
            </div>

            {/* Badge showing season and category */}
            <div className="mb-4 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
                    <span className="material-symbols-outlined text-sm">calendar_month</span>
                    {selectedSeason.name}
                </span>
                <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
                    <span className="material-symbols-outlined text-sm">school</span>
                    Category: Academy
                </span>
            </div>

            {/* Search Bar */}
            <div className="mt-4 mb-6">
                <div className="relative max-w-md">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                    <input
                        type="text"
                        placeholder="Search academy groups by name or discipline..."
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
            ) : groups.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {searchFilteredGroups.map((group) => (
                        <div 
                            key={group._id}
                            className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div 
                                        className="size-12 rounded-xl flex items-center justify-center text-white shadow-sm"
                                        style={{ backgroundColor: primaryColor }}
                                    >
                                        <span className="material-symbols-outlined">{getDisciplineIcon(group.discipline)}</span>
                                    </div>
                                    <div>
                                        <h3 className="text-slate-900 font-bold">{group.name}</h3>
                                        <span className="text-[10px] font-bold text-[#618983] uppercase tracking-widest capitalize">{group.discipline}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-4 mb-4">
                                <div className="flex items-center gap-1.5">
                                    <span className="material-symbols-outlined text-slate-400 text-sm">groups</span>
                                    <span className="text-slate-600 text-sm font-medium">
                                        {group.players?.length || 0} Players
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="material-symbols-outlined text-slate-400 text-sm">sports</span>
                                    <span className="text-slate-600 text-sm font-medium">
                                        {group.coaches?.length || 0} Coaches
                                    </span>
                                </div>
                            </div>

                            <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
                                Academy Group
                            </span>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2rem] border border-slate-100 shadow-sm mt-6">
                    <span className="material-symbols-outlined text-5xl text-slate-300 mb-4">groups_3</span>
                    <h3 className="text-lg font-bold text-slate-900">No academy groups yet</h3>
                    <p className="text-slate-500 text-sm">Create academy groups from the Groups page to see them here.</p>
                </div>
            )}
        </div>
    );
};

export default AcademyGroups;
