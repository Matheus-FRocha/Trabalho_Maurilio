# Protocolo PIFE/1

REST: `POST /api/session` retorna `{playerId, token}` aleatórios; `GET /api/health` retorna status.
Token secreto de 256 bits, mantido apenas em sessionStorage; não publicar ou colocá-lo na URL.
Endpoint `/ws`, STOMP 1.2, CONNECT com header `Authorization: Bearer <token>`.
Assinar somente `/user/queue/events`; publicar somente `/app/game`. Outros destinos são recusados.
Somente o socket mais recente do token pode enviar ações. A desconexão do anterior não derruba o novo.

Envelope JSON enviado pelo cliente (notação própria construída sobre STOMP):

```json
{"type":"DRAW_CARD","roomId":"A3F109","messageId":"uuid-unico","version":3,"payload":{"source":"DECK"}}
```

`version` é a revisão esperada da sala, não a versão do protocolo; PIFE/1 é a versão documental do
contrato. `messageId` deve ser não vazio e ter no máximo 80 caracteres. Frontend usa UUID.
Criação, entrada e sincronização não exigem versão; demais comandos precisam da versão exata.
Campos desconhecidos são rejeitados por Jackson. Payload contém apenas strings.

| type | payload | Regra |
|---|---|---|
| CREATE_ROOM | name (1..24 caracteres) | Cria sala, criador é anfitrião |
| JOIN_ROOM | name | roomId obrigatório, sala esperando e com vaga |
| START_GAME | {} | Apenas anfitrião, dois conectados |
| DRAW_CARD | source: DECK ou DISCARD | Na vez e fase DRAW |
| DISCARD_CARD | cardId: ex. H7 | Na vez e fase DISCARD; deve possuir carta |
| SYNC_ROOM | {} | Apenas membro; restaura presença e snapshot |
| LEAVE_ROOM | {} | Encerra por abandono; oponente vence se existir |

Cartas: `C` paus, `D` ouros, `H` copas, `S` espadas; rank 1..13. ID é naipe+rank.
Exemplo: `{ "id":"H7", "rank":7, "suit":"H" }`.

Resposta: `type, messageId, roomId, version, state, code, message`.
`GAME_STATE_UPDATED` contém o estado privado do destinatário. `GAME_FINISHED` contém o mesmo estado,
mais winnerId/reason. `GAME_ERROR` contém code/message e state nulo. A versão do erro é 0 e não substitui
o estado; o cliente sincroniza ao receber STALE_STATE. Mudança de turno está em `state.turnPlayerId`.
Não há evento TURN_CHANGED separado: o snapshot atômico evita desencontro entre turno e cartas.

Estado: roomId, version, status (WAITING/PLAYING/FINISHED), hostId, turnPlayerId,
phase (DRAW/DISCARD), players (id/name/cardCount/connected), hand (somente sua mão),
discardTop, deckCount, winnerId e reason (MELDS/DECK_EMPTY/ABANDONMENT).

Erros de domínio incluem NOT_YOUR_TURN, WRONG_PHASE, STALE_STATE, NOT_MEMBER, ROOM_NOT_FOUND,
ROOM_FULL, HOST_ONLY, CARD_NOT_OWNED, EMPTY_DISCARD e PAUSED. CONNECT inválido e destino proibido geram
erro STOMP e fechamento da conexão. Erros de JSON podem gerar erro de conversão do transporte;
não devem ser interpretados como jogadas aceitas. Após timeout o cliente orienta sincronizar.

Últimos 128 messageIds de ações, associados ao jogador, são retidos por sala. Repetição retorna
snapshot atual sem reaplicar. Fora da janela, a versão antiga impede reexecução. CREATE_ROOM é
idempotente para o mesmo messageId enquanto a membership da sala estiver ativa; JOIN é idempotente
para um membro existente. O cliente não reenvia automaticamente comandos incertos após reconectar.
