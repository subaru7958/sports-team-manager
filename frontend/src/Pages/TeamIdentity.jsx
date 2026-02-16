import React, { useState, useRef } from "react";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";
import Button from "../components/Button";
import InputField from "../components/InputField";
import ProgressBar from "../components/ProgressBar";

const TeamIdentity = ({ onNext }) => {
    const { setTeam } = useAuth();
    const fileInputRef = useRef(null);
    const [teamName, setTeamName] = useState("");
    const [logo, setLogo] = useState(null);
    const [primaryColor, setPrimaryColor] = useState("#0a47c2");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogo(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveAndContinue = async () => {
        if (!teamName || teamName.trim().length <= 3) {
            setError("Team name must be more than 3 characters long");
            return;
        }

        if (!logo) {
            setError("Please upload a team logo to continue");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const response = await api.post("/team/identity", {
                name: teamName,
                logo,
                primaryColor
            });

            if (response.data.success) {
                setTeam(response.data.team);
                onNext();
            }
        } catch (err) {
            setError(err.response?.data?.message || "Failed to save team identity");
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
                    <div className="w-full max-w-[720px] bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="bg-slate-50/50 p-8 border-b border-slate-100">
                            <ProgressBar
                                step={1}
                                totalSteps={3}
                                title="Team Identity"
                                subtext="Define your organization's brand identity and visual presence."
                            />
                        </div>

                        <div className="p-8 md:p-12">
                            <div className="mb-10 text-center">
                                <h1 className="text-slate-900 tracking-tight text-3xl font-bold leading-tight mb-2 font-display">Let's build your brand</h1>
                                <p className="text-slate-500 text-base font-normal leading-normal">Your team name and logo will be visible to all staff and athletes.</p>
                            </div>

                            {error && (
                                <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-lg text-sm flex items-center gap-2">
                                    <span className="material-symbols-outlined text-base">error</span>
                                    {error}
                                </div>
                            )}

                            <div className="flex flex-col gap-8">
                                <InputField
                                    label="Official Team Name"
                                    placeholder="e.g. Manchester Athletic Club"
                                    value={teamName}
                                    onChange={(e) => setTeamName(e.target.value)}
                                    required
                                />

                                <div className="flex flex-col gap-2">
                                    <label className="text-slate-900 text-sm font-bold uppercase tracking-wider">Organization Logo</label>
                                    <div
                                        onClick={() => fileInputRef.current.click()}
                                        className="flex items-center gap-6 p-6 border-2 border-dashed border-slate-200 rounded-xl hover:border-primary/50 hover:bg-slate-50 transition-all cursor-pointer group"
                                    >
                                        <div className="size-20 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors overflow-hidden">
                                            {logo ? <img src={logo} alt="Preview" className="w-full h-full object-contain" /> : <span className="material-symbols-outlined text-4xl">add_photo_alternate</span>}
                                        </div>
                                        <div>
                                            <p className="text-slate-900 font-semibold group-hover:text-primary transition-colors">{logo ? "Change Logo" : "Upload Logo"}</p>
                                            <p className="text-slate-500 text-sm">PNG, JPG or SVG (Max 5MB)</p>
                                        </div>
                                        <input type="file" className="hidden" ref={fileInputRef} accept="image/*" onChange={handleFileChange} />
                                    </div>
                                </div>

                                <div className="flex flex-col gap-4">
                                    <label className="text-slate-900 text-sm font-bold uppercase tracking-wider">Primary Brand Color</label>
                                    <div className="flex flex-wrap items-center gap-4">
                                        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                                            <div className="size-10 rounded-lg shadow-inner cursor-pointer border border-white" style={{ backgroundColor: primaryColor }} onClick={() => document.getElementById('color-picker').click()}></div>
                                            <div className="flex flex-col">
                                                <input type="text" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="bg-transparent border-none outline-none font-mono text-sm uppercase w-20 text-slate-700" />
                                                <input id="color-picker" type="color" className="hidden" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} />
                                            </div>
                                        </div>
                                        <p className="text-slate-400 text-xs max-w-[200px]">This color will be used for buttons, links, and primary UI elements.</p>
                                    </div>

                                    <div className="flex gap-3">
                                        {["#0a47c2", "#e11d48", "#10b981", "#f59e0b", "#7c3aed", "#0f172a"].map((color) => (
                                            <button
                                                key={color}
                                                className={`size-8 rounded-full border-2 transition-transform hover:scale-110 ${primaryColor === color ? 'border-primary' : 'border-white shadow-sm'}`}
                                                style={{ backgroundColor: color }}
                                                onClick={() => setPrimaryColor(color)}
                                            ></button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="pt-10">
                                <Button
                                    onClick={handleSaveAndContinue}
                                    loading={loading}
                                    className="w-full"
                                    icon="arrow_forward"
                                >
                                    Continue to Discipline Setup
                                </Button>
                            </div>
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

export default TeamIdentity;
