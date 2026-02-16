import React, { createContext, useContext, useState, useEffect } from 'react';

const SeasonContext = createContext();

export const SeasonProvider = ({ children }) => {
    const [selectedSeason, setSelectedSeason] = useState(() => {
        const saved = localStorage.getItem('selectedSeason');
        return saved ? JSON.parse(saved) : null;
    });

    useEffect(() => {
        if (selectedSeason) {
            localStorage.setItem('selectedSeason', JSON.stringify(selectedSeason));
        } else {
            localStorage.removeItem('selectedSeason');
        }
    }, [selectedSeason]);

    const selectSeason = (season) => {
        setSelectedSeason(season);
    };

    const clearSeason = () => {
        setSelectedSeason(null);
    };

    return (
        <SeasonContext.Provider value={{ selectedSeason, selectSeason, clearSeason }}>
            {children}
        </SeasonContext.Provider>
    );
};

export const useSeason = () => {
    const context = useContext(SeasonContext);
    if (!context) {
        throw new Error('useSeason must be used within a SeasonProvider');
    }
    return context;
};
