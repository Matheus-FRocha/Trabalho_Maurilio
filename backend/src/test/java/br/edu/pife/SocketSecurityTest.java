package br.edu.pife;
import br.edu.pife.service.SessionRegistry;
import br.edu.pife.websocket.SocketSecurity;
import org.junit.jupiter.api.Test;
import org.springframework.messaging.simp.stomp.*;
import org.springframework.messaging.support.MessageBuilder;
import java.time.Clock;
import static org.junit.jupiter.api.Assertions.*;

class SocketSecurityTest {
    @Test void rejectsForeignSubscriptionsAndClientBrokerPublishing() {
        var registry=new SessionRegistry(Clock.systemUTC());
        var security=new SocketSecurity(registry);
        var credentials=registry.create();
        var connect=StompHeaderAccessor.create(StompCommand.CONNECT);
        connect.setSessionId("session-a"); connect.setNativeHeader("Authorization","Bearer "+credentials.token());
        connect.setLeaveMutable(true);
        security.preSend(MessageBuilder.createMessage(new byte[0],connect.getMessageHeaders()),null);
        for(String destination:new String[]{"/queue/events","/topic/room","/user/other/queue/events"}) {
            var subscribe=StompHeaderAccessor.create(StompCommand.SUBSCRIBE);
            subscribe.setSessionId("session-a"); subscribe.setUser(connect.getUser()); subscribe.setDestination(destination);
            assertThrows(RuntimeException.class, () -> security.preSend(MessageBuilder.createMessage(new byte[0],subscribe.getMessageHeaders()),null));
        }
        var send=StompHeaderAccessor.create(StompCommand.SEND);
        send.setSessionId("session-a"); send.setUser(connect.getUser()); send.setDestination("/queue/events");
        assertThrows(RuntimeException.class, () -> security.preSend(MessageBuilder.createMessage(new byte[0],send.getMessageHeaders()),null));
    }
}
