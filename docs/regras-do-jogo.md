# Variante aprovada: Pife individual para 2 ou 4

Variante inicial confirmada em 03/11/2026; ampliação para quatro e jogo individual confirmada
em 04/11/2026. Dois jogadores usam 1 baralho (52 cartas); quatro usam 2 (104 cartas), sem curingas,
nove cartas por pessoa. A capacidade é escolhida ao criar a mesa; não há modalidade de duplas.
Ás vale 1: A-2-3 permitido, Q-K-A não.
Trinca: três valores iguais de naipes distintos. Sequência: três valores consecutivos do mesmo naipe.
Uma mão vencedora pode ser particionada em três combinações de três cartas, sem reutilizar cartas.
Não há pontuação acumulada nem regras de eliminação de outras variantes de Caxeta.
Cartas do segundo baralho têm identidade própria (C1-2, por exemplo). Duas cópias da mesma face
podem estar na mão e participar de combinações diferentes; não representam naipes diferentes
na mesma trinca. Uma carta física só pode ser usada em uma combinação.

O criador inicia quando os 2 ou 4 lugares estão preenchidos e conectados. Ele joga primeiro;
depois o turno segue a ordem de entrada, circularmente, pulando desistentes. Cada turno compra uma carta
do monte ou o topo do descarte, depois descarta uma das dez cartas. Ao descartar, o servidor
verifica automaticamente as nove restantes; se formarem três jogos, encerra com vitória.
Caso contrário, passa a vez. O descarte começa com uma carta virada.

Decisões técnicas do MVP: primeiro turno do criador; não reciclar o descarte. Se o monte
acabar após um descarte sem vitória, encerrar empatado. Desconexão pausa ações até reconectar;
a sala expira após 30 minutos sem ação. É possível abandonar pela interface e criar outra sala.
Essas decisões complementares ficam explícitas na sala antes do início.

Saída voluntária antes do início cancela a sala, independentemente da quantidade: motivo CANCELLED,
sem vencedor ou empate. Durante a partida, o desistente fica inativo e os demais continuam. Se a vez
era dele, passa ao próximo ativo em fase de compra; se outro já comprou, esse turno é preservado.
Cartas do desistente saem do jogo, sem voltar ao monte ou descarte. Ele pode criar outra sala,
mas não reentrar na anterior. Vitória por abandono ocorre quando sobra somente um participante:
na mesa de dois isso acontece imediatamente; na de quatro apenas após três desistências.
Ausência temporária/recarregamento permanece uma pausa para reconexão. Somente monte esgotado
após descarte sem vitória gera empate. Critério de ciclo de vida adotado nesta revisão para corrigir
o caso relatado pelo usuário; não altera a formação de combinações da variante aprovada.
