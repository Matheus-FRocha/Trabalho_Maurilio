package br.edu.pife.dto;
import br.edu.pife.model.Card;
import java.util.List;
public record GameView(String roomId, long version, String status, String hostId, String turnPlayerId,
                       String phase, List<PlayerView> players, List<Card> hand, Card discardTop,
                       int deckCount, String winnerId, String reason) {}
