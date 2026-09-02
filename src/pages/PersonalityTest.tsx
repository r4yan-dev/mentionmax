import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

type PersonalityType =
  | "strategist"
  | "grinder"
  | "explorer"
  | "precision";

type Question = {
  id: number;
  text: string;
  subtitle: string;
  options: {
    text: string;
    type: PersonalityType;
  }[];
};

const questions: Question[] = [
  {
    id: 1,
    text: "Quand tu commences un nouveau chapitre, tu préfères...",
    subtitle: "Ta première réaction face à une nouvelle notion.",
    options: [
      {
        text: "Comprendre la structure générale avant les détails.",
        type: "strategist",
      },
      {
        text: "Commencer immédiatement par des exercices.",
        type: "grinder",
      },
      {
        text: "Explorer plusieurs exemples pour voir comment ça fonctionne.",
        type: "explorer",
      },
      {
        text: "Maîtriser les définitions et règles de base.",
        type: "precision",
      },
    ],
  },
  {
    id: 2,
    text: "Devant un exercice difficile, tu fais quoi en premier ?",
    subtitle: "Ce que tu fais quand le problème résiste.",
    options: [
      {
        text: "Je cherche une stratégie globale.",
        type: "strategist",
      },
      {
        text: "J'essaie plusieurs méthodes jusqu'à ce qu'une marche.",
        type: "grinder",
      },
      {
        text: "Je cherche un exercice similaire pour comparer.",
        type: "explorer",
      },
      {
        text: "Je vérifie précisément les données et conditions.",
        type: "precision",
      },
    ],
  },
  {
    id: 3,
    text: "Pour retenir une notion, ce qui marche le mieux pour toi est...",
    subtitle: "Ta méthode de mémorisation naturelle.",
    options: [
      {
        text: "Faire une carte mentale du chapitre.",
        type: "strategist",
      },
      {
        text: "La pratiquer plusieurs fois.",
        type: "grinder",
      },
      {
        text: "La relier à plusieurs exemples.",
        type: "explorer",
      },
      {
        text: "Écrire une fiche très claire et précise.",
        type: "precision",
      },
    ],
  },
  {
    id: 4,
    text: "Une erreur dans ton exercice te donne surtout envie de...",
    subtitle: "Ta réaction face à une mauvaise réponse.",
    options: [
      {
        text: "Comprendre quelle étape du raisonnement a déraillé.",
        type: "strategist",
      },
      {
        text: "Refaire l'exercice jusqu'à réussir.",
        type: "grinder",
      },
      {
        text: "Voir différentes façons de résoudre le problème.",
        type: "explorer",
      },
      {
        text: "Identifier précisément la règle que j'ai mal appliquée.",
        type: "precision",
      },
    ],
  },
  {
    id: 5,
    text: "Quand tu révises avant un examen, tu préfères...",
    subtitle: "Ton organisation sous pression.",
    options: [
      {
        text: "Avoir un plan clair avec des priorités.",
        type: "strategist",
      },
      {
        text: "Enchaîner un maximum d'exercices.",
        type: "grinder",
      },
      {
        text: "Varier les matières et formats.",
        type: "explorer",
      },
      {
        text: "Revoir précisément les points où je perds des points.",
        type: "precision",
      },
    ],
  },
  {
    id: 6,
    text: "Quel compliment te ressemble le plus ?",
    subtitle: "La qualité que les autres remarquent le plus.",
    options: [
      {
        text: "Tu comprends vite la logique.",
        type: "strategist",
      },
      {
        text: "Tu ne lâches jamais.",
        type: "grinder",
      },
      {
        text: "Tu poses toujours de bonnes questions.",
        type: "explorer",
      },
      {
        text: "Tu remarques les détails que les autres ratent.",
        type: "precision",
      },
    ],
  },
  {
    id: 7,
    text: "Quel type d'aide te serait le plus utile ?",
    subtitle: "Ce que MentionMax devrait faire pour toi.",
    options: [
      {
        text: "Me donner la meilleure stratégie.",
        type: "strategist",
      },
      {
        text: "Me donner plus d'exercices adaptés.",
        type: "grinder",
      },
      {
        text: "Me proposer des exemples et connexions.",
        type: "explorer",
      },
      {
        text: "Me montrer exactement où se trouve mon erreur.",
        type: "precision",
      },
    ],
  },
  {
    id: 8,
    text: "Après avoir compris une notion, tu veux généralement...",
    subtitle: "Ce que tu fais ensuite.",
    options: [
      {
        text: "Passer à la notion suivante avec une vue d'ensemble.",
        type: "strategist",
      },
      {
        text: "La travailler jusqu'à être rapide.",
        type: "grinder",
      },
      {
        text: "Voir où elle s'utilise ailleurs.",
        type: "explorer",
      },
      {
        text: "Vérifier que je peux l'expliquer parfaitement.",
        type: "precision",
      },
    ],
  },
];

const profiles: Record<
  PersonalityType,
  {
    name: string;
    short: string;
    description: string;
    strengths: string[];
    recommendations: string[];
  }
> = {
  strategist: {
    name: "Le Stratège",
    short: "Tu apprends en comprenant le système.",
    description:
      "Tu cherches la logique derrière les notions avant de multiplier les exercices. Tu progresses particulièrement bien quand le programme est organisé et que chaque chapitre a un objectif clair.",
    strengths: [
      "Vision globale",
      "Raisonnement structuré",
      "Bonne planification",
    ],
    recommendations: [
      "Commencer par une vue d'ensemble.",
      "Utiliser des exercices qui demandent plusieurs étapes.",
      "Faire régulièrement des simulations complètes.",
    ],
  },

  grinder: {
    name: "Le Grinder",
    short: "Tu apprends surtout en pratiquant.",
    description:
      "Tu préfères passer rapidement à l'action. La répétition, les séries d'exercices et la difficulté progressive sont particulièrement efficaces pour toi.",
    strengths: [
      "Persévérance",
      "Vitesse d'exécution",
      "Apprentissage par pratique",
    ],
    recommendations: [
      "Utiliser les exercices personnalisés quotidiennement.",
      "Augmenter progressivement le niveau.",
      "Faire des sessions Focus courtes et régulières.",
    ],
  },

  explorer: {
    name: "L'Explorateur",
    short: "Tu apprends en reliant les idées.",
    description:
      "Tu comprends mieux quand une notion est reliée à plusieurs exemples, situations et applications. La variété évite que ton apprentissage devienne mécanique.",
    strengths: [
      "Curiosité",
      "Connexions entre notions",
      "Adaptabilité",
    ],
    recommendations: [
      "Alterner cours, exemples et exercices.",
      "Utiliser Snap → Exercices.",
      "Comparer plusieurs méthodes de résolution.",
    ],
  },

  precision: {
    name: "Le Précis",
    short: "Tu apprends par maîtrise détaillée.",
    description:
      "Tu accordes beaucoup d'importance aux définitions, conditions, détails et erreurs. Tu peux construire une maîtrise très solide quand tu travailles avec des feedbacks précis.",
    strengths: [
      "Attention aux détails",
      "Rigueur",
      "Correction des erreurs",
    ],
    recommendations: [
      "Analyser chaque erreur après un exercice.",
      "Utiliser les corrections détaillées.",
      "Réviser les définitions et conditions d'application.",
    ],
  },
};

const storageKey = "mentionmax:personality-test:v1";

export default function PersonalityTest() {
  const navigate = useNavigate();

  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<
    Record<number, PersonalityType>
  >({});
  const [finished, setFinished] = useState(false);

  const question = questions[current];

  const result = useMemo(() => {
    const scores: Record<
      PersonalityType,
      number
    > = {
      strategist: 0,
      grinder: 0,
      explorer: 0,
      precision: 0,
    };

    Object.values(answers).forEach((type) => {
      scores[type] += 1;
    });

    return (
      Object.entries(scores).sort(
        (a, b) => b[1] - a[1]
      )[0]?.[0] as PersonalityType | undefined
    );
  }, [answers]);

  function selectAnswer(
    type: PersonalityType
  ) {
    setAnswers((currentAnswers) => ({
      ...currentAnswers,
      [question.id]: type,
    }));
  }

  function next() {
    if (!answers[question.id]) {
      return;
    }

    if (current === questions.length - 1) {
      const finalType = result;

      if (finalType) {
        localStorage.setItem(
          storageKey,
          JSON.stringify({
            type: finalType,
            completedAt:
              new Date().toISOString(),
          })
        );
      }

      setFinished(true);
      return;
    }

    setCurrent((value) => value + 1);
  }

  function back() {
    setCurrent((value) =>
      Math.max(0, value - 1)
    );
  }

  function restart() {
    setCurrent(0);
    setAnswers({});
    setFinished(false);
  }

  if (finished && result) {
    const profile = profiles[result];

    return (
      <div className="personality-page">
        <div className="personality-result">
          <div className="personality-result__icon">
            ✦
          </div>

          <span className="section-eyebrow">
            Ton profil d'apprentissage
          </span>

          <h1>{profile.name}</h1>

          <p className="personality-result__short">
            {profile.short}
          </p>

          <p className="personality-result__description">
            {profile.description}
          </p>

          <div className="personality-result__columns">
            <div className="personality-result__box">
              <h2>Points forts</h2>

              {profile.strengths.map(
                (item) => (
                  <div
                    className="personality-result__item"
                    key={item}
                  >
                    <span>✓</span>
                    <span>{item}</span>
                  </div>
                )
              )}
            </div>

            <div className="personality-result__box">
              <h2>Comment réviser</h2>

              {profile.recommendations.map(
                (item) => (
                  <div
                    className="personality-result__item"
                    key={item}
                  >
                    <span>→</span>
                    <span>{item}</span>
                  </div>
                )
              )}
            </div>
          </div>

          <div className="personality-result__actions">
            <button
              type="button"
              className="btn btn-primary btn-lg"
              onClick={() =>
                navigate("/preferences")
              }
            >
              Enregistrer mon profil
            </button>

            <button
              type="button"
              className="btn btn-ghost"
              onClick={restart}
            >
              Refaire le test
            </button>
          </div>
        </div>
      </div>
    );
  }

  const progress =
    ((current + 1) / questions.length) * 100;

  return (
    <div className="personality-page">
      <div className="personality-shell">
        <header className="personality-header">
          <Link
            to="/preferences"
            className="personality-back"
          >
            ← Retour
          </Link>

          <div className="personality-logo">
            <span className="sidebar-logo__mark">
              M
            </span>

            <span className="sidebar-logo__text">
              MentionMax
            </span>
          </div>

          <span className="personality-counter">
            {current + 1} / {questions.length}
          </span>
        </header>

        <div className="personality-progress">
          <span
            style={{
              width: `${progress}%`,
            }}
          />
        </div>

        <main className="personality-main">
          <span className="section-eyebrow">
            Test de personnalité
          </span>

          <h1>
            Comment apprends-tu le mieux ?
          </h1>

          <p className="personality-intro">
            Il n'y a pas de bonne ou de mauvaise
            réponse. Réponds selon ta façon naturelle
            de travailler.
          </p>

          <section className="personality-question">
            <span className="personality-question__number">
              QUESTION {current + 1}
            </span>

            <h2>{question.text}</h2>

            <p>{question.subtitle}</p>

            <div className="personality-options">
              {question.options.map(
                (option, index) => (
                  <button
                    type="button"
                    key={option.text}
                    className={`personality-option${
                      answers[question.id] ===
                      option.type
                        ? " selected"
                        : ""
                    }`}
                    onClick={() =>
                      selectAnswer(
                        option.type
                      )
                    }
                  >
                    <span className="personality-option__number">
                      {String.fromCharCode(
                        65 + index
                      )}
                    </span>

                    <span>
                      {option.text}
                    </span>

                    <span className="personality-option__check">
                      {answers[question.id] ===
                      option.type
                        ? "✓"
                        : ""}
                    </span>
                  </button>
                )
              )}
            </div>
          </section>

          <footer className="personality-footer">
            <button
              type="button"
              className="btn btn-ghost"
              disabled={current === 0}
              onClick={back}
            >
              Précédent
            </button>

            <button
              type="button"
              className="btn btn-primary"
              disabled={
                !answers[question.id]
              }
              onClick={next}
            >
              {current ===
              questions.length - 1
                ? "Voir mon profil"
                : "Continuer"}
            </button>
          </footer>
        </main>
      </div>
    </div>
  );
}
