import { useState } from 'react';

export default function Settings() {
  const [dark, setDark] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [saved, setSaved] = useState(false);
  return <main className={`section container settings-page ${dark ? 'dark' : ''}`}><header className="page-header"><div><span className="badge-pill">Paramètres</span><h1>Préférences.</h1><p className="hero__description">Personnalise ton expérience de travail.</p></div></header><section className="card settings-card"><SettingRow title="Mode sombre" description="Utiliser le thème sombre pour les sessions de travail." checked={dark} onChange={setDark}/><SettingRow title="Notifications" description="Rappels de session et progression hebdomadaire." checked={notifications} onChange={setNotifications}/><div className="settings-actions"><button className="btn btn-primary" type="button" onClick={() => setSaved(true)}>Enregistrer</button>{saved ? <span className="feedback success">Paramètres enregistrés.</span> : null}</div></section></main>;
}

function SettingRow({ title, description, checked, onChange }: { title: string; description: string; checked: boolean; onChange: (value: boolean) => void }) {
  return <label className="setting-row"><span><strong>{title}</strong><small>{description}</small></span><input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)}/></label>;
}
