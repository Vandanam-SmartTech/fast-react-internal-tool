import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { getConfig } from "../config";

let stompClient: Client | null = null;
let isConnecting = false;
let connectionPromise: Promise<Client> | null = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 3;

export const connectCustomerSocket = (
  onEvent: (event: string) => void
): Promise<Client> => {
  // Return existing connection
  if (stompClient?.connected) {
    return Promise.resolve(stompClient);
  }

  // Return pending connection
  if (isConnecting && connectionPromise) {
    return connectionPromise;
  }

  // Stop trying after max attempts
  if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
    return Promise.reject(new Error('WebSocket connection unavailable'));
  }

  // Create new connection
  isConnecting = true;
  reconnectAttempts++;
  const { VITE_CRS_API } = getConfig();

  connectionPromise = new Promise((resolve, reject) => {
    stompClient = new Client({
      webSocketFactory: () => new SockJS(`${VITE_CRS_API}/ws`),
      reconnectDelay: 5000,
      debug: () => {}, // Disable debug logging
      onConnect: () => {
        isConnecting = false;
        reconnectAttempts = 0;
        stompClient?.subscribe("/topic/customer-notification", (msg) => {
          onEvent(msg.body);
        });
        resolve(stompClient!);
      },
      onStompError: (error) => {
        isConnecting = false;
        connectionPromise = null;
        // Silently fail - WebSocket is optional
        reject(error);
      },
      onWebSocketError: (error) => {
        isConnecting = false;
        connectionPromise = null;
        // Silently fail - WebSocket is optional
        reject(error);
      }
    });

    stompClient.activate();
  });

  return connectionPromise;
};

export const disconnectCustomerSocket = () => {
  if (stompClient) {
    stompClient.deactivate();
    stompClient = null;
    isConnecting = false;
    connectionPromise = null;
  }
};

export const isConnected = (): boolean => {
  return stompClient?.connected || false;
};
