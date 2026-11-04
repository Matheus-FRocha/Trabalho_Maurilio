# Exclusão mútua e concorrência

## Dentro do servidor
Cada Room tem um ReentrantLock. CREATE/entrada, distribuição, jogada, snapshot, presença e expiração
acessam seus campos somente com esse lock. A região crítica inclui validação de identidade/membership,
turno, fase, versão e propriedade da carta, atualização, incremento de versão e cópia consistente.
O bloco finally sempre libera o lock. Nenhum acesso de rede ou arquivo mapeado ocorre sob esse lock.

ConcurrentHashMap protege índices, não os campos de Room. putIfAbsent impede membership simultânea
em salas diferentes. Criação de salas é serializada brevemente para respeitar capacidade e unicidade.
Não há caminho que segure dois locks de salas diferentes. A expiração adquire uma sala por vez e usa
remoção condicional para não remover associação já substituída.

Dois DRAW_CARD com a mesma versão competem pelo lock. Apenas o primeiro altera a mão e incrementa
versão; o segundo recebe STALE_STATE. Repetição de messageId conhecido recebe snapshot sem repetir
a mutação. O teste com oito threads confere uma compra, dez cartas e decremento único do monte.

## Entre processos
SharedMemoryStore usa um monitor Java para impedir locks sobrepostos dentro da mesma JVM e
FileChannel.lock exclusivo sobre o arquivo para impedir leitura concorrente pela JVM observadora.
O monitor usa FileLock compartilhado na leitura. Ambos liberam com try-with-resources.
O arquivo só é interpretado após adquirir o lock; tamanho e bytes são lidos dentro da região crítica.
O teste FileLockProbe inicia outro processo, confirma que chegou à tentativa, mantém o escritor
bloqueado, verifica que o leitor não encerra e então libera para ele prosseguir.

EventDispatcher coordena expiração/publicação pelo próprio monitor, verifica se a sala ainda existe
e não recria espelho de sala já expirada. Slots ignoram snapshots antigos pela versão. Entregas de rede
ficam fora do lock de sala, e o frontend também ignora versões menores. O dispatcher serializa publicações
breves entre salas; isso limita vazão, aceitável para o MVP acadêmico. Um observador que segure FileLock
indefinidamente pode atrasar publicações: o monitor fornecido apenas lê e solta o lock imediatamente.
