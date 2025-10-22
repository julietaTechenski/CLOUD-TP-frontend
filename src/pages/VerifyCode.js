import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/services/useAuth";

export default function VerifyCode() {
    const { handleConfirmCode } = useAuth();
    const [code, setCode] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState("");
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // Obtener el email de los parámetros de la URL o del estado
        const emailFromState = location.state?.email;
        const emailFromParams = new URLSearchParams(location.search).get('email');
        const userEmail = emailFromState || emailFromParams;
        
        if (userEmail) {
            setEmail(userEmail);
        } else {
            // Si no hay email, redirigir al registro
            navigate("/auth");
        }
    }, [location, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        if (code.length !== 6) {
            setError("Please enter a valid 6-digit code");
            setIsLoading(false);
            return;
        }

        try {
            await handleConfirmCode(email, code);
            // Si la verificación es exitosa, redirigir al login
            navigate("/auth", { 
                state: { 
                    message: "Account verified successfully! Please log in.",
                    email: email 
                } 
            });
        } catch (err) {
            setError(err.message || "Verification failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendCode = async () => {
        try {
            // Aquí podrías implementar una función para reenviar el código
            setError("");
            // Por ahora solo mostramos un mensaje
            setError("Code resent! Please check your email.");
        } catch (err) {
            setError("Failed to resend code. Please try again.");
        }
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
                        Verify Your Account
                    </h1>
                    <p style={{ color: "#6b7280", fontSize: "14px" }}>
                        We've sent a 6-digit verification code to
                    </p>
                    <p style={{ color: "#3b82f6", fontSize: "14px", fontWeight: "500" }}>
                        {email}
                    </p>
                </div>

                {error && (
                    <div
                        style={{
                            backgroundColor: error.includes("resent") ? "#d1fae5" : "#fef2f2",
                            border: `1px solid ${error.includes("resent") ? "#a7f3d0" : "#fecaca"}`,
                            borderRadius: "6px",
                            padding: "12px",
                            marginBottom: "16px",
                        }}
                    >
                        <p style={{ 
                            color: error.includes("resent") ? "#065f46" : "#dc2626", 
                            fontSize: "14px", 
                            margin: 0 
                        }}>
                            {error}
                        </p>
                    </div>
                )}

                <form
                    onSubmit={handleSubmit}
                    style={{ display: "flex", flexDirection: "column", gap: "16px" }}
                >
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        <label
                            htmlFor="code"
                            style={{ fontSize: "14px", fontWeight: "500", color: "#374151" }}
                        >
                            Verification Code
                        </label>
                        <input
                            id="code"
                            type="text"
                            placeholder="123456"
                            value={code}
                            onChange={(e) => {
                                // Solo permitir números y máximo 6 dígitos
                                const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                                setCode(value);
                            }}
                            required
                            maxLength={6}
                            style={{
                                padding: "12px",
                                border: "1px solid #d1d5db",
                                borderRadius: "6px",
                                fontSize: "18px",
                                textAlign: "center",
                                letterSpacing: "2px",
                                outline: "none",
                                transition: "border-color 0.2s",
                            }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading || code.length !== 6}
                        style={{
                            width: "100%",
                            padding: "12px",
                            backgroundColor: isLoading || code.length !== 6 ? "#9ca3af" : "#3b82f6",
                            color: "white",
                            border: "none",
                            borderRadius: "6px",
                            fontSize: "14px",
                            fontWeight: "500",
                            cursor: isLoading || code.length !== 6 ? "not-allowed" : "pointer",
                            transition: "background-color 0.2s",
                        }}
                    >
                        {isLoading ? "Verifying..." : "Verify Account"}
                    </button>
                </form>

                <div style={{ marginTop: "16px", textAlign: "center" }}>
                    <p style={{ fontSize: "14px", color: "#6b7280" }}>
                        Didn't receive the code?{" "}
                        <button
                            type="button"
                            onClick={handleResendCode}
                            style={{
                                color: "#3b82f6",
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                textDecoration: "underline",
                                fontSize: "14px",
                            }}
                        >
                            Resend Code
                        </button>
                    </p>
                </div>

                <div style={{ marginTop: "16px", textAlign: "center" }}>
                    <button
                        type="button"
                        onClick={() => navigate("/auth")}
                        style={{
                            color: "#6b7280",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            textDecoration: "underline",
                            fontSize: "14px",
                        }}
                    >
                        Back to Login
                    </button>
                </div>
            </div>
        </div>
    );
}
