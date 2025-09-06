import React, { useState } from "react";
import { AuthContext } from "./authContext";

export const AuthContextProvider = ({ children }) => {
    const [auth, setAuth] = useState({
        authenticated: sessionStorage.getItem("access_token") !== null,
        accessToken: sessionStorage.getItem("access_token") || undefined,
        refreshToken: sessionStorage.getItem("refresh_token") || undefined,
        userId: undefined,
        role: undefined,
        loading: false,
    });

    const handleLogin = ({ accessToken, refreshToken, userId, role }) => {
        sessionStorage.setItem("access_token", accessToken);
        sessionStorage.setItem("refresh_token", refreshToken);
        setAuth({
            authenticated: true,
            accessToken,
            refreshToken,
            userId,
            role,
            loading: false,
        });
    };

    const handleLogout = () => {
        sessionStorage.removeItem("access_token");
        sessionStorage.removeItem("refresh_token");
        setAuth({
            authenticated: false,
            accessToken: undefined,
            refreshToken: undefined,
            userId: undefined,
            role: undefined,
            loading: false,
        });
    };

    const handleTokensRefresh = ({ accessToken, refreshToken }) => {
        sessionStorage.setItem("access_token", accessToken);
        sessionStorage.setItem("refresh_token", refreshToken);
        setAuth((prev) => ({
            ...prev,
            accessToken,
            refreshToken,
        }));
    };

    const handleRegister = () => Promise.resolve(false);

    return (
        <AuthContext.Provider
            value={{
                ...auth,
                handleLogin,
                handleLogout,
                handleTokensRefresh,
                handleRegister,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
