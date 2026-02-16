import React from "react";
import { useAuth } from "../context/AuthContext";

const PlayerDetailsModal = ({ isOpen, onClose, player, onEditTrigger }) => {
    const { team } = useAuth();
    const primaryColor = team?.primaryColor || "#13ecc8";

    if (!isOpen || !player) return null;

    const getInitials = (name) => {
        if (!name) return "--";
        return name
            .split(' ')
            .filter(n => n.length > 0)
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    const getPlayerName = (player) => {
        if (player.fullName) return player.fullName;
        if (player.firstName && player.lastName) return `${player.firstName} ${player.lastName}`;
        return "Unknown Player";
    };

    const getDisciplineIcon = (discipline) => {
        const disc = discipline?.toLowerCase() || '';
        if (disc.includes('foot')) return 'sports_soccer';
        if (disc.includes('basket')) return 'sports_basketball';
        if (disc.includes('volley')) return 'sports_volleyball';
        if (disc.includes('tennis')) return 'sports_tennis';
        if (disc.includes('swim')) return 'pool';
        if (disc.includes('hand')) return 'sports_handball';
        return 'sports_score'; // Fallback flag icon
    };

    const infoFields = [
        { label: "Discipline", value: player.discipline, icon: getDisciplineIcon(player.discipline), capitalize: true },
        { label: "Category", value: player.category, icon: "category", capitalize: true },
        { label: "Phone", value: player.phone || "Not provided", icon: "phone" },
        { label: "Date of Birth", value: new Date(player.dateOfBirth).toLocaleDateString(), icon: "cake" },
        { label: "Height", value: player.height ? `${player.height} cm` : "Not set", icon: "height" },
        { label: "Weight", value: player.weight ? `${player.weight} kg` : "Not set", icon: "weight" },
        { label: "Status", value: player.status, icon: "check_circle", capitalize: true, isBadge: true },
    ];

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 font-display">
            <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col w-full max-w-[550px] animate-in zoom-in-95 duration-300">
                {/* Header Profile Area */}
                <div className="relative h-32 bg-slate-50 overflow-hidden shrink-0">
                    <div className="absolute inset-0 opacity-10" style={{ backgroundColor: primaryColor }}></div>
                    <button onClick={onClose} className="absolute top-6 right-6 z-20 text-slate-400 hover:text-slate-900 transition-colors p-2 bg-white rounded-full shadow-sm">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Profile Picture Overlay */}
                <div className="px-10 -mt-12 mb-6 flex flex-col items-center relative z-10 shrink-0">
                    <div className="size-24 rounded-3xl flex items-center justify-center text-white font-black text-3xl shadow-xl ring-4 ring-white overflow-hidden bg-slate-100" style={{ backgroundColor: player.image ? 'white' : primaryColor, color: '#111817' }}>
                        {player.image ? (
                            <img src={player.image} alt={getPlayerName(player)} className="w-full h-full object-cover" />
                        ) : (
                            getInitials(getPlayerName(player))
                        )}
                    </div>
                    <h2 className="mt-4 text-2xl font-black text-[#111817] leading-tight">{getPlayerName(player)}</h2>
                    <span className="text-[#618983] text-xs font-bold uppercase tracking-widest mt-1">Player Profile</span>
                </div>

                {/* Details Content */}
                <div className="px-10 pb-10 space-y-6 overflow-y-auto max-h-[50vh]">
                    <div className="grid grid-cols-1 gap-4">
                        {infoFields.map((field, idx) => (
                            <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-100 hover:border-slate-200 transition-colors group">
                                <div className="flex items-center gap-3">
                                    <div className="size-10 rounded-xl flex items-center justify-center bg-slate-50 text-slate-400 group-hover:bg-primary/5 transition-colors" style={{ "--tw-bg-opacity": "1" }}>
                                        <span className="material-symbols-outlined text-xl" style={{ color: `${primaryColor}CC` }}>{field.icon}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider leading-none mb-1">{field.label}</span>
                                        <span className={`text-slate-900 text-sm font-bold ${field.capitalize ? 'capitalize' : ''} ${field.isBadge ? 'flex items-center' : ''}`}>
                                            {field.value}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="pt-4 border-t border-slate-50 flex gap-3">
                        <button
                            onClick={onEditTrigger}
                            className="flex-1 h-14 rounded-2xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined">edit</span>
                            Edit Profile
                        </button>
                        <button className="flex-1 h-14 rounded-2xl text-[#111817] font-bold shadow-lg hover:shadow-primary/20 transition-all flex items-center justify-center gap-2" style={{ backgroundColor: primaryColor }}>
                            <span className="material-symbols-outlined">print</span>
                            Medical Sheet
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlayerDetailsModal;
