import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

export interface LiveNotification {
  type: "LOGIN" | "REGISTER" | "BOOKING" | "SYSTEM";
  title: string;
  message: string;
  timestamp: string;
}

const WS_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api")
  .replace("/api", "/ws");

export function subscribeToLiveNotifications(onNotification: (n: LiveNotification) => void) {
  const client = new Client({
    webSocketFactory: () => new SockJS(WS_URL),
    debug: (str) => {
      console.log('STOMP Debug:', str);
    },
    reconnectDelay: 5000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
  });

  client.onConnect = () => {
    console.log('Connected to WebSocket');
    client.subscribe("/topic/admin-notifications", (message) => {
      if (message.body) {
        onNotification(JSON.parse(message.body));
      }
    });
  };

  client.onStompError = (frame) => {
    console.error('STOMP error', frame.headers['message']);
  };

  client.activate();

  return () => {
    client.deactivate();
  };
}
