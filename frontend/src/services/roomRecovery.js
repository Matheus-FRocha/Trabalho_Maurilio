// Retry only synchronization, never a draw/discard whose outcome could be uncertain.
export function createRoomRecovery({
  send,
  onTimeout,
  delay = 1500,
  maxAttempts = 3,
}) {
  let timer = null,
    activeRoom = null,
    attempts = 0;
  function stop() {
    clearTimeout(timer);
    timer = null;
    activeRoom = null;
  }
  function attempt() {
    if (!activeRoom) return;
    send(activeRoom);
    attempts++;
    timer = setTimeout(() => {
      if (attempts < maxAttempts) attempt();
      else {
        stop();
        onTimeout();
      }
    }, delay);
  }
  return {
    start(roomId) {
      stop();
      activeRoom = roomId;
      attempts = 0;
      attempt();
    },
    ack(roomId) {
      if (roomId === activeRoom) stop();
    },
    stop,
  };
}
