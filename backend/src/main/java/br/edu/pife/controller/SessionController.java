package br.edu.pife.controller;
import br.edu.pife.service.SessionRegistry;
import br.edu.pife.exception.GameException;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
@RestController
public class SessionController {
    private final SessionRegistry sessions;
    public SessionController(SessionRegistry sessions) { this.sessions=sessions; }
    @PostMapping("/api/session") public ResponseEntity<SessionRegistry.Credentials> create() {
        return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(sessions.create());
    }
    @GetMapping("/api/health") public Map<String,String> health() { return Map.of("status","UP","protocol","PIFE/1"); }
    @ExceptionHandler(GameException.class) ResponseEntity<Map<String,String>> error(GameException error) {
        return ResponseEntity.status(429).body(Map.of("code",error.code(),"message",error.getMessage()));
    }
}
