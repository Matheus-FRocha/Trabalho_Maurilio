# Pife/Caxeta

Jogo de cartas em tempo real para **2 ou 4 jogadores**, desenvolvido para a disciplina de
Sistemas Operacionais. O servidor Java controla as regras, envia estados por STOMP sobre
WebSocket e compartilha um snapshot público com um monitor em outra JVM.

**[Jogar online](https://pife-caxeta.onrender.com)** · **[Guia de execução](docs/entrega.md)**

No plano gratuito, a primeira abertura após inatividade pode levar cerca de um minuto.

## Como jogar

1. Escolha uma mesa de dois ou quatro lugares e compartilhe o código com os participantes.
2. Quando todos estiverem conectados, o anfitrião clica em **Começar partida**.
3. Na sua vez, compre do monte ou do topo do descarte. Selecione uma carta da mão e clique
   em **Descartar selecionada**.
4. Vence quem, após descartar, fica com três trincas ou sequências de três cartas, em
   qualquer combinação. [Regras completas](docs/regras-do-jogo.md)

Para testar sozinho, use uma janela normal e outra anônima ou dois navegadores diferentes.
Durante uma partida, a logo volta à tela inicial e **Retomar mesa** abre a mesma sala.

## Compilar e executar

Se você recebeu um pacote com JAR, siga o [guia de execução](docs/entrega.md#executar-o-pacote-no-windows).
Para compilar a partir do código-fonte no Windows, use **JDK 21**, **Node.js 22.12+** e **Maven**
no `PATH`. No CMD, execute da raiz do projeto:

```bat
cd frontend
npm ci
npm run build
cd ..\backend
mvn clean package
java -jar target\pife-1.0.0.jar
```

No Linux ou macOS, a partir da raiz:

```sh
cd frontend
npm ci
npm run build
cd ../backend
./mvnw clean package
java -jar target/pife-1.0.0.jar
```

Após iniciar o servidor, abra **http://localhost:8080**. O JAR contém a interface compilada.
O [guia de execução](docs/entrega.md) também cobre acesso pela rede local e o monitor de
memória compartilhada em um segundo terminal.

## Documentação técnica

- [Requisitos do trabalho](docs/requisitos.md)
- [Arquitetura e processos](docs/arquitetura.md)
- [Protocolo de mensagens](docs/protocolo-de-mensagens.md)
- [Memória compartilhada](docs/gerenciamento-de-memoria.md) e [exclusão mútua](docs/exclusao-mutua.md)
- [Resultados dos testes](docs/testes.md) e [histórico técnico](docs/progresso.md)
- [Implantação no Render](docs/hospedagem.md) e [referências](docs/referencias.md)

[Licença](LICENSE)
