package br.edu.pife;

import br.edu.pife.service.SessionRegistry;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.messaging.simp.stomp.*;
import org.springframework.web.socket.WebSocketHttpHeaders;
import org.springframework.web.socket.client.standard.StandardWebSocketClient;
import org.springframework.web.socket.messaging.WebSocketStompClient;
import java.util.concurrent.TimeUnit;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(webEnvironment=SpringBootTest.WebEnvironment.RANDOM_PORT,properties={
    "RENDER_EXTERNAL_URL=https://pife.example.test", "pife.shared-directory=target/test-public-shared"})
class PublicOriginIntegrationTest {
    @LocalServerPort int port;
    @Autowired SessionRegistry sessions;
    @Test void acceptsConfiguredPublicOriginAndRejectsAnotherOrigin() throws Exception {
        var client=new WebSocketStompClient(new StandardWebSocketClient());
        try {
            var credentials=sessions.create();
            var stomp=new StompHeaders(); stomp.add("Authorization","Bearer "+credentials.token());
            var headers=new WebSocketHttpHeaders(); headers.setOrigin("https://pife.example.test");
            headers.add("X-Forwarded-Proto","https"); headers.add("X-Forwarded-Host","pife.example.test");
            var connection=client.connectAsync("ws://localhost:"+port+"/ws",headers,stomp,new StompSessionHandlerAdapter(){}).get(5,TimeUnit.SECONDS);
            assertTrue(connection.isConnected()); connection.disconnect();
            var foreign=new WebSocketHttpHeaders(); foreign.setOrigin("https://foreign.example.test");
            assertThrows(Exception.class, () -> client.connectAsync("ws://localhost:"+port+"/ws",foreign,stomp,new StompSessionHandlerAdapter(){}).get(5,TimeUnit.SECONDS));
        } finally { client.stop(); }
    }
}
