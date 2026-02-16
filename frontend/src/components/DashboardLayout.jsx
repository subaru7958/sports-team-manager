import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import Button from "./Button";
import { useSeason } from "../context/SeasonContext";

const DashboardLayout = ({ children, activePage, onPageChange }) => {
    const { user, team, logout } = useAuth();
    const { selectedSeason, clearSeason } = useSeason();
    const primaryColor = team?.primaryColor || "#0bdada";
    const [academiesOpen, setAcademiesOpen] = useState(false);
    const academiesRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (academiesRef.current && !academiesRef.current.contains(event.target)) {
                setAcademiesOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const menuItems = [
        { id: "dashboard", name: "Dashboard", icon: "dashboard" },
        { id: "seasons", name: "Seasons", icon: "calendar_month" },
        ...(selectedSeason ? [{ id: "groups", name: "Groups", icon: "groups_3" }] : []),
        { id: "schedules", name: "Schedules", icon: "schedule" },
    ];

    const hrItems = [
        { id: "coaches", name: "Coaches", icon: "sports" },
        { id: "players", name: "Players", icon: "groups" },
    ];

    return (
        <div className="flex h-screen overflow-hidden bg-background-light">
            {/* Sidebar Navigation */}
            <aside className="w-64 border-r border-slate-200 bg-white flex flex-col justify-between p-4 shrink-0 shadow-sm z-20">
                <div className="flex flex-col gap-8">
                    {/* Logo Segment */}
                    <div className="flex items-center gap-3 px-2">
                        <div className="size-12 rounded-xl flex items-center justify-center overflow-hidden border border-slate-100 shadow-sm" style={{ backgroundColor: `${primaryColor}10` }}>
                            {team?.logo ? (
                                <img src={team.logo} alt="Team logo" className="w-full h-full object-contain p-1" />
                            ) : (
                                <span className="material-symbols-outlined" style={{ fontSize: "28px", color: primaryColor }}>sports_score</span>
                            )}
                        </div>
                        <div className="flex flex-col overflow-hidden">
                            <h1 className="text-slate-900 text-base font-bold leading-tight truncate">{team?.name || "Elite Sports"}</h1>
                            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Admin Portal</p>
                        </div>
                    </div>

                    {/* Navigation Links */}
                    <nav className="flex flex-col gap-1">
                        {menuItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => onPageChange(item.id)}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${activePage === item.id
                                    ? "bg-slate-50 text-slate-900 font-bold"
                                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                                    }`}
                            >
                                <span className={`material-symbols-outlined ${activePage === item.id ? "font-variation-settings-fill" : ""}`} style={{ color: activePage === item.id ? primaryColor : "inherit" }}>
                                    {item.icon}
                                </span>
                                <span className="text-sm font-medium">{item.name}</span>
                            </button>
                        ))}

                        <div className="mt-4 mb-1 px-3">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Ressource Humaine</p>
                        </div>

                        {hrItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => onPageChange(item.id)}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${activePage === item.id
                                    ? "bg-slate-50 text-slate-900 font-bold"
                                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                                    }`}
                            >
                                <span className={`material-symbols-outlined ${activePage === item.id ? "font-variation-settings-fill" : ""}`} style={{ color: activePage === item.id ? primaryColor : "inherit" }}>
                                    {item.icon}
                                </span>
                                <span className="text-sm font-medium">{item.name}</span>
                            </button>
                        ))}

                        {/* Academies Dropdown */}
                        <div className="mt-4 mb-1 px-3">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Academies</p>
                        </div>
                        
                        <div className="relative" ref={academiesRef}>
                            <button
                                onClick={() => setAcademiesOpen(!academiesOpen)}
                                className={`flex items-center justify-between w-full px-3 py-2.5 rounded-lg transition-all ${activePage.startsWith('academy') 
                                    ? "bg-slate-50 text-slate-900 font-bold" 
                                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <span className={`material-symbols-outlined ${activePage.startsWith('academy') ? "font-variation-settings-fill" : ""}`} style={{ color: activePage.startsWith('academy') ? primaryColor : "inherit" }}>
                                        school
                                    </span>
                                    <span className="text-sm font-medium">Academies</span>
                                </div>
                                <span className={`material-symbols-outlined text-lg transition-transform ${academiesOpen ? 'rotate-180' : ''}`}>
                                    expand_more
                                </span>
                            </button>
                            
                            {academiesOpen && (
                                <div className="ml-4 mt-1 bg-white border border-slate-100 rounded-lg shadow-lg overflow-hidden">
                                    <button
                                        onClick={() => { onPageChange('academy-players'); setAcademiesOpen(false); }}
                                        className={`flex items-center gap-2 w-full px-3 py-2 text-left hover:bg-slate-50 transition-colors ${activePage === 'academy-players' ? 'bg-slate-50 font-bold' : ''}`}
                                    >
                                        <span className="material-symbols-outlined text-lg" style={{ color: primaryColor }}>groups</span>
                                        <span className="text-sm">Academy Players</span>
                                    </button>
                                    <button
                                        onClick={() => { onPageChange('academy-coaches'); setAcademiesOpen(false); }}
                                        className={`flex items-center gap-2 w-full px-3 py-2 text-left hover:bg-slate-50 transition-colors ${activePage === 'academy-coaches' ? 'bg-slate-50 font-bold' : ''}`}
                                    >
                                        <span className="material-symbols-outlined text-lg" style={{ color: primaryColor }}>sports</span>
                                        <span className="text-sm">Academy Coaches</span>
                                    </button>
                                    <button
                                        onClick={() => { onPageChange('academy-groups'); setAcademiesOpen(false); }}
                                        className={`flex items-center gap-2 w-full px-3 py-2 text-left hover:bg-slate-50 transition-colors ${activePage === 'academy-groups' ? 'bg-slate-50 font-bold' : ''}`}
                                    >
                                        <span className="material-symbols-outlined text-lg" style={{ color: primaryColor }}>groups_3</span>
                                        <span className="text-sm">Academy Groups</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </nav>
                </div>

                <div className="flex flex-col gap-3">
                    <button
                        onClick={logout}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all font-medium"
                    >
                        <span className="material-symbols-outlined text-xl">logout</span>
                        <span className="text-sm">Logout</span>
                    </button>
                    <button
                        onClick={() => onPageChange('settings')}
                        className="flex w-full items-center justify-center gap-2 rounded-xl h-11 text-white text-sm font-bold transition-all shadow-lg active:scale-95"
                        style={{ backgroundColor: primaryColor }}
                    >
                        <span className="material-symbols-outlined text-lg">settings</span>
                        <span>Settings</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden relative">
                {/* Header */}
                <header className="flex items-center justify-between border-b border-slate-200 bg-white px-8 py-4 sticky top-0 z-10 shrink-0 h-20">
                    <div className="flex items-center gap-8">
                        <h2 className="text-slate-900 text-lg font-bold tracking-tight capitalize">{activePage} Management</h2>
                        {selectedSeason && (
                            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm transition-all hover:bg-white group cursor-default">
                                <span className="material-symbols-outlined text-sm font-variation-settings-fill" style={{ color: primaryColor }}>stars</span>
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-slate-500 font-bold uppercase leading-none mb-0.5">Active Season</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-slate-900 text-sm font-black leading-none">{selectedSeason.name}</span>
                                        <button
                                            onClick={() => {
                                                clearSeason();
                                                onPageChange("seasons");
                                            }}
                                            className="size-4 rounded-full bg-slate-200 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all group/close"
                                            title="Exit Season"
                                        >
                                            <span className="material-symbols-outlined text-[10px] transform group-hover/close:rotate-90 transition-transform">close</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                        <nav className="flex items-center gap-6">
                            <a className="text-slate-900 text-sm font-bold border-b-2 pb-1" style={{ borderColor: primaryColor }} href="javascript:void(0)">Overview</a>
                            <a className="text-slate-500 text-sm font-medium hover:text-slate-900 transition-colors" href="javascript:void(0)">Archived</a>
                        </nav>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative w-64 group">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl group-focus-within:text-primary transition-colors">search</span>
                            <input
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border-none bg-slate-100 text-slate-900 placeholder:text-slate-400 text-sm focus:ring-2 transition-all"
                                style={{ "--tw-ring-color": `${primaryColor}30` }}
                                placeholder={`Search ${activePage}...`}
                                type="text"
                            />
                        </div>
                        <div className="h-10 w-10 rounded-full border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-400 shadow-inner">
                            <span className="material-symbols-outlined text-2xl">account_circle</span>
                        </div>
                    </div>
                </header>

                {/* Dynamic Content */}
                <main className="flex-1 overflow-y-auto bg-slate-50/50 relative">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
