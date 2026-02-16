import React, { useState } from "react";
import api from "../api/api";
import Button from "../components/Button";
import InputField from "../components/InputField";

const LoginPage = ({ onLogin }) => {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await api.post("/auth/login", {
                email,
                password
            });

            if (response.data.success) {
                onLogin(response.data.user);
            }
        } catch (err) {
            setError(err.response?.data?.message || "Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative flex h-screen w-full flex-col overflow-x-hidden bg-background-light">
            <header className="flex items-center justify-between border-b border-solid border-slate-200 bg-white px-10 py-3">
                <div className="flex items-center gap-4 text-slate-900">
                    <div className="size-6 text-primary">
                        <svg fill="currentColor" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                            <path clipRule="evenodd" d="M24 4H6V17.3333V30.6667H24V44H42V30.6667V17.3333H24V4Z" fillRule="evenodd"></path>
                        </svg>
                    </div>
                    <h2 className="text-lg font-bold leading-tight tracking-[-0.015em] font-display">AthleticOS</h2>
                </div>
                <Button variant="secondary" className="!h-10 !py-0 !px-4 text-sm">Support</Button>
            </header>

            <main className="flex flex-1 items-center justify-center p-4">
                <div className="w-full max-w-[440px] flex flex-col gap-6">
                    <div className="bg-white shadow-[0_4px_20px_rgba(0,0,0,0.05)] rounded-xl border border-slate-200 overflow-hidden">
                        <div className="w-full h-32 bg-primary/5 flex items-center justify-center border-b border-slate-100">
                            <div className="flex flex-col items-center gap-2">
                                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white">
                                    <span className="material-symbols-outlined" style={{ fontSize: "28px" }}>verified_user</span>
                                </div>
                                <span className="text-xs font-semibold uppercase tracking-widest text-primary/70">Authorized Access Only</span>
                            </div>
                        </div>

                        <div className="p-8">
                            <div className="mb-8 text-center">
                                <h1 className="text-slate-900 text-2xl font-bold leading-tight">Organization Login</h1>
                                <p className="text-slate-500 text-sm mt-2">Enter credentials to access the dashboard</p>
                            </div>

                            {error && (
                                <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-lg text-sm flex items-center gap-2">
                                    <span className="material-symbols-outlined text-base">error</span>
                                    {error}
                                </div>
                            )}

                            <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
                                <InputField
                                    label="Email Address"
                                    type="email"
                                    placeholder="name@organization.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />

                                <div className="relative">
                                    <InputField
                                        label="Password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-4 top-[48px] text-slate-400 hover:text-primary transition-colors"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        <span className="material-symbols-outlined text-xl">
                                            {showPassword ? "visibility_off" : "visibility"}
                                        </span>
                                    </button>
                                </div>

                                <Button
                                    type="submit"
                                    loading={loading}
                                    className="w-full mt-2 h-12"
                                    icon="login"
                                >
                                    Sign In to Dashboard
                                </Button>
                            </form>
                        </div>
                    </div>

                    <div className="flex flex-col items-center gap-4 px-4 text-center">
                        <div className="flex items-center gap-2 text-slate-500 text-xs">
                            <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>lock</span>
                            <span>Secure AES-256 Encrypted Connection</span>
                        </div>
                        <div className="w-full border-t border-slate-200 pt-4">
                            <p className="text-slate-400 text-xs leading-relaxed">
                                © 2026 AthleticOS Professional. <br />
                                Enterprise-grade sports performance and analytics platform.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default LoginPage;
