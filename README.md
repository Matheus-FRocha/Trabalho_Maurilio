# Pife/Caxeta

Jogo web de Pife para **dois jogadores em tempo real**, desenvolvido para Sistemas Operacionais.
Servidor Java 21 autoritativo, cliente React, mensagens STOMP/WebSocket, exclusão mútua por sala
e memória compartilhada real com um monitor em outra JVM. Sem cadastro ou banco de dados.

## Executar no Windows

Pré-requisitos: **JDK 21** (JAVA_HOME), **Node.js 22.12+** e acesso à internet no primeiro build.
Maven 3.9.11 é baixado pelo wrapper; não é preciso instalá-lo globalmente.
O script reconhece também o JDK local em `.tools/java/`, quando presente.

Na raiz do repositório, em PowerShell:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/build.ps1
powershell -ExecutionPolicy Bypass -File scripts/run.ps1
```

Acesse **http://localhost:8080** em dois navegadores ou contextos separados (por exemplo Chrome
e Edge, ou uma janela normal e outra anônima). Crie a mesa, compartilhe o código de seis caracteres,
entre com o outro jogador e clique em **Começar partida** na janela do anfitrião.
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
- Dois jogadores; sem curingas, reciclagem de descarte, cadastro, pontuação acumulada ou persistência.
- Reiniciar o servidor perde salas/sessões; recarregar o navegador preserva sessão na mesma aba.
- Sala expira em 30 minutos sem ações; após expirar, criar outra. Token de reconexão vale duas horas.
- Desconexão pausa jogadas; saída voluntária encerra por abandono. Sala nova exige encerrar a anterior.
- Máximo de 128 salas e 1.000 sessões. Serviço acadêmico, sem infraestrutura de disponibilidade ou TLS.
- O monitor compartilha a região mapeada com o servidor; os clientes web mantêm cópias separadas.
- A cadeia de ferramentas de desenvolvimento do ESLint apresenta seis alertas moderados em `npm audit`
  nesta data, associados a minimatch. `npm audit --omit=dev` não apontou vulnerabilidades.

Licença original preservada em [LICENSE](LICENSE).
