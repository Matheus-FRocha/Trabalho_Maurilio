package br.edu.pife;
import br.edu.pife.service.SessionRegistry;
import org.junit.jupiter.api.Test;
import java.time.*;
import static org.junit.jupiter.api.Assertions.*;
class SessionRegistryTest {
    @Test void newerConnectionReplacesOldSocketWithoutLosingIdentity() {
        var sessions=new SessionRegistry(Clock.systemUTC());
        var credentials=sessions.create();
        var first=sessions.connect("Bearer "+credentials.token(),"one");
        var second=sessions.connect("Bearer "+credentials.token(),"two");
        assertEquals(first.getName(),second.getName());
        assertThrows(RuntimeException.class, () -> sessions.validate(first,"one"));
        assertFalse(sessions.disconnected(first.getName(),"one"));
        assertDoesNotThrow(() -> sessions.validate(second,"two"));
        assertTrue(sessions.disconnected(second.getName(),"two"));
    }
    @Test void bearerTokenIsNecessaryAndRandomPerSession() {
        var sessions=new SessionRegistry(Clock.systemUTC());
        var a=sessions.create(); var b=sessions.create();
        assertNotEquals(a.token(),b.token()); assertNotEquals(a.playerId(),b.playerId());
        assertThrows(RuntimeException.class, () -> sessions.connect(null,"x"));
        assertThrows(RuntimeException.class, () -> sessions.connect("Bearer "+a.playerId(),"x"));
    }
}
