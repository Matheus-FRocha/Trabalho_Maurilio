import { useState } from "react";
import { Card } from "../components/Card";
import { Rules } from "../components/Rules";
export function Home({ game }) {
  const [mode, setMode] = useState("create"),
    [name, setName] = useState(""),
    [code, setCode] = useState(""),
    [maxPlayers, setMaxPlayers] = useState("2");
  const activeRoom =
    game.view &&
    game.view.status !== "FINISHED" &&
    game.view.players.some(
      (player) => player.id === game.playerId && player.active !== false,
    );
  function submit(event) {
    event.preventDefault();
    game.send(
      mode === "create" ? "CREATE_ROOM" : "JOIN_ROOM",
      { name: name.trim(), ...(mode === "create" ? { maxPlayers } : {}) },
      mode === "join" ? code.trim().toUpperCase() : null,
    );
  }
  return (
    <>
      <main className="home-grid">
        <section className="hero">
          <div className="eyebrow">
            <span className="tiny-line" /> UM CLÁSSICO, UMA NOVA MESA
          </div>
          <h1>
            Boa companhia.
            <br />
            Boas cartas.
            <br />
            <em>O próximo jogo é seu.</em>
          </h1>
          <p className="hero-description">
            Chame alguém, puxe uma cadeira e jogue Pife.
            <br className="desktop-break" /> O baralho é clássico. O encontro é
            em tempo real.
          </p>
          <div className="hero-cards" aria-hidden="true">
            <Card card={{ rank: 1, suit: "S" }} />
            <Card card={{ rank: 1, suit: "H" }} />
            <Card card={{ rank: 1, suit: "C" }} />
            <span className="card-orbit">
              Feito para
              <br />
              <strong>2 ou 4.</strong>
            </span>
          </div>
          <div className="hero-note">
            <span>↗</span> Sem cadastro. Só a sua turma e as cartas.
          </div>
        </section>
        <section className="join-panel">
          <div className="panel-kicker">RESERVE SEU LUGAR</div>
          <h2>A mesa está pronta.</h2>
          <p>Uma boa partida começa com um convite.</p>
          {activeRoom ? (
            <div className="resume-panel">
              <span className="panel-kicker">VOCÊ TEM UMA MESA ABERTA</span>
              <strong className="resume-code">{game.view.roomId}</strong>
              <p>
                Sua{" "}
                {game.view.status === "WAITING" ? "sala de espera" : "partida"}{" "}
                continua. Voltar ao início não é desistir.
              </p>
              <button
                className="button button-gold w-full"
                onClick={game.resume}
              >
                Retomar mesa <span aria-hidden="true">↗</span>
              </button>
              <button
                className="text-button"
                disabled={game.status !== "online" || !!game.pending}
                onClick={() => game.send("LEAVE_ROOM")}
              >
                {game.view.status === "WAITING"
                  ? "Sair da sala"
                  : "Desistir da partida"}
              </button>
            </div>
          ) : (
            <>
              <div className="mode-tabs">
                <button
                  className={mode === "create" ? "active" : ""}
                  onClick={() => setMode("create")}
                >
                  Criar partida
                </button>
                <button
                  className={mode === "join" ? "active" : ""}
                  onClick={() => setMode("join")}
                >
                  Entrar com código
                </button>
              </div>
              <form onSubmit={submit}>
                <label htmlFor="name">Seu nome</label>
                <input
                  id="name"
                  autoComplete="nickname"
                  maxLength={24}
                  required
                  placeholder="Como podemos te chamar?"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                {mode === "create" && (
                  <fieldset className="capacity-picker">
                    <legend>Jogadores</legend>
                    {["2", "4"].map((value) => (
                      <label
                        key={value}
                        className={
                          maxPlayers === value
                            ? "capacity-option selected"
                            : "capacity-option"
                        }
                      >
                        <input
                          type="radio"
                          name="maxPlayers"
                          aria-label={`${value} jogadores`}
                          value={value}
                          checked={maxPlayers === value}
                          onChange={() => setMaxPlayers(value)}
                        />
                        <span>
                          <strong>{value} jogadores</strong>
                          <small>
                            {value === "2" ? "1 baralho" : "2 baralhos"}
                          </small>
                        </span>
                      </label>
                    ))}
                  </fieldset>
                )}
                {mode === "join" && (
                  <>
                    <label htmlFor="code">Código da sala</label>
                    <input
                      id="code"
                      maxLength={6}
                      minLength={6}
                      required
                      placeholder="Ex.: A3F109"
                      className="code-input"
                      value={code}
                      onChange={(e) => setCode(e.target.value.toUpperCase())}
                    />
                  </>
                )}
                <button
                  className="button button-gold w-full"
                  disabled={game.status !== "online" || !!game.pending}
                >
                  {game.pending
                    ? "Preparando sua mesa…"
                    : mode === "create"
                      ? "Criar uma mesa"
                      : "Entrar na mesa"}
                  <span aria-hidden="true">↗</span>
                </button>
              </form>
              <div className="panel-foot">
                <span>♧</span>
                <p>
                  {mode === "create"
                    ? "Crie uma sala e compartilhe o código com quem vai jogar com você."
                    : "Peça o código de seis caracteres para quem criou a sala."}
                </p>
              </div>
            </>
          )}
        </section>
      </main>
      <section className="home-bottom">
        <div>
          <span className="feature-icon">♠</span>
          <strong>O Pife que você conhece</strong>
          <p>Trincas, sequências e uma boa estratégia.</p>
        </div>
        <div>
          <span className="feature-icon">↔</span>
          <strong>Perto, mesmo de longe</strong>
          <p>Dois ou quatro jogadores. A mesma mesa. Ao vivo.</p>
        </div>
        <div>
          <span className="feature-icon">◎</span>
          <strong>Simples de começar</strong>
          <p>Compartilhe um código e dê as cartas.</p>
        </div>
      </section>
      <Rules />
    </>
  );
}
