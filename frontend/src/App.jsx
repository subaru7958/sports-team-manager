import React, { useState, useEffect } from "react";
import TeamIdentity from "./Pages/TeamIdentity";
import DisciplineSetup from "./Pages/DisciplineSetup";
import FieldConfiguration from "./Pages/FieldConfiguration";
import LoginPage from "./Pages/LoginPage";
import DashboardManager from "./Pages/DashboardManager";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { SeasonProvider } from "./context/SeasonContext";
import ProtectedRoute from "./components/ProtectedRoute";

function AppContent() {
  const { user, team, login, logout, loading } = useAuth();
  const [step, setStep] = useState(0);

  // Combined logic for Login and Persistence (Smart Resume)
  // Hook must be called BEFORE early returns
  useEffect(() => {
    if (user) {
      // If we have a team and it was partially set up, resume from correct step
      if (team) {
        setStep(team.onboardingStep || 1);
      } else {
        setStep(1); // Default to Step 1 if logged in but no team data yet
      }
    } else {
      setStep(0); // Show Login if not authenticated
    }
  }, [user, team]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const handleLogin = (userData) => {
    login(userData);
  };

  const nextStep = () => {
    if (step === 3) {
      setStep(4);
    } else {
      setStep(step + 1);
    }
  };

  const prevStep = () => setStep(step - 1);

  const finishSetup = () => {
    setStep(4);
  };

  // Condition based on step
  if (step === 0) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <ProtectedRoute>
      {step === 1 && <TeamIdentity onNext={nextStep} />}
      {step === 2 && <DisciplineSetup onNext={nextStep} onBack={prevStep} />}
      {step === 3 && <FieldConfiguration onBack={prevStep} onFinish={finishSetup} />}
      {step === 4 && <DashboardManager onLogout={logout} />}
    </ProtectedRoute>
  );
}

function App() {
  return (
    <AuthProvider>
      <SeasonProvider>
        <AppContent />
      </SeasonProvider>
    </AuthProvider>
  );
}

export default App;
