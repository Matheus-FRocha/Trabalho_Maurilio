import { afterEach, describe, it, expect } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { Table } from "./Table";
import { Result } from "../components/Result";

afterEach(cleanup);
function game(
  reason,
  winnerId = null,
  players = [{ id: "a", name: "Ana", connected: false, cardCount: 0 }],
) {
  return {
    playerId: "a",
    status: "online",
    pending: null,
    reset() {},
    send() {},
    view: {
      status: "FINISHED",
      reason,
      winnerId,
      roomId: "ABC123",
      phase: "DRAW",
      hand: [],
      players,
      deckCount: 0,
      discardTop: null,
    },
  };
}
describe("game result", () => {
  it("allows a departing four-player participant to leave while others continue", () => {
    const value = game(null, null, [
      { id: "a", name: "Ana", connected: false, active: false, cardCount: 0 },
    ]);
    value.view.status = "PLAYING";
    value.view.maxPlayers = 4;
    render(<Result game={value} />);
    expect(
      screen.getByRole("heading", { name: "Você saiu da partida" }),
    ).toBeVisible();
    expect(
      screen.getByText(
        "Os outros jogadores continuam na mesa. Você pode iniciar outra partida.",
      ),
    ).toBeVisible();
  });
  it("shows cancellation instead of a draw when leaving before start", () => {
    render(<Table game={game("CANCELLED")} />);
    expect(
      screen.getByRole("heading", { name: "Sala encerrada" }),
    ).toBeVisible();
    expect(
      screen.queryByRole("heading", { name: "Deu empate." }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("O monte de compra chegou ao fim."),
    ).not.toBeInTheDocument();
  });
  it("only displays a draw for an exhausted deck", () => {
    render(<Table game={game("DECK_EMPTY")} />);
    expect(screen.getByRole("heading", { name: "Deu empate." })).toBeVisible();
  });
  it("does not infer a draw from an unspecified result without a winner", () => {
    render(<Table game={game(null)} />);
    expect(
      screen.getByRole("heading", { name: "Partida encerrada" }),
    ).toBeVisible();
    expect(
      screen.queryByText("O monte de compra chegou ao fim."),
    ).not.toBeInTheDocument();
  });
  it("names the winning opponent when the player abandons an active game", () => {
    const players = [
      { id: "a", name: "Ana", connected: false, cardCount: 9 },
      { id: "b", name: "Beto", connected: true, cardCount: 9 },
    ];
    render(<Table game={game("ABANDONMENT", "b", players)} />);
    expect(
      screen.getByText("Você saiu da partida. Beto venceu por abandono."),
    ).toBeVisible();
  });
});
