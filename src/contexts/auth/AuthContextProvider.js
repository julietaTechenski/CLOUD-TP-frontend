import React, { useCallback, useState, useEffect } from "react";
import { AuthContext } from "./authContext";
import { signIn, signUp, signOut, confirmSignUp, fetchAuthSession } from '@aws-amplify/auth';
import { 
    getAmplifyAccessToken, 
    getAmplifyIdToken, 
    getCurrentCognitoUser,
    isAmplifyAuthenticated,
    clearAmplifyStorage,
    parseJwt,
    isTokenExpired
} from "../../utils/amplifyStorage";

export const AuthContextProvider = ({ children }) => {
    // Initialize auth state from Amplify storage
    const initializeAuthState = () => {
        const accessToken = getAmplifyAccessToken();
        const idToken = getAmplifyIdToken();
        const currentUser = getCurrentCognitoUser();
        
        let userId, role, email, firstName, lastName;
        
        if (idToken) {
            const claims = parseJwt(idToken);
            userId = claims?.sub;
            role = claims?.['custom:role'] || 'user';
            email = claims?.email;
            firstName = claims?.given_name || sessionStorage.getItem("firstName");
            lastName = claims?.family_name || sessionStorage.getItem("lastName");
        }
        
        return {
            authenticated: isAmplifyAuthenticated(),
            accessToken: accessToken || undefined,
            refreshToken: undefined, // We'll get this from Amplify when needed
            userId: userId || sessionStorage.getItem("userId") || undefined,
            role: role || sessionStorage.getItem("role") || undefined,
            email: email || sessionStorage.getItem("email") || undefined,
            firstName: firstName || sessionStorage.getItem("firstName") || undefined,
            lastName: lastName || sessionStorage.getItem("lastName") || undefined,
            loading: false,
        };
    };

    const [auth, setAuth] = useState(initializeAuthState);

    const handleLogout = useCallback(async () => {
        try {
            await signOut();
        } catch (error) {
            console.error("Error en signOut: ", error);
        }

        // Clear Amplify storage and custom sessionStorage
        clearAmplifyStorage();

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
    }, []);

    const refreshTokens = useCallback(async () => {
        try {
            const session = await fetchAuthSession({ forceRefresh: true });
            const accessToken = session.tokens?.accessToken?.toString();
            const idToken = session.tokens?.idToken?.toString();
            
            if (accessToken && idToken) {
                // Extract user info from the refreshed ID token
                const claims = parseJwt(idToken);
                const userId = claims?.sub;
                const userRole = claims?.['custom:role'] || 'user';
                const userEmail = claims?.email;
                
                // Update sessionStorage with user info (for backward compatibility)
                if (userId) sessionStorage.setItem("userId", userId);
                if (userRole) sessionStorage.setItem("role", userRole);
                if (userEmail) sessionStorage.setItem("email", userEmail);
                
                setAuth((prev) => ({
                    ...prev,
                    accessToken,
                    userId,
                    role: userRole,
                    email: userEmail,
                }));
                return accessToken;
            }
            throw new Error("Failed to refresh tokens");
        } catch (error) {
            console.error("Token refresh failed:", error);
            // If refresh fails, logout the user
            await handleLogout();
            throw error;
        }
    }, [handleLogout]);

    // Check token expiration on mount and set up periodic refresh
    useEffect(() => {
        const checkTokenValidity = async () => {
            const accessToken = getAmplifyAccessToken();
            
            if (accessToken && isTokenExpired(accessToken)) {
                try {
                    await refreshTokens();
                } catch (error) {
                    console.error("Token refresh failed on mount:", error);
                    // If refresh fails, clear auth state
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
                }
            }
        };

        checkTokenValidity();

        // Set up periodic token refresh (every 50 minutes)
        const refreshInterval = setInterval(async () => {
            const accessToken = getAmplifyAccessToken();
            if (accessToken && !isTokenExpired(accessToken)) {
                try {
                    await refreshTokens();
                } catch (error) {
                    console.error("Periodic token refresh failed:", error);
                }
            }
        }, 50 * 60 * 1000); // 50 minutes

        return () => clearInterval(refreshInterval);
    }, [refreshTokens]);

    const handleLogin = useCallback(async (email, password) => {
        setAuth((prev) => ({ ...prev, loading: true }));
        try {
            const { isSignedIn, nextStep } = await signIn({
                username: email,
                password: password
            });

            if (isSignedIn) {
                // Amplify automatically stores tokens in localStorage, so we just need to extract them
                const accessToken = getAmplifyAccessToken();
                const idToken = getAmplifyIdToken();

                if (!accessToken || !idToken) {
                    throw new Error("Failed to retrieve tokens after login");
                }

                const claims = parseJwt(idToken);

                const userId = claims.sub; // cognito user ID
                const userRole = claims['custom:role'] || 'user';
                const userEmail = claims.email;
                const firstName = claims.given_name;
                const lastName = claims.family_name;

                // Store user info in sessionStorage for backward compatibility
                sessionStorage.setItem("userId", userId);
                sessionStorage.setItem("role", userRole);
                sessionStorage.setItem("email", userEmail);
                if (firstName) sessionStorage.setItem("firstName", firstName);
                if (lastName) sessionStorage.setItem("lastName", lastName);

                setAuth({
                    authenticated: true,
                    accessToken: accessToken,
                    refreshToken: undefined, // We'll get this from Amplify when needed
                    userId: userId,
                    role: userRole,
                    email: userEmail,
                    firstName: firstName,
                    lastName: lastName,
                    loading: false,
                });

                return true;
            } else {
                throw new Error("Authentication failed");
            }
        } catch (err) {
            setAuth((prev) => ({ ...prev, loading: false }));
            
            // Enhanced error handling for different Cognito error types
            let errorMessage = "Login failed";
            
            if (err.name === 'NotAuthorizedException') {
                errorMessage = "Invalid email or password";
            } else if (err.name === 'UserNotFoundException') {
                errorMessage = "User not found";
            } else if (err.name === 'UserNotConfirmedException') {
                errorMessage = "Please confirm your email address before logging in";
            } else if (err.name === 'TooManyRequestsException') {
                errorMessage = "Too many login attempts. Please try again later";
            } else if (err.name === 'InvalidParameterException') {
                errorMessage = "Invalid email or password format";
            } else if (err.message) {
                errorMessage = err.message;
            }
            
            throw new Error(errorMessage);
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
            
            // Enhanced error handling for different Cognito registration error types
            let errorMessage = "Registration failed";
            
            if (err.name === 'UsernameExistsException') {
                errorMessage = "An account with this email already exists";
            } else if (err.name === 'InvalidPasswordException') {
                errorMessage = "Password does not meet requirements";
            } else if (err.name === 'InvalidParameterException') {
                errorMessage = "Invalid email format";
            } else if (err.name === 'TooManyRequestsException') {
                errorMessage = "Too many registration attempts. Please try again later";
            } else if (err.message) {
                errorMessage = err.message;
            }
            
            throw new Error(errorMessage);
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

    const handleTokensRefresh = useCallback((accessToken, refreshToken) => {
        sessionStorage.setItem("access_token", accessToken);
        sessionStorage.setItem("refresh_token", refreshToken);
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
                refreshTokens,
                handleRegister,
                handleConfirmCode,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};