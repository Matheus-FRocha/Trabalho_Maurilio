export const initialState = {
  page: "room",
  view: null,
  status: "connecting",
  error: "",
  pending: null,
  playerId: null,
};
export function gameReducer(state, action) {
  switch (action.type) {
    case "NAVIGATE":
      return { ...state, page: action.page };
    case "IDENTITY":
      return { ...state, playerId: action.playerId };
    case "CONNECTION":
      return { ...state, status: action.status, pending: null };
    case "PENDING":
      return { ...state, pending: action.id, error: "" };
    case "ERROR":
      return { ...state, error: action.message, pending: null };
    case "CLEAR":
      return { ...state, view: null, error: "", pending: null, page: "home" };
    case "EVENT": {
      const event = action.event;
      const pending = event.messageId === state.pending ? null : state.pending;
      if (event.type === "GAME_ERROR")
        return { ...state, pending, error: event.message };
      if (!event.state) return state;
      if (state.view && state.view.roomId !== event.state.roomId) return state;
      if (
        state.view?.roomId === event.state.roomId &&
        state.view.version > event.state.version
      )
        return { ...state, pending };
      return { ...state, pending, view: event.state, error: "" };
    }
    default:
      return state;
  }
}
export function sortCards(hand) {
  return [...hand].sort(
    (a, b) =>
      "CDHS".indexOf(a.suit) - "CDHS".indexOf(b.suit) || a.rank - b.rank,
  );
}
