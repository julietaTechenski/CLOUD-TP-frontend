import { useAuth } from "../hooks/services/useAuth";
import React, {useEffect, useState} from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function Auth() {
    const {authenticated, handleLogin, handleRegister ,setUserDetails} = useAuth();
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (authenticated) {
            navigate("/track");
        }
    }, [authenticated, navigate]);

    useEffect(() => {
        // Verificar si hay un mensaje de éxito desde la página de verificación
        const message = location.state?.message;
        if (message) {
            setSuccessMessage(message);
            // Pre-llenar el email si viene de la verificación
            const emailFromState = location.state?.email;
            if (emailFromState) {
                setEmail(emailFromState);
            }
            // Limpiar el estado después de mostrar el mensaje
            setTimeout(() => {
                setSuccessMessage("");
            }, 5000);
        }
    }, [location.state]);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        if (!isLogin && password !== confirmPassword) {
            setError("The passwords do not match");
            setIsLoading(false);
            return;
        }

        try {
            if (isLogin) {
                await handleLogin(email, password);
                await setUserDetails();
            } else {
                await handleRegister(username, email, password);
                // Redirigir a la página de verificación con el email
                navigate("/verify", { 
                    state: { email: email },
                    replace: true 
                });
            }
        }catch (err) {
            setError(err?.response?.data?.detail || err.message || String(err));

    } finally {
            setIsLoading(false);
        }
    };

    const toggleMode = () => {
        setIsLogin(!isLogin);
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setError("");
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa] p-4">
            <div className="w-full max-w-[400px] bg-white rounded-lg shadow-[0_4px_6px_rgba(0,0,0,0.1)] p-6 md:p-8">
                <div className="mb-6 text-center">
                    <h1 className="text-2xl font-bold mb-2 text-[#1f2937]">
                        {isLogin ? "Log In" : "Create Account"}
                    </h1>
                    <p className="text-[#6b7280] text-sm">
                        {isLogin
                            ? "Enter your email and password to access"
                            : "Fill in the data to create your account"}
                    </p>
                </div>

                {error && (
                    <div className="bg-[#fef2f2] border border-[#fecaca] rounded-md p-3 mb-4">
                        <p className="text-[#dc2626] text-sm m-0">
                            {error}
                        </p>
                    </div>
                )}

                <form
                    onSubmit={handleSubmit}
                    className="flex flex-col gap-4"
                >
                    {!isLogin && (
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-[#374151]">
                                Username
                            </label>
                            <input
                                id="username"
                                type="text"
                                placeholder="Username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                className="p-3 border border-[#d1d5db] rounded-md text-sm outline-none transition-colors"
                            />
                        </div>
                    )}
                    <div className="flex flex-col gap-2">
                        <label
                            htmlFor="email"
                            className="text-sm font-medium text-[#374151]"
                        >
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            placeholder="your@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="p-3 border border-[#d1d5db] rounded-md text-sm outline-none transition-colors"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label
                            htmlFor="password"
                            className="text-sm font-medium text-[#374151]"
                        >
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="p-3 border border-[#d1d5db] rounded-md text-sm outline-none transition-colors"
                        />
                    </div>

                    {!isLogin && (
                        <div className="flex flex-col gap-2">
                            <label
                                htmlFor="confirmPassword"
                                className="text-sm font-medium text-[#374151]"
                            >
                                Confirm Password
                            </label>
                            <input
                                id="confirmPassword"
                                type="password"
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                className="p-3 border border-[#d1d5db] rounded-md text-sm outline-none transition-colors"
                            />
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full p-3 text-white border-none rounded-md text-sm font-medium transition-colors ${
                            isLoading 
                                ? "bg-[#9ca3af] cursor-not-allowed" 
                                : "bg-[#3b82f6] cursor-pointer hover:bg-[#2563eb]"
                        }`}
                    >
                        {isLoading
                            ? isLogin
                                ? "Signing in..."
                                : "Creating account..."
                            : isLogin
                                ? "Log In"
                                : "Create Account"}
                    </button>
                </form>
                {successMessage && (
                    <div className="bg-[#d1fae5] text-[#065f46] p-3 mb-4 rounded-md">
                        {successMessage}
                    </div>
                )}

                <div className="mt-4 text-center">
                    <p className="text-sm text-[#6b7280]">
                        {isLogin ? "Don't you have an account?": "Have you already got an account? "}

                        <button
                            type="button"
                            onClick={toggleMode}
                            className="text-[#3b82f6] bg-transparent border-none cursor-pointer underline text-sm"
                        >
                            {isLogin ? "Create Account" : "Log In"}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}
