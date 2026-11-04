# Hospedagem do jogo completo

## Provedor e arquitetura
Render executa o Dockerfile, que compila React com Node24, testa/empacota Java21 com Maven e
inicia o JAR com JRE21, usuário sem privilégios e limite de heap por porcentagem de RAM.
Frontend, `/api/session`, `/api/health` e `/ws` ficam na mesma origem HTTPS, com WebSocket WSS.
O GitHub é a origem do código e da CI; não é o processo que hospeda partidas.
O colega citado pelo usuário usa uma URL onrender.com no campo homepage do próprio repositório.
Apenas essa informação de implantação foi consultada; não se copiou seu jogo.

## Acesso à conta e repositório
O repositório Trabalho_Maurilio é **privado** e deve continuar assim. O usuário entrou na conta Render
e confirmou autorização do GitHub somente para esse repositório. Nenhum token/senha é gravado no Git.
O jogo público usa sessões anônimas com tokens aleatórios e mensagens privadas por jogador.
Publicar o site não torna o código do repositório público.

## Configuração preparada
- Tipo Web Service, origem GitHub Matheus-FRocha/Trabalho_Maurilio, branch main.
- Linguagem/runtime Docker, contexto raiz, Dockerfile `./Dockerfile`.
- Plano Free, uma instância. Não usar banco, disco pago ou múltiplas instâncias.
- Health check `/api/health`.
- `PORT` define porta HTTP (8080 local; Render fornece a sua).
- `RENDER_EXTERNAL_URL` é fornecido pelo Render e usado como origem autorizada automaticamente.
- `PIFE_ALLOWED_ORIGINS` pode sobrescrever a lista se for adicionado domínio próprio; usar URLs exatas.
- `PIFE_SHARED_DIRECTORY=/app/runtime/shared` no contêiner; diretório gravável pelo usuário do app.
- Spring `server.forward-headers-strategy=framework` reconhece o proxy HTTPS.
- `render.yaml` declara `autoDeployTrigger: checksPass`; no painel conferir que os checks são
  aguardados antes do deploy. O Blueprint e o painel devem manter configurações equivalentes.

Docker não estava instalado no Windows desta sessão. A CI tem um job dedicado que constrói a
imagem, inicia na porta 8082 com origem pública simulada, executa Playwright e lê mmap em outra JVM
dentro do contêiner. A validação do contêiner depende do resultado desse job, não de inspeção estática.

## Limites do plano gratuito
O serviço pode suspender após 15 minutos sem tráfego e levar cerca de um minuto para iniciar novamente.
Reinícios/redeploys apagam heap e arquivos locais; as salas e sessões não são persistidas.
Free não oferece shell interativo no Render. A demonstração do monitor deve ser feita localmente
ou pelo job de CI, que executa outro processo Java no mesmo contêiner e lê as páginas mapeadas.
O servidor público escreve snapshots; o navegador continua usando sockets, sem acesso ao mmap.

## Estado da publicação
A URL e o resultado do smoke público serão registrados após a confirmação do serviço pelo Render.
Não interpretar um Dockerfile ou um build da CI como prova de que o jogo já está na internet.

Fontes consultadas em 04/11/2026:
- https://render.com/docs/docker
- https://render.com/docs/blueprint-spec
- https://render.com/docs/environment-variables
- https://render.com/docs/websocket
- https://render.com/docs/free
Configurações de Spring e Render também foram conferidas no Context7.
