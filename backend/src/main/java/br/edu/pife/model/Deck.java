package br.edu.pife.model;

import java.util.*;

public final class Deck {
    private Deck() {}
    public static List<Card> ordered() {
        var cards = new ArrayList<Card>();
        for (var suit : List.of("C", "D", "H", "S"))
            for (int rank = 1; rank <= 13; rank++) cards.add(Card.parse(suit + rank));
        return cards;
    }
    public static List<Card> shuffled(Random random) {
        var cards = ordered();
        Collections.shuffle(cards, random);
        return cards;
    }
}
