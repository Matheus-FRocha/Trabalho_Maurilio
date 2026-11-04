package br.edu.pife;
import java.nio.channels.FileChannel;
import java.nio.file.*;
/** Separate-JVM test helper; production monitor remains free of test-only switches. */
public class FileLockProbe {
    public static void main(String[] args) throws Exception {
        try(var channel=FileChannel.open(Path.of(args[0]),StandardOpenOption.READ)) {
            System.out.println("READY"); System.out.flush();
            try(var lock=channel.lock(0,Long.MAX_VALUE,true)) { System.out.println("ACQUIRED"); }
        }
    }
}
