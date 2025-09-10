import { useAuth } from "../hooks/services/useAuth";
import React, {useEffect, useState} from "react";
import { useNavigate } from "react-router-dom";

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

    useEffect(() => {
        if (authenticated) {
            navigate("/track");
        }
    }, [authenticated, navigate]);
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
                await handleRegister(username,email, password);
                setSuccessMessage("Account created successfully!");
                setTimeout(() => {
                    setSuccessMessage("");
                    setIsLogin(true);
                }, 1500);
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
        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#f8f9fa",
                padding: "16px",
            }}
        >
            <div
                style={{
                    width: "100%",
                    maxWidth: "400px",
                    backgroundColor: "white",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                    padding: "32px",
                }}
            >
                <div style={{ marginBottom: "24px", textAlign: "center" }}>
                    <h1
                        style={{
                            fontSize: "24px",
                            fontWeight: "bold",
                            marginBottom: "8px",
                            color: "#1f2937",
                        }}
                    >
                        {isLogin ? "Log In" : "Create Account"}
                    </h1>
                    <p style={{ color: "#6b7280", fontSize: "14px" }}>
                        {isLogin
                            ? "Enter your email and password to access"
                            : "Fill in the data to create your account"}
                    </p>
                </div>

                {error && (
                    <div
                        style={{
                            backgroundColor: "#fef2f2",
                            border: "1px solid #fecaca",
                            borderRadius: "6px",
                            padding: "12px",
                            marginBottom: "16px",
                        }}
                    >
                        <p style={{ color: "#dc2626", fontSize: "14px", margin: 0 }}>
                            {error}
                        </p>
                    </div>
                )}

                <form
                    onSubmit={handleSubmit}
                    style={{display: "flex", flexDirection: "column", gap: "16px"}}
                >
                    {!isLogin && (<div style={{display: "flex", flexDirection: "column", gap: "8px"}}>
                        <label
                            style={{fontSize: "14px", fontWeight: "500", color: "#374151"}}
                        >
                            Username
                        </label>
                        <input
                            id="username"
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            style={{
                                padding: "12px",
                                border: "1px solid #d1d5db",
                                borderRadius: "6px",
                                fontSize: "14px",
                                outline: "none",
                                transition: "border-color 0.2s",
                            }}
                        />
                    </div>)}
                        <div style={{display: "flex", flexDirection: "column", gap: "8px"}}>
                    <label
                        htmlFor="email"
                        style={{fontSize: "14px", fontWeight: "500", color: "#374151"}}
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
                        style={{
                            padding: "12px",
                            border: "1px solid #d1d5db",
                            borderRadius: "6px",
                            fontSize: "14px",
                            outline: "none",
                            transition: "border-color 0.2s",
                        }}
                        />
                    </div>


                    <div style={{display: "flex", flexDirection: "column", gap: "8px"}}>
                        <label
                            htmlFor="password"
                            style={{fontSize: "14px", fontWeight: "500", color: "#374151"}}
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
                            style={{
                                padding: "12px",
                                border: "1px solid #d1d5db",
                                borderRadius: "6px",
                                fontSize: "14px",
                                outline: "none",
                                transition: "border-color 0.2s",
                            }}
                        />
                    </div>

                    {!isLogin && (
                        <div style={{display: "flex", flexDirection: "column", gap: "8px"}}>
                            <label
                                htmlFor="confirmPassword"
                                style={{fontSize: "14px", fontWeight: "500", color: "#374151"}}
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
                                style={{
                                    padding: "12px",
                                    border: "1px solid #d1d5db",
                                    borderRadius: "6px",
                                    fontSize: "14px",
                                    outline: "none",
                                    transition: "border-color 0.2s",
                                }}
                            />
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        style={{
                            width: "100%",
                            padding: "12px",
                            backgroundColor: isLoading ? "#9ca3af" : "#3b82f6",
                            color: "white",
                            border: "none",
                            borderRadius: "6px",
                            fontSize: "14px",
                            fontWeight: "500",
                            cursor: isLoading ? "not-allowed" : "pointer",
                            transition: "background-color 0.2s",
                        }}
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
                    <div style={{ backgroundColor: "#d1fae5", color: "#065f46", padding: "12px", marginBottom: "16px", borderRadius: "6px" }}>
                        {successMessage}
                    </div>
                )}

                <div style={{marginTop: "16px", textAlign: "center"}}>
                    <p style={{fontSize: "14px", color: "#6b7280"}}>
                        {isLogin ? "Don't you have an account?": "Have you already got an account? "}

                        <button
                            type="button"
                            onClick={toggleMode}
                            style={{
                                color: "#3b82f6",
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                textDecoration: "underline",
                                fontSize: "14px",
                            }}
                        >
                            {isLogin ? "Create Account" : "Log In"}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}
