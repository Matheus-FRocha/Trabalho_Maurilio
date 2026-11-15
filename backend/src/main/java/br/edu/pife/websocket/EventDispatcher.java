package br.edu.pife.websocket;
import br.edu.pife.dto.*;
import br.edu.pife.service.*;
import org.slf4j.*;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import java.time.Clock;
import java.io.IOException;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
@Component
public class EventDispatcher {
    private static final Logger log=LoggerFactory.getLogger(EventDispatcher.class);
    private final SimpMessagingTemplate messaging;
    private final SharedMemoryStore shared;
    private final GameService games;
    private final SessionRegistry sessions;
    private final Clock clock;
    private final Set<String> pendingExpirations=new LinkedHashSet<>();
    public EventDispatcher(SimpMessagingTemplate messaging,SharedMemoryStore shared,GameService games,SessionRegistry sessions,Clock clock) {
        this.messaging=messaging; this.shared=shared; this.games=games; this.sessions=sessions; this.clock=clock;
    }
    public synchronized void deliver(List<Delivery> deliveries) {
        if(deliveries.isEmpty()) return;
        var state=deliveries.getFirst().event().state();
        if(!games.containsRoom(state.roomId())) return;
        try {
            if(pendingExpirations.contains(state.roomId())) expireSnapshot(state.roomId());
            shared.write(state);
        }
        catch(Exception error) { log.error("IPC public snapshot failed for room {}",state.roomId(),error); }
        for(var delivery:deliveries) send(delivery.playerId(),delivery.event());
    }
    public void send(String player,Event event) { messaging.convertAndSendToUser(player,"/queue/events",event); }
    @Scheduled(fixedDelay=60000) public synchronized void expire() {
        pendingExpirations.addAll(games.expire(clock.instant()));
        for(String room:List.copyOf(pendingExpirations)) {
            try { expireSnapshot(room); } catch(Exception error) { log.warn("IPC expiry failed",error); }
        }
        sessions.expire();
    }
    private void expireSnapshot(String room) throws IOException {
        shared.remove(room);
        pendingExpirations.remove(room);
    }
}
