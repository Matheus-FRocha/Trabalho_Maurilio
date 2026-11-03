package br.edu.pife.websocket;
import br.edu.pife.dto.*;
import br.edu.pife.service.*;
import br.edu.pife.exception.GameException;
import org.slf4j.*;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.stereotype.Controller;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;
import java.security.Principal;
@Controller
public class GameSocketController {
    private static final Logger log=LoggerFactory.getLogger(GameSocketController.class);
    private final GameService games;
    private final EventDispatcher events;
    private final SessionRegistry sessions;
    public GameSocketController(GameService games,EventDispatcher events,SessionRegistry sessions) { this.games=games; this.events=events; this.sessions=sessions; }
    @MessageMapping("/game") public void command(Command command,Principal principal) {
        if(principal==null) return;
        try { events.deliver(games.handle(principal.getName(),command)); }
        catch(GameException error) { events.send(principal.getName(),new Event("GAME_ERROR",command.messageId(),command.roomId(),0,null,error.code(),error.getMessage())); }
        catch(Exception error) {
            log.error("Unexpected game failure",error);
            events.send(principal.getName(),new Event("GAME_ERROR",command.messageId(),command.roomId(),0,null,"INTERNAL","Falha interna. Sincronize a sala."));
        }
    }
    @EventListener public void disconnect(SessionDisconnectEvent event) {
        if(event.getUser()!=null && sessions.disconnected(event.getUser().getName(),event.getSessionId()))
            events.deliver(games.disconnect(event.getUser().getName()));
    }
}
