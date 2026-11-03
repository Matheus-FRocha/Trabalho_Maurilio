# Pife/Caxeta: design

## Objetivo e limites
Jogo acadêmico web para dois navegadores com Java 21, comunicação STOMP/WebSocket,
protocolo JSON próprio, concorrência e memória compartilhada real. Sem cadastro, banco,
ranking ou histórico. Prazo informado e conferido no PDF: 15/11/2026 23h59.

## Abordagens
1. Estado apenas na JVM: simples, mas insuficiente diante da exigência explícita de IPC compartilhado.
2. Servidor autoritativo com espelho público em Memory-Mapped Files e monitor em outra JVM:
escolha técnica adotada sob autonomia concedida. Mantém privacidade e demonstra IPC real.
3. Dois servidores coordenando todas as regras por memória compartilhada: complexidade desnecessária.

## Componentes e contratos
Backend em camadas, salas em ConcurrentHashMap, domínio puro e ReentrantLock por sala.
Sessão anônima via REST gera token aleatório; CONNECT STOMP autentica token como Principal.
Somente /app/game aceita comandos e /user/queue/events aceita assinaturas privadas.
Envelope de comando: type, roomId, messageId, version, payload.
Servidor produz envelopes versionados com estado público e mão apenas do destinatário.
Versão otimista e cache limitado de messageId evitam repetição de jogadas.
Frontend guarda token em sessionStorage, reconecta e solicita SYNC_ROOM.
Perda de rede desabilita ações. Cliente ignora snapshots antigos.

Snapshot público é escrito em arquivo mapeado por sala sob FileLock. Monitor CLI em JVM
independente mapeia o mesmo arquivo somente para leitura, sob lock compartilhado. Não contém
tokens, mãos ou ordem do monte. Snapshot de jogada é capturado sob lock da sala; I/O ocorre fora.

## Interface
Português, mesa verde, cartas legíveis, criar/entrar, espera, turno, conexão, erros e resultado.
Layout responsivo e acessível com botões nativos e rótulos.

## Validação
JUnit 5 para combinações, turnos, salas, concorrência, privacidade e duas JVMs compartilhando arquivo.
Integração com WebSocket real e Playwright com dois contextos independentes.
Pacotes fonte e executável, scripts, instruções acadêmicas, roteiro de vídeo e apresentação em Markdown.
Não publicar vídeo nem enviar formulário em nome do usuário.

## Origem das decisões
Tecnologias, escopo, autonomia Git e diretório: pedido do usuário.
Variante: confirmação explícita em 03/11/2026. IPC estrito: confirmação explícita na mesma data.
Estrutura e mecanismos: decisões técnicas desta implementação.
Context7 indisponível na sessão; consultar documentação oficial como alternativa registrada.
