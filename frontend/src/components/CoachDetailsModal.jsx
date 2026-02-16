import React from "react";
import { useAuth } from "../context/AuthContext";

const CoachDetailsModal = ({ isOpen, onClose, coach, onEditTrigger }) => {
    const { team } = useAuth();
    const primaryColor = team?.primaryColor || "#13ecc8";

    if (!isOpen || !coach) return null;

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

    const infoFields = [
        { label: "Role / Specialty", value: coach.specialty, icon: "verified_user", capitalize: true },
        { label: "Sport Discipline", value: coach.discipline, icon: getDisciplineIcon(coach.discipline), capitalize: true },
        { label: "Contact Phone", value: coach.phone || "Not provided", icon: "phone" },
        { label: "Join Date", value: new Date(coach.createdAt).toLocaleDateString(), icon: "calendar_today" },
        { label: "Profile Status", value: coach.status, icon: "shield_with_heart", capitalize: true, isBadge: true },
    ];

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[110] p-4 font-display">
            <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col w-full max-w-[500px] animate-in zoom-in-95 duration-300">
                {/* Profile Header */}
                <div className="relative h-32 bg-slate-50 overflow-hidden shrink-0">
                    <div className="absolute inset-0 opacity-10" style={{ backgroundColor: primaryColor }}></div>
                    <button onClick={onClose} className="absolute top-6 right-6 z-20 text-slate-400 hover:text-slate-900 transition-colors p-2 bg-white rounded-full shadow-sm">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Profile Image/Avatar */}
                <div className="px-10 -mt-12 mb-6 flex flex-col items-center relative z-10 shrink-0">
                    <div className="size-24 rounded-3xl flex items-center justify-center text-[#111817] font-black text-3xl shadow-xl ring-4 ring-white overflow-hidden bg-slate-100" style={{ backgroundColor: coach.image ? 'white' : primaryColor }}>
                        {coach.image ? (
                            <img src={coach.image} alt={coach.fullName} className="w-full h-full object-cover" />
                        ) : (
                            getInitials(coach.fullName)
                        )}
                    </div>
                    <h2 className="mt-4 text-2xl font-black text-[#111817] leading-tight text-center">{coach.fullName}</h2>
                    <span className="text-[#13ecc8] text-xs font-black uppercase tracking-[0.2em] mt-1" style={{ color: primaryColor }}>{coach.specialty}</span>
                </div>

                {/* Details List */}
                <div className="px-10 pb-10 space-y-4 overflow-y-auto max-h-[50vh]">
                    {infoFields.map((field, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-50 hover:border-slate-100 transition-colors group">
                            <div className="flex items-center gap-4">
                                <div className="size-10 rounded-xl flex items-center justify-center bg-slate-50 text-slate-400 group-hover:bg-primary/5 transition-colors" style={{ "--tw-bg-opacity": "1" }}>
                                    <span className="material-symbols-outlined text-xl" style={{ color: `${primaryColor}CC` }}>{field.icon}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">{field.label}</span>
                                    <span className={`text-[#111817] text-sm font-bold ${field.capitalize ? 'capitalize' : ''}`}>
                                        {field.value}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}

                    <div className="pt-6 flex gap-3">
                        <button
                            onClick={onEditTrigger}
                            className="flex-1 h-14 rounded-2xl bg-slate-100 text-slate-600 font-extrabold hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined font-bold">edit</span>
                            Edit Staff
                        </button>
                        <button className="flex-1 h-14 rounded-2xl text-[#111817] font-extrabold shadow-lg hover:shadow-primary/20 transition-all flex items-center justify-center gap-2" style={{ backgroundColor: primaryColor }}>
                            <span className="material-symbols-outlined font-bold">description</span>
                            Staff ID Card
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CoachDetailsModal;
