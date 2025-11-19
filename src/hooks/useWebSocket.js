import { useEffect, useRef, useCallback, useState } from 'react';
import { getAmplifyIdToken, parseJwt } from '../utils/amplifyStorage';

/**
 * Custom hook for managing WebSocket connections with auto-reconnect and authentication
 * @param {string} url - WebSocket URL (from REACT_APP_WEBSOCKET_URL)
 * @returns {object} - WebSocket connection state and methods
 */
export const useWebSocket = (url) => {
    const [isConnected, setIsConnected] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState('disconnected'); // 'disconnected', 'connecting', 'connected', 'error'
    const [lastError, setLastError] = useState(null);
    const [reconnectAttempts, setReconnectAttempts] = useState(0);
    const wsRef = useRef(null);
    const reconnectTimeoutRef = useRef(null);
    const pingIntervalRef = useRef(null);
    const subscriptionsRef = useRef(new Set());
    const messageCallbackRef = useRef(null); // Use ref for message callback instead of storing on WebSocket object
    const maxReconnectAttempts = 5;
    const reconnectDelay = 3000; // 3 seconds

    // Get user ID from Cognito token
    const getUserId = useCallback(() => {
        try {
            const idToken = getAmplifyIdToken();
            if (idToken) {
                const claims = parseJwt(idToken);
                return claims?.sub || null;
            }
        } catch (error) {
            console.error('Error getting user ID:', error);
        }
        return null;
    }, []);

    // Send message through WebSocket
    const sendMessage = useCallback((message) => {
        const ws = wsRef.current;
        if (ws && ws.readyState === WebSocket.OPEN) {
            try {
                ws.send(JSON.stringify(message));
                return true;
            } catch (error) {
                console.error('Error sending WebSocket message:', error);
                setLastError(error);
                return false;
            }
        }
        console.warn('WebSocket is not connected. Message not sent:', message);
        return false;
    }, []);

    // Subscribe to a package code
    const subscribe = useCallback((packageCode) => {
        if (!packageCode) return false;

        subscriptionsRef.current.add(packageCode);
        
        if (isConnected && wsRef.current?.readyState === WebSocket.OPEN) {
            const userId = getUserId();
            sendMessage({
                action: 'subscribe',
                package_code: packageCode,
                user_id: userId,
            });
            console.log(`Subscribed to package: ${packageCode}`);
        }
        return true;
    }, [isConnected, getUserId, sendMessage]);

    // Unsubscribe from a package code
    const unsubscribe = useCallback((packageCode) => {
        if (!packageCode) return false;

        subscriptionsRef.current.delete(packageCode);
        
        if (isConnected && wsRef.current?.readyState === WebSocket.OPEN) {
            sendMessage({
                action: 'unsubscribe',
                package_code: packageCode,
            });
            console.log(`Unsubscribed from package: ${packageCode}`);
        }
        return true;
    }, [isConnected, sendMessage]);

    // Connect to WebSocket
    const connect = useCallback(() => {
        if (!url) {
            console.warn('WebSocket URL not provided');
            setLastError(new Error('WebSocket URL not provided'));
            return;
        }

        const currentWs = wsRef.current;
        if (currentWs?.readyState === WebSocket.OPEN || 
            currentWs?.readyState === WebSocket.CONNECTING) {
            console.log('WebSocket already connecting or connected');
            return;
        }

        setConnectionStatus('connecting');
        setLastError(null);
        const userId = getUserId();

        try {
            // Construct URL with proper encoding
            let wsUrl = url;
            if (userId) {
                const separator = url.includes('?') ? '&' : '?';
                wsUrl = `${url}${separator}user_id=${encodeURIComponent(userId)}`;
            }

            const ws = new WebSocket(wsUrl);
            wsRef.current = ws;

            ws.onopen = () => {
                console.log('WebSocket connected');
                setIsConnected(true);
                setConnectionStatus('connected');
                setLastError(null);
                setReconnectAttempts(0);

                // Resubscribe to all packages using current refs
                subscriptionsRef.current.forEach((packageCode) => {
                    const currentUserId = getUserId();
                    const ws = wsRef.current;
                    if (ws && ws.readyState === WebSocket.OPEN) {
                        try {
                            ws.send(JSON.stringify({
                                action: 'subscribe',
                                package_code: packageCode,
                                user_id: currentUserId,
                            }));
                        } catch (error) {
                            console.error('Error resubscribing:', error);
                        }
                    }
                });

                // Start ping interval to keep connection alive (every 30 seconds)
                pingIntervalRef.current = setInterval(() => {
                    const ws = wsRef.current;
                    if (ws && ws.readyState === WebSocket.OPEN) {
                        try {
                            ws.send(JSON.stringify({ action: 'ping' }));
                        } catch (error) {
                            console.error('Error sending ping:', error);
                        }
                    }
                }, 30000);
            };

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    
                    // Handle pong response
                    if (data.action === 'pong') {
                        return;
                    }

                    // Call the message callback using ref
                    if (messageCallbackRef.current) {
                        messageCallbackRef.current(data);
                    }
                } catch (error) {
                    console.error('Error parsing WebSocket message:', error);
                    setLastError(error);
                }
            };

            ws.onerror = (error) => {
                console.error('WebSocket error:', error);
                setConnectionStatus('error');
                setLastError(error);
            };

            ws.onclose = (event) => {
                console.log('WebSocket disconnected', event.code, event.reason);
                setIsConnected(false);
                setConnectionStatus('disconnected');

                // Clear ping interval
                if (pingIntervalRef.current) {
                    clearInterval(pingIntervalRef.current);
                    pingIntervalRef.current = null;
                }

                // Attempt to reconnect if not a normal closure
                setReconnectAttempts((prev) => {
                    const nextAttempt = prev + 1;
                    if (event.code !== 1000 && nextAttempt < maxReconnectAttempts) {
                        const delay = reconnectDelay * nextAttempt;
                        console.log(`Attempting to reconnect in ${delay}ms (attempt ${nextAttempt}/${maxReconnectAttempts})`);
                        
                        reconnectTimeoutRef.current = setTimeout(() => {
                            connect();
                        }, delay);
                        return nextAttempt;
                    } else if (nextAttempt >= maxReconnectAttempts) {
                        const error = new Error('Max reconnection attempts reached');
                        console.error(error.message);
                        setLastError(error);
                        setConnectionStatus('error');
                        return nextAttempt;
                    }
                    return prev;
                });
            };
        } catch (error) {
            console.error('Error creating WebSocket connection:', error);
            setConnectionStatus('error');
            setIsConnected(false);
            setLastError(error);
        }
    }, [url, getUserId]); // Removed sendMessage dependency to avoid stale closures

    // Disconnect from WebSocket
    const disconnect = useCallback(() => {
        // Clear reconnect timeout
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
        }

        // Clear ping interval
        if (pingIntervalRef.current) {
            clearInterval(pingIntervalRef.current);
            pingIntervalRef.current = null;
        }

        // Close WebSocket connection
        if (wsRef.current) {
            wsRef.current.onclose = null; // Prevent reconnection
            wsRef.current.close(1000, 'Client disconnect');
            wsRef.current = null;
        }

        setIsConnected(false);
        setConnectionStatus('disconnected');
        subscriptionsRef.current.clear();
    }, []);

    // Set message callback using ref pattern
    const setMessageCallback = useCallback((callback) => {
        messageCallbackRef.current = callback;
    }, []);

    // Connect on mount if URL is provided, or allow lazy connection
    useEffect(() => {
        if (url) {
            connect();
        }

        return () => {
            disconnect();
        };
    }, [url, connect, disconnect]); // Only reconnect if URL changes

    return {
        isConnected,
        connectionStatus,
        lastError,
        reconnectAttempts,
        connect,
        disconnect,
        subscribe,
        unsubscribe,
        sendMessage,
        setMessageCallback,
    };
};
