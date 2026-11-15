# Requisitos e rastreabilidade

O projeto foi desenvolvido para o Trabalho 02, **Jogo com Comunicação entre Processos**, da
disciplina de Sistemas Operacionais. O enunciado pede um jogo multiplayer com sockets,
mensagens em notação definida pelo projeto, gerenciamento de memória e exclusão mútua. A
implementação reúne sincronização dos navegadores por mensagens e memória compartilhada
entre processos Java.

| Requisito | Implementação e evidência |
| --- | --- |
| Jogo com pelo menos dois participantes | Mesas para dois ou quatro jogadores. Os testes `game.spec.js` e `four-player.spec.js` simulam conexões independentes. |
| Sockets e notação das mensagens | `/ws` usa STOMP sobre WebSocket com [mensagens JSON PIFE/1](protocolo-de-mensagens.md). |
| Validação das jogadas | `SocketSecurity` autentica a sessão, `GameService` valida participação, vez e fase, e `MeldValidator` verifica as combinações. |
| Estado da partida | O servidor mantém o estado e envia snapshots versionados para cada participante. |
| Memória compartilhada entre processos | `SharedMemoryStore` e `SharedMemoryMonitor` usam uma [região de arquivo mapeada com Java NIO](gerenciamento-de-memoria.md). O teste inicia uma segunda JVM. |
| Exclusão mútua | `ReentrantLock` por sala e `FileLock` na região mapeada. [Escopo dos locks](exclusao-mutua.md) |
| Privacidade das mãos | Cada jogador recebe a própria mão. O espelho compartilhado contém dados públicos da sala. |
| Código e executável | Os scripts de empacotamento geram ZIPs com e sem JAR. [Execução dos pacotes](entrega.md) |
