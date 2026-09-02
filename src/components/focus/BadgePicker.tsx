import type {
  GroupBadge,
} from "../../features/focus/types";

const emojis = [
  "📚",
  "🎓",
  "🧠",
  "⚡",
  "🔥",
  "🚀",
  "📐",
  "🔬",
  "🧪",
  "🏆",
  "🎯",
  "💡",
  "🌊",
  "⭐",
  "🦉",
  "🐝",
];

const colors = [
  "#0FA3A3",
  "#2E6BE0",
  "#E23A6B",
  "#16A673",
  "#E08A16",
  "#7856C8",
  "#E05D44",
  "#53615F",
];

interface BadgePickerProps {
  value: GroupBadge;
  onChange: (
    badge: GroupBadge
  ) => void;
}

export function BadgePicker({
  value,
  onChange,
}: BadgePickerProps) {
  return (
    <div className="badge-picker">
      <div className="badge-picker__preview">
        <span
          className="badge-picker__preview-icon"
          style={{
            backgroundColor:
              value.color,
          }}
        >
          {value.emoji ?? "📚"}
        </span>

        <div>
          <strong>
            Icône du groupe
          </strong>

          <small>
            Choisis ton identité.
          </small>
        </div>
      </div>

      <div className="badge-picker__label">
        Emoji
      </div>

      <div className="badge-picker__emojis">
        {emojis.map((emoji) => (
          <button
            type="button"
            key={emoji}
            className={
              value.emoji === emoji
                ? "badge-emoji selected"
                : "badge-emoji"
            }
            onClick={() =>
              onChange({
                ...value,
                emoji,
                imageUrl:
                  undefined,
              })
            }
          >
            {emoji}
          </button>
        ))}
      </div>

      <div className="badge-picker__label">
        Couleur
      </div>

      <div className="badge-picker__colors">
        {colors.map((color) => (
          <button
            type="button"
            key={color}
            className={
              value.color === color
                ? "badge-color selected"
                : "badge-color"
            }
            style={{
              backgroundColor:
                color,
            }}
            onClick={() =>
              onChange({
                ...value,
                color,
              })
            }
            aria-label={`Couleur ${color}`}
          />
        ))}
      </div>
    </div>
  );
}
