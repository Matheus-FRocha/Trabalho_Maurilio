package br.edu.pife.config;
import br.edu.pife.service.SessionRegistry;
import br.edu.pife.websocket.SocketSecurity;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.*;
import org.springframework.web.socket.config.annotation.*;
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    private final SessionRegistry sessions;
    private final String[] origins;
    public WebSocketConfig(SessionRegistry sessions,@Value("${pife.allowed-origins:http://localhost:5173,http://127.0.0.1:5173,http://localhost:8080,http://127.0.0.1:8080}") String[] origins) {
        this.sessions=sessions; this.origins=origins;
    }
    @Override public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws").setAllowedOrigins(origins);
        registry.setPreserveReceiveOrder(true);
    }
    @Override public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.enableSimpleBroker("/queue"); registry.setApplicationDestinationPrefixes("/app"); registry.setPreservePublishOrder(true);
    }
    @Override public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(new SocketSecurity(sessions));
    }
    @Override public void configureWebSocketTransport(WebSocketTransportRegistration registration) {
        registration.setMessageSizeLimit(16*1024).setSendBufferSizeLimit(64*1024).setSendTimeLimit(10000);
    }
}
