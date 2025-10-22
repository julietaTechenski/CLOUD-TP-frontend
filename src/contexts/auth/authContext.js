import { createContext } from "react";
import { isAmplifyAuthenticated, getAmplifyAccessToken, getAmplifyRefreshToken } from "../../utils/amplifyStorage";

export const ACCESS_TOKEN_HEADER_NAME = "access_token";
export const REFRESH_TOKEN_HEADER_NAME = "refresh_token";

const getInitialState = () => ({
    authenticated: isAmplifyAuthenticated(),
    accessToken: getAmplifyAccessToken() || undefined,
    refreshToken: getAmplifyRefreshToken() || undefined,
    userId: sessionStorage.getItem("userId") || undefined,
    role: sessionStorage.getItem("role") || undefined,
    email: sessionStorage.getItem("email") || undefined,
    firstName: sessionStorage.getItem("firstName") || undefined,
    lastName: sessionStorage.getItem("lastName") || undefined,
    loading: false,
    handleLogin: () => Promise.resolve(false),
    handleLogout: () => {},
    handleTokensRefresh: () => {},
    refreshTokens: () => Promise.resolve(false),
    handleRegister: () => Promise.resolve(false),
    setUserDetails: () => Promise.resolve(false),
});

export const AuthContext = createContext(getInitialState());
