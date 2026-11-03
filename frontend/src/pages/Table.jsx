import { useState } from 'react'
import { Card } from '../components/Card'
import { Rules } from '../components/Rules'
import { sortCards } from '../utils/gameState'
export function Table({ game }) {
  const state = game.view, [selected, setSelected] = useState(null), [sorted, setSorted] = useState(false)
  const own = state.players.find(p => p.id === game.playerId), other = state.players.find(p => p.id !== game.playerId)
  const mine = state.turnPlayerId === game.playerId, finished = state.status === 'FINISHED'
  const paused = state.players.some(p => !p.connected), locked = game.status !== 'online' || !!game.pending || finished || paused
  const canDraw = !locked && mine && state.phase === 'DRAW', canDiscard = !locked && mine && state.phase === 'DISCARD'
  const hand = sorted ? sortCards(state.hand) : state.hand
  const winner = state.players.find(p => p.id === state.winnerId)
  const hint = finished ? 'A mesa guarda uma boa história.' : paused ? 'Aguardando reconexão do adversário…' : !mine ? `Vez de ${other?.name}. Planeje sua próxima jogada.` : state.phase === 'DRAW' ? 'Sua vez. Compre uma carta para começar.' : 'Escolha uma carta da sua mão e descarte.'
  return <main className="table-page">
    <div className="table-heading"><div><div className="eyebrow">SALA <span data-testid="room-code">{state.roomId}</span></div><h1>Vamos às cartas.</h1></div><button className="text-button" disabled={!!game.pending || game.status !== 'online' || finished} onClick={() => game.send('LEAVE_ROOM')}>Sair da partida ↗</button></div>
    <div className={`turn-banner ${mine && !finished ? 'your-turn' : ''}`} role="status"><span className="turn-dot"/>{hint}<span className="turn-step">{finished ? 'FINALIZADA' : mine ? (state.phase === 'DRAW' ? '01 / COMPRAR' : '02 / DESCARTAR') : 'AGUARDE'}</span></div>
    <section className="game-felt" aria-label="Mesa de jogo">
      <div className="opponent"><div className="player-label"><span className="avatar small">{other?.name.slice(0, 1).toUpperCase()}</span><strong>{other?.name}</strong><span>{other?.cardCount || 0} cartas · {other?.connected ? 'conectado' : 'ausente'}</span>{!mine && !finished && <small>JOGANDO</small>}</div><div className="opponent-cards" aria-label={`${other?.cardCount || 0} cartas do adversário`}>{Array.from({ length: other?.cardCount || 0 }, (_, i) => <Card back key={i}/>)}</div></div>
      <div className="felt-watermark" aria-hidden="true">P<span>♠</span>FE</div>
      <div className="piles"><div className="pile"><span className="pile-label">MONTE</span><Card back/><button className="pile-action" disabled={!canDraw || state.deckCount === 0} onClick={() => game.send('DRAW_CARD', { source: 'DECK' })} aria-label="Comprar do monte">Comprar <span>↙</span></button><small>{state.deckCount} cartas restantes</small></div><span className="pile-divider"/><div className="pile"><span className="pile-label">DESCARTE</span><Card card={state.discardTop}/><button className="pile-action" disabled={!canDraw || !state.discardTop} onClick={() => game.send('DRAW_CARD', { source: 'DISCARD' })} aria-label="Comprar do descarte">Pegar carta <span>↙</span></button><small>Última carta descartada</small></div></div>
      <div className="own-label"><span className="avatar small">{own?.name.slice(0, 1).toUpperCase()}</span><strong>{own?.name} <small>VOCÊ</small></strong></div>
      {finished && <div className="result-overlay"><div className="result-box"><span className="result-symbol">{state.winnerId === game.playerId ? '♛' : '♠'}</span><div className="panel-kicker">FIM DE PARTIDA</div><h2>{state.winnerId === game.playerId ? 'Você venceu!' : state.winnerId ? 'Partida encerrada' : 'Deu empate.'}</h2><p>{state.reason === 'MELDS' ? `${winner?.name} fechou os três jogos.` : state.reason === 'ABANDONMENT' ? 'A partida terminou por saída de um jogador.' : 'O monte de compra chegou ao fim.'}</p><button className="button button-gold" onClick={game.reset}>Voltar ao início <span>↗</span></button></div></div>}
    </section>
    <section className="hand-section" aria-label="Sua mão"><div className="hand-heading"><div><span className="eyebrow">SUA MÃO</span><span>{state.hand.length} cartas</span></div><button className="text-button" onClick={() => setSorted(!sorted)}>{sorted ? 'Ordem de compra' : 'Organizar por naipe'} ↔</button></div><div className="hand-cards">{hand.map(card => <Card key={card.id} card={card} selected={selected === card.id} onClick={() => setSelected(selected === card.id ? null : card.id)} disabled={!canDiscard} testId="hand-card"/>)}</div><div className="hand-actions"><p>{canDiscard ? 'Selecione uma carta para devolver à mesa.' : 'Três combinações. Nove cartas. Uma vitória.'}</p><button className="button button-gold" disabled={!canDiscard || !state.hand.some(c => c.id === selected)} onClick={() => { game.send('DISCARD_CARD', { cardId: selected }); setSelected(null) }}>Descartar selecionada <span>↑</span></button></div></section><Rules/>
  </main>
}
