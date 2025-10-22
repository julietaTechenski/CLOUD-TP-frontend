// Helper functions to work with AWS Amplify's localStorage format

/**
 * Extract the Cognito user pool ID from localStorage keys
 * @returns {string|null} The user pool ID or null if not found
 */
export const getCognitoUserPoolId = () => {
    const keys = Object.keys(localStorage);
    const cognitoKey = keys.find(key => key.startsWith('CognitoIdentityServiceProvider.') && key.includes('.LastAuthUser'));
    
    if (cognitoKey) {
        return cognitoKey.split('.')[1];
    }
    return null;
};

/**
 * Extract the current authenticated user from localStorage
 * @returns {string|null} The username/email or null if not found
 */
export const getCurrentCognitoUser = () => {
    const userPoolId = getCognitoUserPoolId();
    if (!userPoolId) return null;
    
    const lastAuthUserKey = `CognitoIdentityServiceProvider.${userPoolId}.LastAuthUser`;
    return localStorage.getItem(lastAuthUserKey);
};

/**
 * Get the access token from localStorage using Amplify's format
 * @returns {string|null} The access token or null if not found
 */
export const getAmplifyAccessToken = () => {
    const userPoolId = getCognitoUserPoolId();
    const currentUser = getCurrentCognitoUser();
    
    if (!userPoolId || !currentUser) return null;
    
    const accessTokenKey = `CognitoIdentityServiceProvider.${userPoolId}.${currentUser}.accessToken`;
    return localStorage.getItem(accessTokenKey);
};

/**
 * Get the ID token from localStorage using Amplify's format
 * @returns {string|null} The ID token or null if not found
 */
export const getAmplifyIdToken = () => {
    const userPoolId = getCognitoUserPoolId();
    const currentUser = getCurrentCognitoUser();
    
    if (!userPoolId || !currentUser) return null;
    
    const idTokenKey = `CognitoIdentityServiceProvider.${userPoolId}.${currentUser}.idToken`;
    return localStorage.getItem(idTokenKey);
};

/**
 * Get the refresh token from localStorage using Amplify's format
 * @returns {string|null} The refresh token or null if not found
 */
export const getAmplifyRefreshToken = () => {
    const userPoolId = getCognitoUserPoolId();
    const currentUser = getCurrentCognitoUser();
    
    if (!userPoolId || !currentUser) return null;
    
    const refreshTokenKey = `CognitoIdentityServiceProvider.${userPoolId}.${currentUser}.refreshToken`;
    return localStorage.getItem(refreshTokenKey);
};

/**
 * Check if user is authenticated based on Amplify storage
 * @returns {boolean} True if user is authenticated
 */
export const isAmplifyAuthenticated = () => {
    return getAmplifyAccessToken() !== null;
};

/**
 * Clear all Cognito-related data from localStorage
 */
export const clearAmplifyStorage = () => {
    const userPoolId = getCognitoUserPoolId();
    const currentUser = getCurrentCognitoUser();
    
    if (userPoolId && currentUser) {
        const keys = [
            `CognitoIdentityServiceProvider.${userPoolId}.LastAuthUser`,
            `CognitoIdentityServiceProvider.${userPoolId}.${currentUser}.accessToken`,
            `CognitoIdentityServiceProvider.${userPoolId}.${currentUser}.idToken`,
            `CognitoIdentityServiceProvider.${userPoolId}.${currentUser}.refreshToken`,
            `CognitoIdentityServiceProvider.${userPoolId}.${currentUser}.clockDrift`
        ];
        
        keys.forEach(key => localStorage.removeItem(key));
    }
    
    // Also clear any custom sessionStorage items
    sessionStorage.removeItem("userId");
    sessionStorage.removeItem("role");
    sessionStorage.removeItem("email");
    sessionStorage.removeItem("firstName");
    sessionStorage.removeItem("lastName");
};

/**
 * Parse JWT token to extract claims
 * @param {string} token - The JWT token
 * @returns {object|null} The decoded claims or null if invalid
 */
export const parseJwt = (token) => {
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
        return null;
    }
};

/**
 * Check if a token is expired
 * @param {string} token - The JWT token
 * @returns {boolean} True if token is expired
 */
export const isTokenExpired = (token) => {
    if (!token) return true;
    try {
        const decoded = parseJwt(token);
        if (!decoded || !decoded.exp) return true;
        const currentTime = Math.floor(Date.now() / 1000);
        return decoded.exp < currentTime;
    } catch (e) {
        return true;
    }
};
