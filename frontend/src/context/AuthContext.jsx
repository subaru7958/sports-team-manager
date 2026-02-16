import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [team, setTeam] = useState(null);

    // Initial check for authentication and onboarding status
    useEffect(() => {
        const checkStatus = async () => {
            try {
                // Get team data which also verifies authentication indirectly
                const response = await api.get('/team');
                if (response.data.success) {
                    setTeam(response.data.team);
                    // Assuming if we get team data, user is "logged in" for this session
                    setUser({ email: 'mehrez1251@gmail.com', name: 'Manager' });
                }
            } catch (err) {
                console.log('No active session or team found');
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        checkStatus();
    }, []);

    const login = async (userData) => {
        setUser(userData);
        try {
            const response = await api.get('/team');
            if (response.data.success) {
                setTeam(response.data.team);
            }
        } catch (err) {
            console.log('No team found for new login');
            setTeam(null);
        }
    };

    const logout = async () => {
        try {
            await api.get('/auth/logout');
            setUser(null);
            setTeam(null);
        } catch (err) {
            console.error('Logout failed', err);
        }
    };

    const value = {
        user,
        team,
        loading,
        setTeam,
        login,
        logout
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
