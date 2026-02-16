import React, { useState, useEffect } from "react";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";
import Button from "./Button";

const EditPlayerModal = ({ isOpen, onClose, player, onPlayerUpdated }) => {
    const { team } = useAuth();
    const primaryColor = team?.primaryColor || "#13ecc8";

    const [fullName, setFullName] = useState("");
    const [dateOfBirth, setDateOfBirth] = useState("");
    const [phone, setPhone] = useState("");
    const [weight, setWeight] = useState("");
    const [height, setHeight] = useState("");
    const [discipline, setDiscipline] = useState("");
    const [category, setCategory] = useState("");
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const fileInputRef = React.useRef(null);

    const categoryMap = {
        football: [
            { label: "École (U6–U9)", value: "ecole" },
            { label: "Minime (U14–U15)", value: "minime" },
            { label: "Cadet (U16–U17)", value: "cadet" },
            { label: "Junior (U18–U19)", value: "junior" },
            { label: "Espoir (U20–U23)", value: "espoir" },
            { label: "Senior (Adult / Pro)", value: "senior" }
        ],
        handball: [
            { label: "École (U9)", value: "ecole" },
            { label: "Minime (U15)", value: "minime" },
            { label: "Cadet (U18)", value: "cadet" },
            { label: "Junior (U20)", value: "junior" },
            { label: "Senior (Adult)", value: "senior" }
        ],
        volleyball: [
            { label: "École / Baby (U7–U9)", value: "ecole" },
            { label: "Minime (U15)", value: "minime" },
            { label: "Cadet (U17–U18)", value: "cadet" },
            { label: "Junior (U20–U21)", value: "junior" },
            { label: "Senior (Adult)", value: "senior" }
        ],
        basketball: [
            { label: "École / Mini (U7–U9)", value: "ecole" },
            { label: "Minime (U14–U15)", value: "minime" },
            { label: "Cadet (U16–U17)", value: "cadet" },
            { label: "Junior (U18–U20)", value: "junior" },
            { label: "Senior (Adult)", value: "senior" }
        ],
        swimming: [
            { label: "Avenir / École (U10)", value: "ecole" },
            { label: "Benjamins / Minime (U12–U15)", value: "benjamins" },
            { label: "Junior (U16–U20)", value: "junior" },
            { label: "Senior (Adult)", value: "senior" }
        ]
    };

    useEffect(() => {
        if (player) {
            setFullName(player.fullName || "");
            const date = player.dateOfBirth ? new Date(player.dateOfBirth).toISOString().split('T')[0] : "";
            setDateOfBirth(date);
            setPhone(player.phone || "");
            setWeight(player.weight || "");
            setHeight(player.height || "");
            setDiscipline(player.discipline || "");
            setCategory(player.category || "");
            setImage(player.image || null);
        }
    }, [player, isOpen]);

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

    if (!isOpen || !player) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!fullName || !dateOfBirth || !discipline || !category) {
            setError("Please fill in all required fields");
            return;
        }

        setLoading(true);
        const payload = {
            fullName,
            dateOfBirth,
            phone,
            weight: weight || null,
            height: height || null,
            category,
            discipline,
            image
        };

        try {
            const response = await api.put(`/players/${player._id}`, payload);
            if (response.data.success) {
                onPlayerUpdated(response.data.player);
                onClose();
            }
        } catch (err) {
            setError(err.response?.data?.message || "Failed to update player");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[110] p-4 font-display">
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col w-full max-w-[500px] animate-in zoom-in-95 duration-300">
                <div className="px-8 pt-8 pb-4 flex justify-between items-start">
                    <div className="flex flex-col gap-1">
                        <h2 className="text-slate-900 text-2xl font-black">Edit Athlete Profile</h2>
                        <p className="text-slate-500 text-sm font-medium">Update profile details for {fullName}.</p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-900 transition-colors p-1">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="px-8 py-4 space-y-5 overflow-y-auto max-h-[75vh]">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs font-bold border border-red-100 flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">error</span>
                            {error}
                        </div>
                    )}

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
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-slate-900 text-sm font-bold">Full Name</label>
                            <input className="w-full h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold outline-none focus:border-primary transition-colors" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-slate-900 text-sm font-bold">Discipline</label>
                            <select className="w-full h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold outline-none" value={discipline} onChange={(e) => setDiscipline(e.target.value)} required>
                                <option value="" disabled>Select discipline</option>
                                {team?.disciplines?.map((d) => (
                                    <option key={d} value={d.toLowerCase()}>{d}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-slate-900 text-sm font-bold">Date of Birth</label>
                            <input type="date" className="w-full h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold outline-none" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} required />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-slate-900 text-sm font-bold">Category</label>
                            <select className="w-full h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold outline-none" value={category} onChange={(e) => setCategory(e.target.value)} required>
                                <option value="" disabled>Select category</option>
                                {discipline && categoryMap[discipline?.toLowerCase()]?.map((cat) => (
                                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-slate-900 text-sm font-bold">Contact Phone</label>
                        <input className="w-full h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold outline-none" placeholder="+216 -- --- ---" value={phone} onChange={(e) => setPhone(e.target.value)} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-slate-900 text-sm font-bold">Height (cm)</label>
                            <input type="number" className="w-full h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold outline-none" placeholder="180" value={height} onChange={(e) => setHeight(e.target.value)} />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-slate-900 text-sm font-bold">Weight (kg)</label>
                            <input type="number" className="w-full h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold outline-none" placeholder="75" value={weight} onChange={(e) => setWeight(e.target.value)} />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 mt-4">
                        <Button variant="ghost" type="button" onClick={onClose} className="!px-6">Cancel</Button>
                        <Button loading={loading} type="submit" className="!min-w-[140px] shadow-lg" style={{ backgroundColor: primaryColor }}>Update Profile</Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditPlayerModal;
