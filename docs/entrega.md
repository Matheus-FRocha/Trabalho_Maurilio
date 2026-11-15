# Preparação da entrega

## Pacotes

| Uso | Arquivo | Requisitos para executar |
| --- | --- | --- |
| Forms, código sem executável | `pife-fontes.zip` | Compilação a partir das fontes |
| Forms, código com executável | `pife-com-executavel-forms.zip` | JDK 21 e Maven instalado no PATH. O primeiro início baixa as dependências com internet |
| Teste fora do Forms | `pife-com-executavel.zip` | Java 21. Inclui as dependências e passa de 10 MB |

Depois de compilar o frontend e o backend, use `scripts/package.ps1` para gerar o pacote completo
e `scripts/package.ps1 -ForForms` para gerar os anexos de até 10 MB. O script usa os arquivos
versionados no commit atual. O pacote leve inclui `bin/pife.jar` e a interface compilada.

## Como executar no Windows

1. Extraia o ZIP inteiro. No Prompt de Comando, abra a pasta extraída e confira `java -version`.
2. No pacote completo, execute `java -jar bin\pife.jar` ou abra `iniciar.cmd`. No pacote do Forms,
   execute `iniciar.cmd`. O script usa o Maven instalado para preparar `bin\lib` e iniciar o JAR.
   Nas próximas execuções, com a pasta de dependências intacta, `java -jar bin\pife.jar` funciona diretamente.
3. Aguarde a inicialização e abra `http://localhost:8080`. Mantenha o terminal aberto durante a partida.
   Para encerrar o servidor, pressione `Ctrl+C`.
4. Para jogar na mesma rede, basta um computador executar o JAR. Use `ipconfig` para descobrir
   seu IPv4. Antes de iniciar, defina no CMD `set "PIFE_ALLOWED_ORIGINS=http://localhost:8080,http://IP-DO-SERVIDOR:8080"`,
   substituindo `IP-DO-SERVIDOR` pelo IPv4 encontrado. As outras pessoas abrem esse endereço,
   se a rede e o firewall permitirem. Se houver bloqueio no computador corporativo, use o jogo online.
5. Para testar sozinho, abra janelas com sessões separadas, como Edge e Firefox, ou uma janela
   normal e outra anônima. Crie a mesa na primeira, entre na outra com o código e inicie após
   preencher todas as vagas.

O jogo também está disponível em [pife-caxeta.onrender.com](https://pife-caxeta.onrender.com).
O primeiro acesso pode demorar cerca de um minuto quando o Render Free está ocioso.

Para gerar o JAR completo a partir das fontes pelo CMD com Node.js, JDK 21 e Maven instalados,
execute na raiz do projeto:

```bat
cd frontend
npm ci
npm run build
cd ..\backend
mvn clean package
java -jar target\pife-1.0.0.jar
```

## Apresentação sugerida (6–8 minutos)
1. Objetivo e variante aprovada: dois ou quatro jogadores, nove cartas, três jogos, sem curingas.
   Dois jogadores usam um baralho; quatro usam dois, em jogo individual.
2. Criar sala e mostrar os navegadores; cada um recebe apenas a própria mão.
3. Explicar envelope JSON: type, roomId, messageId, version e payload. Mostrar DRAW_CARD.
4. Mostrar domínio e região crítica no GameService; explicar corrida de duas compras.
5. Diferenciar heap da JVM, cópias do navegador e sockets de memória compartilhada do SO.
6. Rodar o monitor em outro terminal, jogar e ler a nova versão no mesmo arquivo mapeado.
7. Mostrar testes de duas JVMs e FileLock, reconexão, resultado e limitações.

## Vídeo de até um minuto
O script frontend/scripts/record-gameplay.mjs automatiza uma partida real em dois contextos e grava
a tela do primeiro jogador, em WebM, sem som. Inspecionar o vídeo antes de usar; a dupla pode gravar
uma narração ou uma partida manual se preferir. Não há mãos fabricadas nem endpoint de teste no servidor.

Roteiro: 0–10s criar e compartilhar sala; 10–18s segundo jogador e início; 18–45s comprar e descartar,
ver a alternância de turno; 45–55s reconectar preservando cartas; 55–60s encerrar e mostrar resultado.
O término por abandono é diferente da vitória por três jogos, que é coberta no teste JUnit.
Use `output/videos/pife-gameplay-formulario.mp4` para publicar a demonstração. Depois de publicar,
cole no Forms o link do vídeo. O endereço do jogo serve para jogar no navegador.

## Campos do formulário
- Nomes: preencher nomes reais dos dois integrantes.
- Nome do jogo: Pife/Caxeta — variante Pife individual para dois ou quatro.
- Jogo existente: sim, o jogo de cartas Pife, também conhecido como Caxeta.
- Dinâmica: Pife individual para dois (um baralho) ou quatro (dois baralhos), com nove cartas por
  pessoa. Crie uma mesa, compartilhe o código e comece quando as vagas estiverem preenchidas.
  Na sua vez, clique em Comprar para tirar do monte ou em Pegar carta para usar o topo do descarte.
  Selecione uma carta da mão e clique em Descartar selecionada. Vence quem, após descartar,
  fica com três combinações de três cartas (trincas de valores iguais com naipes distintos ou
  sequências do mesmo naipe). Quem desiste é pulado. O último ativo vence por abandono.
- Linguagens: Java 21 (servidor/monitor), JavaScript (React).
- Comunicação: os navegadores enviam ao servidor comandos JSON via STOMP sobre WebSocket para
  criar/entrar em mesa, iniciar, comprar, descartar, sair ou sincronizar. O servidor valida a ação
  e envia o estado versionado da mesa ou uma mensagem de erro. Cada jogador recebe sua própria mão.
- Dado compartilhado: estado público da mesa, incluindo participantes, turno, fase, quantidade
  de cartas, topo do descarte e resultado. Os navegadores recebem cópias por mensagens. O servidor
  também escreve esse estado em uma região de arquivo mapeada com Java NIO, que um processo monitor
  em outra JVM lê. As mãos são privadas.
- Exclusão: `ReentrantLock` por sala protege a atualização do estado e a criação dos snapshots.
  O envio por rede ocorre após liberar o lock. A região mapeada usa `FileLock` exclusivo na escrita
  e compartilhado na leitura para evitar que o monitor leia um snapshot incompleto.
- Anexos: ZIPs com/sem executável; link público do vídeo, após a dupla escolher onde hospedá-lo.

O PDF exige turma correta e envio único. Não foram enviados formulário, registro do jogo ou vídeo
a serviços externos. Esses passos dependem dos dados reais da dupla e de conferência acadêmica.
