import { useGame } from "./hooks/useGame";
import { Home } from "./pages/Home";
import { Room } from "./pages/Room";
import { Table } from "./pages/Table";
export default function App() {
  const game = useGame();
  return (
    <div className="app-shell">
      <header className="site-header">
        <a className="brand" href="/" aria-label="Pife, início">
          <span className="brand-icon">♠</span> pife
          <span className="brand-dot">.</span>
        </a>
        <span className="header-caption">O prazer de uma boa partida.</span>
        <div className={`connection ${game.status}`}>
          <span />
          <span data-testid="connection">
            {game.status === "online"
              ? "Conectado"
              : game.status === "connecting"
                ? "Conectando…"
                : "Reconectando…"}
          </span>
        </div>
      </header>
      {game.error && (
        <div className="error-banner" role="alert">
          <span>{game.error}</span>
          {game.view && (
            <button onClick={() => game.send("SYNC_ROOM")}>
              Sincronizar sala
            </button>
          )}
          {game.status !== "online" && (
            <button onClick={game.restart}>Reiniciar conexão</button>
          )}
        </div>
      )}
      {!game.view ? (
        <Home game={game} />
      ) : game.view.status === "WAITING" ? (
        <Room game={game} />
      ) : (
        <Table game={game} />
      )}
      <footer className="site-footer">
        <span>
          pife.{" "}
          <span className="footer-muted">Um clássico para compartilhar.</span>
        </span>
        <span>
          2 jogadores <b>·</b> Em tempo real <b>·</b> Feito para jogar
        </span>
      </footer>
    </div>
  );
}
