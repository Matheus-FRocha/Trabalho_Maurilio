import { useEffect, useReducer, useRef, useCallback } from 'react'
import { credentials, connectSession } from '../services/connection'
import { gameReducer, initialState } from '../utils/gameState'
export function useGame() {
  const [state, dispatch] = useReducer(gameReducer, initialState)
  const current = useRef(state), socket = useRef(null), timer = useRef(null)
  const room = useRef(sessionStorage.getItem('pife.room'))
  useEffect(() => { current.current = state }, [state])
  const send = useCallback((type, payload = {}, roomId = current.current.view?.roomId) => {
    if (!socket.current?.connected || current.current.pending) return
    const messageId = crypto.randomUUID()
    dispatch({ type: 'PENDING', id: messageId })
    socket.current.publish({ destination: '/app/game', body: JSON.stringify({ type, roomId, messageId, version: current.current.view?.version ?? null, payload }) })
    clearTimeout(timer.current)
    timer.current = setTimeout(() => dispatch({ type: 'ERROR', message: 'Sem resposta. Sincronize a sala antes de tentar novamente.' }), 8000)
  }, [])
  useEffect(() => {
    let alive = true, client
    credentials().then(identity => {
      if (!alive) return
      dispatch({ type: 'IDENTITY', playerId: identity.playerId })
      client = connectSession(identity, {
        connected() {
          if (!alive) return
          dispatch({ type: 'CONNECTION', status: 'online' })
          if (room.current) client.publish({ destination: '/app/game', body: JSON.stringify({ type: 'SYNC_ROOM', roomId: room.current, messageId: crypto.randomUUID(), payload: {} }) })
        },
        offline() { if (alive) dispatch({ type: 'CONNECTION', status: 'offline' }) },
        error(message) { if (alive) dispatch({ type: 'ERROR', message }) },
        event(event) {
          if (!alive) return
          if (event.state) { room.current = event.roomId; sessionStorage.setItem('pife.room', event.roomId) }
          if (event.code === 'ROOM_NOT_FOUND') { room.current = null; sessionStorage.removeItem('pife.room'); dispatch({ type: 'CLEAR' }) }
          if (event.messageId === current.current.pending) clearTimeout(timer.current)
          dispatch({ type: 'EVENT', event })
          if (event.code === 'STALE_STATE') client.publish({ destination: '/app/game', body: JSON.stringify({ type: 'SYNC_ROOM', roomId: room.current, messageId: crypto.randomUUID(), payload: {} }) })
        },
      })
      socket.current = client
    }).catch(error => { if (alive) { dispatch({ type: 'ERROR', message: error.message }); dispatch({ type: 'CONNECTION', status: 'offline' }) } })
    return () => { alive = false; clearTimeout(timer.current); client?.deactivate() }
  }, [])
  function reset() { room.current = null; sessionStorage.removeItem('pife.room'); dispatch({ type: 'CLEAR' }) }
  function restart() { sessionStorage.removeItem('pife.credentials'); sessionStorage.removeItem('pife.room'); location.reload() }
  return { ...state, send, reset, restart }
}
