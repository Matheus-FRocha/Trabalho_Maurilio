package br.edu.pife.model;

public record Card(String id, int rank, String suit) {
    public Card {
        if (rank < 1 || rank > 13 || !java.util.Set.of("C", "D", "H", "S").contains(suit)
                || !(suit + rank).equals(id)) throw new IllegalArgumentException("Carta inválida");
    }
    public static Card parse(String id) {
        if (id == null || id.length() < 2) throw new IllegalArgumentException("Carta inválida");
        return new Card(id, Integer.parseInt(id.substring(1)), id.substring(0, 1));
    }
}
