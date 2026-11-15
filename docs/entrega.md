# Guia de execução e avaliação

O Pife/Caxeta é um jogo de cartas em tempo real para duas ou quatro pessoas. A versão web pode
ser aberta diretamente no navegador. No Render Free, a primeira abertura após inatividade pode
levar cerca de um minuto. [Jogar online](https://pife-caxeta.onrender.com)

## Executar o pacote no Windows

| Pacote | Conteúdo e requisitos |
| --- | --- |
| `pife-fontes.zip` | Código-fonte. Para gerar um JAR, siga a seção de compilação do [README](../README.md#compilar-e-executar). |
| `pife-com-executavel-forms.zip` | Código e JAR com a interface compilada. Requer JDK 21, Maven no `PATH` e internet na primeira execução para preparar `bin/lib`. |
| `pife-com-executavel.zip` | Código e JAR com as dependências incluídas. Requer Java 21. |

Extraia o ZIP inteiro e abra o Prompt de Comando (CMD) na pasta extraída. Para o pacote compacto,
execute `iniciar.cmd`. Para o pacote completo, execute `java -jar bin\pife.jar`. Aguarde a
inicialização, abra `http://localhost:8080` e mantenha o terminal aberto. Para encerrar o servidor,
pressione `Ctrl+C`.

Para jogar na mesma rede, descubra o IPv4 do computador que executará o servidor com `ipconfig`.
Antes de iniciá-lo, configure as origens permitidas no mesmo CMD, substituindo `IP-DO-SERVIDOR`
pelo IPv4 encontrado.

```bat
set "PIFE_ALLOWED_ORIGINS=http://localhost:8080,http://IP-DO-SERVIDOR:8080"
```

Os demais jogadores abrem `http://IP-DO-SERVIDOR:8080`. A rede e o firewall precisam permitir
acesso à porta 8080.

## Testar uma partida

1. Abra uma sessão de navegador para cada jogador. Para testar sozinho com duas pessoas, use
   uma janela normal e outra anônima, ou dois navegadores diferentes.
2. Crie a mesa, escolha dois ou quatro lugares e compartilhe o código. Em cada sessão adicional,
   selecione **Entrar com código**, preencha o nome e entre na mesa.
3. Com as vagas preenchidas, clique em **Começar partida** na janela do anfitrião. Quem está na vez
   compra do monte ou do descarte, seleciona uma carta da mão e clica em **Descartar selecionada**.
4. Nos demais clientes, confira a mudança de turno e das contagens. Cada cliente vê apenas a
   própria mão. As condições de vitória, desistência e empate estão nas [regras](regras-do-jogo.md).

## Demonstrar comunicação entre processos

Com a sala aberta no servidor local, execute o comando abaixo em outro terminal, na pasta do
pacote com executável. Se houver mais de uma sala, use o arquivo de slot correspondente.

```bat
monitor.cmd runtime\shared\slot-000.mmap
```

Depois de uma jogada, repita o comando e compare a versão, a fase e as contagens do snapshot.
O monitor é uma segunda JVM que lê a região mapeada com `FileLock`. Os clientes web recebem
estados por WebSocket. Os dois caminhos estão na [arquitetura](arquitetura.md). Os resultados
da verificação estão na página de [testes](testes.md).
