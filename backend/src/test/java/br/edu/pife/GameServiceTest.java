package br.edu.pife;

import br.edu.pife.dto.*;
import br.edu.pife.model.*;
import br.edu.pife.service.GameService;
import br.edu.pife.exception.GameException;
import org.junit.jupiter.api.Test;
import java.time.*;
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;
import static org.junit.jupiter.api.Assertions.*;

class GameServiceTest {
    private final GameService service = new GameService(Clock.systemUTC(), Deck::ordered);
    private Command cmd(String type, String room, Long version, Map<String,String> payload) {
        return new Command(type, room, UUID.randomUUID().toString(), version, payload);
    }
    private GameView send(String who, String type, String room, Long version, Map<String,String> payload) {
        return service.handle(who, cmd(type, room, version, payload)).stream()
            .filter(d -> d.playerId().equals(who)).findFirst().orElseThrow().event().state();
    }
    private GameView ready() {
        var created = send("a", "CREATE_ROOM", null, null, Map.of("name","Ana"));
        var joined = send("b", "JOIN_ROOM", created.roomId(), null, Map.of("name","Beto"));
        return send("a", "START_GAME", joined.roomId(), joined.version(), Map.of());
    }
    @Test void createsJoinsAndDealsOnlyPrivateHands() {
        var state = ready();
        assertEquals("PLAYING", state.status());
        assertEquals(9, state.hand().size());
        assertEquals(33, state.deckCount());
        var other = send("b","SYNC_ROOM",state.roomId(),null,Map.of());
        assertEquals(9,other.hand().size());
        assertTrue(Collections.disjoint(state.hand(),other.hand()));
        assertEquals(List.of(9,9),other.players().stream().map(PlayerView::cardCount).toList());
        assertThrows(GameException.class, () -> send("c","JOIN_ROOM",state.roomId(),null,Map.of("name","C")));
        assertThrows(GameException.class, () -> send("c","SYNC_ROOM",state.roomId(),null,Map.of()));
    }
    @Test void validatesTurnsPhaseOwnershipAndStaleVersionWithoutMutation() {
        var state = ready();
        assertThrows(GameException.class, () -> send("b","DRAW_CARD",state.roomId(),state.version(),Map.of("source","DECK")));
        assertThrows(GameException.class, () -> send("a","DISCARD_CARD",state.roomId(),state.version(),Map.of("cardId","C1")));
        var drawn = send("a","DRAW_CARD",state.roomId(),state.version(),Map.of("source","DECK"));
        assertEquals(10,drawn.hand().size());
        assertEquals("DISCARD",drawn.phase());
        assertThrows(GameException.class, () -> send("a","DRAW_CARD",state.roomId(),drawn.version(),Map.of("source","DECK")));
        assertThrows(GameException.class, () -> send("a","DISCARD_CARD",state.roomId(),state.version(),Map.of("cardId","C1")));
        assertThrows(GameException.class, () -> send("a","DISCARD_CARD",state.roomId(),drawn.version(),Map.of("cardId","S13")));
        assertEquals(drawn.version(),send("a","SYNC_ROOM",state.roomId(),null,Map.of()).version());
    }
    @Test void duplicateMessageDoesNotDrawTwice() {
        var state=ready();
        var command=cmd("DRAW_CARD",state.roomId(),state.version(),Map.of("source","DISCARD"));
        var first=service.handle("a",command).getFirst().event().state();
        var duplicate=service.handle("a",command).getFirst().event().state();
        assertEquals(first.version(),duplicate.version());
        assertEquals(10,duplicate.hand().size());
        assertNull(duplicate.discardTop());
    }
    @Test void concurrentDrawsHaveExactlyOneWinner() throws Exception {
        var state=ready();
        var successes=new AtomicInteger();
        var gate=new CountDownLatch(1);
        try(var pool=Executors.newFixedThreadPool(8)) {
            var futures=new ArrayList<Future<?>>();
            for(int i=0;i<8;i++) futures.add(pool.submit(() -> {
                try { gate.await(); send("a","DRAW_CARD",state.roomId(),state.version(),Map.of("source","DECK")); successes.incrementAndGet(); }
                catch(GameException expected) { } catch(InterruptedException e) { Thread.currentThread().interrupt(); }
            }));
            gate.countDown();
            for(var future:futures) future.get(5,TimeUnit.SECONDS);
        }
        assertEquals(1,successes.get());
        var result=send("a","SYNC_ROOM",state.roomId(),null,Map.of());
        assertEquals(10,result.hand().size());
        assertEquals(32,result.deckCount());
        assertEquals(state.version()+1,result.version());
    }
    @Test void winningDiscardEndsGameAndBlocksFurtherActions() {
        var state=ready();
        var drawn=send("a","DRAW_CARD",state.roomId(),state.version(),Map.of("source","DECK"));
        // Ordered deck deals C1..C9 to host: three consecutive runs.
        var extra=drawn.hand().getLast();
        var won=send("a","DISCARD_CARD",state.roomId(),drawn.version(),Map.of("cardId",extra.id()));
        assertEquals("FINISHED",won.status());
        assertEquals("a",won.winnerId());
        assertEquals("MELDS",won.reason());
        assertThrows(GameException.class, () -> send("b","DRAW_CARD",won.roomId(),won.version(),Map.of("source","DECK")));
    }
    @Test void disconnectPausesUntilSyncAndResignHasAResult() {
        var state=ready();
        service.disconnect("b");
        var paused=send("a","SYNC_ROOM",state.roomId(),null,Map.of());
        assertFalse(paused.players().get(1).connected());
        assertThrows(GameException.class, () -> send("a","DRAW_CARD",state.roomId(),paused.version(),Map.of("source","DECK")));
        var back=send("b","SYNC_ROOM",state.roomId(),null,Map.of());
        var ended=send("a","LEAVE_ROOM",state.roomId(),back.version(),Map.of());
        assertEquals("FINISHED",ended.status());
        assertEquals("b",ended.winnerId());
    }
    @Test void expiresIdleRoomsAndReleasesPlayerMembership() {
        var now=Instant.parse("2026-11-03T12:00:00Z");
        var svc=new GameService(Clock.fixed(now,ZoneOffset.UTC),Deck::ordered);
        var created=svc.handle("a",cmd("CREATE_ROOM",null,null,Map.of("name","A"))).getFirst().event().state();
        assertEquals(List.of(created.roomId()),svc.expire(now.plusSeconds(1801)));
        assertThrows(GameException.class, () -> svc.handle("a",cmd("SYNC_ROOM",created.roomId(),null,Map.of())));
        assertNotNull(svc.handle("a",cmd("CREATE_ROOM",null,null,Map.of("name","A"))));
    }
    @Test void finishedPlayersCanJoinAnotherRoom() {
        var state=ready();
        send("a","LEAVE_ROOM",state.roomId(),state.version(),Map.of());
        var another=send("c","CREATE_ROOM",null,null,Map.of("name","C"));
        var joined=send("b","JOIN_ROOM",another.roomId(),null,Map.of("name","B"));
        assertEquals(2,joined.players().size());
    }
    @Test void syncingFinishedRoomDoesNotNotifyPlayerNowInAnotherRoom() {
        var state=ready();
        send("a","LEAVE_ROOM",state.roomId(),state.version(),Map.of());
        var another=send("a","CREATE_ROOM",null,null,Map.of("name","Ana"));
        var deliveries=service.handle("b",cmd("SYNC_ROOM",state.roomId(),null,Map.of()));
        assertEquals(List.of("b"),deliveries.stream().map(Delivery::playerId).toList());
        assertEquals(another.roomId(),send("a","SYNC_ROOM",another.roomId(),null,Map.of()).roomId());
    }
    @Test void exhaustedDeckEndsAsDrawWhenNobodyHasMelds() {
        var svc=new GameService(Clock.systemUTC(),() -> Deck.shuffled(new Random(42)));
        var created=svc.handle("a",cmd("CREATE_ROOM",null,null,Map.of("name","A"))).getFirst().event().state();
        var joined=svc.handle("b",cmd("JOIN_ROOM",created.roomId(),null,Map.of("name","B"))).getFirst().event().state();
        var state=svc.handle("a",cmd("START_GAME",joined.roomId(),joined.version(),Map.of())).getFirst().event().state();
        for(int i=0;i<33;i++) {
            String player=state.turnPlayerId();
            var results=svc.handle(player,cmd("DRAW_CARD",state.roomId(),state.version(),Map.of("source","DECK")));
            var drawn=results.stream().filter(d -> d.playerId().equals(player)).findFirst().orElseThrow().event().state();
            state=svc.handle(player,cmd("DISCARD_CARD",drawn.roomId(),drawn.version(),Map.of("cardId",drawn.hand().getLast().id()))).getFirst().event().state();
        }
        assertEquals("FINISHED",state.status()); assertEquals("DECK_EMPTY",state.reason()); assertNull(state.winnerId());
    }
}
