# Validação executada

Ambiente: Windows, Temurin JDK 21.0.13 local, Maven 3.9.11 wrapper, Node 24.15.0 e npm 11.12.1.
Atualização: 04/11/2026. Não há Mockito nos testes porque domínio, transporte e IPC são exercitados de verdade.

## Cobertura e evidências
| Suíte | Casos e resultados observados |
|---|---|
| DomainTest (4) | Baralho único, embaralhamento, trincas/sequências, partições, rejeição Q-K-A/duplicatas |
| GameServiceTest (12) | Salas, mãos privadas, fases, turno, versão, repetição, corrida 8 threads, vitória, reconexão, expiração, nova sala, isolamento de sala encerrada, monte esgotado e cancelamento antes do início com um ou dois jogadores |
| SharedMemoryTest (3) | Segunda JVM lendo mmap, snapshots antigos/slots, leitor bloqueado por FileLock de outro processo |
| SessionRegistryTest (2) | Token aleatório, token exigido, socket antigo substituído e desconexão antiga sem efeito |
| SocketSecurityTest (1) | Assinatura alheia e publicação direta no broker recusadas |
| WebSocketIntegrationTest (2) | Servidor HTTP/socket real, dois jogadores, mãos diferentes, erro de turno e compras/descartes; CONNECT inválido |
| FourPlayerTest (8) | 104 IDs físicos, faces duplicadas/trincas, vagas, distribuição privada, quatro turnos, desistência e último participante, nova sala e SYNC antigo |
| PublicOriginIntegrationTest (1) | Origem pública RENDER_EXTERNAL_URL permitida; origem diferente recusada |
| Vitest (10) | Snapshots e pending, ordenação, IDs, cancelamento/empate/abandono e resultado de quem saiu enquanto outros continuam |
| Playwright (7) | Dois ou quatro contextos, turnos, logo sem reload/desistência, retomada/reload, desistentes, nova sala, mobile e cancelamento |

Total Java observado: **33 testes, zero falhas/erros/ignorados**. Frontend: **10 testes** unitários e
**7 testes** de navegador, sem erros de página. ESLint, Prettier e Vite build passaram.
Os sete casos de navegador também passaram contra o frontend servido pelo JAR (PIFE_BASE_URL=8080),
sem Vite. GET / retornou HTTP 200 com assets compilados e /api/health retornou UP.
Na validação da entrega inicial, o ZIP com executável foi extraído em diretório limpo, iniciado
pelo iniciar.cmd na porta 8081, e os três testes então existentes passaram. Monitor.cmd também leu o mmap.
Inspeção dos ZIPs: nenhum arquivo-fonte ausente, nenhuma credencial/runtime/dependência local,
LICENSE idêntico ao original e nenhum .jar/.class/.exe no ZIP apenas de fontes.
O vídeo foi decodificado para conferência: 61,16 segundos, VP9/WebM, 1440x1080, 25 fps, sem áudio.
Os relatórios JUnit são gerados em backend/target/surefire-reports/; traces de falhas em
frontend/test-results/. Essas pastas são ignoradas no Git; a CI reproduz os checks.

Os ciclos iniciais de domínio, salas, IPC e transporte começaram com testes em RED por ausência
de implementação. Testes adicionais de caracterização ampliaram a cobertura na integração.
Na correção de membership após término, a regressão finishedPlayersCanJoinAnotherRoom foi observada
falhando com ALREADY_IN_ROOM e passou após liberar a associação. Vitória por combinações tem fixture
de baralho ordenado injetada apenas no teste; produção embaralha com SecureRandom e não tem endpoint
para manipular baralho ou mãos. Encerramento completo no navegador usa saída voluntária.

## Problemas encontrados e corrigidos
- Windows/JDK 21: Selector.open falhava no TEMP abreviado (8.3). Probe mínima reproduziu; diretório
  temporário canônico local resolveu. env.ps1 aplica ajuste somente aos processos filhos.
- Broker simples não devolve receipts STOMP usados inicialmente pelo teste. Teste passou a aguardar
  a resposta real CREATE_ROOM, com preservação de ordem por sessão; sem sleeps para sincronização.
- Ícone decorativo entrava no nome acessível do botão de entrada. Marcado aria-hidden.
- Membership da sala finalizada bloqueava nova entrada. Corrigido com teste de regressão.
- Revisão independente encontrou entrega de snapshot de sala antiga ao participante em sala nova.
  Teste observou destinatários [a,b] quando deveria ser [b]; corrigido no serviço e com filtro no cliente.
- randomUUID ausente em HTTP de rede local: helper com getRandomValues, teste unitário e teste de
  navegador removendo essa API passaram. Não é teste em outro computador físico.
- Saída sozinho na espera mostrava empate: testes Java observaram ABANDONMENT em vez de CANCELLED;
  React inferia empate de qualquer winnerId nulo. Corrigido para motivo explícito, cancelamento sem
  mesa fictícia e vitória do adversário apenas durante partida iniciada. Cinco Playwright passaram.
- Checkout no Windows convertia CSS/HTML/MJS para CRLF e falhava na formatação. Esses formatos
  passaram a ter LF explícito em .gitattributes; Prettier voltou a passar.
- Logo usava link com reload: teste de navegador observou perda da variável do documento.
  Agora o documento é preservado, a home oferece Retomar mesa e a preferência de página sobrevive
  ao reload da aba. Quatro clientes também exercitam a logo durante uma partida em andamento.
- Mesa de quatro: testes asseguram que desistente não recebe eventos futuros da sala antiga,
  não volta a ficar ativo via SYNC e pode criar outra sala sem interferência. Ás baixo e trincas de
  naipes distintos foram mantidos com cartas físicas repetidas nos dois baralhos.

## Limites
Os testes não comprovam desempenho sob carga ou disponibilidade distribuída. Teste automatizado de
vitória no navegador por combinações não foi feito; a regra é provada no domínio/serviço. O teste real
WebSocket usa baralho aleatório, e o de vitória usa fixture local. Alertas moderados de minimatch
aparecem na cadeia de desenvolvimento do ESLint; npm audit --omit=dev retornou zero vulnerabilidades.
