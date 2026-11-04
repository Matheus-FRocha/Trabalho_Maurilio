package br.edu.pife;

import br.edu.pife.dto.*;
import br.edu.pife.model.*;
import br.edu.pife.service.*;
import br.edu.pife.exception.GameException;
import org.junit.jupiter.api.Test;
import java.time.Clock;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;

class FourPlayerTest {
    private final GameService service=new GameService(Clock.systemUTC(), copies -> Deck.shuffledCopies(copies,new Random(42)));
    private Command command(String type,String room,Long version,Map<String,String> payload) {
        return new Command(type,room,UUID.randomUUID().toString(),version,payload);
    }
    private GameView send(String player,String type,String room,Long version,Map<String,String> payload) {
        return service.handle(player,command(type,room,version,payload)).stream().filter(d -> d.playerId().equals(player)).findFirst().orElseThrow().event().state();
    }
    private GameView waiting(int players) {
        var state=send("a","CREATE_ROOM",null,null,Map.of("name","Ana","maxPlayers","4"));
        for(var id:List.of("b","c","d").subList(0,players-1)) state=send(id,"JOIN_ROOM",state.roomId(),null,Map.of("name",id));
        return state;
    }
    private GameView ready() {
        var state=waiting(4);
        return send("a","START_GAME",state.roomId(),state.version(),Map.of());
    }
    @Test void doubleDeckHas104DistinctIdentitiesWithExactlyTwoOfEachFace() {
        var cards=Deck.forCopies(2);
        assertEquals(104,cards.size()); assertEquals(104,new HashSet<>(cards).size());
        for(var face:Deck.ordered()) assertEquals(2,cards.stream().filter(c -> c.rank()==face.rank() && c.suit().equals(face.suit())).count());
        assertTrue(cards.contains(Card.parse("C1-2")));
        assertThrows(IllegalArgumentException.class, () -> Card.parse("C1-3"));
        assertThrows(IllegalArgumentException.class, () -> Deck.forCopies(3));
    }
    @Test void identicalFacesAreAllowedInSeparateRunsButNotAsDifferentSuitsInASet() {
        var good=Arrays.stream("C1 C2 C3 C1-2 C2-2 C3-2 H7 H8 H9".split(" ")).map(Card::parse).toList();
        var bad=Arrays.stream("C5 C5-2 D5 H7 H8 H9 S1 S2 S3".split(" ")).map(Card::parse).toList();
        assertTrue(MeldValidator.isWinning(good)); assertFalse(MeldValidator.isWinning(bad));
    }
    @Test void rejectsUnsupportedCapacityAndDoesNotStartWithThreePlayers() {
        assertThrows(GameException.class, () -> send("a","CREATE_ROOM",null,null,Map.of("name","A","maxPlayers","3")));
        var state=waiting(3);
        assertEquals(4,state.maxPlayers()); assertEquals(2,state.deckCopies());
        assertThrows(GameException.class, () -> send("a","START_GAME",state.roomId(),state.version(),Map.of()));
    }
    @Test void dealsNinePrivateCardsToAllFourAndRejectsFifth() {
        var state=ready();
        assertEquals(67,state.deckCount()); assertEquals(4,state.players().size());
        var all=new HashSet<Card>();
        for(var player:List.of("a","b","c","d")) {
            var view=send(player,"SYNC_ROOM",state.roomId(),null,Map.of());
            assertEquals(9,view.hand().size());
            for(var card:view.hand()) assertTrue(all.add(card),"Same physical card dealt twice");
        }
        assertEquals(36,all.size());
        assertThrows(GameException.class, () -> send("e","JOIN_ROOM",state.roomId(),null,Map.of("name","E")));
    }
    @Test void turnsRotateInJoinOrderThroughAllFourPlayers() {
        var state=ready();
        for(var player:List.of("a","b","c","d")) {
            assertEquals(player,state.turnPlayerId());
            var drawn=send(player,"DRAW_CARD",state.roomId(),state.version(),Map.of("source","DECK"));
            state=send(player,"DISCARD_CARD",state.roomId(),drawn.version(),Map.of("cardId",drawn.hand().getLast().id()));
            assertEquals("PLAYING",state.status());
        }
        assertEquals("a",state.turnPlayerId());
    }
    @Test void leavingOnTurnAfterDrawContinuesAtNextPlayerAndDoesNotPauseForLeaver() {
        var state=ready();
        var drawn=send("a","DRAW_CARD",state.roomId(),state.version(),Map.of("source","DECK"));
        var left=send("a","LEAVE_ROOM",state.roomId(),drawn.version(),Map.of());
        assertEquals("PLAYING",left.status()); assertEquals("b",left.turnPlayerId()); assertEquals("DRAW",left.phase());
        assertFalse(left.players().getFirst().active());
        var next=send("b","DRAW_CARD",state.roomId(),left.version(),Map.of("source","DECK"));
        assertEquals(10,next.hand().size());
    }
    @Test void leavingOffTurnPreservesCurrentDrawAndLastRemainingPlayerWins() {
        var state=ready();
        var drawn=send("a","DRAW_CARD",state.roomId(),state.version(),Map.of("source","DECK"));
        var b=send("b","LEAVE_ROOM",state.roomId(),drawn.version(),Map.of());
        assertEquals("a",b.turnPlayerId()); assertEquals("DISCARD",b.phase());
        var c=send("c","LEAVE_ROOM",state.roomId(),b.version(),Map.of());
        var d=send("d","LEAVE_ROOM",state.roomId(),c.version(),Map.of());
        assertEquals("FINISHED",d.status()); assertEquals("a",d.winnerId()); assertEquals("ABANDONMENT",d.reason());
    }
    @Test void formerPlayerCanCreateAnotherRoomAndOldSyncNeitherReactivatesNorBroadcasts() {
        var state=ready();
        send("a","LEAVE_ROOM",state.roomId(),state.version(),Map.of());
        var another=send("a","CREATE_ROOM",null,null,Map.of("name","Ana"));
        assertEquals(2,another.maxPlayers());
        var deliveries=service.handle("a",command("SYNC_ROOM",state.roomId(),null,Map.of()));
        assertEquals(List.of("a"),deliveries.stream().map(Delivery::playerId).toList());
        assertFalse(deliveries.getFirst().event().state().players().getFirst().active());
        assertThrows(GameException.class, () -> send("a","DRAW_CARD",state.roomId(),state.version()+1,Map.of("source","DECK")));
        var current=send("b","SYNC_ROOM",state.roomId(),null,Map.of());
        var update=service.handle("b",command("DRAW_CARD",state.roomId(),current.version(),Map.of("source","DECK")));
        assertFalse(update.stream().anyMatch(d -> d.playerId().equals("a")));
    }
}
