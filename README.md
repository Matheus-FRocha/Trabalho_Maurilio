# Pife/Caxeta

Jogo web de Pife para **2 ou 4 jogadores em tempo real**, desenvolvido para Sistemas Operacionais.
Servidor Java 21 autoritativo, cliente React, mensagens STOMP/WebSocket, exclusão mútua por sala
e memória compartilhada real com um monitor em outra JVM. Sem cadastro ou banco de dados.

**[Jogar online](https://pife-caxeta.onrender.com)** · **[Guia de execução e avaliação](docs/entrega.md)**

O guia mostra como abrir os pacotes, testar uma partida e observar a memória compartilhada em uma
segunda JVM. A primeira abertura do jogo online após inatividade pode levar cerca de um minuto.

- [Requisitos do trabalho e evidências](docs/requisitos.md)
- [Arquitetura e processos](docs/arquitetura.md)
- [Protocolo de mensagens](docs/protocolo-de-mensagens.md)
- [Memória compartilhada](docs/gerenciamento-de-memoria.md) e [exclusão mútua](docs/exclusao-mutua.md)
- [Testes e resultados](docs/testes.md)
- [Implantação no Render](docs/hospedagem.md)

## Saída, cancelamento e resultado

- **Antes de começar:** sair da sala cancela a espera, independentemente de quantas pessoas entraram.
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

## Compilar e executar

Para compilar do código-fonte no Windows, use **JDK 21**, **Node.js 22.12+** e **Maven** no `PATH`.
Execute os comandos a partir da raiz no CMD, com acesso à internet para baixar as dependências.

```bat
cd frontend
npm ci
npm run build
cd ..\backend
mvn clean package
java -jar target\pife-1.0.0.jar
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
./scripts/dev-backend.ps1
./scripts/dev-frontend.ps1
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
./scripts/monitor.ps1 -File runtime/shared/slot-000.mmap
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

As versões das dependências estão registradas no POM e no lockfile do frontend.
[Referências técnicas](docs/referencias.md)

## Entrega

Depois do build, `scripts/package.ps1` gera os ZIPs de fontes e do JAR completo em `output/entrega/`.
Com `-ForForms`, gera também a versão compacta de até 10 MB, cujo primeiro início usa Maven para
obter as dependências. [Instruções dos pacotes](docs/entrega.md#executar-o-pacote-no-windows)

## Limitações conhecidas

- Regras da variante aprovadas em [docs/regras-do-jogo.md](docs/regras-do-jogo.md).
- Mesas para exatamente 2 ou 4; sem duplas, curingas, reciclagem do descarte, cadastro ou persistência.
- Reiniciar o servidor perde salas/sessões; recarregar o navegador preserva sessão na mesma aba.
- Sala expira em 30 minutos sem ações; após expirar, criar outra. Token de reconexão vale duas horas.
- Desconexão de jogador ativo pausa jogadas; desistentes não impedem a continuação. Antes do início, sair cancela a sala.
  Sala nova exige encerrar a anterior.
- Máximo de 128 salas e 1.000 sessões. Serviço acadêmico em uma instância; HTTPS/WSS público fornecido pelo Render.
- O monitor compartilha a região mapeada com o servidor; os clientes web mantêm cópias separadas.
- A cadeia de ferramentas de desenvolvimento do ESLint apresenta seis alertas moderados em `npm audit`
  nesta data, associados a minimatch. `npm audit --omit=dev` não apontou vulnerabilidades.

Licença original preservada em [LICENSE](LICENSE).
