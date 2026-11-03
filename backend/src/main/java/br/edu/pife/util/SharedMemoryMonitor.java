package br.edu.pife.util;

import java.nio.channels.FileChannel;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;

/** Independent process reading the same mapped region under a cross-process shared FileLock. */
public final class SharedMemoryMonitor {
    private SharedMemoryMonitor() {}
    public static String read(Path file) throws Exception {
        try(var channel=FileChannel.open(file,StandardOpenOption.READ);
            var lock=channel.lock(0,Long.MAX_VALUE,true)) {
            var memory=channel.map(FileChannel.MapMode.READ_ONLY,0,channel.size());
            int size=memory.getInt();
            if(size<1 || size>memory.remaining()) throw new IllegalStateException("Snapshot inválido");
            var bytes=new byte[size]; memory.get(bytes);
            return new String(bytes,StandardCharsets.UTF_8);
        }
    }
    public static void main(String[] args) throws Exception {
        if(args.length!=1) throw new IllegalArgumentException("Uso: SharedMemoryMonitor <arquivo.mmap>");
        System.out.println(read(Path.of(args[0])));
    }
}
