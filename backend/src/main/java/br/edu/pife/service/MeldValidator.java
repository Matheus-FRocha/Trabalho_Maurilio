package br.edu.pife.service;

import br.edu.pife.model.Card;
import java.util.*;

public final class MeldValidator {
    private MeldValidator() {}
    public static boolean isWinning(List<Card> hand) {
        return hand != null && hand.size() == 9 && new HashSet<>(hand).size() == 9 && partition(hand);
    }
    private static boolean partition(List<Card> cards) {
        if (cards.isEmpty()) return true;
        for (int i = 1; i < cards.size() - 1; i++) {
            for (int j = i + 1; j < cards.size(); j++) {
                if (!meld(cards.getFirst(), cards.get(i), cards.get(j))) continue;
                var remaining = new ArrayList<>(cards);
                remaining.remove(j);
                remaining.remove(i);
                remaining.removeFirst();
                if (partition(remaining)) return true;
            }
        }
        return false;
    }
    private static boolean meld(Card a, Card b, Card c) {
        if (a.rank() == b.rank() && b.rank() == c.rank()) return true;
        if (!a.suit().equals(b.suit()) || !b.suit().equals(c.suit())) return false;
        int[] ranks = {a.rank(), b.rank(), c.rank()};
        Arrays.sort(ranks);
        return ranks[1] == ranks[0] + 1 && ranks[2] == ranks[1] + 1;
    }
}
