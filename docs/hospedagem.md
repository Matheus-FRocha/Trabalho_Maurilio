# Implantação web

O serviço público usa uma instância Docker no Render Free. O Dockerfile compila o cliente React
com Node.js, executa os testes Java com Maven e empacota a interface no JAR Spring Boot. A imagem
final executa o JAR em um JRE 21 com usuário sem privilégios. [Abrir o jogo](https://pife-caxeta.onrender.com)

## Configuração

| Item | Valor |
| --- | --- |
| Tipo de serviço e ambiente | Web Service, Docker |
| Branch e contexto de build | `main`, raiz do repositório |
| Dockerfile | `./Dockerfile` |
| Verificação de saúde | `/api/health` |
| Porta | Variável `PORT` definida pelo Render |
| Origem permitida para WebSocket | `RENDER_EXTERNAL_URL`, com opção de configurar `PIFE_ALLOWED_ORIGINS` |
| Pasta do arquivo mapeado | `PIFE_SHARED_DIRECTORY=/app/runtime/shared` |

A interface, a API e o WebSocket são servidos na mesma origem HTTPS. A autorização de cada
jogador vem da sessão anônima criada pelo servidor. Os testes da imagem executam partidas
pelo navegador e verificam a leitura da região mapeada em outra JVM. [Resultados dos testes](testes.md)

## Limites da hospedagem

O Render Free pode suspender serviços ociosos e demorar cerca de um minuto para reativá-los.
Reinícios encerram as partidas e sessões em memória. A demonstração do monitor pode ser feita
no computador que executa o servidor. [Guia de execução](entrega.md#demonstrar-comunicação-entre-processos)
· [Documentação do plano Free](https://render.com/docs/free)
