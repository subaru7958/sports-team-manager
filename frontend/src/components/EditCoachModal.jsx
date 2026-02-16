import React, { useState, useEffect } from "react";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";
import Button from "./Button";

const EditCoachModal = ({ isOpen, onClose, coach, onCoachUpdated }) => {
    const { team } = useAuth();
    const primaryColor = team?.primaryColor || "#13ecc8";

    const [fullName, setFullName] = useState("");
    const [phone, setPhone] = useState("");
    const [specialty, setSpecialty] = useState("");
    const [discipline, setDiscipline] = useState("");
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const fileInputRef = React.useRef(null);

    const specialties = [
        "Head Coach",
        "Assistant Coach",
        "Technical Director",
        "Physical Trainer",
        "Goalkeeper Coach",
        "Medical Staff",
        "Tactical Analyst"
    ];

    useEffect(() => {
        if (coach) {
            setFullName(coach.fullName || "");
            setPhone(coach.phone || "");
            setSpecialty(coach.specialty || "");
            setDiscipline(coach.discipline || "");
            setImage(coach.image || null);
        }
    }, [coach, isOpen]);

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

    if (!isOpen || !coach) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!fullName || !discipline || !specialty) {
            setError("Please fill in all required fields");
            return;
        }

        setLoading(true);
        const payload = {
            fullName,
            phone,
            specialty,
            discipline,
            image
        };

        try {
            const response = await api.put(`/coaches/${coach._id}`, payload);
            if (response.data.success) {
                onCoachUpdated(response.data.coach);
                onClose();
            }
        } catch (err) {
            setError(err.response?.data?.message || "Failed to update coach");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[110] p-4 font-display">
            <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col w-full max-w-[500px] animate-in zoom-in-95 duration-300">
                <div className="px-8 pt-8 pb-4 flex justify-between items-start">
                    <div className="flex flex-col gap-1">
                        <h2 className="text-[#111817] text-2xl font-black">Edit Staff Profile</h2>
                        <p className="text-slate-500 text-sm font-medium">Updating details for {fullName}.</p>
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

                    <div className="flex flex-col gap-2">
                        <label className="text-[#111817] text-sm font-bold">Full Name</label>
                        <input
                            className="w-full h-12 rounded-2xl border border-slate-100 bg-slate-50 px-4 text-sm font-bold outline-none focus:border-primary transition-colors"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-[#111817] text-sm font-bold">Discipline</label>
                            <select
                                className="w-full h-12 rounded-2xl border border-slate-100 bg-slate-50 px-4 text-sm font-bold outline-none cursor-pointer appearance-none"
                                value={discipline}
                                onChange={(e) => setDiscipline(e.target.value)}
                                required
                            >
                                <option value="" disabled>Select sport</option>
                                {team?.disciplines?.map((disc) => (
                                    <option key={disc} value={disc.toLowerCase()}>{disc}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-[#111817] text-sm font-bold">Specialty</label>
                            <select
                                className="w-full h-12 rounded-2xl border border-slate-100 bg-slate-50 px-4 text-sm font-bold outline-none cursor-pointer appearance-none"
                                value={specialty}
                                onChange={(e) => setSpecialty(e.target.value)}
                                required
                            >
                                <option value="" disabled>Select role</option>
                                {specialties.map((spec) => (
                                    <option key={spec} value={spec}>{spec}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-[#111817] text-sm font-bold">Phone Number</label>
                        <input
                            className="w-full h-12 rounded-2xl border border-slate-100 bg-slate-50 px-4 text-sm font-bold outline-none"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t border-slate-50 mt-4">
                        <Button variant="ghost" type="button" onClick={onClose} className="!px-6">Cancel</Button>
                        <Button loading={loading} type="submit" className="!min-w-[140px] shadow-lg" style={{ backgroundColor: primaryColor }}>Update Staff</Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditCoachModal;
