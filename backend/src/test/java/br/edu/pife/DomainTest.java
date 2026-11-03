package br.edu.pife;

import br.edu.pife.model.Card;
import br.edu.pife.model.Deck;
import br.edu.pife.service.MeldValidator;
import org.junit.jupiter.api.Test;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;

class DomainTest {
    private List<Card> cards(String ids) {
        return Arrays.stream(ids.split(" ")).map(Card::parse).toList();
    }

    @Test void deckContains52DistinctCardsAndShufflePreservesThem() {
        var original = Deck.ordered();
        var shuffled = Deck.shuffled(new Random(42));
        assertEquals(52, original.size());
        assertEquals(52, new HashSet<>(original).size());
        assertEquals(new HashSet<>(original), new HashSet<>(shuffled));
        assertNotEquals(original, shuffled);
    }

    @Test void acceptsThreeRunsAndMixedSets() {
        assertTrue(MeldValidator.isWinning(cards("C1 C2 C3 H4 H5 H6 S7 S8 S9")));
        assertTrue(MeldValidator.isWinning(cards("C5 D5 H5 C10 C11 C12 S1 S2 S3")));
    }

    @Test void searchesAllPartitionsInsteadOfGreedilyTakingASet() {
        assertTrue(MeldValidator.isWinning(cards("C1 D1 H1 C2 D2 H2 C3 D3 H3")));
    }

    @Test void rejectsWrapAroundDuplicatesIncompleteAndMixedSuits() {
        assertFalse(MeldValidator.isWinning(cards("C12 C13 C1 H4 H5 H6 S7 S8 S9")));
        assertFalse(MeldValidator.isWinning(cards("C1 C1 C1 H4 H5 H6 S7 S8 S9")));
        assertFalse(MeldValidator.isWinning(cards("C1 C2")));
        assertFalse(MeldValidator.isWinning(cards("C1 D2 C3 H4 H5 H6 S7 S8 S9")));
        assertThrows(IllegalArgumentException.class, () -> Card.parse("C14"));
    }
}
