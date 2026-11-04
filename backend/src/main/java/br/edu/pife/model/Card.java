package br.edu.pife.model;

public record Card(String id, int rank, String suit) {
    public Card {
        if (rank < 1 || rank > 13 || !java.util.Set.of("C", "D", "H", "S").contains(suit)
                || !((suit + rank).equals(id) || (suit + rank + "-2").equals(id)))
            throw new IllegalArgumentException("Carta inválida");
    }
    public static Card parse(String id) {
        if (id == null || id.length() < 2) throw new IllegalArgumentException("Carta inválida");
        var parts=id.substring(1).split("-",-1);
        if(parts.length>2 || (parts.length==2 && !"2".equals(parts[1])))
            throw new IllegalArgumentException("Cópia de carta inválida");
        return new Card(id, Integer.parseInt(parts[0]), id.substring(0, 1));
    }
}
