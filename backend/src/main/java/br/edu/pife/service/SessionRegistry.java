package br.edu.pife.service;

import br.edu.pife.exception.GameException;
import java.security.*;
import java.time.*;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

public final class SessionRegistry {
    public record Credentials(String playerId,String token) {}
    private record Identity(String playerId,Instant expires) {}
    private final Map<String,Identity> tokens=new ConcurrentHashMap<>();
    private final Map<String,String> activeSockets=new ConcurrentHashMap<>();
    private final Clock clock;
    private final SecureRandom random=new SecureRandom();
    public SessionRegistry(Clock clock) { this.clock=clock; }
    public synchronized Credentials create() {
        expire();
        if(tokens.size()>=1000) throw new GameException("CAPACITY","Limite de sessões atingido.");
        byte[] bytes=new byte[32]; random.nextBytes(bytes);
        String token=Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
        String playerId=UUID.randomUUID().toString();
        tokens.put(token,new Identity(playerId,clock.instant().plusSeconds(7200)));
        return new Credentials(playerId,token);
    }
    public Principal connect(String authorization,String socket) {
        if(authorization==null || !authorization.startsWith("Bearer ")) throw new GameException("IDENTITY","Token necessário.");
        var identity=tokens.get(authorization.substring(7));
        if(identity==null || identity.expires.isBefore(clock.instant())) throw new GameException("IDENTITY","Sessão expirada. Abra uma nova sessão.");
        activeSockets.put(identity.playerId,socket);
        return identity::playerId;
    }
    public void validate(Principal principal,String socket) {
        if(principal==null || !Objects.equals(activeSockets.get(principal.getName()),socket))
            throw new GameException("IDENTITY","Conexão substituída ou inválida.");
    }
    public boolean disconnected(String player,String socket) { return activeSockets.remove(player,socket); }
    public void expire() {
        var now=clock.instant();
        tokens.entrySet().removeIf(entry -> entry.getValue().expires.isBefore(now) && !activeSockets.containsKey(entry.getValue().playerId));
    }
}
