# Fontes técnicas consultadas

Consulta em 03/11/2026. Inicialmente Context7 não estava disponível; foram usadas fontes oficiais e
metadados dos registries. O plugin foi conectado durante o trabalho, e as configurações foram conferidas:
Spring Framework `/spring-projects/spring-framework/v6.2.19` (ChannelInterceptor, CONNECT/setUser e
convertAndSendToUser) e Tailwind `/tailwindlabs/tailwindcss.com` (plugin Vite e import CSS).

- Spring Boot, versões/requisitos: https://docs.spring.io/spring-boot/system-requirements.html
- Linha escolhida (3.5): https://docs.spring.io/spring-boot/3.5/system-requirements.html
- Autenticação STOMP: https://docs.spring.io/spring-framework/reference/web/websocket/stomp/authentication-token-based.html
- Destinos privados: https://docs.spring.io/spring-framework/reference/web/websocket/stomp/user-destination.html
- Vite: https://vite.dev/guide/
- Tailwind/Vite: https://tailwindcss.com/docs/installation/using-vite
- Java NIO: https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/nio/channels/FileChannel.html
- FileLock: https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/nio/channels/FileLock.html
- Propriedades de rede e temporários Unix-domain: https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/net/doc-files/net-properties.html
- Versões Spring verificadas em https://repo.maven.apache.org/maven2/org/springframework/boot/spring-boot-starter-parent/maven-metadata.xml
- Versões frontend conferidas com npm view e fixadas no package-lock.json.

A escolha do Spring Boot 3.5.16 mantém JUnit 5 e Jackson 2, sem migração ao JUnit 6/Jackson 3 da linha 4.
Não se usaram versões preview. Java 21 Temurin foi instalado apenas em .tools/java, sem alteração global.

Atualização de 04/11/2026: Context7 Spring Boot `/spring-projects/spring-boot/v3.5.16` para
forwarded headers; Render `/websites/render` para Docker, Blueprint, healthCheck e checksPass.
Variáveis conferidas em https://render.com/docs/environment-variables (PORT/RENDER_EXTERNAL_URL).
Planos/limites em https://render.com/docs/free. O repositório do colega indicava endereço Render
no campo homepage; isso não significa hospedagem Java no GitHub Pages. Não se reutilizou seu código.

Playwright `/microsoft/playwright/v1.64.1` no Context7: routeWebSocket/connectToServer e
encaminhamento manual via onMessage para testar perda/atraso de respostas no socket real.
