package br.edu.pife.config;
import br.edu.pife.model.Deck;
import br.edu.pife.service.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.*;
import java.nio.file.Path;
import java.time.Clock;
import java.security.SecureRandom;
@Configuration
public class GameConfig {
    @Bean Clock clock() { return Clock.systemUTC(); }
    @Bean GameService gameService(Clock clock) { return new GameService(clock,copies -> Deck.shuffledCopies(copies,new SecureRandom())); }
    @Bean SessionRegistry sessionRegistry(Clock clock) { return new SessionRegistry(clock); }
    @Bean(destroyMethod="close") SharedMemoryStore sharedMemoryStore(@Value("${pife.shared-directory:runtime/shared}") String directory,ObjectMapper mapper) throws Exception {
        return new SharedMemoryStore(Path.of(directory),mapper);
    }
}
