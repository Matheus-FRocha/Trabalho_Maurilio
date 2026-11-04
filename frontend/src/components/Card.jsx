export const suits = { C: "♣", D: "♦", H: "♥", S: "♠" };
export function Card({
  card,
  back = false,
  selected = false,
  onClick,
  disabled,
  testId,
}) {
  if (back)
    return (
      <div className="playing-card card-back" aria-label="Carta virada">
        <span>♠</span>
      </div>
    );
  if (!card)
    return (
      <div className="card-empty" aria-label="Descarte vazio">
        —
      </div>
    );
  const rank = { 1: "A", 11: "J", 12: "Q", 13: "K" }[card.rank] || card.rank;
  const content = (
    <>
      <span className="card-corner">
        {rank}
        <small>{suits[card.suit]}</small>
      </span>
      <span className="card-suit">{suits[card.suit]}</span>
      <span className="card-corner bottom">
        {rank}
        <small>{suits[card.suit]}</small>
      </span>
    </>
  );
  const className = `playing-card ${"DH".includes(card.suit) ? "card-red" : ""} ${selected ? "selected" : ""}`;
  return onClick ? (
    <button
      type="button"
      data-testid={testId}
      aria-label={`${rank} ${suits[card.suit]}`}
      aria-pressed={selected}
      className={className}
      onClick={onClick}
      disabled={disabled}
    >
      {content}
    </button>
  ) : (
    <div className={className}>{content}</div>
  );
}
