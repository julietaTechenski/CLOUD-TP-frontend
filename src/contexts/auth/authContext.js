import { createContext } from "react";

export const ACCESS_TOKEN_HEADER_NAME = "access-token";
export const REFRESH_TOKEN_HEADER_NAME = "refresh-token";

const getInitialState = () => ({
    authenticated: sessionStorage.getItem("access_token") !== null,
    accessToken: sessionStorage.getItem("access_token") || undefined,
    refreshToken: sessionStorage.getItem("refresh_token") || undefined,
    userId: undefined,
    role: undefined,
    loading: false,
    handleLogin: () => Promise.resolve(false),
    handleLogout: () => {},
    handleTokensRefresh: () => {},
    handleRegister: () => Promise.resolve(false),
});

export const AuthContext = createContext(getInitialState());
