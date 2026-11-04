# Multiplayer web Implementation Plan

**Spec:** docs/superpowers/specs/2026-11-03-multiplayer-web-design.md
**Goal:** corrigir logo, ampliar 2/4, renovar visual e hospedar a aplicação Java completa.
**Tech:** Java21/Spring/STOMP, React/Vite/Tailwind, Docker/Render, JUnit/Vitest/Playwright.

## Review Focus
Identidade física de cartas duplicadas e naipes em trincas; desistência fora/na vez; sala antiga
não interferindo na nova; logo sem reload/desistência; readiness 4 vagas; origem WSS pública;
conta/plano de hospedagem realmente disponíveis e nenhuma credencial versionada.

### Task 1: Domínio e salas
Arquivos: Card/Deck/MeldValidator, DTOs, GameService/GameConfig e testes.
Interface: CREATE_ROOM.payload.maxPlayers (string 2/4, padrão2); maxPlayers/deckCopies no estado;
PlayerView.active. Deck.forCopies(int), shuffledCopies(int,Random); IntFunction de decks no serviço.
- [x] Testar RED: 104 IDs, naipes distintos, 4 vagas/9 cartas, rotação, desistência e isolamento.
- [x] Implementar e executar Maven test GREEN, revisar e commit.

### Task 2: Cliente, navegação e visual
Arquivos: App/useGame/Home/Room/Table/Result/Rules, CSS, componentes/tests/e2e.
Interface: ir ao início preserva sessão; Retomar usa view atual; criar/entrar bloqueados se em jogo.
- [x] Testar logo sem reload/desistência, criação4 e quatro clientes.
- [x] Implementar seleção2/4, status dos três adversários, resultado de desistente e tema azul/coral.
- [x] Vitest/lint/format/build/Playwright desktop e mobile; inspecionar capturas, commit.

### Task 3: Hospedagem
Arquivos: Dockerfile, .dockerignore, render.yaml, application.properties, docs/README.
- [x] Consultar APIs/configurações oficiais/Context7 e preparar deploy que execute Java21.
- [x] Validar origem pública, PORT e forwarded headers; preservar mmap em diretório gravável.
- [ ] Publicar em Render após acesso confirmado e verificar URL/partida real na web.

### Task 4: Revisão e entrega
- [x] Revisão independente, regressões e suítes completas; documentar regras/resultados reais.
- [ ] Integrar develop/main, push/CI, pacotes e confirmar acesso público ou bloqueio concreto.

Autonomia de execução e Git já concedidas; trabalhar nesta raiz, preservar LICENSE e origin.
Não copiar o trabalho do colega nem remover requisitos para facilitar hospedagem.
