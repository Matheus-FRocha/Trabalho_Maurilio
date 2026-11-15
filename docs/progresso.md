# Histórico técnico e validação

## 3 de novembro de 2026

A versão inicial implementou regras de Pife para dois jogadores, salas em memória e comandos
STOMP sobre WebSocket. O monitor Java passou a ler o estado público da sala em uma região de
arquivo mapeada. Testes com duas JVMs verificaram a leitura e a exclusão mútua entre processos.
A saída antes do início passou a cancelar a sala sem declarar um resultado de partida.

## 4 de novembro de 2026

As mesas passaram a aceitar dois ou quatro jogadores. A mesa de quatro usa dois baralhos e
identifica cada cópia física. A navegação pela logo preserva a sessão e oferece a opção de
retomar a mesa. Se alguém desiste durante a partida, os demais continuam
até uma vitória por combinações ou até restar um único participante ativo.

A primeira verificação pública encontrou uma falha intermitente ao recarregar a página.
O cliente passou a solicitar novamente apenas o estado da sala, com um limite de três
tentativas. O cliente não reenvia automaticamente as ações de jogo. O teste de regressão
descarta a primeira resposta de sincronização e verifica a recuperação pela seguinte.

A versão corrigida passou nos nove cenários de navegador na hospedagem. Doze recargas
adicionais recuperaram o resultado da partida. [Cobertura e resultados](testes.md)

## 15 de novembro de 2026

O pacote compacto foi criado para o limite de 10 MB por anexo. Ele inclui o JAR executável e
prepara as dependências com Maven no primeiro início. O pacote completo inclui as
dependências e pode ser executado diretamente com Java 21.

O pacote compacto foi extraído e iniciado com cache Maven vazio. Foram aprovados 33 testes de
backend, 13 testes de frontend e nove cenários Playwright contra o JAR compacto. O pacote
completo foi executado com `java -jar` e respondeu `UP` em `/api/health`. O MP4 de demonstração
foi verificado com duração de 59,04 segundos e mostra uma partida encerrada por abandono.

A integração contínua verificou o build, o contêiner, a comunicação entre navegadores e o monitor
em uma segunda JVM. [Execução da CI](https://github.com/Matheus-FRocha/Trabalho_Maurilio/actions/runs/43765688726)

A revisão final restringiu as orientações da entrega à execução do jogo e do monitor. A
documentação técnica descreve o protocolo, a arquitetura e os limites verificados.

Foram reproduzidas duas ordens de eventos na reconexão. Um fechamento atrasado podia marcar
como ausente um jogador que já voltou. Uma solicitação de sincronização enfileirada também podia
restaurar a presença de um socket já fechado. A verificação do socket passou a ocorrer sob o
lock da sala, o mesmo que protege a atualização de presença.

Uma falha transitória ao gravar o marcador de expiração podia deixar o slot mapeado ocupado
depois de a sala expirar. A associação do slot é preservada até gravar o marcador, com nova
tentativa no ciclo seguinte. A credencial de `CONNECT` é removida do frame
antes de autenticar, para que erros de rejeição do transporte não registrem o cabeçalho.

Quatro cenários de regressão reproduziram os problemas e passaram após as correções. A suíte
Maven final teve 37 testes aprovados. A integração do cabeçalho de sessão foi conferida com a
documentação do Spring Framework 6.2.19 no Context7. [Resultados e limites](testes.md)

O ZIP de fontes da revisão foi compilado em uma pasta recém-extraída com Node.js e Maven.
O JAR completo iniciou com Java 21. O pacote compacto foi extraído em um caminho com espaços,
baixou as dependências com cache Maven vazio e passou nos nove testes de navegador. O monitor
incluído leu o snapshot de uma mesa para quatro jogadores em outra JVM. Os dois anexos do
formulário atendem ao limite de 10.000.000 bytes. Foram verificados o conteúdo exato dos ZIPs,
o manifesto dos JARs e as somas SHA-256.

O commit de aplicação `515234b` passou nos jobs de verificação e contêiner. A versão entregue
pelo Render respondeu `UP` em `/api/health` e passou nos nove testes Playwright por HTTPS/WSS.
[Execução da CI](https://github.com/Matheus-FRocha/Trabalho_Maurilio/actions/runs/43768501519)
