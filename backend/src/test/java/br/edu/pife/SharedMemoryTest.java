package br.edu.pife;

import br.edu.pife.dto.*;
import br.edu.pife.model.*;
import br.edu.pife.service.*;
import br.edu.pife.util.SharedMemoryMonitor;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import java.nio.file.*;
import java.time.*;
import java.util.*;
import java.util.concurrent.TimeUnit;
import static org.junit.jupiter.api.Assertions.*;

class SharedMemoryTest {
    @TempDir Path directory;
    @Test void independentJvmReadsSharedMappedStateWithoutPrivateCards() throws Exception {
        var mapper=new ObjectMapper();
        var service=new GameService(Clock.systemUTC(),Deck::ordered);
        var state=service.handle("a",new Command("CREATE_ROOM",null,"create",null,Map.of("name","Ana"))).getFirst().event().state();
        try(var store=new SharedMemoryStore(directory,mapper)) {
            Path file=store.write(state);
            String javaBin=Path.of(System.getProperty("java.home"),"bin","java.exe").toString();
            if(!Files.exists(Path.of(javaBin))) javaBin=Path.of(System.getProperty("java.home"),"bin","java").toString();
            var process=new ProcessBuilder(javaBin,"-cp",System.getProperty("java.class.path"),SharedMemoryMonitor.class.getName(),file.toString()).redirectErrorStream(true).start();
            assertTrue(process.waitFor(10,TimeUnit.SECONDS));
            String output=new String(process.getInputStream().readAllBytes(),java.nio.charset.StandardCharsets.UTF_8);
            assertEquals(0,process.exitValue(),output);
            var json=mapper.readTree(output);
            assertEquals(state.roomId(),json.path("roomId").asText());
            assertEquals("WAITING",json.path("status").asText());
            assertFalse(json.has("hand"));
            assertFalse(output.contains("token"));
        }
    }
    @Test void ignoresOldSnapshotsAndReusesExpiredSlot() throws Exception {
        var state=new GameView("ABC123",5,"PLAYING","a","b","DRAW",List.of(),List.of(Card.parse("H2")),null,30,null,null,2,1);
        try(var store=new SharedMemoryStore(directory,new ObjectMapper())) {
            Path file=store.write(state);
            store.write(new GameView("ABC123",4,"WAITING","a",null,"DRAW",List.of(),List.of(),null,0,null,null,2,1));
            assertTrue(SharedMemoryMonitor.read(file).contains("\"version\":5"));
            store.remove("ABC123");
            assertTrue(SharedMemoryMonitor.read(file).contains("EXPIRED"));
            Path reused=store.write(new GameView("XYZ789",1,"WAITING","x",null,"DRAW",List.of(),List.of(),null,0,null,null,2,1));
            assertEquals(file,reused);
            assertTrue(SharedMemoryMonitor.read(file).contains("XYZ789"));
        }
    }
    @Test void exclusiveWriterLockBlocksReaderInAnotherJvm() throws Exception {
        Path file=directory.resolve("lock-probe.mmap");
        Files.write(file,new byte[32]);
        String executable=Path.of(System.getProperty("java.home"),"bin",System.getProperty("os.name").startsWith("Windows")?"java.exe":"java").toString();
        Process process;
        try(var channel=java.nio.channels.FileChannel.open(file,StandardOpenOption.READ,StandardOpenOption.WRITE)) {
            try(var lock=channel.lock()) {
                process=new ProcessBuilder(executable,"-cp",System.getProperty("java.class.path"),FileLockProbe.class.getName(),file.toString()).start();
                var reader=process.inputReader();
                assertEquals("READY",reader.readLine());
                assertFalse(process.waitFor(300,TimeUnit.MILLISECONDS),"Reader crossed exclusive FileLock");
            }
            assertTrue(process.waitFor(5,TimeUnit.SECONDS));
            assertEquals(0,process.exitValue());
        }
    }
}

