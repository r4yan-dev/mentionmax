const rows = [
  ["1", "Sara", "1 240 XP"],
  ["2", "Youssef", "1 180 XP"],
  ["3", "Rayan", "1 120 XP"],
  ["4", "Adam", "980 XP"],
];

export default function Leaderboard() {
  return (
    <div className="app-page-placeholder">
      <span className="section-eyebrow">
        Classement
      </span>

      <h1>
        Ton classement.
      </h1>

      <p>
        Classement local placeholder. Le système de
        score sera relié au Progress Engine.
      </p>

      <div className="leaderboard-card">
        {rows.map(([rank, name, xp]) => (
          <div
            key={rank}
            className={`leaderboard-row${
              name === "Rayan" ? " current" : ""
            }`}
          >
            <strong>{rank}</strong>
            <span>{name}</span>
            <b>{xp}</b>
          </div>
        ))}
      </div>
    </div>
  );
}
