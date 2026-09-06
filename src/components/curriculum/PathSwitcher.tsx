import { Check } from "lucide-react";
import { useAccount } from "../../context/AccountContext";
import { pathLabels, resolveUserPath, type UserPath } from "../../data/curriculum/secondBac";
import "./PathSwitcher.css";

export default function PathSwitcher() {
  const { schoolPreferences } = useAccount();
  const current = resolveUserPath(schoolPreferences?.track ?? null, schoolPreferences?.section ?? null);
  const label = current === "SP" ? "SP" : current === "SMA" ? "SM A" : current === "SMB" ? "SM B" : "—";
  const fullLabel = current ? pathLabels[current] : "Parcours non défini";

  return (
    <div className="path-switcher" aria-label="Parcours actuel">
      <span className="path-switcher__label">Parcours</span>
      <div className="path-switcher__buttons" role="status" aria-label={`Parcours actuel : ${fullLabel}`}>
        <div
          className="path-switcher__button active"
          aria-current="true"
          title={`Parcours actuel : ${fullLabel}`}
        >
          <span>{label}</span>
          {current ? <Check size={13} /> : null}
        </div>
      </div>
    </div>
  );
}
