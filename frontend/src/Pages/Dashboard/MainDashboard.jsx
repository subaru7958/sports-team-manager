import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/api";
import CreateSeasonModal from "../../components/CreateSeasonModal";

const MainDashboard = () => {
    const { team } = useAuth();
    const primaryColor = team?.primaryColor || "#0bdada";

    const [stats, setStats] = useState({
        coaches: 0,
        players: 0,
        seasons: 0
    });
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [coachesRes, playersRes, seasonsRes] = await Promise.all([
                    api.get("/coaches/my"),
                    api.get("/players/my"),
                    api.get("/seasons/my")
                ]);

                setStats({
                    coaches: coachesRes.data.coaches?.length || 0,
                    players: playersRes.data.players?.length || 0,
                    seasons: seasonsRes.data.seasons?.length || 0
                });
            } catch (err) {
                console.error("Failed to fetch dashboard stats", err);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    const statCards = [
        { label: "Total Coaches", value: stats.coaches, icon: "sports", color: "blue" },
        { label: "Registered Players", value: stats.players, icon: "groups", color: "green" },
        { label: "Active Seasons", value: stats.seasons, icon: "calendar_month", color: "orange" },
    ];

    return (
        <div className="flex-1 flex flex-col p-8 md:p-12 h-full gap-10">
            <div className="flex justify-between items-end">
                <div className="flex flex-col gap-1">
                    <h2 className="text-3xl font-extrabold text-slate-900 font-display transition-all">
                        Organization Overview
                    </h2>
                    <p className="text-slate-500 font-medium">Insights and summary of your athletic programs</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="text-right hidden md:block">
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Current Status</p>
                        <p className="text-slate-900 text-sm font-bold">System Online</p>
                    </div>
                    <div className="size-2 bg-green-500 rounded-full animate-pulse"></div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {statCards.map((card, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-full translate-x-12 -translate-y-12 group-hover:scale-110 transition-transform duration-500 opacity-50"></div>
                        <div className="flex items-center gap-4 relative z-10">
                            <div className="size-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${primaryColor}15` }}>
                                <span className="material-symbols-outlined text-2xl" style={{ color: primaryColor }}>{card.icon}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">{card.label}</span>
                                <span className="text-2xl font-black text-slate-900 leading-none">{loading ? "..." : card.value}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Action Area */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-10 flex flex-col items-center justify-center text-center relative overflow-hidden flex-1 max-h-[500px]">
                <div className="absolute top-0 left-0 w-64 h-64 blur-[120px] rounded-full -translate-x-1/2 -translate-y-1/2 opacity-10" style={{ backgroundColor: primaryColor }}></div>

                <div className="size-20 bg-primary/10 rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: `${primaryColor}15` }}>
                    <span className="material-symbols-outlined text-4xl" style={{ color: primaryColor }}>auto_awesome</span>
                </div>

                <h3 className="text-2xl font-bold text-slate-900 mb-3">Quick Logistics Manager</h3>
                <p className="text-slate-500 max-w-md mx-auto mb-8 font-medium">
                    Your central command for all athletic operations. Start a new season, manage your technical staff, or register new athletes to populate your dashboard.
                </p>

                <div className="flex flex-wrap items-center justify-center gap-4">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="px-8 h-14 rounded-2xl text-white font-bold transition-all shadow-xl hover:scale-[1.02] active:scale-95 flex items-center gap-2"
                        style={{ backgroundColor: primaryColor }}
                    >
                        <span className="material-symbols-outlined">add_circle</span>
                        Launch New Season
                    </button>
                    <button className="px-8 h-14 rounded-2xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-all flex items-center gap-2">
                        <span className="material-symbols-outlined">download</span>
                        Export Report
                    </button>
                </div>
            </div>

            <CreateSeasonModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSeasonCreated={() => window.location.reload()} // Refresh stats
            />
        </div>
    );
};

export default MainDashboard;
