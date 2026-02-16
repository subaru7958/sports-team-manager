import React, { useState, useEffect } from "react";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";
import Button from "../components/Button";
import ProgressBar from "../components/ProgressBar";
import InputField from "../components/InputField";

const FieldConfiguration = ({ onBack, onFinish }) => {
    const { setTeam } = useAuth();
    const [disciplines, setDisciplines] = useState([]);
    const [facilities, setFacilities] = useState({});
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [error, setError] = useState("");

    const icons = {
        "Football": "sports_soccer",
        "Basketball": "sports_basketball",
        "Tennis": "sports_tennis",
        "Swimming": "pool",
        "Handball": "sports_handball",
        "Volleyball": "sports_volleyball"
    };

    const getFieldLabel = (sport) => {
        if (sport === "Tennis") return "Court";
        if (sport === "Swimming") return "Pool";
        if (sport === "Basketball" || sport === "Handball" || sport === "Volleyball") return "Court";
        return "Field";
    };

    useEffect(() => {
        const fetchTeam = async () => {
            try {
                const response = await api.get("/team");
                if (response.data.success && response.data.team) {
                    const selected = response.data.team.disciplines || [];
                    const savedFacilities = response.data.team.facilities || [];
                    setDisciplines(selected);

                    const initialFacilities = {};
                    selected.forEach(d => {
                        const sportKey = d.toLowerCase();
                        const sportFacilities = savedFacilities
                            .filter(f => f.discipline === sportKey)
                            .map(f => f.name);

                        initialFacilities[sportKey] = sportFacilities.length > 0
                            ? sportFacilities
                            : ["Main " + getFieldLabel(d)];
                    });
                    setFacilities(initialFacilities);
                    setTeam(response.data.team);
                }
            } catch (err) {
                console.error("Failed to fetch team data", err);
            } finally {
                setFetching(false);
            }
        };
        fetchTeam();
    }, [setTeam]);

    const addField = (discipline) => {
        const key = discipline.toLowerCase();
        setFacilities({
            ...facilities,
            [key]: [...(facilities[key] || []), ""]
        });
    };

    const removeField = (discipline, index) => {
        const key = discipline.toLowerCase();
        if (facilities[key].length <= 1) {
            setError(`Each sport must have at least one ${getFieldLabel(discipline).toLowerCase()}`);
            return;
        }
        const updated = [...facilities[key]];
        updated.splice(index, 1);
        setFacilities({
            ...facilities,
            [key]: updated
        });
    };

    const handleNameChange = (discipline, index, value) => {
        const key = discipline.toLowerCase();
        const updated = [...facilities[key]];
        updated[index] = value;
        setFacilities({
            ...facilities,
            [key]: updated
        });
    };

    const handleFinish = async () => {
        setLoading(true);
        setError("");

        try {
            const flattened = [];
            Object.keys(facilities).forEach(disciplineKey => {
                facilities[disciplineKey].forEach(name => {
                    if (name.trim()) {
                        flattened.push({ name, discipline: disciplineKey });
                    }
                });
            });

            const response = await api.post("/team/facilities", {
                facilities: flattened
            });

            if (response.data.success) {
                setTeam(response.data.team);
                onFinish();
            }
        } catch (err) {
            setError(err.response?.data?.message || "Failed to save field configuration");
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background-light">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="relative flex h-auto min-h-screen w-full flex-col group/design-root overflow-x-hidden bg-background-light">
            <div className="layout-container flex h-full grow flex-col">
                <header className="flex items-center justify-between border-b border-solid border-slate-200 bg-white px-10 py-3">
                    <div className="flex items-center gap-4 text-slate-900 font-display">
                        <div className="text-primary size-6">
                            <svg fill="currentColor" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                <path clipRule="evenodd" d="M24 4H6V17.3333V30.6667H24V44H42V30.6667V17.3333H24V4Z" fillRule="evenodd"></path>
                            </svg>
                        </div>
                        <h2 className="text-slate-900 text-lg font-bold leading-tight tracking-[-0.015em]">AthleticOS</h2>
                    </div>
                </header>

                <main className="flex-1 flex justify-center py-10 px-4">
                    <div className="layout-content-container flex flex-col max-w-[800px] w-full bg-white shadow-sm rounded-xl overflow-hidden border border-slate-200">
                        <div className="p-8 border-b border-slate-100">
                            <ProgressBar
                                step={3}
                                totalSteps={3}
                                title="Field Configuration"
                                subtext="Finalizing your organization setup"
                            />
                        </div>

                        <div className="px-8 pt-8 pb-4">
                            <h1 className="text-slate-900 tracking-tight text-[28px] font-bold leading-tight">Configure Your Facilities</h1>
                            <p className="text-slate-500 text-base font-normal leading-normal mt-2">Define naming for your fields and courts for the scheduling calendar.</p>
                        </div>

                        {error && (
                            <div className="mx-8 mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-lg text-sm flex items-center gap-2">
                                <span className="material-symbols-outlined text-base">error</span>
                                {error}
                            </div>
                        )}

                        {disciplines.map((d, i) => (
                            <React.Fragment key={d}>
                                <div className="px-8 py-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                            <span className="material-symbols-outlined text-xl">{icons[d] || 'sports'}</span>
                                        </div>
                                        <h2 className="text-slate-900 text-xl font-bold leading-tight">{d}</h2>
                                    </div>
                                    <div className="space-y-4">
                                        {(facilities[d.toLowerCase()] || []).map((name, index) => (
                                            <div key={`${d}-${index}`} className="flex items-center gap-3">
                                                <div className="flex-1">
                                                    <InputField
                                                        label={index === 0 ? `${getFieldLabel(d)} Name` : ""}
                                                        placeholder={`e.g. ${d} A`}
                                                        value={name}
                                                        onChange={(e) => handleNameChange(d, index, e.target.value)}
                                                        className="!gap-1"
                                                    />
                                                </div>
                                                <div className={index === 0 ? "pt-5" : ""}>
                                                    <button onClick={() => removeField(d, index)} className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                                        <span className="material-symbols-outlined">delete</span>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        <button onClick={() => addField(d)} className="flex items-center gap-2 text-primary font-semibold text-sm hover:underline py-2">
                                            <span className="material-symbols-outlined text-lg">add_circle</span>
                                            Add {getFieldLabel(d)}
                                        </button>
                                    </div>
                                </div>
                                {i < disciplines.length - 1 && <div className="mx-8 border-t border-slate-100"></div>}
                            </React.Fragment>
                        ))}

                        <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex justify-between items-center mt-auto">
                            <Button onClick={onBack} variant="ghost" icon="arrow_back">Back</Button>
                            <Button onClick={handleFinish} loading={loading} icon="check_circle">Finish Setup</Button>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default FieldConfiguration;
