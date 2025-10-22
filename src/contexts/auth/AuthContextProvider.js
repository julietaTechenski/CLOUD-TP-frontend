import React, { useCallback, useState } from "react";
import { AuthContext } from "./authContext";

import { signIn, signUp, signOut } from 'aws-amplify/auth';

function parseJwt(token) {
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
        return null;
    }
}

export const AuthContextProvider = ({ children }) => {
    const [auth, setAuth] = useState({
        authenticated: !!sessionStorage.getItem("access-token"),
        accessToken: sessionStorage.getItem("access-token") || undefined,
        userId: sessionStorage.getItem("userId") || undefined,
        role: sessionStorage.getItem("role") || undefined,
        email: sessionStorage.getItem("email") || undefined,
        firstName: sessionStorage.getItem("firstName") || undefined, // Cognito no da esto por defecto
        lastName: sessionStorage.getItem("lastName") || undefined,  // Cognito no da esto por defecto
        loading: false,
    });

    const handleLogin = useCallback(async (email, password) => {
        setAuth((prev) => ({ ...prev, loading: true }));
        try {
            const { isSignedIn, nextStep } = await signIn({
                username: email,
                password: password
            });

            if (isSignedIn) {
                // Get the current user session
                const { getCurrentUser } = await import('aws-amplify/auth');
                const { tokens } = await getCurrentUser();

                const accessToken = tokens.accessToken.toString();
                const idToken = tokens.idToken.toString();
                const refreshToken = tokens.refreshToken.toString();

                const claims = parseJwt(idToken);

                const userId = claims.sub; // cognito user ID
                const userRole = claims['custom:role'] || 'user';
                const userEmail = claims.email;

                sessionStorage.setItem("access-token", accessToken);
                sessionStorage.setItem("refresh-token", refreshToken);
                sessionStorage.setItem("userId", userId);
                sessionStorage.setItem("role", userRole);
                sessionStorage.setItem("email", userEmail);

                setAuth({
                    authenticated: true,
                    accessToken: accessToken,
                    refreshToken: refreshToken,
                    userId: userId,
                    role: userRole,
                    email: userEmail,
                    loading: false,
                });

                return true;
            } else {
                throw new Error("Authentication failed");
            }
        } catch (err) {
            setAuth((prev) => ({ ...prev, loading: false }));
            throw err.message || "Login failed";
        }
    }, []);

    const handleRegister = useCallback(async (username, email, password) => {
        try {
            const { isSignUpComplete, userId, nextStep } = await signUp({
                username: email,
                password: password,
                options: {
                    userAttributes: {
                        email: email,
                    }
                }
            });
            return true;
        } catch (err) {
            console.error("Error al registrar:", err);
            throw err.message || "Registration failed";
        }
    }, []);

    const handleConfirmCode = useCallback(async (email, code) => {
        try {
            await confirmSignUp({
                username: email,
                confirmationCode: code
            });
            return true;
        } catch (err) {
            console.error("Error al confirmar código:", err);
            throw err.message || "Code verification failed";
        }
    }, []);


    const handleLogout = async () => {
        try {
            await signOut();
        } catch (error) {
            console.error("Error en signOut: ", error);
        }

        sessionStorage.removeItem("access-token");
        sessionStorage.removeItem("refresh-token");
        sessionStorage.removeItem("userId");
        sessionStorage.removeItem("role");
        sessionStorage.removeItem("email");
        sessionStorage.removeItem("firstName");
        sessionStorage.removeItem("lastName");

        setAuth({
            authenticated: false,
            accessToken: undefined,
            refreshToken: undefined,
            userId: undefined,
            role: undefined,
            email: undefined,
            firstName: undefined,
            lastName: undefined,
            loading: false,
        });
    };


    const handleTokensRefresh = useCallback((  accessToken, refreshToken ) => {
        sessionStorage.setItem("access-token", accessToken);
        sessionStorage.setItem("refresh-token", refreshToken);
        setAuth((prev) => ({
            ...prev,
            accessToken,
            refreshToken,
        }));
    }, []);

    return (
        <AuthContext.Provider
            value={{
                ...auth,
                handleLogin,
                handleLogout,
                handleTokensRefresh,
                handleRegister,
                handleConfirmCode,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};