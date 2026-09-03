# MentionMax

MentionMax est une plateforme non-profit de préparation au 2BAC marocain. Le produit est organisé autour du parcours scolaire, des leçons, de la pratique, de la progression, des examens et d'outils IA contextuels.

## Parcours

- **2BAC Sciences Physiques** : maths, physique-chimie, SVT, anglais, philosophie
- **2BAC Sciences Mathématiques A** : maths, physique-chimie, anglais, philosophie
- **2BAC Sciences Mathématiques B** : maths, physique-chimie, anglais, philosophie

Le changement de parcours contrôle réellement les matières et le contenu disponibles. La SVT n'est pas exposée en SM B.

## Architecture

```text
UI / pages
  ↓
features
  ↓
services
  ↓
Supabase / API externe
```

Les contenus locaux restent séparés de l'interface. Les services sont remplaçables sans réécrire les pages.

## Mission Helios

La banque contient 300 exercices de mathématiques répartis sur 15 jours, avec 20 exercices par journée, difficulté progressive, contexte narratif et progression utilisateur.

Le fichier `src/data/mock/missionHeliosBank.ts` est la source canonique côté interface. Supabase possède également les tables `mission_helios_chapters` et `mission_helios_exercises` pour la persistance et l'évolution du contenu.

## IA

Les pages parlent à `src/services/ai/aiService.ts` via l'interface `AIProvider`.

Le fournisseur local actuel rend l'application entièrement utilisable sans clé API. Pour connecter un vrai modèle, il suffit d'implémenter `AIProvider` côté serveur puis de l'enregistrer auprès du service. Les clés secrètes ne doivent jamais être exposées dans Vite côté client.

## Développement

```bash
npm install
npm run dev
```

Validation locale :

```bash
npm run lint
npm run build
```

CI exécute les mêmes contrôles sur chaque push et pull request.

## Variables d'environnement

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
```

Aucun secret serveur ne doit être placé dans `VITE_*`.
