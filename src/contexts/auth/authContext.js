import { createContext } from "react";

export const ACCESS_TOKEN_HEADER_NAME = "access-token";
export const REFRESH_TOKEN_HEADER_NAME = "refresh-token";

const getInitialState = () => ({
    authenticated: sessionStorage.getItem(ACCESS_TOKEN_HEADER_NAME) !== null,
    accessToken: sessionStorage.getItem(ACCESS_TOKEN_HEADER_NAME) || undefined,
    refreshToken: sessionStorage.getItem(REFRESH_TOKEN_HEADER_NAME) || undefined,
    userId: sessionStorage.getItem("userId") || undefined,
    role: sessionStorage.getItem("role") || undefined,
    email: sessionStorage.getItem("email") || undefined,
    firstName: sessionStorage.getItem("firstName") || undefined,
    lastName: sessionStorage.getItem("lastName") || undefined,
    loading: false,
    handleLogin: () => Promise.resolve(false),
    handleLogout: () => {},
    handleTokensRefresh: () => {},
    handleRegister: () => Promise.resolve(false),
    handleConfirmCode: () => Promise.resolve(false),
    setUserDetails: () => Promise.resolve(false),
});

export const AuthContext = createContext(getInitialState());
