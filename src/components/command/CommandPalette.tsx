import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "../navigation/Icon";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function CommandPalette({
  open,
  onClose,
}: Props) {
  const navigate = useNavigate();

  const [query, setQuery] =
    useState("");

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        document
          .querySelector<HTMLInputElement>(
            ".mm-command__input"
          )
          ?.focus();
      }, 0);
    } else {
      setQuery("");
    }
  }, [open]);

  if (!open) {
    return null;
  }

  const actions = [
    {
      label: "Aller à Accueil",
      route: "/accueil",
      icon: "home" as const,
    },
    {
      label: "Aller à Focus",
      route: "/focus",
      icon: "focus" as const,
    },
    {
      label: "Aller à AI Help",
      route: "/ai-help",
      icon: "ai" as const,
    },
  ];

  const disabledActions = [
    "Expliquer ceci",
    "Créer des flashcards",
  ];

  const filtered = actions.filter(
    (action) =>
      action.label
        .toLowerCase()
        .includes(
          query.toLowerCase()
        )
  );

  return (
    <div
      className="mm-command-overlay"
      onMouseDown={onClose}
    >
      <div
        className="mm-command"
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >
        <div className="mm-command__search">
          <Icon
            name="search"
            size={19}
          />

          <input
            className="mm-command__input"
            value={query}
            onChange={(event) =>
              setQuery(
                event.target.value
              )
            }
            placeholder="Aller à..."
          />

          <kbd>ESC</kbd>
        </div>

        <div className="mm-command__list">
          {filtered.map((action) => (
            <button
              key={action.label}
              type="button"
              onClick={() => {
                navigate(
                  action.route
                );
                onClose();
              }}
            >
              <Icon
                name={action.icon}
                size={18}
              />

              <span>{action.label}</span>
            </button>
          ))}

          {disabledActions.map(
            (label) => {
              if (
                query &&
                !label
                  .toLowerCase()
                  .includes(
                    query.toLowerCase()
                  )
              ) {
                return null;
              }

              return (
                <button
                  key={label}
                  type="button"
                  disabled
                >
                  <Icon
                    name="ai"
                    size={18}
                  />

                  <span>{label}</span>

                  <small>
                    Bientôt
                  </small>
                </button>
              );
            }
          )}

          {filtered.length === 0 &&
            !disabledActions.some(
              (label) =>
                label
                  .toLowerCase()
                  .includes(
                    query.toLowerCase()
                  )
            ) && (
              <div className="mm-command__empty">
                Aucun résultat.
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
