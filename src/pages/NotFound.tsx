import { Link } from 'react-router-dom';

export default function NotFound() {
  return <main className="section container not-found"><span className="badge-pill">404</span><h1>Page introuvable.</h1><p className="hero__description">Cette page n’existe pas encore.</p><Link className="btn btn-primary" to="/">Retour à l’accueil</Link></main>;
}
