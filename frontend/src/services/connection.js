import { Client } from "@stomp/stompjs";
export async function credentials() {
  const saved = sessionStorage.getItem("pife.credentials");
  if (saved) {
    try {
      const value = JSON.parse(saved);
      if (value.token && value.playerId) return value;
    } catch {
      /* Replace corrupt local session. */
    }
  }
  const response = await fetch("/api/session", { method: "POST" });
  if (!response.ok)
    throw new Error(
      "Não foi possível iniciar a sessão. Confira o servidor e tente novamente.",
    );
  const value = await response.json();
  sessionStorage.setItem("pife.credentials", JSON.stringify(value));
  return value;
}
export function connectSession(identity, callbacks) {
  const url = new URL("/ws", location.href);
  url.protocol = location.protocol === "https:" ? "wss:" : "ws:";
  const client = new Client({
    brokerURL: url.href,
    connectHeaders: { Authorization: `Bearer ${identity.token}` },
    reconnectDelay: 1500,
    connectionTimeout: 8000,
    heartbeatIncoming: 0,
    heartbeatOutgoing: 10000,
    onConnect() {
      client.subscribe("/user/queue/events", (message) => {
        try {
          callbacks.event(JSON.parse(message.body));
        } catch {
          callbacks.error("Resposta inválida do servidor.");
        }
      });
      callbacks.connected();
    },
    onWebSocketClose: () => callbacks.offline(),
    onStompError: () => {
      callbacks.error("Sessão recusada pelo servidor. Reinicie a conexão.");
      callbacks.offline();
    },
  });
  client.activate();
  return client;
}
