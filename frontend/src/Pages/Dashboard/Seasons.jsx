import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/api";
import CreateSeasonModal from "../../components/CreateSeasonModal";
import { useSeason } from "../../context/SeasonContext";

const Seasons = ({ onPageChange }) => {
    const { team } = useAuth();
    const primaryColor = team?.primaryColor || "#13ecc8";

    const [seasons, setSeasons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("all");
    const { selectSeason } = useSeason();

    useEffect(() => {
        const fetchSeasons = async () => {
            try {
                const response = await api.get("/seasons/my");
                if (response.data.success) {
                    setSeasons(response.data.seasons);
                }
            } catch (err) {
                console.error("Failed to fetch seasons", err);
            } finally {
                setLoading(false);
            }
        };
        fetchSeasons();
    }, []);

    const handleSeasonCreated = (newSeason) => {
        setSeasons([...seasons, newSeason]);
    };

    const getDisciplineIcon = (discipline) => {
        const disc = discipline.toLowerCase();
        if (disc.includes('foot')) return 'sports_soccer';
        if (disc.includes('basket')) return 'sports_basketball';
        if (disc.includes('volley')) return 'sports_volleyball';
        if (disc.includes('tennis')) return 'sports_tennis';
        if (disc.includes('swim')) return 'pool';
        return 'sports_score';
    };

    const getStatus = (start, end) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const startDate = new Date(start);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(end);
        endDate.setHours(0, 0, 0, 0);

        if (today > endDate) return 'archived';
        if (today >= startDate && today <= endDate) return 'active';
        return 'upcoming';
    };

    const groupedSeasons = seasons.reduce((acc, season) => {
        if (!season || !season.discipline) return acc;
        const disc = season.discipline.toLowerCase();
        if (!acc[disc]) acc[disc] = [];
        const enrichedSeason = {
            ...season,
            dynamicStatus: getStatus(season.startDate, season.endDate)
        };
        acc[disc].push(enrichedSeason);
        return acc;
    }, {});

    const disciplines = Object.keys(groupedSeasons);
    const filteredDisciplines = activeTab === "all" ? disciplines : [activeTab];

    const stats = {
        active: seasons.filter(s => getStatus(s.startDate, s.endDate) === 'active').length,
        total: seasons.length
    };

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-slate-200 border-t-primary rounded-full animate-spin" style={{ borderTopColor: primaryColor }}></div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col w-full max-w-[1200px] mx-auto px-4 lg:px-10 py-5 font-display">
            {/* Breadcrumbs */}
            <div className="flex flex-wrap gap-2 py-2">
                <a className="text-[#618983] text-sm font-medium leading-normal hover:text-primary transition-colors" href="javascript:void(0)" style={{ "--tw-text-opacity": "1", "--primary-color": primaryColor }}>Organization</a>
                <span className="text-[#618983] text-sm font-medium leading-normal">/</span>
                <span className="text-[#111817] text-sm font-medium leading-normal">Season Management</span>
            </div>

            {/* Page Heading */}
            <div className="flex flex-wrap justify-between items-end gap-3 py-6">
                <div className="flex min-w-72 flex-col gap-2">
                    <h1 className="text-[#111817] text-4xl font-black leading-tight tracking-[-0.033em]">Season Management</h1>
                    <p className="text-[#618983] text-base font-normal leading-normal">Manage and organize competitive periods across all sports disciplines.</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center justify-center rounded-lg h-10 px-4 bg-white border border-[#dbe6e4] text-[#111817] text-sm font-bold hover:bg-slate-50 transition-colors">
                        <span className="material-symbols-outlined mr-2 text-lg">filter_list</span>
                        <span>Filter</span>
                    </button>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center justify-center rounded-lg h-10 px-6 text-[#111817] text-sm font-bold tracking-[0.015em] hover:shadow-lg transition-all"
                        style={{ backgroundColor: primaryColor }}
                    >
                        <span className="material-symbols-outlined mr-2">add_circle</span>
                        <span>Create New Season</span>
                    </button>
                </div>
            </div>

            {/* Tabs Component */}
            <div className="pb-6">
                <div className="flex border-b border-[#dbe6e4] gap-8 overflow-x-auto no-scrollbar">
                    <button
                        onClick={() => setActiveTab("all")}
                        className={`flex items-center gap-2 border-b-[3px] pb-3 pt-4 transition-all ${activeTab === "all" ? "border-primary text-[#111817]" : "border-transparent text-[#618983] hover:text-[#111817]"}`}
                        style={{ borderBottomColor: activeTab === "all" ? primaryColor : "transparent" }}
                    >
                        <span className="material-symbols-outlined text-xl">grid_view</span>
                        <p className="text-sm font-bold tracking-[0.015em] whitespace-nowrap">All Disciplines</p>
                    </button>
                    {disciplines.map(d => (
                        <button
                            key={d}
                            onClick={() => setActiveTab(d)}
                            className={`flex items-center gap-2 border-b-[3px] pb-3 pt-4 transition-all ${activeTab === d ? "border-primary text-[#111817]" : "border-transparent text-[#618983] hover:text-[#111817]"}`}
                            style={{ borderBottomColor: activeTab === d ? primaryColor : "transparent" }}
                        >
                            <span className="material-symbols-outlined text-xl">{getDisciplineIcon(d)}</span>
                            <p className="text-sm font-bold tracking-[0.015em] whitespace-nowrap capitalize">{d}</p>
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Sections */}
            {seasons.length > 0 ? (
                <div className="flex-1">
                    {filteredDisciplines.map((discipline) => (
                        <div key={discipline} className="mb-10 last:mb-0">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-[#111817] text-[22px] font-bold leading-tight tracking-[-0.015em] flex items-center gap-2">
                                    <span className="material-symbols-outlined" style={{ color: primaryColor }}>{getDisciplineIcon(discipline)}</span>
                                    <span className="capitalize">{discipline}</span>
                                </h2>
                                <span className="text-xs font-semibold uppercase tracking-wider text-[#618983]">
                                    {groupedSeasons[discipline].length} Season{groupedSeasons[discipline].length > 1 ? 's' : ''} Found
                                </span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {groupedSeasons[discipline].map((season) => (
                                    <div
                                        key={season._id}
                                        className="bg-white border-l-4 rounded-lg shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col gap-4"
                                        style={{ borderLeftColor: season.dynamicStatus === 'active' ? primaryColor : '#d1d5db' }}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="flex flex-col">
                                                <h3 className="text-[#111817] text-lg font-bold truncate max-w-[180px]">{season.name}</h3>
                                                <span className="text-xs text-[#618983] flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-xs">{getDisciplineIcon(discipline)}</span>
                                                    <span className="capitalize">{discipline}</span> • {season.description || 'Pro Division'}
                                                </span>
                                            </div>
                                            <span
                                                className="px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                                                style={{
                                                    backgroundColor: season.dynamicStatus === 'active' ? `${primaryColor}33` : '#f3f4f6',
                                                    color: season.dynamicStatus === 'active' ? '#111817' : '#6b7280'
                                                }}
                                            >
                                                {season.dynamicStatus}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-[#618983] text-sm">
                                            <span className="material-symbols-outlined text-lg">calendar_today</span>
                                            <span>{new Date(season.startDate).toLocaleDateString(undefined, { month: 'short', day: '2-digit', year: 'numeric' })} - {new Date(season.endDate).toLocaleDateString(undefined, { month: 'short', day: '2-digit', year: 'numeric' })}</span>
                                        </div>
                                        <div className="mt-2 flex items-center gap-3">
                                            <button
                                                onClick={() => {
                                                    selectSeason(season);
                                                    onPageChange("groups");
                                                }}
                                                className="flex-1 py-2 rounded-lg text-sm font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                                                style={{ backgroundColor: primaryColor, color: '#111817' }}
                                            >
                                                <span className="material-symbols-outlined text-sm">login</span>
                                                Enter Season
                                            </button>
                                            <button className="p-2 border border-[#dbe6e4] rounded-lg text-[#111817] hover:bg-slate-50 transition-colors">
                                                <span className="material-symbols-outlined text-lg">edit</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                {/* Add New Card Placeholder for specific discipline */}
                                <button
                                    onClick={() => setIsModalOpen(true)}
                                    className="border-2 border-dashed border-[#dbe6e4] rounded-lg p-5 flex flex-col items-center justify-center gap-2 min-h-[180px] bg-slate-50/50 hover:bg-slate-50 transition-all hover:border-primary/40 group"
                                >
                                    <span className="material-symbols-outlined text-3xl text-[#618983] group-hover:text-primary transition-colors">add_circle</span>
                                    <p className="text-sm font-bold text-[#618983] group-hover:text-[#111817]">New {discipline} Season</p>
                                    <p className="text-xs text-[#618983] text-center">Add a new competitive period for this discipline</p>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                /* Empty State when no seasons exist at all */
                <div className="flex-1 flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-dashed border-[#dbe6e4]">
                    <div className="size-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                        <span className="material-symbols-outlined text-4xl text-[#618983]">event_busy</span>
                    </div>
                    <h3 className="text-[#111817] text-xl font-bold mb-2">No seasons configured</h3>
                    <p className="text-[#618983] max-w-sm mb-8">Set up your first athletic season to start tracking athletes, teams, and performance.</p>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="px-8 h-12 rounded-xl text-[#111817] font-bold shadow-lg hover:scale-[1.02] active:scale-95 transition-all"
                        style={{ backgroundColor: primaryColor }}
                    >
                        Create Your First Season
                    </button>
                </div>
            )}

            {/* Summary Stats Footer */}
            <div className="mt-12 p-6 bg-white rounded-xl border border-[#dbe6e4] flex flex-wrap gap-10 items-center justify-center lg:justify-start shadow-sm">
                <div className="flex flex-col items-center lg:items-start">
                    <span className="text-2xl font-black" style={{ color: primaryColor }}>{stats.active.toString().padStart(2, '0')}</span>
                    <span className="text-xs font-bold text-[#618983] uppercase">Active Seasons</span>
                </div>
                <div className="w-px h-10 bg-[#dbe6e4] hidden lg:block"></div>
                <div className="flex flex-col items-center lg:items-start">
                    <span className="text-2xl font-black text-[#111817]">{stats.total.toString().padStart(2, '0')}</span>
                    <span className="text-xs font-bold text-[#618983] uppercase">Total Historical</span>
                </div>
                <div className="flex-grow"></div>
                <button className="text-sm font-bold flex items-center gap-2 hover:underline transition-all" style={{ color: primaryColor }}>
                    View Organization Archives
                    <span className="material-symbols-outlined">arrow_forward</span>
                </button>
            </div>

            <CreateSeasonModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSeasonCreated={handleSeasonCreated}
            />
        </div>
    );
};

export default Seasons;
