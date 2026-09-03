import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { useAccount } from "../../context/AccountContext";
import { saveSchoolProfile } from "../../features/schoolProfile";
import { pathLabels, resolveUserPath, type UserPath } from "../../data/curriculum/secondBac";
import "./PathSwitcher.css";

const options: UserPath[] = ["SP", "SMA", "SMB"];

export default function PathSwitcher() {
  const { schoolPreferences, refreshSchoolPreferences } = useAccount();
  const [saving, setSaving] = useState(false);
  const current = resolveUserPath(schoolPreferences?.track ?? null, schoolPreferences?.section ?? null);

  async function choose(path: UserPath) {
    if (path === current || saving) return;
    setSaving(true);
    try {
      if (path === "SP") {
        await saveSchoolProfile({ track: "SPC", section: null });
      } else {
        await saveSchoolProfile({ track: "SM", section: path === "SMA" ? "A" : "B" });
      }
      await refreshSchoolPreferences();
      window.dispatchEvent(new CustomEvent("mentionmax:path-changed", { detail: path }));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="path-switcher" aria-label="Choisir ton parcours">
      <span className="path-switcher__label">Parcours</span>
      <div className="path-switcher__buttons">
        {options.map((path) => (
          <button
            key={path}
            type="button"
            className={`path-switcher__button${current === path ? " active" : ""}`}
            aria-pressed={current === path}
            onClick={() => void choose(path)}
            disabled={saving}
            title={pathLabels[path]}
          >
            <span>{path === "SP" ? "SP" : path === "SMA" ? "SM A" : "SM B"}</span>
            {current === path ? <Check size={13} /> : null}
          </button>
        ))}
      </div>
      <ChevronDown size={14} className="path-switcher__chevron" aria-hidden="true" />
    </div>
  );
}
