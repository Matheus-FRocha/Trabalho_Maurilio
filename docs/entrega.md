# Preparação da entrega

## Pacotes
1. Executar scripts/build.ps1 (frontend, lint, testes, Maven verify).
2. Executar backend e `npm run test:e2e` em frontend.
3. Executar scripts/package.ps1. São gerados ZIP de fontes e ZIP das mesmas fontes com JAR e launcher.
4. Extrair o pacote em outra pasta e testar com Java 21. O JDK não é redistribuído; requisito explícito.
5. Não incluir .git, .tools, node_modules, target inteiro, runtime, logs ou tokens.

## Apresentação sugerida (6–8 minutos)
1. Objetivo e variante aprovada: dois jogadores, nove cartas, três jogos, sem curingas.
2. Criar sala e mostrar os dois navegadores; cada um recebe apenas a própria mão.
3. Explicar envelope JSON: type, roomId, messageId, version e payload. Mostrar DRAW_CARD.
4. Mostrar domínio e região crítica no GameService; explicar corrida de duas compras.
5. Diferenciar heap da JVM, cópias do navegador e sockets de memória compartilhada do SO.
6. Rodar o monitor em outro terminal, jogar e ler a nova versão no mesmo arquivo mapeado.
7. Mostrar testes de duas JVMs e FileLock, reconexão, resultado e limitações.

## Vídeo de aproximadamente um minuto
O script frontend/scripts/record-gameplay.mjs automatiza uma partida real em dois contextos e grava
a tela do primeiro jogador, em WebM, sem som. Inspecionar o vídeo antes de usar; a dupla pode gravar
uma narração ou uma partida manual se preferir. Não há mãos fabricadas nem endpoint de teste no servidor.

Roteiro: 0–10s criar e compartilhar sala; 10–18s segundo jogador e início; 18–45s comprar e descartar,
ver a alternância de turno; 45–55s reconectar preservando cartas; 55–60s encerrar e mostrar resultado.
O término por abandono é diferente da vitória por três jogos, que é coberta no teste JUnit.

## Campos do formulário
- Nomes: preencher nomes reais dos dois integrantes.
- Nome do jogo: Pife/Caxeta — variante Pife para dois.
- Explicação: formar três combinações de três cartas após compra e descarte.
- Linguagens: Java 21 (servidor/monitor), JavaScript (React).
- Comunicação: STOMP sobre WebSocket; comandos e snapshots privados JSON versionados.
- Memória: heap autoritativo, cópias nos navegadores e espelho público NIO mapeado com segunda JVM.
- Exclusão: ReentrantLock por sala e FileLock exclusivo/compartilhado entre processos.
- Anexos: ZIPs com/sem executável; link público do vídeo, após a dupla escolher onde hospedá-lo.

O PDF exige turma correta e envio único. Não foram enviados formulário, registro do jogo ou vídeo
a serviços externos. Esses passos dependem dos dados reais da dupla e de conferência acadêmica.
