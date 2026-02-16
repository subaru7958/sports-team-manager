import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/api";
import Button from "../../components/Button";
import CreateCoachModal from "../../components/CreateCoachModal";
import EditCoachModal from "../../components/EditCoachModal";
import CoachDetailsModal from "../../components/CoachDetailsModal";

const AcademyCoaches = () => {
    const { team } = useAuth();
    const primaryColor = team?.primaryColor || "#13ecc8";
    const [coaches, setCoaches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [selectedCoach, setSelectedCoach] = useState(null);
    const [activeTab, setActiveTab] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");

    // Academy category - this is the default for academy coaches
    const ACADEMY_CATEGORY = "academy";

    useEffect(() => {
        const fetchCoaches = async () => {
            try {
                const response = await api.get("/coaches/my");
                if (response.data.success) {
                    // Filter to only show academy coaches
                    const academyCoaches = response.data.coaches.filter(
                        c => c.category?.toLowerCase() === ACADEMY_CATEGORY.toLowerCase()
                    );
                    setCoaches(academyCoaches);
                }
            } catch (err) {
                console.error("Failed to fetch coaches", err);
            } finally {
                setLoading(false);
            }
        };
        fetchCoaches();
    }, []);

    const handleCoachCreated = (newCoach) => {
        const academyCoach = { ...newCoach, category: ACADEMY_CATEGORY };
        setCoaches([...coaches, academyCoach]);
    };

    const handleCoachUpdated = (updatedCoach) => {
        setCoaches(coaches.map(c => c._id === updatedCoach._id ? updatedCoach : c));
        if (selectedCoach?._id === updatedCoach._id) {
            setSelectedCoach(updatedCoach);
        }
    };

    const handleDeleteCoach = async (id) => {
        if (!window.confirm("Are you sure you want to remove this staff member? This action cannot be undone.")) return;
        try {
            const response = await api.delete(`/coaches/${id}`);
            if (response.data.success) {
                setCoaches(coaches.filter(c => c._id !== id));
            }
        } catch (err) {
            console.error("Failed to delete coach", err);
        }
    };

    const getInitials = (name) => {
        if (!name) return "--";
        return name.split(' ').filter(n => n).map(n => n[0]).join('').toUpperCase().substring(0, 2);
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

    const handleViewDetails = (coach) => {
        setSelectedCoach(coach);
        setIsDetailsModalOpen(true);
    };

    const handleOpenEdit = (coach) => {
        setSelectedCoach(coach);
        setIsEditModalOpen(true);
    };

    // Filtering logic
    const filteredCoaches = activeTab === "all"
        ? coaches
        : coaches.filter(c => c.discipline?.toLowerCase() === activeTab.toLowerCase());

    // Search filtering
    const searchFilteredCoaches = searchQuery
        ? filteredCoaches.filter(c => 
            c.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.specialty?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.discipline?.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : filteredCoaches;

    const disciplines = team?.disciplines || [];

    const handleCreateClick = () => {
        setSelectedCoach(null);
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
                    <h1 className="text-[#111817] text-4xl font-black leading-tight tracking-[-0.033em]">Academy Coaches</h1>
                    <p className="text-[#618983] text-base font-normal">Manage academy-level coaching staff in your organization.</p>
                </div>
                <button
                    onClick={handleCreateClick}
                    className="flex items-center justify-center rounded-2xl h-14 px-8 text-[#111817] text-base font-bold transition-all hover:shadow-xl active:scale-95"
                    style={{ backgroundColor: primaryColor }}
                >
                    <span className="material-symbols-outlined mr-2">person_add</span>
                    Register Academy Coach
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
                        placeholder="Search academy coaches by name, specialty or discipline..."
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
            ) : coaches.length > 0 ? (
                <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden mt-6">
                    {searchFilteredCoaches.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-100">
                                        <th className="px-6 py-5 text-xs font-black text-[#618983] uppercase tracking-widest">Staff Member</th>
                                        <th className="px-6 py-5 text-xs font-black text-[#618983] uppercase tracking-widest">Discipline</th>
                                        <th className="px-6 py-5 text-xs font-black text-[#618983] uppercase tracking-widest">Role / Specialty</th>
                                        <th className="px-6 py-5 text-xs font-black text-[#618983] uppercase tracking-widest text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {searchFilteredCoaches.map((coach) => (
                                        <tr key={coach._id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div 
                                                        className="size-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                                                        style={{ backgroundColor: primaryColor }}
                                                    >
                                                        {getInitials(coach.fullName)}
                                                    </div>
                                                    <div>
                                                        <p className="text-[#111817] text-sm font-bold">{coach.fullName}</p>
                                                        <p className="text-[#618983] text-xs">{coach.email || 'No email'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="material-symbols-outlined text-lg" style={{ color: primaryColor }}>{getDisciplineIcon(coach.discipline)}</span>
                                                    <span className="text-[#111817] text-sm font-bold capitalize">{coach.discipline}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold capitalize">
                                                    {coach.specialty || 'Academy Coach'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => handleViewDetails(coach)}
                                                        className="p-2 rounded-lg text-[#618983] hover:bg-slate-100 hover:text-[#111817] transition-colors"
                                                    >
                                                        <span className="material-symbols-outlined text-lg">visibility</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleOpenEdit(coach)}
                                                        className="p-2 rounded-lg text-[#618983] hover:bg-slate-100 hover:text-[#111817] transition-colors"
                                                    >
                                                        <span className="material-symbols-outlined text-lg">edit</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteCoach(coach._id)}
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
                            <h3 className="text-lg font-bold text-slate-900">No academy coaches found</h3>
                            <p className="text-slate-500 text-sm">Try adjusting your search or filters.</p>
                        </div>
                    )}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2rem] border border-slate-100 shadow-sm mt-6">
                    <span className="material-symbols-outlined text-5xl text-slate-300 mb-4">sports</span>
                    <h3 className="text-lg font-bold text-slate-900">No academy coaches yet</h3>
                    <p className="text-slate-500 text-sm mb-4">Get started by registering your first academy coach.</p>
                    <button
                        onClick={handleCreateClick}
                        className="flex items-center gap-2 px-6 py-2 rounded-xl text-white font-bold text-sm transition-all shadow-lg active:scale-95"
                        style={{ backgroundColor: primaryColor }}
                    >
                        <span className="material-symbols-outlined">person_add</span>
                        Register Academy Coach
                    </button>
                </div>
            )}

            {/* Modals */}
            {isCreateModalOpen && (
                <CreateCoachModal
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                    onCoachCreated={handleCoachCreated}
                    defaultCategory={ACADEMY_CATEGORY}
                />
            )}

            {isEditModalOpen && selectedCoach && (
                <EditCoachModal
                    isOpen={isEditModalOpen}
                    onClose={() => { setIsEditModalOpen(false); setSelectedCoach(null); }}
                    coach={selectedCoach}
                    onCoachUpdated={handleCoachUpdated}
                />
            )}

            {isDetailsModalOpen && selectedCoach && (
                <CoachDetailsModal
                    isOpen={isDetailsModalOpen}
                    onClose={() => { setIsDetailsModalOpen(false); setSelectedCoach(null); }}
                    coach={selectedCoach}
                />
            )}
        </div>
    );
};

export default AcademyCoaches;
