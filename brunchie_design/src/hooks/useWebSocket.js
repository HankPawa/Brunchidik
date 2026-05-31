import { useEffect, useRef, useState } from "react";
import { Client } from "@stomp/stompjs";

/**
 * Connects to a STOMP endpoint via native WebSocket and subscribes to topics.
 * @param {string} wsPath  - Proxy path, e.g. "/ws-pedidos"
 * @param {string[]} topics - STOMP topics to subscribe to
 * @param {(topic: string, data: any) => void} onMessage - Called on each message
 * @returns {boolean} connected state
 */
export const useWebSocket = (wsPath, topics, onMessage) => {
  const onMessageRef = useRef(onMessage);
  useEffect(() => { onMessageRef.current = onMessage; });

  const [connected, setConnected] = useState(false);
  const topicsKey = JSON.stringify(topics);

  useEffect(() => {
    if (!wsPath || !topics || topics.length === 0) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const brokerURL = `${protocol}//${window.location.host}${wsPath}`;

    const client = new Client({
      brokerURL,
      reconnectDelay: 5000,
      onConnect: () => {
        setConnected(true);
        JSON.parse(topicsKey).forEach((topic) => {
          client.subscribe(topic, (frame) => {
            try {
              onMessageRef.current(topic, JSON.parse(frame.body));
            } catch {
              onMessageRef.current(topic, frame.body);
            }
          });
        });
      },
      onDisconnect: () => setConnected(false),
      onStompError: () => setConnected(false),
    });

    client.activate();
    return () => { client.deactivate(); };
  }, [wsPath, topicsKey]);

  return connected;
};
