import { useEffect, useReducer, useRef, useCallback } from "react";
import { credentials, connectSession } from "../services/connection";
import { gameReducer, initialState } from "../utils/gameState";
import { messageId as newMessageId } from "../utils/messageId";
import { createRoomRecovery } from "../services/roomRecovery";
export function useGame() {
  const [state, dispatch] = useReducer(gameReducer, {
    ...initialState,
    page: sessionStorage.getItem("pife.page") || "room",
    recovering: !!sessionStorage.getItem("pife.room"),
  });
  const navigate = useCallback((page) => {
    sessionStorage.setItem("pife.page", page);
    dispatch({ type: "NAVIGATE", page });
  }, []);
  const current = useRef(state),
    socket = useRef(null),
    timer = useRef(null),
    pendingId = useRef(null),
    roomRequests = useRef(new Set()),
    syncRoom = useRef(null),
    stopRecovery = useRef(null);
  const room = useRef(sessionStorage.getItem("pife.room"));
  useEffect(() => {
    current.current = state;
  }, [state]);
  const send = useCallback(
    (type, payload = {}, roomId = current.current.view?.roomId) => {
      if (!socket.current?.connected || pendingId.current) return;
      const messageId = newMessageId();
      if (!room.current && (type === "CREATE_ROOM" || type === "JOIN_ROOM"))
        roomRequests.current.add(messageId);
      pendingId.current = messageId;
      dispatch({ type: "PENDING", id: messageId });
      socket.current.publish({
        destination: "/app/game",
        body: JSON.stringify({
          type,
          roomId,
          messageId,
          version: current.current.view?.version ?? null,
          payload,
        }),
      });
      clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        pendingId.current = null;
        dispatch({
          type: "ERROR",
          message: "Sem resposta. Sincronize a sala antes de tentar novamente.",
        });
      }, 8000);
    },
    [],
  );
  useEffect(() => {
    let alive = true,
      client;
    const recovery = createRoomRecovery({
      send(roomId) {
        if (!alive || !client?.connected) return;
        client.publish({
          destination: "/app/game",
          body: JSON.stringify({
            type: "SYNC_ROOM",
            roomId,
            messageId: newMessageId(),
            payload: {},
          }),
        });
      },
      onTimeout() {
        if (alive)
          dispatch({
            type: "ERROR",
            message:
              "Não foi possível recuperar a sala. Tente sincronizar novamente.",
          });
      },
    });
    syncRoom.current = () => {
      if (!alive || !client?.connected || !room.current) return;
      dispatch({ type: "RECOVERY" });
      recovery.start(room.current);
    };
    stopRecovery.current = recovery.stop;
    credentials()
      .then((identity) => {
        if (!alive) return;
        dispatch({ type: "IDENTITY", playerId: identity.playerId });
        client = connectSession(identity, {
          connected() {
            if (!alive) return;
            dispatch({ type: "CONNECTION", status: "online" });
            if (room.current) syncRoom.current();
          },
          offline() {
            recovery.stop();
            pendingId.current = null;
            clearTimeout(timer.current);
            if (alive) dispatch({ type: "CONNECTION", status: "offline" });
          },
          error(message) {
            if (alive) dispatch({ type: "ERROR", message });
          },
          event(event) {
            if (!alive) return;
            if (event.roomId && room.current && event.roomId !== room.current)
              return;
            if (
              event.roomId &&
              !room.current &&
              !roomRequests.current.has(event.messageId)
            )
              return;
            if (event.state) {
              roomRequests.current.clear();
              recovery.ack(event.roomId);
              if (!room.current) navigate("room");
              room.current = event.roomId;
              sessionStorage.setItem("pife.room", event.roomId);
            }
            if (event.type === "GAME_ERROR")
              roomRequests.current.delete(event.messageId);
            if (
              event.code === "ROOM_NOT_FOUND" ||
              event.code === "NOT_MEMBER"
            ) {
              recovery.stop();
              room.current = null;
              sessionStorage.removeItem("pife.room");
              dispatch({ type: "CLEAR" });
            }
            if (event.messageId === pendingId.current) {
              clearTimeout(timer.current);
              pendingId.current = null;
            }
            dispatch({ type: "EVENT", event });
            if (event.code === "STALE_STATE") syncRoom.current();
          },
        });
        socket.current = client;
      })
      .catch((error) => {
        if (alive) {
          dispatch({ type: "ERROR", message: error.message });
          dispatch({ type: "CONNECTION", status: "offline" });
        }
      });
    return () => {
      alive = false;
      recovery.stop();
      syncRoom.current = null;
      clearTimeout(timer.current);
      client?.deactivate();
    };
  }, [navigate]);
  function reset() {
    stopRecovery.current?.();
    pendingId.current = null;
    roomRequests.current.clear();
    clearTimeout(timer.current);
    room.current = null;
    sessionStorage.removeItem("pife.room");
    navigate("home");
    dispatch({ type: "CLEAR" });
  }
  function goHome() {
    const view = current.current.view;
    const me = view?.players.find(
      (player) => player.id === current.current.playerId,
    );
    if (view?.status === "FINISHED" || me?.active === false) reset();
    else navigate("home");
  }
  function restart() {
    sessionStorage.removeItem("pife.credentials");
    sessionStorage.removeItem("pife.room");
    location.reload();
  }
  return {
    ...state,
    send,
    reset,
    restart,
    goHome,
    resume: () => navigate("room"),
    sync: () => syncRoom.current?.(),
    hasRoom: state.recovering || !!state.view,
  };
}
