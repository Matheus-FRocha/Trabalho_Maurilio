# Memória e IPC

## O que é compartilhado
O processo servidor contém uma JVM, cujo heap guarda as salas. ConcurrentHashMap permite acesso
concorrente por threads dessa JVM; **não cria memória compartilhada entre processos**.
Cada navegador é outro processo e mantém sua própria cópia de apresentação. WebSocket troca bytes
entre esses processos; **não é memória compartilhada do sistema operacional**.

O compartilhamento estrito ocorre entre **servidor e monitor Java independente**. SharedMemoryStore
mapeia arquivos com FileChannel.map(READ_WRITE), e SharedMemoryMonitor usa map(READ_ONLY) sobre os mesmos
arquivos. O sistema operacional mantém páginas mapeadas apoiadas pelo arquivo. FileLock coordena o acesso
entre processos; MappedByteBuffer.force publica o conteúdo para o arquivo. Não se usa serialização de
objetos Java nem um banco. O monitor lê o estado público; não é um segundo servidor de regras.

O espelho é uma demonstração real de IPC compartilhado, complementar ao jogo web. Os navegadores
não acessam os arquivos mapeados. Se a avaliação exigir especificamente que cada processo jogador
mapeie a região, será necessário um cliente nativo adicional; não afirmar que o navegador faz isso.

## Ciclo de vida
1. CREATE_ROOM cria Room com players, mãos, deck, descarte, fase, turno, versão e timestamp.
2. Um ConcurrentHashMap indexa por código de sala; outro associa jogador à sala ativa.
3. Sob lock, o servidor valida ação, muda os objetos e cria snapshots imutáveis por destinatário.
4. Depois de soltar o lock, o dispatcher espelha apenas informações públicas e envia STOMP privado.
5. Clientes aplicam snapshots pela versão e renderizam; mãos alheias nunca são enviadas.
6. Ao terminar, memberships são liberadas para outra partida; a sala anterior permanece sincronizável
   até expirar. A cada minuto, salas com 30 minutos sem ação são removidas e o slot fica reutilizável.
7. Ao encerrar a JVM, heap e sessões se perdem. Arquivos mmap podem permanecer, mas não restauram
   partidas: contêm somente observações públicas. Após reiniciar, um slot pode refletir execução anterior
   até ser reutilizado. Conferir roomId/versão e se o servidor atual conhece a sala.

Há no máximo 128 salas; cache de comandos limitado a 128 por sala e 52 ou 104 cartas por partida.
Capacidade (2/4), quantidade de baralhos (1/2) e active dos jogadores fazem parte do snapshot público.
Na desistência a membership é liberada imediatamente. As cartas privadas do desistente permanecem
no objeto até expirar, sem serem retornadas ao monte ou enviadas aos outros; turnos o ignoram.
Até 1.000 credenciais anônimas, com expiração de duas horas para reconexão e descarte das expiradas
desconectadas. Sessions em uso continuam identificadas até desconectar. Não há logs de tokens.

## Formato e limites do mmap
Até 128 arquivos `slot-NNN.mmap`, cada um com 16 KiB (máximo 2 MiB de regiões mapeadas).
Primeiros 4 bytes: tamanho do JSON, inteiro big-endian. Restante: UTF-8 com protocol PIFE/1,
roomId, version, status, turno/fase, jogadores/contagens, deckCount, discardTop e resultado.
Sem mãos, tokens ou ordem do monte. Na expiração, escreve tombstone EXPIRED e recicla o slot.

Slots são mantidos mapeados até o fim do processo; não se força unmap com APIs internas do JDK.
Reutilização evita acúmulo e problemas de exclusão de arquivo mapeado no Windows. Não abrir dois
servidores apontando para a mesma pasta: há um único escritor autoritativo suportado.
Falha do espelho é registrada no log; a jogada já aceita não é revertida ou repetida e STOMP continua.
Arquivos em runtime/ são ignorados pelo Git e excluídos dos pacotes.
