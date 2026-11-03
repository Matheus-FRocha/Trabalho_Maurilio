package br.edu.pife.service;

import br.edu.pife.dto.GameView;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.nio.MappedByteBuffer;
import java.nio.channels.FileChannel;
import java.nio.file.*;
import java.util.*;

/** Bounded shared memory: 128 reusable public slots, each 16 KiB. No private cards or tokens. */
public final class SharedMemoryStore implements AutoCloseable {
    public static final int SIZE=16*1024;
    private final Path directory;
    private final ObjectMapper mapper;
    private final Map<String,Slot> rooms=new HashMap<>();
    private final List<Slot> slots=new ArrayList<>();
    public SharedMemoryStore(Path directory,ObjectMapper mapper) throws IOException {
        this.directory=directory.toAbsolutePath(); this.mapper=mapper; Files.createDirectories(directory);
    }
    public synchronized Path write(GameView state) throws IOException {
        var slot=rooms.get(state.roomId());
        if(slot!=null && state.version()<=slot.version) return slot.path;
        if(slot==null) {
            slot=slots.stream().filter(s -> s.room==null).findFirst().orElse(null);
            if(slot==null) {
                if(slots.size()>=128) throw new IOException("Shared memory capacity exhausted");
                var path=directory.resolve("slot-%03d.mmap".formatted(slots.size()));
                var channel=FileChannel.open(path,StandardOpenOption.CREATE,StandardOpenOption.READ,StandardOpenOption.WRITE);
                var buffer=channel.map(FileChannel.MapMode.READ_WRITE,0,SIZE);
                slot=new Slot(path,channel,buffer); slots.add(slot);
            }
            slot.room=state.roomId(); rooms.put(state.roomId(),slot);
        }
        var data=new LinkedHashMap<String,Object>();
        data.put("protocol","PIFE/1"); data.put("roomId",state.roomId()); data.put("version",state.version());
        data.put("status",state.status()); data.put("turnPlayerId",state.turnPlayerId()); data.put("phase",state.phase());
        data.put("players",state.players()); data.put("deckCount",state.deckCount()); data.put("discardTop",state.discardTop());
        data.put("winnerId",state.winnerId()); data.put("reason",state.reason());
        write(slot,mapper.writeValueAsBytes(data)); slot.version=state.version();
        return slot.path;
    }
    private void write(Slot slot,byte[] bytes) throws IOException {
        if(bytes.length>SIZE-4) throw new IOException("Shared snapshot too large");
        // Java monitor prevents overlapping locks in this JVM; FileLock coordinates other processes.
        try(var lock=slot.channel.lock()) {
            slot.buffer.position(4); slot.buffer.put(bytes); slot.buffer.putInt(0,bytes.length); slot.buffer.force();
        }
    }
    public synchronized void remove(String roomId) throws IOException {
        var slot=rooms.remove(roomId);
        if(slot==null) return;
        write(slot,mapper.writeValueAsBytes(Map.of("roomId",roomId,"status","EXPIRED")));
        slot.room=null; slot.version=0;
    }
    @Override public synchronized void close() throws IOException {
        for(var slot:slots) slot.channel.close();
        rooms.clear(); slots.clear();
    }
    private static final class Slot {
        private final Path path;
        private final FileChannel channel;
        private final MappedByteBuffer buffer;
        private String room;
        private long version;
        private Slot(Path path,FileChannel channel,MappedByteBuffer buffer) { this.path=path; this.channel=channel; this.buffer=buffer; }
    }
}
