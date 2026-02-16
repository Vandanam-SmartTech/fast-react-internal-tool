import { connectCustomerSocket, disconnectCustomerSocket } from '../services/websocket';

/**
 * Safely connect to WebSocket with error handling
 * WebSocket is optional - failures are silently handled
 */
export const safeConnectWebSocket = (onEvent: (event: string) => void): (() => void) => {
  connectCustomerSocket(onEvent).catch(() => {
    // Silently handle WebSocket connection failures
    // The service is optional and app works without it
  });

  return () => {
    try {
      disconnectCustomerSocket();
    } catch {
      // Ignore disconnect errors
    }
  };
};
