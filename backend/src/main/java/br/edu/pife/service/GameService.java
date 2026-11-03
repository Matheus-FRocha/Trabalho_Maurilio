package br.edu.pife.service;

import br.edu.pife.dto.*;
import br.edu.pife.model.Card;
import br.edu.pife.exception.GameException;
import java.security.SecureRandom;
import java.time.*;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.locks.ReentrantLock;
import java.util.function.Supplier;

/** All mutable room fields are read/written only while its lock is held. No network I/O here. */
public class GameService {
    private final ConcurrentHashMap<String, Room> rooms = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, String> membership = new ConcurrentHashMap<>();
    private final Clock clock;
    private final Supplier<List<Card>> decks;
    private final SecureRandom random = new SecureRandom();
    public GameService(Clock clock, Supplier<List<Card>> decks) { this.clock=clock; this.decks=decks; }

    public List<Delivery> handle(String player, Command command) {
        require(player != null && !player.isBlank(), "IDENTITY", "Sessão inválida.");
        require(command != null && command.type()!=null && command.messageId()!=null
            && !command.messageId().isBlank() && command.messageId().length()<=80,
            "PROTOCOL", "Mensagem inválida.");
        if ("CREATE_ROOM".equals(command.type())) return create(player,command);
        String roomId=command.roomId()==null ? "" : command.roomId().trim().toUpperCase(Locale.ROOT);
        Room room=rooms.get(roomId);
        require(room!=null,"ROOM_NOT_FOUND","Sala não encontrada ou expirada.");
        room.lock.lock();
        try {
            require(rooms.get(roomId)==room,"ROOM_NOT_FOUND","Sala expirada.");
            if ("JOIN_ROOM".equals(command.type())) return join(room,player,command);
            require(room.players.containsKey(player),"NOT_MEMBER","Você não pertence a esta sala.");
            if ("SYNC_ROOM".equals(command.type())) {
                var member=room.players.get(player);
                if (!member.connected) { member.connected=true; room.version++; }
                room.touched=clock.instant();
                return snapshot(room,command.messageId());
            }
            String key=player+":"+command.messageId();
            if (room.processed.contains(key)) return snapshot(room,command.messageId());
            require(command.version()!=null && command.version()==room.version,"STALE_STATE","Estado mudou. Sincronize e tente novamente.");
            switch(command.type()) {
                case "START_GAME" -> start(room,player);
                case "DRAW_CARD" -> draw(room,player,command.value("source"));
                case "DISCARD_CARD" -> discard(room,player,command.value("cardId"));
                case "LEAVE_ROOM" -> leave(room,player);
                default -> throw new GameException("UNKNOWN_TYPE","Ação desconhecida.");
            }
            room.processed.add(key);
            if(room.processed.size()>128) room.processed.removeFirst();
            room.version++;
            room.touched=clock.instant();
            return snapshot(room,command.messageId());
        } finally { room.lock.unlock(); }
    }
    private synchronized List<Delivery> create(String player, Command command) {
        String previous=membership.get(player);
        if(previous!=null) {
            var old=rooms.get(previous);
            if(old!=null) {
                old.lock.lock();
                try {
                    if (old.createMessage.equals(command.messageId())) return snapshot(old,command.messageId());
                    require("FINISHED".equals(old.status),"ALREADY_IN_ROOM","Saia da sala atual antes de criar outra.");
                } finally { old.lock.unlock(); }
            }
            membership.remove(player,previous);
        }
        require(rooms.size()<128,"CAPACITY","Servidor cheio. Tente novamente depois.");
        String name=name(command);
        String id;
        do { id=String.format("%06X",random.nextInt(0x1000000)); } while(rooms.containsKey(id));
        var room=new Room(id,player,clock.instant(),command.messageId());
        room.players.put(player,new Player(name));
        room.lock.lock();
        try {
            require(membership.putIfAbsent(player,id)==null,"ALREADY_IN_ROOM","Jogador já está em outra sala.");
            rooms.put(id,room);
            return snapshot(room,command.messageId());
        } finally { room.lock.unlock(); }
    }
    private List<Delivery> join(Room room,String player,Command command) {
        if(room.players.containsKey(player)) return snapshot(room,command.messageId());
        require("WAITING".equals(room.status) && room.players.size()<2,"ROOM_FULL","Sala cheia ou já iniciada.");
        String name=name(command);
        require(membership.putIfAbsent(player,room.id)==null,"ALREADY_IN_ROOM","Jogador já está em outra sala.");
        room.players.put(player,new Player(name));
        room.version++;
        room.touched=clock.instant();
        return snapshot(room,command.messageId());
    }
    private String name(Command command) {
        var name=command.value("name");
        require(name!=null && !name.trim().isEmpty() && name.trim().length()<=24,"NAME","Informe um nome de 1 a 24 caracteres.");
        return name.trim();
    }
    private void start(Room room,String player) {
        require(room.host.equals(player),"HOST_ONLY","Somente quem criou a sala pode iniciar.");
        require("WAITING".equals(room.status) && room.players.size()==2,"NOT_READY","Aguarde os dois jogadores.");
        connected(room);
        var deck=new ArrayDeque<>(decks.get());
        require(deck.size()==52 && new HashSet<>(deck).size()==52,"DECK","Baralho inválido.");
        room.deck=deck;
        for(var member:room.players.values()) for(int i=0;i<9;i++) member.hand.add(room.deck.removeFirst());
        room.discards.add(room.deck.removeFirst());
        room.status="PLAYING";
        room.turn=room.host;
    }
    private void turn(Room room,String player,String phase) {
        require("PLAYING".equals(room.status),"NOT_PLAYING","A partida não está em andamento.");
        connected(room);
        require(player.equals(room.turn),"NOT_YOUR_TURN","Aguarde sua vez.");
        require(phase.equals(room.phase),"WRONG_PHASE",phase.equals("DRAW") ? "Descarte uma carta primeiro." : "Compre uma carta primeiro.");
    }
    private void connected(Room room) {
        require(room.players.values().stream().allMatch(p -> p.connected),"PAUSED","Aguardando reconexão do adversário.");
    }
    private void draw(Room room,String player,String source) {
        turn(room,player,"DRAW");
        require(Set.of("DECK","DISCARD").contains(source==null?"":source),"SOURCE","Origem de compra inválida.");
        if("DECK".equals(source)) {
            require(!room.deck.isEmpty(),"EMPTY_DECK","Monte vazio.");
            room.players.get(player).hand.add(room.deck.removeFirst());
        } else {
            require(!room.discards.isEmpty(),"EMPTY_DISCARD","Descarte vazio.");
            room.players.get(player).hand.add(room.discards.removeLast());
        }
        room.phase="DISCARD";
    }
    private void discard(Room room,String player,String cardId) {
        turn(room,player,"DISCARD");
        var hand=room.players.get(player).hand;
        var card=hand.stream().filter(c -> c.id().equals(cardId)).findFirst().orElseThrow(() -> new GameException("CARD_NOT_OWNED","Esta carta não está na sua mão."));
        hand.remove(card);
        room.discards.add(card);
        if(MeldValidator.isWinning(hand)) {
            room.status="FINISHED"; room.winner=player; room.reason="MELDS";
        } else if(room.deck.isEmpty()) {
            room.status="FINISHED"; room.reason="DECK_EMPTY";
        } else {
            room.turn=room.players.keySet().stream().filter(p -> !p.equals(player)).findFirst().orElseThrow();
        }
        room.phase="DRAW";
    }
    private void leave(Room room,String player) {
        require(!"FINISHED".equals(room.status),"FINISHED","Partida já encerrada.");
        room.status="FINISHED"; room.reason="ABANDONMENT";
        room.winner=room.players.keySet().stream().filter(p -> !p.equals(player)).findFirst().orElse(null);
        room.players.get(player).connected=false;
    }
    public List<Delivery> disconnect(String player) {
        var id=membership.get(player);
        var room=id==null?null:rooms.get(id);
        if(room==null) return List.of();
        room.lock.lock();
        try {
            var member=room.players.get(player);
            if(member==null || !member.connected) return List.of();
            member.connected=false; room.version++;
            return snapshot(room,null);
        } finally { room.lock.unlock(); }
    }
    public List<String> expire(Instant now) {
        var removed=new ArrayList<String>();
        for(var room:rooms.values()) {
            room.lock.lock();
            try {
                if(room.touched.plusSeconds(1800).isBefore(now) && rooms.remove(room.id,room)) {
                    room.players.keySet().forEach(p -> membership.remove(p,room.id));
                    removed.add(room.id);
                }
            } finally { room.lock.unlock(); }
        }
        return removed;
    }
    private List<Delivery> snapshot(Room room,String messageId) {
        var players=room.players.entrySet().stream().map(e -> new PlayerView(e.getKey(),e.getValue().name,e.getValue().hand.size(),e.getValue().connected)).toList();
        return room.players.entrySet().stream().map(entry -> {
            var view=new GameView(room.id,room.version,room.status,room.host,room.turn,room.phase,players,
                List.copyOf(entry.getValue().hand),room.discards.isEmpty()?null:room.discards.getLast(),room.deck.size(),room.winner,room.reason);
            return new Delivery(entry.getKey(),new Event("FINISHED".equals(room.status)?"GAME_FINISHED":"GAME_STATE_UPDATED",messageId,room.id,room.version,view,null,null));
        }).toList();
    }
    private static void require(boolean condition,String code,String message) {
        if(!condition) throw new GameException(code,message);
    }
    private static final class Player {
        private final String name;
        private final List<Card> hand=new ArrayList<>();
        private boolean connected=true;
        private Player(String name) { this.name=name; }
    }
    private static final class Room {
        private final ReentrantLock lock=new ReentrantLock();
        private final String id,host,createMessage;
        private final LinkedHashMap<String,Player> players=new LinkedHashMap<>();
        private final LinkedHashSet<String> processed=new LinkedHashSet<>();
        private ArrayDeque<Card> deck=new ArrayDeque<>();
        private final List<Card> discards=new ArrayList<>();
        private String status="WAITING",phase="DRAW",turn,winner,reason;
        private long version=1;
        private Instant touched;
        private Room(String id,String host,Instant now,String createMessage) {
            this.id=id; this.host=host; this.touched=now; this.createMessage=createMessage;
        }
    }
}
