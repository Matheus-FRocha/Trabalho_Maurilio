# Variante aprovada: Pife para dois

Confirmada pelo usuário em 03/11/2026. Dois jogadores, um baralho padrão de 52 cartas,
sem curingas, nove cartas por jogador. Ás vale 1: A-2-3 permitido, Q-K-A não.
Trinca: três valores iguais de naipes distintos. Sequência: três valores consecutivos do mesmo naipe.
Uma mão vencedora pode ser particionada em três combinações de três cartas, sem reutilizar cartas.
Não há pontuação acumulada nem regras de eliminação de outras variantes de Caxeta.

O criador inicia quando os dois jogadores estão conectados. Cada turno compra uma carta
do monte ou o topo do descarte, depois descarta uma das dez cartas. Ao descartar, o servidor
verifica automaticamente as nove restantes; se formarem três jogos, encerra com vitória.
Caso contrário, passa a vez. O descarte começa com uma carta virada.

Decisões técnicas do MVP: primeiro turno do criador; não reciclar o descarte. Se o monte
acabar após um descarte sem vitória, encerrar empatado. Desconexão pausa ações até reconectar;
a sala expira após 30 minutos sem ação. É possível abandonar pela interface e criar outra sala.
Essas decisões complementares ficam explícitas na sala antes do início.

Saída voluntária antes do início cancela a sala, com um ou dois participantes: motivo CANCELLED,
sem vencedor ou empate. Depois de iniciar, saída é abandono e concede vitória ao adversário.
Ausência temporária/recarregamento permanece uma pausa para reconexão. Somente monte esgotado
após descarte sem vitória gera empate. Critério de ciclo de vida adotado nesta revisão para corrigir
o caso relatado pelo usuário; não altera a formação de combinações da variante aprovada.
