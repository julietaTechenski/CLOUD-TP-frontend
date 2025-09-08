import { useAuth } from "../hooks/services/useAuth";
import React, { useState } from "react";

export default function Auth() {
    const { handleLogin, handleRegister } = useAuth();
    const authContext = useAuth();
    console.log("authContext:", authContext);

    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        if (!isLogin && password !== confirmPassword) {
            setError("Las contraseñas no coinciden");
            setIsLoading(false);
            return;
        }

        try {
            if (isLogin) {
                await handleLogin(email, password);
                alert("Login successful!");
            } else {
                console.log("Registering with:", { username, email, password });
                await handleRegister(username,email, password);
                alert("Account created! Now you can log in.");
                setIsLogin(true);
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
                        {isLogin ? "Iniciar Sesión" : "Crear Cuenta"}
                    </h1>
                    <p style={{ color: "#6b7280", fontSize: "14px" }}>
                        {isLogin
                            ? "Ingresa tu email y contraseña para acceder"
                            : "Completa los datos para crear tu cuenta"}
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
                        placeholder="tu@email.com"
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
                            Contraseña
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
                                Confirmar Contraseña
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
                                ? "Iniciando sesión..."
                                : "Creando cuenta..."
                            : isLogin
                                ? "Iniciar Sesión"
                                : "Crear Cuenta"}
                    </button>
                </form>

                <div style={{marginTop: "16px", textAlign: "center"}}>
                    <p style={{fontSize: "14px", color: "#6b7280"}}>
                        {isLogin ? "¿No tienes cuenta? " : "¿Ya tienes cuenta? "}
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
                            {isLogin ? "Crear cuenta" : "Iniciar sesión"}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}
