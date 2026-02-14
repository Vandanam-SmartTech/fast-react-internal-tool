import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { getConfig } from "../config";

let stompClient: Client | null = null;
let isConnecting = false;
let connectionPromise: Promise<Client> | null = null;

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

  // Create new connection
  isConnecting = true;
  const { VITE_CRS_API } = getConfig();

  connectionPromise = new Promise((resolve, reject) => {
    stompClient = new Client({
      webSocketFactory: () => new SockJS(`${VITE_CRS_API}/ws`),
      reconnectDelay: 5000,
      onConnect: () => {
        isConnecting = false;
        stompClient?.subscribe("/topic/customer-notification", (msg) => {
          onEvent(msg.body);
        });
        resolve(stompClient!);
      },
      onStompError: (error) => {
        isConnecting = false;
        connectionPromise = null;
        reject(error);
      },
      onWebSocketError: (error) => {
        isConnecting = false;
        connectionPromise = null;
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
