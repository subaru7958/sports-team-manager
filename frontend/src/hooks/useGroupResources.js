import { useState, useEffect, useCallback } from 'react';
import api from '../api/api';

export const useGroupResources = (selectedSeason) => {
    const [availableCoaches, setAvailableCoaches] = useState([]);
    const [availablePlayers, setAvailablePlayers] = useState([]);
    const [availableCategories, setAvailableCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchResources = useCallback(async () => {
        if (!selectedSeason) return;

        setLoading(true);
        setError(null);
        try {
            // In a real optimized scenario, we might cache these responses or use React Query
            // For now, we fetch fresh data to ensure we have the latest roster
            const [coachesRes, playersRes] = await Promise.all([
                api.get('/coaches/my'),
                api.get('/players/my')
            ]);

            if (coachesRes.data.success) {
                const filteredCoaches = coachesRes.data.coaches.filter(
                    c => c.discipline?.toLowerCase() === selectedSeason.discipline?.toLowerCase()
                );
                setAvailableCoaches(filteredCoaches);
            }

            if (playersRes.data.success) {
                const filteredPlayers = playersRes.data.players.filter(
                    p => p.discipline?.toLowerCase() === selectedSeason.discipline?.toLowerCase()
                );
                setAvailablePlayers(filteredPlayers);

                const uniqueCategories = [...new Set(filteredPlayers.map(p => p.category))].filter(Boolean);
                setAvailableCategories(uniqueCategories);
            }
        } catch (err) {
            console.error("Failed to fetch resources", err);
            setError("Failed to load coaches and players. Please try again.");
        } finally {
            setLoading(false);
        }
    }, [selectedSeason]);

    useEffect(() => {
        fetchResources();
    }, [fetchResources]);

    return {
        availableCoaches,
        availablePlayers,
        availableCategories,
        loading,
        error,
        refetch: fetchResources
    };
};
