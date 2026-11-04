package br.edu.pife.model;

import java.util.*;

public final class Deck {
    private Deck() {}
    public static List<Card> ordered() {
        return forCopies(1);
    }
    public static List<Card> forCopies(int copies) {
        if(copies!=1 && copies!=2) throw new IllegalArgumentException("Use um ou dois baralhos");
        var cards = new ArrayList<Card>();
        for(int copy=1;copy<=copies;copy++)
            for (var suit : List.of("C", "D", "H", "S"))
                for (int rank = 1; rank <= 13; rank++) cards.add(Card.parse(suit + rank + (copy==1?"":"-2")));
        return cards;
    }
    public static List<Card> shuffled(Random random) {
        return shuffledCopies(1,random);
    }
    public static List<Card> shuffledCopies(int copies,Random random) {
        var cards = forCopies(copies);
        Collections.shuffle(cards, random);
        return cards;
    }
}
