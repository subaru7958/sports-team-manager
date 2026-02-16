import React, { useState, useEffect } from "react";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";

const Settings = () => {
    const { team, setTeam, primaryColor } = useAuth();
    const [activeTab, setActiveTab] = useState("brand");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });
    
    // Brand settings
    const [teamName, setTeamName] = useState("");
    const [logo, setLogo] = useState("");
    const [brandColor, setBrandColor] = useState("#0a47c2");
    
    // Discipline settings
    const [disciplines, setDisciplines] = useState([]);
    const [facilities, setFacilities] = useState({});
    const [newDiscipline, setNewDiscipline] = useState("");
    
    const availableDisciplines = [
        { id: "football", name: "Football", icon: "sports_soccer" },
        { id: "basketball", name: "Basketball", icon: "sports_basketball" },
        { id: "tennis", name: "Tennis", icon: "sports_tennis" },
        { id: "swimming", name: "Swimming", icon: "pool" },
        { id: "handball", name: "Handball", icon: "sports_handball" },
        { id: "volleyball", name: "Volleyball", icon: "sports_volleyball" }
    ];

    useEffect(() => {
        if (team) {
            setTeamName(team.name || "");
            setLogo(team.logo || "");
            setBrandColor(team.primaryColor || "#0a47c2");
            setDisciplines(team.disciplines || []);
            
            // Group facilities by discipline
            const facMap = {};
            (team.facilities || []).forEach(f => {
                const key = f.discipline?.toLowerCase() || "other";
                if (!facMap[key]) facMap[key] = [];
                facMap[key].push(f.name);
            });
            setFacilities(facMap);
        }
    }, [team]);

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogo(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveBrand = async () => {
        setLoading(true);
        setMessage({ type: "", text: "" });
        try {
            const response = await api.put("/team", {
                name: teamName,
                logo: logo,
                primaryColor: brandColor
            });
            if (response.data.success) {
                setTeam(response.data.team);
                setMessage({ type: "success", text: "Brand settings saved!" });
            }
        } catch (err) {
            setMessage({ type: "error", text: err.response?.data?.message || "Failed to save" });
        } finally {
            setLoading(false);
        }
    };

    const handleAddDiscipline = async (disciplineName) => {
        if (!disciplineName || disciplines.includes(disciplineName)) return;
        
        const key = disciplineName.toLowerCase();
        const newDiscs = [...disciplines, disciplineName];
        const newFacilities = { ...facilities, [key]: ["Main Field"] };
        
        setLoading(true);
        setMessage({ type: "", text: "" });
        try {
            const response = await api.put("/team", {
                disciplines: newDiscs,
                facilities: Object.entries(newFacilities).flatMap(([disc, names]) => 
                    names.map(name => ({ name, discipline: disc }))
                )
            });
            if (response.data.success) {
                setDisciplines(newDiscs);
                setFacilities(newFacilities);
                setTeam(response.data.team);
                setMessage({ type: "success", text: "Discipline added!" });
            }
        } catch (err) {
            setMessage({ type: "error", text: err.response?.data?.message || "Failed to add discipline" });
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveDiscipline = async (disciplineName) => {
        const key = disciplineName.toLowerCase();
        const newDiscs = disciplines.filter(d => d !== disciplineName);
        const newFacilities = { ...facilities };
        delete newFacilities[key];
        
        setLoading(true);
        setMessage({ type: "", text: "" });
        try {
            const response = await api.put("/team", {
                disciplines: newDiscs,
                facilities: Object.entries(newFacilities).flatMap(([disc, names]) => 
                    names.map(name => ({ name, discipline: disc }))
                )
            });
            if (response.data.success) {
                setDisciplines(newDiscs);
                setFacilities(newFacilities);
                setTeam(response.data.team);
                setMessage({ type: "success", text: "Discipline removed!" });
            }
        } catch (err) {
            setMessage({ type: "error", text: err.response?.data?.message || "Failed to remove discipline" });
        } finally {
            setLoading(false);
        }
    };

    const handleAddFacility = (discipline) => {
        const key = discipline.toLowerCase();
        setFacilities({
            ...facilities,
            [key]: [...(facilities[key] || []), ""]
        });
    };

    const handleRemoveFacility = async (discipline, index) => {
        const key = discipline.toLowerCase();
        if ((facilities[key] || []).length <= 1) {
            setMessage({ type: "error", text: "Each discipline must have at least one facility" });
            return;
        }
        
        const updated = [...(facilities[key] || [])];
        updated.splice(index, 1);
        
        setLoading(true);
        setMessage({ type: "", text: "" });
        try {
            const response = await api.put("/team", {
                disciplines,
                facilities: Object.entries({ ...facilities, [key]: updated }).flatMap(([disc, names]) => 
                    names.map(name => ({ name, discipline: disc }))
                )
            });
            if (response.data.success) {
                setFacilities({ ...facilities, [key]: updated });
                setTeam(response.data.team);
                setMessage({ type: "success", text: "Facility removed!" });
            }
        } catch (err) {
            setMessage({ type: "error", text: err.response?.data?.message || "Failed to remove facility" });
        } finally {
            setLoading(false);
        }
    };

    const handleFacilityNameChange = async (discipline, index, value) => {
        const key = discipline.toLowerCase();
        const updated = [...(facilities[key] || [])];
        updated[index] = value;
        
        setFacilities({
            ...facilities,
            [key]: updated
        });
    };

    const handleSaveFacilities = async () => {
        setLoading(true);
        setMessage({ type: "", text: "" });
        try {
            const flatFacilities = Object.entries(facilities).flatMap(([disc, names]) => 
                names.map(name => ({ name, discipline: disc }))
            );
            const response = await api.put("/team", {
                disciplines,
                facilities: flatFacilities
            });
            if (response.data.success) {
                setTeam(response.data.team);
                setMessage({ type: "success", text: "Facilities saved!" });
            }
        } catch (err) {
            setMessage({ type: "error", text: err.response?.data?.message || "Failed to save facilities" });
        } finally {
            setLoading(false);
        }
    };

    const getDisciplineIcon = (discipline) => {
        const found = availableDisciplines.find(d => d.name.toLowerCase() === discipline.toLowerCase());
        return found?.icon || "sports";
    };

    const availableToAdd = availableDisciplines.filter(
        d => !disciplines.some(disc => disc.toLowerCase() === d.name.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-[#111817] text-4xl font-black leading-tight tracking-[-0.033em]">Settings</h1>
                    <p className="text-[#618983] text-base font-normal mt-1">Manage your organization's brand, disciplines, and facilities.</p>
                </div>

                {/* Message */}
                {message.text && (
                    <div className={`mb-6 p-4 rounded-xl ${message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                        {message.text}
                    </div>
                )}

                {/* Tabs */}
                <div className="flex gap-2 mb-6 border-b border-slate-200 pb-4">
                    <button
                        onClick={() => setActiveTab("brand")}
                        className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === "brand" ? "text-white shadow" : "text-lg-slate-600 hover:bg-slate-100"}`}
                        style={activeTab === "brand" ? { backgroundColor: brandColor } : {}}
                    >
                        Brand & Identity
                    </button>
                    <button
                        onClick={() => setActiveTab("disciplines")}
                        className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === "disciplines" ? "text-white shadow-lg" : "text-slate-600 hover:bg-slate-100"}`}
                        style={activeTab === "disciplines" ? { backgroundColor: brandColor } : {}}
                    >
                        Disciplines
                    </button>
                    <button
                        onClick={() => setActiveTab("facilities")}
                        className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === "facilities" ? "text-white shadow-lg" : "text-slate-600 hover:bg-slate-100"}`}
                        style={activeTab === "facilities" ? { backgroundColor: brandColor } : {}}
                    >
                        Facilities
                    </button>
                </div>

                {/* Brand Tab */}
                {activeTab === "brand" && (
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                        <h2 className="text-slate-900 text-xl font-bold mb-6">Brand & Identity</h2>
                        
                        {/* Logo */}
                        <div className="mb-6">
                            <label className="text-slate-900 text-sm font-bold block mb-2">Organization Logo</label>
                            <div className="flex items-center gap-4">
                                <div className="w-20 h-20 rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200">
                                    {logo ? (
                                        <img src={logo} alt="Team Logo" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="material-symbols-outlined text-3xl text-slate-400">image</span>
                                    )}
                                </div>
                                <label className="cursor-pointer">
                                    <input type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
                                    <span className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-50 transition-colors">
                                        Change Logo
                                    </span>
                                </label>
                            </div>
                        </div>

                        {/* Team Name */}
                        <div className="mb-6">
                            <label className="text-slate-900 text-sm font-bold block mb-2">Organization Name</label>
                            <input
                                type="text"
                                value={teamName}
                                onChange={(e) => setTeamName(e.target.value)}
                                className="w-full h-12 rounded-xl border border-slate-200 px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-offset-0"
                                style={{ "--tw-ring-color": brandColor + "30" }}
                            />
                        </div>

                        {/* Brand Color */}
                        <div className="mb-6">
                            <label className="text-slate-900 text-sm font-bold block mb-2">Brand Color</label>
                            <div className="flex items-center gap-4">
                                <input
                                    type="color"
                                    value={brandColor}
                                    onChange={(e) => setBrandColor(e.target.value)}
                                    className="w-14 h-14 rounded-xl border border-slate-200 cursor-pointer"
                                />
                                <input
                                    type="text"
                                    value={brandColor}
                                    onChange={(e) => setBrandColor(e.target.value)}
                                    className="h-12 rounded-xl border border-slate-200 px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-offset-0 uppercase"
                                    style={{ "--tw-ring-color": brandColor + "30" }}
                                />
                            </div>
                            <p className="text-slate-500 text-xs mt-2">This color will be used throughout the dashboard.</p>
                        </div>

                        {/* Preview */}
                        <div className="mb-6 p-4 rounded-xl bg-slate-50">
                            <p className="text-slate-500 text-xs font-bold uppercase mb-2">Preview</p>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: brandColor }}>
                                    <span className="material-symbols-outlined">sports_soccer</span>
                                </div>
                                <span className="text-slate-900 font-bold">{teamName || "Your Team"}</span>
                            </div>
                        </div>

                        <button
                            onClick={handleSaveBrand}
                            disabled={loading}
                            className="w-full h-12 rounded-xl text-white font-bold text-sm transition-all shadow-lg active:scale-95 disabled:opacity-50"
                            style={{ backgroundColor: brandColor }}
                        >
                            {loading ? "Saving..." : "Save Brand Settings"}
                        </button>
                    </div>
                )}

                {/* Disciplines Tab */}
                {activeTab === "disciplines" && (
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                        <h2 className="text-slate-900 text-xl font-bold mb-6">Manage Disciplines</h2>
                        
                        {/* Current Disciplines */}
                        <div className="mb-6">
                            <label className="text-slate-900 text-sm font-bold block mb-3">Current Disciplines</label>
                            {disciplines.length === 0 ? (
                                <p className="text-slate-400 text-sm">No disciplines configured yet.</p>
                            ) : (
                                <div className="flex flex-wrap gap-2">
                                    {disciplines.map(disc => (
                                        <div key={disc} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200">
                                            <span className="material-symbols-outlined text-lg" style={{ color: brandColor }}>
                                                {getDisciplineIcon(disc)}
                                            </span>
                                            <span className="text-slate-900 font-bold text-sm">{disc}</span>
                                            <button
                                                onClick={() => handleRemoveDiscipline(disc)}
                                                className="text-slate-400 hover:text-red-500 transition-colors"
                                            >
                                                <span className="material-symbols-outlined text-lg">close</span>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Add New Discipline */}
                        <div className="mb-6">
                            <label className="text-slate-900 text-sm font-bold block mb-3">Add Discipline</label>
                            {availableToAdd.length === 0 ? (
                                <p className="text-slate-400 text-sm">All available disciplines are already added.</p>
                            ) : (
                                <div className="flex flex-wrap gap-2">
                                    {availableToAdd.map(disc => (
                                        <button
                                            key={disc.id}
                                            onClick={() => handleAddDiscipline(disc.name)}
                                            disabled={loading}
                                            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all disabled:opacity-50"
                                        >
                                            <span className="material-symbols-outlined text-lg text-slate-600">
                                                {disc.icon}
                                            </span>
                                            <span className="text-slate-700 font-bold text-sm">{disc.name}</span>
                                            <span className="material-symbols-outlined text-lg text-green-600">add</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="p-4 rounded-xl bg-amber-50 border border-amber-100">
                            <p className="text-amber-800 text-sm">
                                <span className="font-bold">Note:</span> You can manage facilities for each discipline in the Facilities tab.
                            </p>
                        </div>
                    </div>
                )}

                {/* Facilities Tab */}
                {activeTab === "facilities" && (
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-slate-900 text-xl font-bold">Manage Facilities</h2>
                            <button
                                onClick={handleSaveFacilities}
                                disabled={loading}
                                className="px-4 py-2 rounded-lg text-white font-bold text-sm transition-all shadow-lg active:scale-95 disabled:opacity-50"
                                style={{ backgroundColor: brandColor }}
                            >
                                {loading ? "Saving..." : "Save All"}
                            </button>
                        </div>

                        {disciplines.length === 0 ? (
                            <div className="text-center py-8">
                                <span className="material-symbols-outlined text-4xl text-slate-300">sports</span>
                                <p className="text-slate-400 text-sm mt-2">No disciplines configured. Add disciplines first.</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {disciplines.map(disc => {
                                    const key = disc.toLowerCase();
                                    const discFacilities = facilities[key] || [];
                                    return (
                                        <div key={disc} className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-2">
                                                    <span className="material-symbols-outlined text-xl" style={{ color: brandColor }}>
                                                        {getDisciplineIcon(disc)}
                                                    </span>
                                                    <span className="text-slate-900 font-bold">{disc}</span>
                                                </div>
                                                <button
                                                    onClick={() => handleAddFacility(disc)}
                                                    className="text-xs font-bold text-green-600 hover:text-green-700"
                                                >
                                                    + Add Facility
                                                </button>
                                            </div>
                                            
                                            <div className="space-y-2">
                                                {discFacilities.map((facility, idx) => (
                                                    <div key={idx} className="flex items-center gap-2">
                                                        <input
                                                            type="text"
                                                            value={facility}
                                                            onChange={(e) => handleFacilityNameChange(disc, idx, e.target.value)}
                                                            className="flex-1 h-10 rounded-lg border border-slate-200 px-3 text-sm font-medium outline-none focus:ring-2 focus:ring-offset-0"
                                                            style={{ "--tw-ring-color": brandColor + "30" }}
                                                            placeholder="Facility name"
                                                        />
                                                        <button
                                                            onClick={() => handleRemoveFacility(disc, idx)}
                                                            className="text-slate-400 hover:text-red-500 transition-colors p-1"
                                                        >
                                                            <span className="material-symbols-outlined text-lg">delete</span>
                                                        </button>
                                                    </div>
                                                ))}
                                                {discFacilities.length === 0 && (
                                                    <p className="text-slate-400 text-xs">No facilities. Click "Add Facility" to create one.</p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Settings;
