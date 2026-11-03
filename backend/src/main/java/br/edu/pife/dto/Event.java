package br.edu.pife.dto;
public record Event(String type, String messageId, String roomId, long version, GameView state,
                    String code, String message) {}
