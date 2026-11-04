export function Result({ game }) {
  const state = game.view;
  const winner = state.players.find((player) => player.id === state.winnerId);
  const opponent = state.players.find((player) => player.id !== game.playerId);
  const won = !!state.winnerId && state.winnerId === game.playerId;
  const cancelled = state.reason === "CANCELLED";
  const draw = state.reason === "DECK_EMPTY";
  const title = cancelled
    ? "Sala encerrada"
    : draw
      ? "Deu empate."
      : won
        ? "Você venceu!"
        : "Partida encerrada";
  let message = "A partida foi encerrada.";
  if (cancelled)
    message =
      "A partida não chegou a começar. Nenhuma vitória ou empate foi registrado.";
  else if (draw) message = "O monte de compra chegou ao fim.";
  else if (state.reason === "MELDS")
    message = `${winner?.name || "O vencedor"} fechou os três jogos.`;
  else if (state.reason === "ABANDONMENT" && winner)
    message = won
      ? `${opponent?.name || "O adversário"} saiu da partida. Você venceu por abandono.`
      : `Você saiu da partida. ${winner.name} venceu por abandono.`;
  return (
    <div className="result-box">
      <span className="result-symbol">{won ? "♛" : "♠"}</span>
      <div className="panel-kicker">
        {cancelled ? "SALA CANCELADA" : "FIM DE PARTIDA"}
      </div>
      <h2>{title}</h2>
      <p>{message}</p>
      <button className="button button-gold" onClick={game.reset}>
        Voltar ao início <span aria-hidden="true">↗</span>
      </button>
    </div>
  );
}
