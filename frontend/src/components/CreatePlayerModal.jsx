import React, { useState, useEffect } from "react";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";
import Button from "./Button";

const CreatePlayerModal = ({ isOpen, onClose, onPlayerCreated, defaultCategory }) => {
    const { team } = useAuth();
    const primaryColor = team?.primaryColor || "#13ecc8";

    const [fullName, setFullName] = useState("");
    const [dateOfBirth, setDateOfBirth] = useState("");
    const [phone, setPhone] = useState("");
    const [weight, setWeight] = useState("");
    const [height, setHeight] = useState("");
    const [discipline, setDiscipline] = useState("");
    const [category, setCategory] = useState(defaultCategory || "");
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const fileInputRef = React.useRef(null);

    // Update category when defaultCategory changes
    useEffect(() => {
        if (defaultCategory) {
            setCategory(defaultCategory);
        }
    }, [defaultCategory]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const categoryMap = {
        football: [
            { label: "Academy", value: "academy" },
            { label: "École (U6–U9)", value: "ecole" },
            { label: "Minime (U14–U15)", value: "minime" },
            { label: "Cadet (U16–U17)", value: "cadet" },
            { label: "Junior (U18–U19)", value: "junior" },
            { label: "Espoir (U20–U23)", value: "espoir" },
            { label: "Senior (Adult / Pro)", value: "senior" }
        ],
        handball: [
            { label: "Academy", value: "academy" },
            { label: "École (U9)", value: "ecole" },
            { label: "Minime (U15)", value: "minime" },
            { label: "Cadet (U18)", value: "cadet" },
            { label: "Junior (U20)", value: "junior" },
            { label: "Senior (Adult)", value: "senior" }
        ],
        volleyball: [
            { label: "Academy", value: "academy" },
            { label: "École / Baby (U7–U9)", value: "ecole" },
            { label: "Minime (U15)", value: "minime" },
            { label: "Cadet (U17–U18)", value: "cadet" },
            { label: "Junior (U20–U21)", value: "junior" },
            { label: "Senior (Adult)", value: "senior" }
        ],
        basketball: [
            { label: "Academy", value: "academy" },
            { label: "École / Mini (U7–U9)", value: "ecole" },
            { label: "Minime (U14–U15)", value: "minime" },
            { label: "Cadet (U16–U17)", value: "cadet" },
            { label: "Junior (U18–U20)", value: "junior" },
            { label: "Senior (Adult)", value: "senior" }
        ],
        swimming: [
            { label: "Academy", value: "academy" },
            { label: "Avenir / École (U10)", value: "ecole" },
            { label: "Benjamins / Minime (U12–U15)", value: "benjamins" },
            { label: "Junior (U16–U20)", value: "junior" },
            { label: "Senior (Adult)", value: "senior" }
        ]
    };

    useEffect(() => {
        if (team?.disciplines?.length === 1) {
            setDiscipline(team.disciplines[0].toLowerCase());
        }
    }, [team]);

    useEffect(() => {
        setCategory(""); // Reset category when discipline changes
    }, [discipline]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!fullName || !dateOfBirth || !discipline || !category) {
            setError("Please fill in all required fields");
            return;
        }

        setLoading(true);
        console.log('--- FRONTEND: SUBMITTING PLAYER ---');
        const payload = {
            fullName,
            dateOfBirth,
            phone,
            weight: weight || undefined,
            height: height || undefined,
            category,
            discipline,
            image
        };
        console.log('Payload:', { ...payload, image: image ? 'base64_data' : 'none' });

        try {
            const response = await api.post("/players/new", payload);
            console.log('Response:', response.data);

            if (response.data.success) {
                console.log('Player registration successful!');
                onPlayerCreated(response.data.player);
                onClose();
                // Reset form
                setFullName("");
                setDateOfBirth("");
                setPhone("");
                setWeight("");
                setHeight("");
                setCategory("");
                setImage(null);
            }
        } catch (err) {
            setError(err.response?.data?.message || "Failed to create player");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 font-display">
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col w-full max-w-[500px] animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="px-8 pt-8 pb-4 flex justify-between items-start">
                    <div className="flex flex-col gap-1">
                        <h2 className="text-slate-900 text-2xl font-black">Register New Player</h2>
                        <p className="text-slate-500 text-sm font-medium">Add an athlete to your organization's roster.</p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-900 transition-colors p-1">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="px-8 py-4 space-y-5 overflow-y-auto max-h-[75vh]">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs font-bold border border-red-100 flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">error</span>
                            {error}
                        </div>
                    )}

                    {/* Image Upload Area */}
                    <div className="flex flex-col items-center gap-4 pb-2">
                        <div
                            onClick={() => fileInputRef.current.click()}
                            className="size-24 rounded-full border-2 border-dashed border-slate-200 flex items-center justify-center cursor-pointer hover:border-primary transition-all overflow-hidden bg-slate-50 relative group"
                        >
                            {image ? (
                                <img src={image} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <span className="material-symbols-outlined text-3xl text-slate-300 group-hover:text-primary transition-colors">add_a_photo</span>
                            )}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <span className="material-symbols-outlined text-white text-xl">edit</span>
                            </div>
                        </div>
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em]">Athlete Portrait (Optional)</p>
                    </div>

                    {/* Discipline Selection */}
                    <div className="flex flex-col gap-2">
                        <label className="text-slate-900 text-sm font-bold">Discipline</label>
                        {team?.disciplines?.length > 1 ? (
                            <div className="relative">
                                <select
                                    value={discipline}
                                    onChange={(e) => setDiscipline(e.target.value)}
                                    className="w-full h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold focus:ring-2 focus:ring-offset-0 focus:border-transparent outline-none appearance-none cursor-pointer"
                                    style={{ "--tw-ring-color": `${primaryColor}40` }}
                                >
                                    <option value="" disabled>Choose Discipline</option>
                                    {team.disciplines.map((d, i) => (
                                        <option key={i} value={d.toLowerCase()}>{d}</option>
                                    ))}
                                </select>
                                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">expand_more</span>
                            </div>
                        ) : (
                            <div className="h-12 flex items-center px-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-bold uppercase">
                                {team?.disciplines?.[0] || "No discipline"}
                            </div>
                        )}
                    </div>

                    {/* Full Name & Phone */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-slate-900 text-sm font-bold">Full Name</label>
                            <input
                                className="w-full h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium focus:ring-2 outline-none"
                                style={{ "--tw-ring-color": `${primaryColor}40` }}
                                placeholder="e.g. Jean Dupont"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-slate-900 text-sm font-bold">Phone Number</label>
                            <input
                                className="w-full h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium focus:ring-2 outline-none"
                                style={{ "--tw-ring-color": `${primaryColor}40` }}
                                placeholder="+216 12 345 678"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Date of Birth & Category Container */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-slate-900 text-sm font-bold">Date of Birth</label>
                            <input
                                type="date"
                                className="w-full h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium focus:ring-2 outline-none"
                                style={{ "--tw-ring-color": `${primaryColor}40` }}
                                value={dateOfBirth}
                                onChange={(e) => setDateOfBirth(e.target.value)}
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-slate-900 text-sm font-bold">Category</label>
                            <div className="relative">
                                <select
                                    disabled={!discipline}
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="w-full h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold focus:ring-2 outline-none appearance-none cursor-pointer disabled:opacity-50 disabled:bg-slate-50"
                                    style={{ "--tw-ring-color": `${primaryColor}40` }}
                                >
                                    <option value="" disabled>Select Category</option>
                                    {discipline && categoryMap[discipline.toLowerCase()]?.map((cat, i) => (
                                        <option key={i} value={cat.value}>{cat.label}</option>
                                    ))}
                                </select>
                                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">expand_more</span>
                            </div>
                        </div>
                    </div>

                    {/* Optional Height & Weight */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-slate-900 text-sm font-bold">Weight (kg) <span className="text-slate-400 font-normal">Optional</span></label>
                            <input
                                type="number"
                                className="w-full h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium focus:ring-2 outline-none"
                                style={{ "--tw-ring-color": `${primaryColor}40` }}
                                placeholder="70"
                                value={weight}
                                onChange={(e) => setWeight(e.target.value)}
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-slate-900 text-sm font-bold">Height (cm) <span className="text-slate-400 font-normal">Optional</span></label>
                            <input
                                type="number"
                                className="w-full h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium focus:ring-2 outline-none"
                                style={{ "--tw-ring-color": `${primaryColor}40` }}
                                placeholder="180"
                                value={height}
                                onChange={(e) => setHeight(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Footer / Action */}
                    <div className="pt-6 border-t border-slate-100 flex justify-end gap-3 mt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 h-12 rounded-xl text-slate-500 font-bold hover:bg-slate-50 transition-all"
                        >
                            Cancel
                        </button>
                        <Button
                            loading={loading}
                            type="submit"
                            className="!h-12 !px-8 shadow-lg shadow-primary/20"
                            style={{ backgroundColor: primaryColor }}
                        >
                            Register Player
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreatePlayerModal;
