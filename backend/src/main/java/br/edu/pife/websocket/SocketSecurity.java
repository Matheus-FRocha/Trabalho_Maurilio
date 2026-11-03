package br.edu.pife.websocket;
import br.edu.pife.service.SessionRegistry;
import org.springframework.messaging.*;
import org.springframework.messaging.simp.stomp.*;
import org.springframework.messaging.support.*;
public final class SocketSecurity implements ChannelInterceptor {
    private final SessionRegistry sessions;
    public SocketSecurity(SessionRegistry sessions) { this.sessions=sessions; }
    @Override public Message<?> preSend(Message<?> message,MessageChannel channel) {
        var headers=MessageHeaderAccessor.getAccessor(message,StompHeaderAccessor.class);
        if(headers==null || headers.getCommand()==null) return message;
        var command=headers.getCommand();
        if(command==StompCommand.CONNECT) {
            headers.setUser(sessions.connect(headers.getFirstNativeHeader("Authorization"),headers.getSessionId()));
        } else if(command==StompCommand.SEND || command==StompCommand.SUBSCRIBE) {
            sessions.validate(headers.getUser(),headers.getSessionId());
            String allowed=command==StompCommand.SEND?"/app/game":"/user/queue/events";
            if(!allowed.equals(headers.getDestination())) throw new MessageDeliveryException("Destino não autorizado");
        }
        return message;
    }
}
