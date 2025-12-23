import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { getConfig } from "../config";

let stompClient: Client | null = null;

export const connectCustomerSocket = (
  onEvent: (event: string) => void
) => {
  const { VITE_CRS_API } = getConfig();

  stompClient = new Client({
    webSocketFactory: () => new SockJS(`${VITE_CRS_API}/ws`),
    reconnectDelay: 5000,
    onConnect: () => {
      stompClient?.subscribe("/topic/customer-notification", (msg) => {
        onEvent(msg.body); // ✅ just pass event
      });
    },
  });

  stompClient.activate();
};

export const disconnectCustomerSocket = () => {
  stompClient?.deactivate();
};
