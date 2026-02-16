import React, { useState } from "react";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";
import Button from "../components/Button";
import ProgressBar from "../components/ProgressBar";

const DisciplineSetup = ({ onNext, onBack }) => {
    const { setTeam } = useAuth();
    const [selectedDisciplines, setSelectedDisciplines] = useState([]);
    const [facilityCounts, setFacilityCounts] = useState({
        "Football": 1,
        "Basketball": 1,
        "Tennis": 1,
        "Swimming": 1,
        "Handball": 1,
        "Volleyball": 1
    });
    const [customDiscipline, setCustomDiscipline] = useState("");
    const [showCustomInput, setShowCustomInput] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [availableDisciplines, setAvailableDisciplines] = useState([
        { id: "football", name: "Football", icon: "sports_soccer", subtext: "Pitches and training grounds" },
        { id: "basketball", name: "Basketball", icon: "sports_basketball", subtext: "Indoor courts and facilities" },
        { id: "tennis", name: "Tennis", icon: "sports_tennis", subtext: "Indoor and outdoor courts" },
        { id: "swimming", name: "Swimming", icon: "pool", subtext: "Olympic and practice pools" },
        { id: "handball", name: "Handball", icon: "sports_handball", subtext: "Indoor handball courts" },
        { id: "volleyball", name: "Volleyball", icon: "sports_volleyball", subtext: "Indoor and beach courts" },
    ]);

    const toggleDiscipline = (name) => {
        if (selectedDisciplines.includes(name)) {
            setSelectedDisciplines(selectedDisciplines.filter(d => d !== name));
        } else {
            setSelectedDisciplines([...selectedDisciplines, name]);
        }
    };

    const handleCountChange = (name, val) => {
        setFacilityCounts({
            ...facilityCounts,
            [name]: parseInt(val) || 0
        });
    };

    const handleAddCustom = () => {
        if (customDiscipline.trim()) {
            const name = customDiscipline.trim();
            if (!availableDisciplines.find(d => d.name.toLowerCase() === name.toLowerCase())) {
                const newDisc = {
                    id: name.toLowerCase().replace(/\s+/g, '-'),
                    name: name,
                    icon: "sports",
                    subtext: "Custom facility"
                };
                setAvailableDisciplines([...availableDisciplines, newDisc]);
                setSelectedDisciplines([...selectedDisciplines, name]);
                setFacilityCounts({ ...facilityCounts, [name]: 1 });
            }
            setCustomDiscipline("");
            setShowCustomInput(false);
        }
    };

    const handleSaveAndContinue = async () => {
        if (selectedDisciplines.length === 0) {
            setError("Please select at least one discipline");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const response = await api.post("/team/disciplines", {
                disciplines: selectedDisciplines,
                facilityCounts: facilityCounts
            });

            if (response.data.success) {
                setTeam(response.data.team);
                onNext();
            }
        } catch (err) {
            setError(err.response?.data?.message || "Failed to save disciplines");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative flex h-auto min-h-screen w-full flex-col group/design-root overflow-x-hidden bg-background-light">
            <div className="layout-container flex h-full grow flex-col">
                <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-slate-200 px-10 py-3 bg-white">
                    <div className="flex items-center gap-4 text-slate-900 font-display">
                        <div className="size-6 text-primary">
                            <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                <path clipRule="evenodd" d="M24 4H42V17.3333V30.6667H24V44H6V30.6667V17.3333H24V4Z" fill="currentColor" fillRule="evenodd"></path>
                            </svg>
                        </div>
                        <h2 className="text-slate-900 text-lg font-bold leading-tight tracking-[-0.015em]">AthleticOS</h2>
                    </div>
                    <div className="flex flex-1 justify-end gap-8">
                        <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 border border-slate-200" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCpVpoE-n7npKLckFmu6q74on2M2n4ieuVAyv6O9-UOzQTK_EfKD1XaEB6xpiG1bvCXNE4CxJGj1guJ0KjYS5GMy8xw02Z5EVCUouE_zt-tojWJ4BladrBpqJkiTgqiLzJs9_etccMkg5J2EYxew33PcTxxKKPNpHG9io0o52ykkhvsgWcRmg7_zXVLN7FMCPFVTM8x1ofuvY9UjQ4_pMDWp6wLUOqTvXLTuU2lgXfsYiyysqlwoLUKBhLvzFDAuF9qVwIjcHJuH6JU")' }}></div>
                    </div>
                </header>

                <main className="flex-1 flex flex-col items-center justify-center p-6 md:p-12">
                    <div className="w-full max-w-[720px] bg-white rounded-xl shadow-sm border border-slate-200 p-8 md:p-12">
                        <div className="mb-10">
                            <ProgressBar
                                step={2}
                                totalSteps={3}
                                title="Discipline Setup"
                                subtext="Select the sports and activities managed by your organization."
                            />
                        </div>

                        <div className="mb-10 text-center">
                            <h1 className="text-slate-900 tracking-tight text-3xl font-bold leading-tight mb-2 font-display">Which disciplines do you manage?</h1>
                            <p className="text-slate-500 text-base font-normal leading-normal">Select all that apply. We'll help you configure the facilities for each.</p>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-lg text-sm flex items-center gap-2">
                                <span className="material-symbols-outlined text-base">error</span>
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
                            {availableDisciplines.map((discipline) => {
                                const isSelected = selectedDisciplines.includes(discipline.name);
                                return (
                                    <div
                                        key={discipline.id}
                                        onClick={() => toggleDiscipline(discipline.name)}
                                        className={`discipline-card group ${isSelected ? "selected" : ""}`}
                                    >
                                        <div className="absolute top-3 right-3">
                                            <input type="checkbox" checked={isSelected} readOnly className="rounded text-primary focus:ring-primary h-5 w-5 border-slate-300 pointer-events-none" />
                                        </div>
                                        <div className={`size-12 rounded-full flex items-center justify-center transition-colors ${isSelected ? "bg-primary/20 text-primary" : "bg-slate-100 text-slate-600 group-hover:bg-primary/10 group-hover:text-primary"}`}>
                                            <span className="material-symbols-outlined text-3xl font-variation-settings-fill">{discipline.icon}</span>
                                        </div>
                                        <span className="text-sm font-semibold text-slate-900">{discipline.name}</span>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="flex flex-col items-center mb-10 gap-4">
                            {!showCustomInput ? (
                                <button onClick={() => setShowCustomInput(true)} className="flex items-center gap-2 text-primary font-semibold hover:text-blue-700 transition-colors text-sm">
                                    <span className="material-symbols-outlined">add_circle</span>
                                    Add Custom Discipline
                                </button>
                            ) : (
                                <div className="flex items-center gap-2 w-full max-w-sm animate-in fade-in slide-in-from-top-2">
                                    <input autoFocus className="form-input flex-1 !h-10 text-sm" placeholder="Enter sport name..." value={customDiscipline} onChange={(e) => setCustomDiscipline(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddCustom()} />
                                    <Button onClick={handleAddCustom} className="!h-10 !py-0 !px-4 text-sm">Add</Button>
                                    <button onClick={() => setShowCustomInput(false)} className="text-slate-400 hover:text-slate-600">
                                        <span className="material-symbols-outlined text-xl">close</span>
                                    </button>
                                </div>
                            )}
                        </div>

                        {selectedDisciplines.length > 0 && (
                            <div className="flex flex-col gap-4 mb-10">
                                <h3 className="text-slate-900 text-sm font-bold uppercase tracking-wider">Quick Facility Count</h3>
                                {availableDisciplines.filter(d => selectedDisciplines.includes(d.name)).map(discipline => (
                                    <div key={`facility-${discipline.id}`} className="border border-slate-200 rounded-xl p-5 bg-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                                                <span className="material-symbols-outlined">{discipline.icon}</span>
                                            </div>
                                            <div>
                                                <p className="text-slate-900 font-semibold">{discipline.name}</p>
                                                <p className="text-xs text-slate-500">{discipline.subtext}</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-1 w-full md:w-auto">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase">
                                                Approx. {discipline.name === "Tennis" ? "Courts" : discipline.name === "Swimming" ? "Pools" : "Fields"}
                                            </label>
                                            <input className="form-input rounded-lg w-full md:w-32 !h-10 text-sm" type="number" value={facilityCounts[discipline.name] || 0} onChange={(e) => handleCountChange(discipline.name, e.target.value)} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="pt-4 flex flex-col gap-4">
                            <Button onClick={handleSaveAndContinue} loading={loading} className="w-full" icon="arrow_forward">
                                Continue to Field Config
                            </Button>
                            <Button onClick={onBack} variant="ghost" className="!py-0 text-sm">Back to Team Identity</Button>
                        </div>
                    </div>
                </main>

                <footer className="py-6 text-center">
                    <p className="text-slate-400 text-sm">© 2026 AthleticOS Professional. All rights reserved.</p>
                </footer>
            </div>
        </div>
    );
};

export default DisciplineSetup;
