import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/api";
import Button from "./Button";
import InputField from "./InputField";

const CreateSeasonModal = ({ isOpen, onClose, onSeasonCreated }) => {
    const { team } = useAuth();
    const primaryColor = team?.primaryColor || "#0bdada";

    // Get today's date in YYYY-MM-DD format for the min attribute
    const today = new Date().toISOString().split('T')[0];

    const [name, setName] = useState("");
    const [discipline, setDiscipline] = useState("");
    const [description, setDescription] = useState("");
    const [startDate, setStartDate] = useState(today);
    const [endDate, setEndDate] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Set default discipline if team has only one
    useEffect(() => {
        if (team?.disciplines?.length === 1) {
            setDiscipline(team.disciplines[0].toLowerCase());
        }
    }, [team]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("Season creation started with data:", { name, discipline, description, startDate, endDate });

        // Basic validation
        if (!name || !discipline || !startDate || !endDate) {
            console.log("Validation failed: Missing fields");
            setError("Please fill in all required fields");
            return;
        }

        // Date validation: Start date cannot be in the past
        if (new Date(startDate) < new Date(today)) {
            console.log("Validation failed: Start date in past");
            setError("Start date cannot be in the past");
            return;
        }

        // Date validation: End date must be after start date
        if (new Date(endDate) <= new Date(startDate)) {
            console.log("Validation failed: End date <= Start date");
            setError("End date must be after the start date");
            return;
        }

        setLoading(true);
        setError("");

        try {
            console.log("Sending API request to /seasons/new...");
            const response = await api.post("/seasons/new", {
                name,
                discipline,
                description,
                startDate,
                endDate
            });

            if (response.data.success) {
                console.log("Season created successfully:", response.data.season);
                onSeasonCreated(response.data.season);
                onClose();
                // Reset form
                setName("");
                setDescription("");
                setStartDate(today);
                setEndDate("");
            }
        } catch (err) {
            console.error("API Error during season creation:", err.response?.data || err.message);
            setError(err.response?.data?.message || "Failed to create season");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col w-full max-w-[560px] animate-in zoom-in-95 duration-300">
                {/* Modal Header */}
                <div className="px-8 pt-8 pb-4 flex justify-between items-start">
                    <div className="flex flex-col gap-1">
                        <h2 className="text-slate-900 text-2xl font-bold leading-tight">Create New Season</h2>
                        <p className="text-slate-500 text-sm font-medium">Fill in the details to start a new season for your discipline.</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-900 transition-colors p-1"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Modal Content / Form */}
                <form onSubmit={handleSubmit} className="px-8 py-4 space-y-5 overflow-y-auto max-h-[70vh]">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium border border-red-100 flex items-center gap-2 animate-shake">
                            <span className="material-symbols-outlined text-base">error</span>
                            {error}
                        </div>
                    )}

                    {/* Discipline Selection */}
                    <div className="flex flex-col gap-2">
                        <label className="text-slate-900 text-sm font-bold">Selectionner Discipline</label>
                        {team?.disciplines?.length > 1 ? (
                            <div className="relative">
                                <select
                                    value={discipline}
                                    onChange={(e) => setDiscipline(e.target.value)}
                                    className="w-full h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium focus:ring-2 focus:ring-offset-0 focus:border-transparent outline-none appearance-none cursor-pointer"
                                    style={{ "--tw-ring-color": `${primaryColor}40` }}
                                >
                                    <option value="" disabled>Choisir une discipline</option>
                                    {team.disciplines.map((d, i) => (
                                        <option key={i} value={d.toLowerCase()}>{d}</option>
                                    ))}
                                </select>
                                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">expand_more</span>
                            </div>
                        ) : (
                            <div className="h-12 flex items-center px-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-bold uppercase tracking-wide">
                                {team?.disciplines?.[0] || "No disciplines configured"}
                            </div>
                        )}
                    </div>

                    {/* Season Name */}
                    <div className="flex flex-col gap-2">
                        <label className="text-slate-900 text-sm font-bold">Nom de la Saison</label>
                        <input
                            className="w-full h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium focus:ring-2 focus:ring-offset-0 focus:border-transparent outline-none"
                            style={{ "--tw-ring-color": `${primaryColor}40` }}
                            placeholder="e.g. Summer League 2024"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    {/* Description */}
                    <div className="flex flex-col gap-2">
                        <label className="text-slate-900 text-sm font-bold">Description (Optional)</label>
                        <textarea
                            className="w-full p-4 rounded-xl border border-slate-200 bg-white text-sm font-medium focus:ring-2 focus:ring-offset-0 focus:border-transparent outline-none min-h-[100px] resize-none"
                            style={{ "--tw-ring-color": `${primaryColor}40` }}
                            placeholder="Briefly describe the objectives or rules of this season..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    {/* Dates Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-slate-900 text-sm font-bold">Date de Début</label>
                            <input
                                type="date"
                                min={today}
                                className="w-full h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium focus:ring-2 focus:ring-offset-0 focus:border-transparent outline-none"
                                style={{ "--tw-ring-color": `${primaryColor}40` }}
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-slate-900 text-sm font-bold">Date de Fin</label>
                            <input
                                type="date"
                                min={startDate || today}
                                className="w-full h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium focus:ring-2 focus:ring-offset-0 focus:border-transparent outline-none"
                                style={{ "--tw-ring-color": `${primaryColor}40` }}
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>
                    </div>

                    <p className="text-slate-400 text-xs italic font-medium pt-2 flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">info</span>
                        You will assign players and coaches after creating the season.
                    </p>

                    {/* Modal Footer / Buttons */}
                    <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 mt-4">
                        <Button
                            variant="ghost"
                            type="button"
                            onClick={onClose}
                            className="!px-6"
                        >
                            Cancel
                        </Button>
                        <Button
                            loading={loading}
                            type="submit"
                            className="!min-w-[140px] shadow-lg shadow-primary/20"
                            style={{ backgroundColor: primaryColor }}
                        >
                            Create Season
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateSeasonModal;
