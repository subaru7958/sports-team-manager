import React from 'react';
import { useAuth } from '../context/AuthContext';
import LoginPage from '../Pages/LoginPage';

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background-light">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!user) {
        // In a router setup, we'd use <Navigate to="/login" />
        // For current state-based setup, we just show Login
        return <LoginPage />;
    }

    return children;
};

export default ProtectedRoute;
