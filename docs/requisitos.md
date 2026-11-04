# Requisitos e rastreabilidade

## Enunciado acadêmico
Fonte lida: PDF fornecido pelo usuário, “Trabalho 02 - Jogo com Comunicação entre processos”,
3 páginas. Disciplina Sistemas Operacionais, professor Maurilio Campano Jr.
O texto admite Java, pede jogo para pelo menos dois usuários, sockets, troca de mensagens,
notação própria, gerenciamento de memória e explicação da exclusão mútua. Trabalho em dupla,
vídeo de gameplay de aproximadamente um minuto e dois arquivos compactados, com e sem executável.
Entrega em formulário da turma até **15/11/2026 às 23h59**; apenas um integrante envia.
A escolha do jogo deve ser registrada na lista da turma, sem repetir outro grupo.
Não foi verificado/preenchido o formulário ou a lista em nome da dupla.

O PDF usa a expressão memória compartilhada e exemplifica variáveis replicadas por mensagens.
O usuário confirmou adicionalmente que o professor exige compartilhamento estrito entre processos.
Por isso foi implementado o espelho NIO e seu monitor em outra JVM, além da sincronização web.
O PDF não define regras específicas de Pife nem exige interface elaborada. React, Tailwind e Java 21
são requisitos do usuário. A apresentação também foi solicitada pelo usuário.

| Requisito | Implementação / evidência |
|---|---|
| Dois usuários | Contextos independentes em `frontend/e2e/game.spec.js` |
| 2 ou 4 usuários (ampliação pedida) | Quatro contextos em `frontend/e2e/four-player.spec.js`; 1/2 baralhos e 9 cartas por pessoa |
| Sockets e notação | `/ws`, STOMP, envelope JSON PIFE/1 |
| Regras no servidor | GameService e MeldValidator, testes JUnit |
| Estado central | Salas em ConcurrentHashMap, snapshots privados |
| Memória compartilhada estrita | SharedMemoryStore + SharedMemoryMonitor; segunda JVM no teste |
| Exclusão mútua | ReentrantLock por sala e FileLock interprocessos |
| Privacidade | Destinos privados; não incluir mão alheia nem tokens no mmap |
| Limpeza | Expiração de salas, memberships, cache limitado e slots reutilizáveis |
| Entrega | Scripts de build/pacote e roteiro em docs/entrega.md |

Não fazem parte: banco, ranking, login permanente ou histórico. Nomes e turma não foram fornecidos.
Em 04/11/2026 foram confirmados jogo individual para quatro (sem duplas), continuidade após
desistências e tema azul/coral com fundo claro. Java e IPC foram preservados na preparação do Render.
