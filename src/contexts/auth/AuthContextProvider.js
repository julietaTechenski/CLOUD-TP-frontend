import React, {useCallback, useState} from "react";
import { AuthContext } from "./authContext";
import api from "../../lib/axios";

export const AuthContextProvider = ({ children }) => {
    const [auth, setAuth] = useState({
        authenticated: !!sessionStorage.getItem("access_token"),
        accessToken: sessionStorage.getItem("access_token") || undefined,
        userId: sessionStorage.getItem("userId") || undefined,
        role: sessionStorage.getItem("role") || undefined,
        email: sessionStorage.getItem("email") || undefined,
        firstName: sessionStorage.getItem("firstName") || undefined,
        lastName: sessionStorage.getItem("lastName") || undefined,
        loading: false,
    });

    const handleLogin = useCallback( async(email,password ) => {
        setAuth((prev) => ({ ...prev, loading: true }));
        try {
            const res =await  api.post("/auth/token/", {email, password });
            const { access, refresh, userId, role } = res.data;
            sessionStorage.setItem("access_token", access);
            sessionStorage.setItem("refresh_token", refresh);
            setAuth({
                authenticated: true,
                accessToken: access,
                refreshToken: refresh,
                loading: false,
            });

            return true;
        } catch (err) {
            setAuth((prev) => ({ ...prev, loading: false }));
            throw err.response?.data?.detail || "Login failed";
        }
    },[]);

    const handleRegister = useCallback (async (username,email,password)  => {
        console.log("Payload que voy a enviar:", { username, email, password });
        try {
            const response = await api.post("/auth/register/", { username, email, password });
            return true;
        } catch (err) {
            console.error("Error al registrar:", err.response?.data);
            throw err.response?.data?.detail || "Registration failed";
        }
    },[]);


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

    const handleTokensRefresh = useCallback((  accessToken, refreshToken ) => {
        sessionStorage.setItem("access_token", accessToken);
        sessionStorage.setItem("refresh_token", refreshToken);
        setAuth((prev) => ({
            ...prev,
            accessToken,
            refreshToken,
        }));
    }, []);

    const setUserDetails = useCallback(async () => {
        try {
            const res = await api.get("/auth/me/");
            const { id, role, email, first_name, last_name } = res.data;
            sessionStorage.setItem("userId", id);
            sessionStorage.setItem("role", role);
            sessionStorage.setItem("email", email);
            sessionStorage.setItem("firstName", first_name);
            sessionStorage.setItem("lastName", last_name);
            setAuth((prev) => ({
                ...prev,
                userId: id,
                role,
                email,
                firstName: first_name,
                lastName: last_name,
                loading: false,
            }));
        } catch (err) {
            console.error("Error fetching user details:", err);
            setAuth((prev) => ({ ...prev, loading: false }));
        }
    }, []);


    return (
        <AuthContext.Provider
            value={{
                ...auth,
                handleLogin,
                handleLogout,
                handleTokensRefresh,
                handleRegister,
                setUserDetails,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
