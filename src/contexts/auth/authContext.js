import { createContext } from "react";

export const ACCESS_TOKEN_HEADER_NAME = "access-token";
export const REFRESH_TOKEN_HEADER_NAME = "refresh-token";

const getInitialState = () => ({
    authenticated: sessionStorage.getItem(ACCESS_TOKEN_HEADER_NAME) !== null,
    accessToken: sessionStorage.getItem(ACCESS_TOKEN_HEADER_NAME) || undefined,
    refreshToken: sessionStorage.getItem(REFRESH_TOKEN_HEADER_NAME) || undefined,
    userId: undefined,
    role: undefined,
    email: undefined,
    firstName: undefined,
    lastName: undefined,
    loading: false,
    handleLogin: () => Promise.resolve(false),
    handleLogout: () => {},
    handleTokensRefresh: () => {},
    handleRegister: () => Promise.resolve(false),
    setUserDetails: () => Promise.resolve(false),
});

export const AuthContext = createContext(getInitialState());
