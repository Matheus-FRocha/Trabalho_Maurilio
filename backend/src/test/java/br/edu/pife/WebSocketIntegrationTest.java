package br.edu.pife;

import br.edu.pife.dto.*;
import br.edu.pife.service.SessionRegistry;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.stomp.*;
import org.springframework.web.socket.client.standard.StandardWebSocketClient;
import org.springframework.web.socket.messaging.WebSocketStompClient;
import org.springframework.messaging.converter.MappingJackson2MessageConverter;
import java.lang.reflect.Type;
import java.util.*;
import java.util.concurrent.*;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(webEnvironment=SpringBootTest.WebEnvironment.RANDOM_PORT,properties={"pife.shared-directory=target/test-shared"})
class WebSocketIntegrationTest {
    @LocalServerPort int port;
    @Autowired TestRestTemplate rest;
    @Autowired SessionRegistry sessions;
    @Test void twoRealSocketsExchangePrivateHandsAndErrors() throws Exception {
        try(var a=new Peer(); var b=new Peer()) {
            a.send("CREATE_ROOM",null,null,Map.of("name","Ana"));
            var created=a.next();
            b.send("JOIN_ROOM",created.roomId(),null,Map.of("name","Beto"));
            var joined=b.next(); a.next();
            a.send("START_GAME",joined.roomId(),joined.version(),Map.of());
            var first=a.next(); var second=b.next();
            assertEquals(9,first.state().hand().size());
            assertEquals(9,second.state().hand().size());
            assertTrue(Collections.disjoint(first.state().hand(),second.state().hand()));
            b.send("DRAW_CARD",joined.roomId(),first.version(),Map.of("source","DECK"));
            assertEquals("NOT_YOUR_TURN",b.next().code());
            a.send("DRAW_CARD",joined.roomId(),first.version(),Map.of("source","DECK"));
            var drawn=a.next(); var observed=b.next();
            assertEquals(10,drawn.state().hand().size());
            assertEquals(9,observed.state().hand().size());
            assertEquals(10,observed.state().players().getFirst().cardCount());
            a.send("DISCARD_CARD",joined.roomId(),drawn.version(),Map.of("cardId",drawn.state().hand().getLast().id()));
            var discarded=a.next(); b.next();
            assertEquals(9,discarded.state().hand().size());
            if("PLAYING".equals(discarded.state().status())) assertEquals(b.credentials.playerId(),discarded.state().turnPlayerId());
        }
    }
    @Test void invalidTokenCannotConnect() {
        var client=new WebSocketStompClient(new StandardWebSocketClient());
        try {
            var headers=new StompHeaders(); headers.add("Authorization","Bearer invalid");
            assertThrows(Exception.class, () -> client.connectAsync("ws://localhost:"+port+"/ws",new org.springframework.web.socket.WebSocketHttpHeaders(),headers,new StompSessionHandlerAdapter(){}).get(5,TimeUnit.SECONDS));
        } finally { client.stop(); }
    }
    private class Peer implements AutoCloseable {
        final SessionRegistry.Credentials credentials=rest.postForObject("/api/session",null,SessionRegistry.Credentials.class);
        final BlockingQueue<Event> events=new LinkedBlockingQueue<>();
        final WebSocketStompClient client=new WebSocketStompClient(new StandardWebSocketClient());
        final org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler scheduler=new org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler();
        final StompSession connection;
        Peer() throws Exception {
            client.setMessageConverter(new MappingJackson2MessageConverter());
            scheduler.initialize(); client.setTaskScheduler(scheduler);
            var headers=new StompHeaders(); headers.add("Authorization","Bearer "+credentials.token());
            connection=client.connectAsync("ws://localhost:"+port+"/ws",new org.springframework.web.socket.WebSocketHttpHeaders(),headers,new StompSessionHandlerAdapter(){}).get(5,TimeUnit.SECONDS);
            connection.subscribe("/user/queue/events",new StompFrameHandler(){
                public Type getPayloadType(StompHeaders h) { return Event.class; }
                public void handleFrame(StompHeaders h,Object payload) { events.add((Event)payload); }
            });
        }
        void send(String type,String room,Long version,Map<String,String> payload) {
            connection.send("/app/game",new Command(type,room,UUID.randomUUID().toString(),version,payload));
        }
        Event next() throws Exception { var event=events.poll(5,TimeUnit.SECONDS); assertNotNull(event,"Missing STOMP event"); return event; }
        public void close() { if(connection.isConnected()) connection.disconnect(); client.stop(); scheduler.shutdown(); }
    }
}
