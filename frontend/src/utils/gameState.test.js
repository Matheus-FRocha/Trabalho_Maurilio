import { describe, it, expect } from "vitest";
import { gameReducer, initialState, sortCards } from "./gameState";
describe("state received from server", () => {
  it("keeps current room when a delayed different-room snapshot arrives", () => {
    const current = {
      ...initialState,
      view: { roomId: "NEW123", version: 1 },
      pending: "new",
    };
    const result = gameReducer(current, {
      type: "EVENT",
      event: {
        messageId: "old",
        state: { roomId: "OLD456", version: 99, status: "FINISHED" },
      },
    });
    expect(result.view.roomId).toBe("NEW123");
    expect(result.pending).toBe("new");
  });
  it("ignores older snapshots and keeps private hand untouched", () => {
    const latest = {
      roomId: "ABC123",
      version: 5,
      hand: [{ id: "H2", suit: "H", rank: 2 }],
    };
    const current = {
      ...initialState,
      view: latest,
      pending: "new-command",
      recovering: true,
    };
    const result = gameReducer(current, {
      type: "EVENT",
      event: {
        messageId: "old-command",
        state: { ...latest, version: 4, hand: [] },
      },
    });
    expect(result.view).toBe(latest);
    expect(result.pending).toBe("new-command");
    expect(result.recovering).toBe(false);
  });
  it("releases matching pending action and displays server rejection", () => {
    const result = gameReducer(
      { ...initialState, pending: "m1" },
      {
        type: "EVENT",
        event: {
          messageId: "m1",
          type: "GAME_ERROR",
          message: "Aguarde sua vez.",
        },
      },
    );
    expect(result.pending).toBeNull();
    expect(result.error).toBe("Aguarde sua vez.");
  });
  it("clears pending action on disconnect and sorts without mutating server hand", () => {
    const hand = [
      { id: "S9", suit: "S", rank: 9 },
      { id: "C1", suit: "C", rank: 1 },
    ];
    expect(sortCards(hand).map((c) => c.id)).toEqual(["C1", "S9"]);
    expect(hand[0].id).toBe("S9");
    expect(
      gameReducer(
        { ...initialState, pending: "m1" },
        { type: "CONNECTION", status: "offline" },
      ).pending,
    ).toBeNull();
  });
});
