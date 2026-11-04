export function Rules() {
  return (
    <details className="rules">
      <summary>
        Como jogar Pife <span>↗</span>
      </summary>
      <div className="rules-body">
        <p>
          Forme <strong>3 combinações de 3 cartas</strong>: valores iguais em
          naipes diferentes ou sequências do mesmo naipe.
        </p>
        <p>
          Na sua vez, compre do monte ou do descarte. Escolha uma carta e
          descarte. Se as nove restantes fecharem os três jogos, você vence
          automaticamente.
        </p>
        <p>
          Dois jogadores usam 1 baralho; quatro usam 2. Nove cartas por pessoa,
          sem curingas, ás baixo (A-2-3). Trincas exigem três naipes distintos.
          O criador joga primeiro, na ordem de entrada. Monte esgotado encerra
          em empate.
        </p>
        <p>
          Antes do início, sair cancela a sala. Na partida de dois, desistir dá
          vitória ao adversário. Na de quatro, os demais continuam; o último
          participante vence por abandono. A partida pausa se alguém ativo
          desconectar. Sala expira após 30 minutos sem ação.
        </p>
      </div>
    </details>
  );
}
