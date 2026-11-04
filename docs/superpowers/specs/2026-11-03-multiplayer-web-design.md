# Mesas 2/4, navegação, visual e publicação

## Solicitação e decisões
Usuário pediu logo que volte ao início sem reload, hospedagem pública real, cores mais vivas e
mesas para 2 ou 4, usando 2 baralhos para 4. Confirmou jogo individual: desistente sai, demais
continuam; vitória por combinações ou do último participante. Confirmou azul/coral com fundo claro.

## Arquitetura
Preservar Java 21/Spring/STOMP, mmap/FileLock, domínio autoritativo e sem banco. Capacidade fixa
de 2 ou 4 escolhida ao criar; iniciar apenas com todos os lugares ocupados/conectados. Nove cartas
por participante; 52 cartas para 2, 104 para 4, sem curingas. Ás baixo e trincas de naipes distintos.
IDs físicos: C1 no primeiro baralho, C1-2 no segundo. Duas cópias iguais podem compor jogos separados,
mas não contam como naipes diferentes na mesma trinca. Monte não é reciclado.

Estado inclui maxPlayers/deckCopies e active por participante. Turno circular pela ordem de entrada,
pulando desistentes. Durante PLAYING, desistência libera membership, não cancela os demais; se for
o jogador da vez, passa à fase DRAW do próximo. Cartas do desistente saem do jogo e não retornam ao
monte. Quando sobra um participante, ele vence por abandono. Antes de iniciar, saída cancela a sala.
SYNC de desistente é privado, não reativa nem notifica sua sala antiga enquanto está em outra.
Conexão perdida continua pausando para reconexão dos participantes ativos.

## Navegação e visual
Logo vira controle de navegação interna, sem mudança de documento e sem LEAVE implícito. Home
durante partida mostra Retomar e Sair; não permite criar outra mesa com membership ativa. Preferência
de página é mantida na aba. Resultado permanece explícito. Cartas continuam legíveis e navegação
por teclado preservada. Fundo claro, azul intenso para mesa/estrutura e coral para ações.
Mostrar os outros 1 ou 3 jogadores, estados ativo/ausente/desistente e indicador de vez.

## Hospedagem
Colega hospeda em Render (homepage do GitHub aponta para onrender.com). Apenas configuração pública
foi inspecionada; código de jogo não será copiado. Sites usa Workers e não executa Java, portanto não
substitui o backend acadêmico. Render encontrado via descoberta de plugin e sugerido para conexão.
Preparar Docker multi-stage (Node, Maven/Java21, runtime JRE21), render.yaml free e porta PORT.
Configurar origem pública real por RENDER_EXTERNAL_URL e forwarded headers. Publicar quando houver
acesso confirmado à conta; não fingir deploy nem usar Actions/Codespaces como servidor permanente.
Plano gratuito pode suspender serviço ocioso e perder partidas ao reiniciar; documentar.

## Alternativas consideradas
Pages + Java externo exige duas hospedagens/URLs e não elimina necessidade do backend. JAR inteiro
no Render mantém uma origem e o mesmo modelo acadêmico: escolha adotada. Sites precisaria reescrever
Java/IPC, contrariando requisitos. Não contratar plano pago sem autorização explícita de custo.

## Verificação
TDD para baralho duplo, trincas, capacidade, turnos, desistências e logo; Playwright com 4 contextos,
privacidade, rede/reload e fluxo de início/retomada. Inspeção desktop/móvel. Review independente,
Maven verify, lint/format/Vitest/build/Playwright, CI, pacotes. Deploy confirmado por URL pública
e teste real com clientes independentes, somente após conta disponível.
