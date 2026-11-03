# Pife/Caxeta

Trabalhar somente neste repositório. Preservar LICENSE, origin e alterações existentes.
Java 21, Spring Boot, Maven; React/JavaScript, Vite, Tailwind, STOMP. Sem banco de dados.
Regras aprovadas em docs/regras-do-jogo.md. Servidor valida todas as ações.
Nunca enviar mão alheia. Identidade vem da sessão autenticada, nunca de playerId recebido.
Estado em memória; ReentrantLock por sala. Rede fora do lock. Snapshots imutáveis e versionados.
Exigência confirmada: memória compartilhada real entre processos. Manter mecanismo NIO mapeado,
FileLock e teste com segunda JVM. Não confundir ConcurrentHashMap com IPC.
Usar Superpowers, testes antes da implementação e revisão antes de integrar.
Consultar Context7 se disponível; fallback em documentação oficial e registrar a limitação.
Branches feature/* -> develop -> main após verificações. Conventional Commits e push autorizados.
Proibido force push, reset --hard, git clean, publicar credenciais ou substituir LICENSE.
Verificar backend com Maven e frontend com npm test, npm run build e Playwright.
Documentar resultados reais, limitações, decisões e alterações em docs/progresso.md.
