import { useState } from "react";
import { Card } from "../components/Card";
import { Rules } from "../components/Rules";
export function Room({ game }) {
  const state = game.view,
    [copied, setCopied] = useState(false);
  const host = state.hostId === game.playerId;
  const ready =
    state.players.length === 2 && state.players.every((p) => p.connected);
  const disabled = game.status !== "online" || !!game.pending;
  async function copy() {
    try {
      await navigator.clipboard.writeText(state.roomId);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }
  return (
    <main className="waiting-page">
      <div className="section-heading">
        <div className="eyebrow">SUA MESA PARTICULAR</div>
        <h1>Melhor com companhia.</h1>
        <p>Convide alguém para ocupar o outro lado da mesa.</p>
      </div>
      <section className="waiting-panel">
        <div className="invite-block">
          <span className="panel-kicker">CÓDIGO DA SALA</span>
          <strong data-testid="room-code">{state.roomId}</strong>
          <button onClick={copy} className="text-button">
            {copied ? "Código copiado ✓" : "Copiar convite ↗"}
          </button>
        </div>
        <div className="seat-list">
          {[0, 1].map((index) => {
            const player = state.players[index];
            return (
              <div className={`seat ${player ? "occupied" : ""}`} key={index}>
                <div className="avatar">
                  {player?.name.slice(0, 1).toUpperCase() || "+"}
                </div>
                <strong>{player?.name || "Uma cadeira esperando"}</strong>
                <span>
                  {player
                    ? player.connected
                      ? "Pronto para jogar"
                      : "Reconectando…"
                    : "Compartilhe o código"}
                </span>
                {player?.id === state.hostId && <small>ANFITRIÃO</small>}
              </div>
            );
          })}
        </div>
        <div className="waiting-cards" aria-hidden="true">
          <Card back />
          <Card back />
          <Card back />
        </div>
        {host ? (
          <button
            className="button button-gold"
            disabled={!ready || disabled}
            onClick={() => game.send("START_GAME")}
          >
            Começar partida <span>→</span>
          </button>
        ) : (
          <p className="waiting-message">
            {ready
              ? "Tudo pronto. Aguardando o anfitrião começar…"
              : "Aguardando o outro jogador reconectar…"}
          </p>
        )}
        <button
          className="text-button leave"
          disabled={disabled}
          onClick={() => game.send("LEAVE_ROOM")}
        >
          Sair da sala
        </button>
      </section>
      <Rules />
    </main>
  );
}
