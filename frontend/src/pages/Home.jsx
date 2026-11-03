import { useState } from 'react'
import { Card } from '../components/Card'
import { Rules } from '../components/Rules'
export function Home({ game }) {
  const [mode, setMode] = useState('create'), [name, setName] = useState(''), [code, setCode] = useState('')
  function submit(event) {
    event.preventDefault()
    game.send(mode === 'create' ? 'CREATE_ROOM' : 'JOIN_ROOM', { name: name.trim() }, mode === 'join' ? code.trim().toUpperCase() : null)
  }
  return <>
    <main className="home-grid">
      <section className="hero">
        <div className="eyebrow"><span className="tiny-line"/> UM CLÁSSICO, UMA NOVA MESA</div>
        <h1>Boa companhia.<br/>Boas cartas.<br/><em>Sua próxima partida.</em></h1>
        <p className="hero-description">Chame alguém, puxe uma cadeira e jogue Pife.<br className="desktop-break"/> O baralho é clássico. O encontro é em tempo real.</p>
        <div className="hero-cards" aria-hidden="true"><Card card={{ rank: 1, suit: 'S' }}/><Card card={{ rank: 1, suit: 'H' }}/><Card card={{ rank: 1, suit: 'C' }}/><span className="card-orbit">Feito para<br/><strong>dois.</strong></span></div>
        <div className="hero-note"><span>↗</span> Sem cadastro. Só você, seu parceiro e as cartas.</div>
      </section>
      <section className="join-panel">
        <div className="panel-kicker">RESERVE SEU LUGAR</div><h2>A mesa está pronta.</h2><p>Uma boa partida começa com um convite.</p>
        <div className="mode-tabs"><button className={mode === 'create' ? 'active' : ''} onClick={() => setMode('create')}>Criar partida</button><button className={mode === 'join' ? 'active' : ''} onClick={() => setMode('join')}>Entrar com código</button></div>
        <form onSubmit={submit}>
          <label htmlFor="name">Seu nome</label><input id="name" autoComplete="nickname" maxLength={24} required placeholder="Como podemos te chamar?" value={name} onChange={e => setName(e.target.value)}/>
          {mode === 'join' && <><label htmlFor="code">Código da sala</label><input id="code" maxLength={6} minLength={6} required placeholder="Ex.: A3F109" className="code-input" value={code} onChange={e => setCode(e.target.value.toUpperCase())}/></>}
          <button className="button button-gold w-full" disabled={game.status !== 'online' || !!game.pending}>{game.pending ? 'Preparando sua mesa…' : mode === 'create' ? 'Criar uma mesa' : 'Entrar na mesa'}<span aria-hidden="true">↗</span></button>
        </form>
        <div className="panel-foot"><span>♧</span><p>{mode === 'create' ? 'Crie uma sala e compartilhe o código com quem vai jogar com você.' : 'Peça o código de seis caracteres para quem criou a sala.'}</p></div>
      </section>
    </main>
    <section className="home-bottom"><div><span className="feature-icon">♠</span><strong>O Pife que você conhece</strong><p>Trincas, sequências e uma boa estratégia.</p></div><div><span className="feature-icon">↔</span><strong>Perto, mesmo de longe</strong><p>Dois jogadores. A mesma mesa. Ao vivo.</p></div><div><span className="feature-icon">◎</span><strong>Simples de começar</strong><p>Compartilhe um código e dê as cartas.</p></div></section>
    <Rules/>
  </>
}
