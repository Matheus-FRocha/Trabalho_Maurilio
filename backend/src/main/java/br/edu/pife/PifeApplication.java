package br.edu.pife;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;
@SpringBootApplication
@EnableScheduling
public class PifeApplication {
    public static void main(String[] args) { SpringApplication.run(PifeApplication.class,args); }
}
