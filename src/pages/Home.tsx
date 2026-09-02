import {
  ArrowRight,
  BookOpen,
  Bot,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Target,
  Trophy,
  Upload,
  Video,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Link,
} from "react-router-dom";
import {
  supabase,
} from "../integrations/supabase/client";
import {
  useAuth,
} from "../context/AuthContext";

type Subject = {
  id: string;
  name: string;
  coefficient?: number;
  sort_order?: number;
};

type Topic = {
  id: string;
  subject_id?: string;
  name: string;
  progress?: number;
  importance?: number;
};

type Session = {
  id: string;
  duration_minutes?: number;
};

type Profile = {
  name?: string;
  target_grade?: number | null;
};

const fallbackSubjects: Subject[] = [
  {
    id: "mathematiques",
    name: "Mathématiques",
    coefficient: 9,
  },
  {
    id: "physique",
    name: "Physique-Chimie",
    coefficient: 7,
  },
  {
    id: "svt",
    name: "SVT",
    coefficient: 3,
  },
  {
    id: "anglais",
    name: "Anglais",
    coefficient: 2,
  },
  {
    id: "philosophie",
    name: "Philosophie",
    coefficient: 2,
  },
];

const subjectTone: Record<
  string,
  string
> = {
  mathematiques:
    "mx2-subject-teal",
  maths:
    "mx2-subject-teal",
  "physique-chimie":
    "mx2-subject-green",
  physique:
    "mx2-subject-green",
  svt:
    "mx2-subject-mint",
  anglais:
    "mx2-subject-aqua",
  philosophie:
    "mx2-subject-coral",
};

function daysUntilBac() {
  const target =
    new Date(
      "2027-06-06T08:00:00",
    ).getTime();

  return Math.max(
    0,
    Math.ceil(
      (target - Date.now()) /
        86400000,
    ),
  );
}

export default function HomePage() {
  const { user } =
    useAuth();

  const [profile, setProfile] =
    useState<Profile | null>(
      null,
    );

  const [subjects, setSubjects] =
    useState<Subject[]>(
      fallbackSubjects,
    );

  const [topics, setTopics] =
    useState<Topic[]>([]);

  const [sessions, setSessions] =
    useState<Session[]>([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    async function load() {
      const [
        profileResult,
        subjectResult,
        topicResult,
        sessionResult,
      ] =
        await Promise.all([
          user
            ? supabase
                .from("profiles")
                .select(
                  "name,target_grade",
                )
                .eq(
                  "id",
                  user.id,
                )
                .maybeSingle()
            : Promise.resolve({
                data: null,
                error: null,
              }),

          supabase
            .from("subjects")
            .select("*")
            .order(
              "sort_order",
            ),

          supabase
            .from("topics")
            .select("*")
            .order(
              "sort_order",
            ),

          user
            ? supabase
                .from(
                  "study_sessions",
                )
                .select("*")
                .eq(
                  "user_id",
                  user.id,
                )
            : Promise.resolve({
                data: [],
                error: null,
              }),
        ]);

      if (
        profileResult.data
      ) {
        setProfile(
          profileResult.data,
        );
      }

      if (
        subjectResult.data?.length
      ) {
        setSubjects(
          subjectResult.data,
        );
      }

      setTopics(
        topicResult.data ?? [],
      );

      setSessions(
        sessionResult.data ?? [],
      );

      setLoading(false);
    }

    void load();
  }, [user]);

  const totalMinutes =
    sessions.reduce(
      (
        sum,
        session,
      ) =>
        sum +
        Number(
          session.duration_minutes ??
            0,
        ),
      0,
    );

  const hoursToday =
    Math.floor(
      totalMinutes / 60,
    );

  const remainingMinutes =
    totalMinutes % 60;

  const displayName =
    profile?.name ||
    user?.email
      ?.split("@")[0] ||
    "Étudiant";

  const target =
    profile?.target_grade ??
    null;

  const bacDays =
    daysUntilBac();

  const chapters =
    useMemo(
      () =>
        topics
          .slice()
          .sort(
            (a, b) =>
              Number(
                b.importance ??
                  0,
              ) -
              Number(
                a.importance ??
                  0,
              ),
          )
          .slice(0, 6),
      [topics],
    );

  return (
    <div className="mx2-page mx2-home">
      <header className="mx2-topbar">
        <div className="mx2-greeting">
          <span>
            Prêt à cartonner
            aujourd'hui ?
          </span>

          <h1>
            Bonjour,{" "}
            {displayName}{" "}
            <span>👋</span>
          </h1>
        </div>

        <div className="mx2-header-chips">
          <div className="mx2-header-chip">
            <BookOpen size={20} />

            <div>
              <strong>
                BAC SM
              </strong>
              <small>
                Sciences Maths
              </small>
            </div>
          </div>

          <div className="mx2-header-chip">
            <CalendarDays size={20} />

            <div>
              <strong>
                {bacDays}
              </strong>

              <small>
                jours au BAC
              </small>
            </div>
          </div>

          <div className="mx2-header-quote">
            <span>“</span>

            <div>
              <strong>
                Discipline
                aujourd'hui,
              </strong>

              <small>
                liberté demain.
              </small>
            </div>
          </div>
        </div>
      </header>

      <section className="mx2-dashboard-grid">
        <article className="mx2-card mx2-objective-card">
          <div className="mx2-card-heading">
            <div>
              <span className="mx2-card-icon">
                <Target
                  size={15}
                />
              </span>

              <strong>
                Ton objectif
              </strong>
            </div>

            <span className="mx2-kicker">
              BAC
            </span>
          </div>

          <div className="mx2-objective-value">
            <div>
              <strong>
                {target !==
                null
                  ? target.toFixed(
                      2,
                    )
                  : "—"}
              </strong>

              <span>
                / 20
              </span>

              <small>
                Ton objectif final au BAC
              </small>
            </div>

            <div className="mx2-ring">
              <svg
                viewBox="0 0 42 42"
              >
                <circle
                  cx="21"
                  cy="21"
                  r="17"
                  fill="none"
                  stroke="var(--mx2-mint)"
                  strokeWidth="3"
                />
                <circle
                  cx="21"
                  cy="21"
                  r="17"
                  fill="none"
                  stroke="var(--mx2-teal)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray="106.8"
                  strokeDashoffset="30"
                  transform="rotate(-90 21 21)"
                />
              </svg>

              <span>
                72%
              </span>

              <small>
                du chemin
              </small>
            </div>
          </div>

          <Link
            to="/focus"
            className="mx2-primary-cta"
          >
            Continuer à travailler
            <ArrowRight size={15} />
          </Link>

          <div className="mx2-priority-list">
            <span>
              Tes priorités
              aujourd'hui
            </span>

            <div>
              <span>
                <i className="mx2-dot mx2-dot-red" />
                Dérivabilité
              </span>
              <strong>
                À faire
              </strong>
            </div>

            <div>
              <span>
                <i className="mx2-dot mx2-dot-gold" />
                Équilibre chimique
              </span>
              <strong>
                Moyen
              </strong>
            </div>

            <div>
              <span>
                <i className="mx2-dot mx2-dot-green" />
                Intégrales
              </span>
              <strong>
                Moyen
              </strong>
            </div>
          </div>

          <Link
            to="/subjects"
            className="mx2-text-link"
          >
            Voir toutes mes priorités →
          </Link>
        </article>

        <article className="mx2-card mx2-subjects-card">
          <div className="mx2-card-heading">
            <div>
              <span className="mx2-card-icon">
                <BookOpen
                  size={15}
                />
              </span>

              <strong>
                Tes matières
              </strong>
            </div>

            <Link to="/subjects">
              Voir tout
            </Link>
          </div>

          <div className="mx2-subject-mini-grid">
            {subjects
              .slice(0, 6)
              .map(
                (
                  subject,
                  index,
                ) => {
                  const key =
                    subject.id
                      .toLowerCase()
                      .replace(
                        /[^a-z]/g,
                        "",
                      );

                  const tone =
                    subjectTone[
                      key
                    ] ??
                    [
                      "mx2-subject-teal",
                      "mx2-subject-green",
                      "mx2-subject-mint",
                      "mx2-subject-aqua",
                      "mx2-subject-coral",
                    ][
                      index %
                        5
                    ];

                  const value =
                    Math.min(
                      95,
                      64 +
                        index *
                          5,
                    );

                  return (
                    <Link
                      key={
                        subject.id
                      }
                      to={`/subjects/${subject.id}`}
                      className={`mx2-mini-subject ${tone}`}
                    >
                      <div>
                        <span className="mx2-mini-subject-icon">
                          {index +
                            1}
                        </span>

                        <strong>
                          {
                            subject.name
                          }
                        </strong>
                      </div>

                      <span>
                        {
                          value
                        }%
                      </span>

                      <i>
                        <b
                          style={{
                            width:
                              `${value}%`,
                          }}
                        />
                      </i>
                    </Link>
                  );
                },
              )}
          </div>
        </article>

        <article className="mx2-card mx2-chapters-card">
          <div className="mx2-card-heading">
            <div>
              <span className="mx2-card-icon">
                <BookOpen
                  size={15}
                />
              </span>

              <strong>
                Chapitres
                (Maths)
              </strong>
            </div>

            <Link to="/subjects">
              Voir tout
            </Link>
          </div>

          <div className="mx2-chapter-list">
            {(chapters.length
              ? chapters
              : [
                  {
                    id: "1",
                    name: "Limites",
                    progress: 82,
                  },
                  {
                    id: "2",
                    name: "Continuité",
                    progress: 64,
                  },
                  {
                    id: "3",
                    name: "Dérivabilité",
                    progress: 41,
                  },
                  {
                    id: "4",
                    name: "Variations",
                    progress: 73,
                  },
                  {
                    id: "5",
                    name: "Primitives",
                    progress: 29,
                  },
                  {
                    id: "6",
                    name: "Intégrales",
                    progress: 68,
                  },
                ]
            ).map(
              (
                chapter,
                index,
              ) => {
                const value =
                  Number(
                    chapter.progress ??
                      [
                        82,
                        64,
                        41,
                        73,
                        29,
                        68,
                      ][
                        index %
                          6
                      ],
                  );

                return (
                  <Link
                    key={
                      chapter.id
                    }
                    to={
                      `/subjects/mathematiques`
                    }
                    className="mx2-chapter-row"
                  >
                    <span
                      className={`mx2-chapter-index mx2-chapter-${index}`}
                    >
                      {index +
                        1}
                    </span>

                    <span>
                      {
                        chapter.name
                      }
                    </span>

                    <strong>
                      {value}%
                    </strong>

                    <ChevronRight
                      size={
                        14
                      }
                    />
                  </Link>
                );
              },
            )}
          </div>
        </article>

        <article className="mx2-card mx2-concept-card">
          <div className="mx2-card-heading">
            <div>
              <span className="mx2-card-icon">
                <Bot size={15} />
              </span>

              <strong>
                Concept :
                Dérivabilité
              </strong>
            </div>

            <span className="mx2-heart">
              ♡
            </span>
          </div>

          <div className="mx2-breadcrumb">
            Maths
            <span>›</span>
            Analyse
            <span>›</span>
            Dérivabilité
          </div>

          <div className="mx2-concept-score">
            <div>
              <strong>
                41%
              </strong>
              <span>
                Maîtrise
              </span>
            </div>

            <div className="mx2-concept-circle">
              41
            </div>
          </div>

          <div className="mx2-action-grid">
            <Link to="/ai">
              <Bot size={14} />
              <strong>
                Comprendre
              </strong>
              <small>
                Leçon & résumé
              </small>
            </Link>

            <Link to="/ai">
              <BookOpen size={14} />
              <strong>
                Mes notes
              </strong>
              <small>
                Voir mes fiches
              </small>
            </Link>

            <Link to="/ai">
              <Video size={14} />
              <strong>
                Vidéo → Notes
              </strong>
              <small>
                YouTube → Fiche
              </small>
            </Link>

            <Link to="/subjects">
              <BookOpen size={14} />
              <strong>
                S'entraîner
              </strong>
              <small>
                Exercices & quiz
              </small>
            </Link>

            <Link to="/ai">
              <Bot size={14} />
              <strong>
                Demander à l'IA
              </strong>
              <small>
                Poser une question
              </small>
            </Link>

            <Link to="/exams">
              <FileTextIcon />
              <strong>
                Examens BAC
              </strong>
              <small>
                Sujets & corrigés
              </small>
            </Link>
          </div>
        </article>

        <article className="mx2-card mx2-ai-card">
          <div className="mx2-card-heading">
            <div>
              <span className="mx2-card-icon">
                <Bot size={15} />
              </span>

              <strong>
                IA Hub
              </strong>
            </div>
          </div>

          <strong className="mx2-ai-question">
            Qu'est-ce que tu veux
            faire ?
          </strong>

          <div className="mx2-ai-tools-grid">
            <Link to="/ai">
              <Target size={17} />
              <span>
                Exercices
                <small>
                  Générer des exercices
                </small>
              </span>
            </Link>

            <Link to="/ai">
              <Bot size={17} />
              <span>
                Expliquer
                <small>
                  Un concept
                </small>
              </span>
            </Link>

            <Link to="/ai">
              <BookOpen size={17} />
              <span>
                Flashcards
                <small>
                  Créer des cartes
                </small>
              </span>
            </Link>

            <Link to="/ai">
              <Video size={17} />
              <span>
                Vidéo → Notes
                <small>
                  Transformer une vidéo
                </small>
              </span>
            </Link>

            <Link to="/ai">
              <CheckCircle2 size={17} />
              <span>
                Vérifier réponse
                <small>
                  Analyser ma réponse
                </small>
              </span>
            </Link>

            <Link to="/ai">
              <Trophy size={17} />
              <span>
                Fiche de révision
                <small>
                  Générer une fiche
                </small>
              </span>
            </Link>
          </div>
        </article>

        <article className="mx2-card mx2-video-card">
          <div className="mx2-card-heading">
            <div>
              <span className="mx2-card-icon">
                <Video size={15} />
              </span>

              <strong>
                Vidéo → Notes
              </strong>
            </div>
          </div>

          <p>
            Transforme une vidéo en fiche personnalisée.
          </p>

          <div className="mx2-video-input">
            <Video size={14} />

            <input
              placeholder="Colle le lien YouTube ici"
            />

            <Link to="/ai">
              Analyser
            </Link>
          </div>

          <div className="mx2-history-title">
            Récentes transformations
          </div>

          <div className="mx2-history-list">
            <div>
              <span className="mx2-history-thumb">
                ∂
              </span>

              <span>
                <strong>
                  Dérivabilité — Cours complet
                </strong>
                <small>
                  Aujourd'hui
                </small>
              </span>
            </div>

            <div>
              <span className="mx2-history-thumb">
                F
              </span>

              <span>
                <strong>
                  Les lois de Newton
                </strong>
                <small>
                  Il y a 2 jours
                </small>
              </span>
            </div>

            <div>
              <span className="mx2-history-thumb">
                ∫
              </span>

              <span>
                <strong>
                  Limites — Exercices corrigés
                </strong>
                <small>
                  Il y a 3 jours
                </small>
              </span>
            </div>
          </div>

          <Link
            to="/ai"
            className="mx2-text-link"
          >
            Voir tout l'historique →
          </Link>
        </article>

        <article className="mx2-card mx2-resume-card">
          <div className="mx2-card-heading">
            <div>
              <span className="mx2-card-icon">
                <BookOpen
                  size={15}
                />
              </span>

              <strong>
                Fiche générée
              </strong>
            </div>

            <span className="mx2-resume-badges">
              ✎ ○ ●
            </span>
          </div>

          <div className="mx2-resume-sheet">
            <small>
              MATHS · ANALYSE
            </small>

            <h3>
              Les limites
            </h3>

            <div className="mx2-resume-columns">
              <div>
                <strong>
                  Rappels essentiels
                </strong>

                <p>
                  Une suite ou fonction peut
                  se rapprocher d'une valeur
                  sans forcément l'atteindre.
                </p>

                <div className="mx2-resume-formula">
                  lim f(x) = L
                </div>
              </div>

              <div>
                <strong>
                  Propriétés
                </strong>

                <ul>
                  <li>
                    Somme
                  </li>
                  <li>
                    Produit
                  </li>
                  <li>
                    Quotient
                  </li>
                </ul>
              </div>
            </div>

            <div className="mx2-resume-bottom">
              <span>
                ⭐ Rappel
              </span>

              <small>
                Vérifier le sens de variation
                avant de conclure.
              </small>
            </div>
          </div>

          <Link
            to="/ai"
            className="mx2-primary-cta"
          >
            Ouvrir la fiche
            <ArrowRight size={15} />
          </Link>
        </article>

        <article className="mx2-card mx2-check-card">
          <div className="mx2-card-heading">
            <div>
              <span className="mx2-card-icon">
                <CheckCircle2
                  size={15}
                />
              </span>

              <strong>
                Vérifier réponse
              </strong>
            </div>
          </div>

          <p>
            Envoie ta réponse.
          </p>

          <div className="mx2-upload-box">
            <Upload size={23} />

            <strong>
              Glisse une image ici
            </strong>

            <small>
              ou clique pour sélectionner
            </small>
          </div>

          <Link
            to="/ai"
            className="mx2-danger-cta"
          >
            Analyser ma réponse
          </Link>
        </article>

        <article className="mx2-card mx2-streak-card">
          <span className="mx2-kicker">
            Série actuelle 🔥
          </span>

          <strong>
            12{" "}
            <small>
              jours
            </small>
          </strong>

          <span>
            Continue comme ça !
          </span>

          <div className="mx2-week">
            {[
              "L",
              "M",
              "M",
              "J",
              "V",
              "S",
              "D",
            ].map(
              (day, index) => (
                <div
                  key={day + index}
                >
                  <small>
                    {day}
                  </small>

                  <i
                    className={
                      index < 5
                        ? "done"
                        : ""
                    }
                  />
                </div>
              ),
            )}
          </div>
        </article>

        <article className="mx2-card mx2-correction-card">
          <div className="mx2-card-heading">
            <div>
              <span className="mx2-card-icon">
                <CheckCircle2
                  size={15}
                />
              </span>

              <strong>
                Résultat de correction
              </strong>
            </div>
          </div>

          <div className="mx2-score">
            <span>
              Score obtenu
            </span>

            <strong>
              14,5
            </strong>

            <small>
              /20
            </small>
          </div>

          <div className="mx2-correction-lines">
            <span>
              ✓ Méthode correcte
              <b>
                5 / 5
              </b>
            </span>

            <span>
              ✓ Formules correctes
              <b>
                4 / 5
              </b>
            </span>

            <span className="bad">
              × Erreur de signe
              <b>
                -1,5
              </b>
            </span>

            <span className="bad">
              × Vérification finale
              <b>
                -1
              </b>
            </span>
          </div>

          <div className="mx2-warning-box">
            <strong>
              Ta faiblesse principale
            </strong>

            <span>
              Vérification finale
            </span>

            <small>
              Tu as trouvé la méthode mais tu
              n'as pas vérifié ton résultat.
            </small>
          </div>
        </article>

        <article className="mx2-card mx2-recommendations-card">
          <div className="mx2-card-heading">
            <div>
              <span className="mx2-card-icon">
                <Bot size={15} />
              </span>

              <strong>
                Recommandations IA
              </strong>
            </div>
          </div>

          {[
            "Regarde cette explication ciblée",
            "Exemple corrigé",
            "Exercice ciblé 1",
            "Exercice ciblé 2",
          ].map(
            (
              item,
              index,
            ) => (
              <div
                className="mx2-recommendation"
                key={item}
              >
                <span>
                  <strong>
                    {item}
                  </strong>
                  <small>
                    {index <
                    2
                      ? "Pour renforcer ta compréhension"
                      : "Application + vérification"}
                  </small>
                </span>

                <Link to="/ai">
                  {index <
                  2
                    ? "Voir"
                    : "Faire"}
                </Link>
              </div>
            ),
          )}

          <Link
            to="/ai"
            className="mx2-primary-cta"
          >
            Re-tester mes compétences
          </Link>
        </article>

        <article className="mx2-card mx2-exams-card">
          <div className="mx2-card-heading">
            <div>
              <span className="mx2-card-icon">
                <CalendarDays
                  size={15}
                />
              </span>

              <strong>
                Examens – Accueil
              </strong>
            </div>
          </div>

          <div className="mx2-tabs">
            <span className="active">
              Sujets
            </span>
            <span>
              Corrigés
            </span>
            <span>
              Simulations
            </span>
            <span>
              Mes résultats
            </span>
          </div>

          {[
            "Examen National 2022 (Session Normale)",
            "Examen National 2022 (Session Rattrapage)",
            "Examen Régional – Casablanca 2023",
          ].map(
            (exam, index) => (
              <div
                className="mx2-exam-row"
                key={exam}
              >
                <span>
                  {exam}
                </span>

                <small>
                  {index ===
                  0
                    ? "98 XP"
                    : "80 XP"}
                </small>
              </div>
            ),
          )}

          <Link
            to="/exams"
            className="mx2-text-link"
          >
            Voir tous les examens →
          </Link>
        </article>

        <article className="mx2-card mx2-profile-card">
          <div className="mx2-card-heading">
            <div>
              <span className="mx2-card-icon">
                <UserIcon />
              </span>

              <strong>
                Profil
              </strong>
            </div>
          </div>

          <div className="mx2-profile-preview">
            <div className="mx2-avatar">
              {displayName
                .slice(0, 1)
                .toUpperCase()}
            </div>

            <div>
              <strong>
                {displayName}
              </strong>

              <small>
                BAC SM · Lycée
              </small>
            </div>
          </div>

          <div className="mx2-profile-stats">
            <div>
              <span>
                Niveau
              </span>
              <strong>
                24
              </strong>
            </div>

            <div>
              <span>
                XP total
              </span>
              <strong>
                {(
                  totalMinutes *
                  10
                ).toLocaleString()}
              </strong>
            </div>
          </div>

          <div className="mx2-profile-progress">
            <div>
              <span>
                Progression
              </span>

              <strong>
                {hoursToday}
                h{" "}
                {remainingMinutes}
                m
              </strong>
            </div>

            <i>
              <b
                style={{
                  width:
                    `${Math.min(
                      100,
                      totalMinutes /
                        6,
                    )}%`,
                }}
              />
            </i>
          </div>

          <Link
            to="/profile"
            className="mx2-soft-cta"
          >
            Modifier
          </Link>
        </article>
      </section>

      {!loading &&
        subjects.length ===
          0 && (
          <div className="mx2-empty-note">
            Aucune matière n'a
            encore été chargée.
          </div>
        )}
    </div>
  );
}

function FileTextIcon() {
  return (
    <span className="mx2-inline-icon">
      ▣
    </span>
  );
}

function UserIcon() {
  return (
    <span className="mx2-inline-icon">
      ●
    </span>
  );
}
