# Pife/Caxeta

Jogo web de Pife para **2 ou 4 jogadores em tempo real**, desenvolvido para Sistemas Operacionais.
Servidor Java 21 autoritativo, cliente React, mensagens STOMP/WebSocket, exclusão mútua por sala
e memória compartilhada real com um monitor em outra JVM. Sem cadastro ou banco de dados.

## Publicação na internet e GitHub Pages

O código está versionado no GitHub. Isso **não hospeda automaticamente o jogo em execução**.
O [GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages)
serve arquivos estáticos (HTML, CSS e JavaScript); não executa Java/Spring Boot nem o servidor WebSocket.
Portanto, **o multiplayer completo não funciona hospedado somente no GitHub Pages**.

| Opção | O que funciona |
|---|---|
| Repositório GitHub | Armazena código, documentação e workflow de testes; não mantém o jogo rodando |
| Apenas GitHub Pages | Pode servir a interface compilada, mas não processa salas nem partidas Java |
| Servidor com Java 21 e WebSocket | Executa o JAR completo e serve interface, API e partidas no mesmo endereço |
| Pages + servidor Java externo | Possível após adaptar URLs/base do frontend e configurar as origens; exige as duas hospedagens |

Para este projeto, a opção mais simples é **publicar o JAR completo em um serviço que execute Java 21**.
O build continua podendo partir do repositório; o processo roda no servidor da hospedagem, não no Git.
O serviço precisa manter uma instância ativa, aceitar WebSocket e oferecer diretório gravável para os
arquivos mapeados. Use HTTPS/WSS para acesso público; o proxy deve encaminhar `/ws` com upgrade WebSocket.
`PORT` (padrão 8080) ou `SERVER_PORT` configura a porta interna, `PIFE_ALLOWED_ORIGINS` as origens exatas autorizadas e
`PIFE_SHARED_DIRECTORY` a pasta do espelho de memória compartilhada. Evite múltiplas instâncias,
pois as salas ficam na memória de um único processo; reinícios perdem as partidas.

O frontend usa `/api` e `/ws` na mesma origem. A publicação preparada é no **Render**, executando
o Dockerfile da raiz; não é GitHub Pages. O repositório continua privado e o serviço web poderá ser
público. A URL só será registrada após a plataforma confirmar a implantação; configuração detalhada
em [docs/hospedagem.md](docs/hospedagem.md). No Render, `RENDER_EXTERNAL_URL` define automaticamente a
origem autorizada; HTTPS/WSS e forwarded headers são suportados. `render.yaml` especifica plano Free
e deploy após checks. A confirmação da conta é feita fora do código, sem tokens no repositório.

Para separar Pages e servidor seria necessário parametrizar URLs e base path dos assets. O JAR
inteiro no Render evita essa separação. O serviço Free pode suspender após inatividade e reiniciar,
perdendo as partidas em memória; consulte os [limites oficiais](https://render.com/docs/free).

## Branches e integração

A entrega inicial possui 8 branches remotas: `main`, `develop` e 6 branches `feature/*`
(`backend-core`, `game-rules`, `websocket`, `frontend`, `integration` e `documentation`).
São referências do histórico Git, não oito servidores ou instalações ativas. As seis funcionalidades
já foram integradas. É válido mantê-las para rastreabilidade acadêmica ou removê-las após integração;
o fluxo normal de novas correções é branch temporária -> develop -> main, após os testes.

## Saída, cancelamento e resultado

- **Antes de começar:** sair da sala cancela a espera, esteja sozinho ou com outro jogador.
  A tela mostra “Sala encerrada”; não há vitória, derrota ou empate porque a partida não começou.
- **Durante a partida de 2:** “Sair da partida” é desistência; o adversário vence por abandono.
- **Durante a partida de 4:** o desistente sai e os demais continuam; turnos pulam quem saiu.
  Quem fechar os três jogos vence, ou o último participante vence se todos os outros desistirem.
- **Conexão perdida ou página recarregada:** a partida pausa para reconexão, sem vitória automática.
- **Empate:** somente quando o monte acaba após um descarte sem vitória por combinações.

## Mesas e navegação

Ao criar, escolha **2 jogadores / 1 baralho** ou **4 jogadores / 2 baralhos**. São 9 cartas por
pessoa, sem curingas, em partidas individuais. O anfitrião inicia após preencher todos os lugares.
As cópias físicas do segundo baralho têm IDs distintos; trincas continuam exigindo naipes diferentes.
As [regras completas](docs/regras-do-jogo.md) incluem turnos, desistência e tratamento do monte.

Clicar na **logo** volta ao início sem recarregar a página e sem desistir. A opção **Retomar mesa**
leva de volta à partida, inclusive após recarregar a aba. Para abrir outra mesa, saia da anterior
explicitamente. Desconectar apenas pausa para reconexão dos participantes ativos.

## Executar no Windows

Pré-requisitos: **JDK 21** (JAVA_HOME), **Node.js 22.12+** e acesso à internet no primeiro build.
Maven 3.9.11 é baixado pelo wrapper; não é preciso instalá-lo globalmente.
O script reconhece também o JDK local em `.tools/java/`, quando presente.

Na raiz do repositório, em PowerShell:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/build.ps1
powershell -ExecutionPolicy Bypass -File scripts/run.ps1
```

Acesse **http://localhost:8080** em 2 ou 4 navegadores/contextos separados. Crie a mesa com a
capacidade desejada, compartilhe o código e preencha os lugares; clique em **Começar partida**
na janela do anfitrião.
Cada jogador compra uma carta, seleciona uma da mão e descarta. O servidor reconhece a vitória.
O JAR já contém o frontend compilado: Node não é necessário para executá-lo depois do build.

Em Linux/macOS: `cd frontend && npm ci && npm run build`, depois
`cd ../backend && ./mvnw clean verify && java -jar target/pife-1.0.0.jar`.

## Desenvolver

Na primeira vez, execute `npm ci` dentro de `frontend`. Em dois terminais na raiz:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/dev-backend.ps1
powershell -ExecutionPolicy Bypass -File scripts/dev-frontend.ps1
```

Abra http://localhost:5173. O Vite encaminha `/api` e `/ws` para a porta 8080.
Para acesso em rede local, configure `PIFE_ALLOWED_ORIGINS` com a origem exata utilizada
(por exemplo `http://192.168.1.10:5173`), reinicie o servidor e permita a porta necessária no firewall.
Os dois clientes devem acessar o mesmo servidor. Uma instalação do backend atende uma única instância.

## Testar

```powershell
. ./scripts/env.ps1
./backend/mvnw.cmd -f backend/pom.xml test
cd frontend
npm run lint
npm run format:check
npm test
npm run build
npx playwright install chromium
# Com o backend iniciado na porta 8080:
npm run test:e2e
```

Playwright inicia/encerra o Vite e usa contextos independentes. Há testes de domínio, salas,
concorrência, privacidade, comunicação real e FileLock entre JVMs.
Resultados e limites: [docs/testes.md](docs/testes.md).

## Demonstrar memória compartilhada

Com uma sala aberta, o servidor escreve um snapshot público em `runtime/shared/slot-000.mmap`
quando iniciado por `scripts/run.ps1` (em desenvolvimento: `backend/runtime/shared/`).
Execute em outro terminal:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/monitor.ps1 -File runtime/shared/slot-000.mmap
```

Esse comando inicia **outro processo Java**, mapeia o mesmo arquivo e lê turno, fase, contagens e
versão sob `FileLock`. Execute novamente após uma jogada e compare a versão. Cada sala ativa ocupa
um slot; confira `roomId` no JSON para identificar a sala. Mãos e tokens não entram no espelho.
O monitor apenas observa; os navegadores comunicam-se via sockets, sem mapear arquivos locais.
Detalhes: [memória](docs/gerenciamento-de-memoria.md) e [exclusão mútua](docs/exclusao-mutua.md).

## Estrutura e tecnologias

```text
backend/    Java 21, Spring Boot 3.5.16, Maven, Jackson, JUnit 5
frontend/   React 19, Vite 8, Tailwind 4, @stomp/stompjs, Vitest, Playwright
docs/       requisitos, regras, protocolo, arquitetura, evidências e entrega
scripts/    build, execução, desenvolvimento, monitor e empacotamento
```

Spring Boot 3.5.16 é a versão estável de manutenção da linha 3.5 consultada nesta execução,
escolhida para manter JUnit 5 e Jackson 2 conforme o pedido. Versões JavaScript exatas no lockfile.
Context7 foi conectado durante a execução e confirmou autenticação STOMP e integração Tailwind/Vite;
também foram usadas [fontes oficiais](docs/referencias.md).
Os nomes dos integrantes e a turma devem ser preenchidos pela dupla, sem inventar informações.

## Entrega

`scripts/package.ps1` gera em `output/entrega/` dois ZIPs: fontes e fontes com JAR executável.
É necessário executar o build antes. O pacote executável inclui `iniciar.cmd` e requer Java 21.
O script `frontend/scripts/record-gameplay.mjs` grava cerca de um minuto de gameplay real:
inicie o JAR na porta 8080, depois execute `node scripts/record-gameplay.mjs` dentro de `frontend`.
O vídeo fica em `output/videos/gameplay.webm`, sem narração. Roteiro de apresentação e formulário:
[docs/entrega.md](docs/entrega.md).

## Limitações conhecidas

- Regras da variante aprovadas em [docs/regras-do-jogo.md](docs/regras-do-jogo.md).
- Mesas para exatamente 2 ou 4; sem duplas, curingas, reciclagem do descarte, cadastro ou persistência.
- Reiniciar o servidor perde salas/sessões; recarregar o navegador preserva sessão na mesma aba.
- Sala expira em 30 minutos sem ações; após expirar, criar outra. Token de reconexão vale duas horas.
- Desconexão de jogador ativo pausa jogadas; desistentes não impedem a continuação. Antes do início, sair cancela a sala.
  Sala nova exige encerrar a anterior.
- Máximo de 128 salas e 1.000 sessões. Serviço acadêmico, sem infraestrutura de disponibilidade ou TLS.
- O monitor compartilha a região mapeada com o servidor; os clientes web mantêm cópias separadas.
- A cadeia de ferramentas de desenvolvimento do ESLint apresenta seis alertas moderados em `npm audit`
  nesta data, associados a minimatch. `npm audit --omit=dev` não apontou vulnerabilidades.

Licença original preservada em [LICENSE](LICENSE).
