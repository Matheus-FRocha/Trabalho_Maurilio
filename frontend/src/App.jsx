import { useGame } from "./hooks/useGame";
import { Home } from "./pages/Home";
import { Room } from "./pages/Room";
import { Table } from "./pages/Table";
import { Result } from "./components/Result";
export default function App() {
  const game = useGame();
  const own = game.view?.players.find((player) => player.id === game.playerId);
  const terminal = game.view?.status === "FINISHED" || own?.active === false;
  const home = !game.view || (game.page === "home" && !terminal);
  return (
    <div className="app-shell">
      <header className="site-header">
        <a
          className="brand"
          href="/"
          aria-label="Pife, início"
          onClick={(event) => {
            event.preventDefault();
            game.goHome();
          }}
        >
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
          {(game.view || game.hasRoom) && (
            <button onClick={game.sync}>Sincronizar sala</button>
          )}
          {game.status !== "online" && (
            <button onClick={game.restart}>Reiniciar conexão</button>
          )}
        </div>
      )}
      {game.recovering ? (
        <main className="waiting-page">
          <section className="waiting-panel mt-10">
            <div className="result-box">
              <div className="panel-kicker">RETOMANDO A CONEXÃO</div>
              <h2>Recuperando sua mesa…</h2>
              <p>Aguardando o estado atualizado da sua sala.</p>
              <button
                className="button button-gold"
                disabled={game.status !== "online"}
                onClick={game.sync}
              >
                Tentar sincronizar
              </button>
            </div>
          </section>
        </main>
      ) : home ? (
        <Home game={game} />
      ) : game.view.status === "WAITING" ? (
        <Room game={game} />
      ) : (game.view.status === "FINISHED" &&
          game.view.reason === "CANCELLED") ||
        (own?.active === false && game.view.status === "PLAYING") ? (
        <main className="waiting-page">
          <section className="waiting-panel mt-10">
            <Result game={game} />
          </section>
        </main>
      ) : (
        <Table game={game} />
      )}
      <footer className="site-footer">
        <span>
          pife.{" "}
          <span className="footer-muted">Um clássico para compartilhar.</span>
        </span>
        <span>
          2 ou 4 jogadores <b>·</b> Em tempo real <b>·</b> Feito para jogar
        </span>
      </footer>
    </div>
  );
}
