package br.edu.pife.dto;
import java.util.Map;
public record Command(String type, String roomId, String messageId, Long version, Map<String,String> payload) {
    public String value(String key) { return payload == null ? null : payload.get(key); }
}
