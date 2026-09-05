import type { LessonDocument } from "../../types/academic";

type Axis = {
  id: string;
  chapter: string;
  title: string;
  question: string;
  positions: string[];
  recap: string[];
};

const makeLesson = ({ id, chapter, title, question, positions, recap }: Axis): LessonDocument => ({
  id,
  title: `${title} — ${chapter}`,
  language: "fr",
  source: "APPROVED",
  subjectId: "philosophie",
  chapter,
  topic: title,
  blocks: [
    { type: "title", title: `${title} — ${chapter}` },
    { type: "intro", text: question },
    { type: "concept", title: "Problématique", text: question },
    { type: "comparison", title: "Positions philosophiques", items: positions },
    { type: "method", title: "Méthode Bac", text: "Définis les notions, pose clairement le problème, expose les thèses en présence, puis confronte-les avec des arguments et des exemples précis." },
    { type: "common-mistake", title: "Erreur fréquente", text: "Réciter les philosophes sans expliquer leur réponse à la problématique. Chaque référence doit soutenir une idée." },
    { type: "exam-tip", title: "Réflexe Bac", text: "Mémorise pour chaque philosophe : sa thèse, son argument central et le point précis de la problématique auquel il répond." },
    { type: "recap", title: "À retenir", items: recap },
  ],
});

export const secondBacPhilosophyLessons: LessonDocument[] = [
  makeLesson({ id: "2bac-philo-person-identity", chapter: "Le sujet humain — La personne", title: "Axe 1 : L'identité de la personne", question: "Sur quoi se fonde l'identité de la personne ? L'identité personnelle est-elle fixe ou changeante ?", positions: [
    "Jules Lachelier : l'identité de la personne est changeante ; elle repose sur la permanence du caractère et la continuité des souvenirs, puisque les événements qui constituent les souvenirs se renouvellent et s'enchaînent.",
    "Sigmund Freud : l'identité est en changement permanent et reste instable en raison de la dynamique du conflit entre le surmoi, le ça et le moi dans l'appareil psychique.",
    "John Locke : le fondement de l'identité personnelle est la conscience et la mémoire ; elles font de l'individu un être rationnel qui demeure lui-même malgré les changements.",
    "René Descartes : l'identité de la personne se fonde sur la pensée qui rend le sujet identique à lui-même ; elle est stable avec la permanence de la raison.",
    "Arthur Schopenhauer : l'identité se détermine par la volonté, qui demeure constante et assure la continuité de l'individu.",
  ], recap: ["Identité entre permanence et changement", "Conscience et mémoire", "Pensée et raison", "Volonté", "Dynamique psychique"] }),
  makeLesson({ id: "2bac-philo-person-value", chapter: "Le sujet humain — La personne", title: "Axe 2 : La valeur de la personne", question: "D'où la personne tire-t-elle sa valeur ? Est-elle un moyen ou une fin ? Sa valeur est-elle relative ou absolue ?", positions: [
    "Friedrich Hegel : la valeur des personnes dépend de leur contribution à l'histoire, qui peut utiliser les individus comme des moyens pour réaliser ses objectifs.",
    "Emmanuel Kant : la personne est une fin en soi parce qu'elle est un sujet doué d'une raison pratique et morale ; elle ne peut donc pas être traitée comme un simple moyen et doit être respectée.",
    "Georges Gusdorf : la solidarité et la coexistence fondent la valeur et l'accomplissement de la personne ; son existence se réalise par la participation à la vie des autres, l'appartenance au groupe et l'acceptation d'autrui.",
  ], recap: ["Personne comme moyen ou comme fin", "Respect et dignité", "Valeur historique", "Solidarité et coexistence"] }),
  makeLesson({ id: "2bac-philo-person-freedom", chapter: "Le sujet humain — La personne", title: "Axe 3 : La personne entre nécessité et liberté", question: "La personne est-elle un sujet libre ou un être soumis à des nécessités et à des déterminismes ?", positions: [
    "Jean-Paul Sartre : la personne est un projet libre ; l'existence précède l'essence, elle se dépasse constamment et peut transcender les situations qui semblent la déterminer à l'avance.",
    "Baruch Spinoza : la personne n'est pas libre dans ses choix et ses actions ; elle est soumise aux nécessités de la nature qui déterminent son agir.",
    "Sigmund Freud : la personne n'est pas libre en elle-même en raison des déterminismes biologiques et psychologiques qui influencent son comportement.",
  ], recap: ["Liberté comme projet", "Nécessité de la nature", "Déterminismes biologiques et psychologiques", "Limites du choix"] }),

  makeLesson({ id: "2bac-philo-other-existence", chapter: "Le sujet humain — Autrui", title: "Axe 1 : L'existence d'autrui", question: "L'existence d'autrui est-elle nécessaire à l'existence du moi ou constitue-t-elle une menace pour lui ?", positions: [
    "Jean-Paul Sartre : l'existence d'autrui est ambivalente, à la fois positive et négative ; autrui est une source de relation mais aussi de conflit et de menace pour le moi.",
    "Friedrich Hegel : autrui est nécessaire au moi pour prendre conscience de lui-même ; les deux sont inséparables, comme le montre la dialectique du maître et de l'esclave.",
    "René Descartes : le sujet n'a pas besoin d'autrui pour se connaître ou atteindre la vérité de son existence, puisqu'il dispose de la raison ; le cogito en constitue l'exemple : « Je pense, donc je suis ».",
    "Martin Heidegger : l'existence d'autrui peut menacer l'existence du moi, qui risque de se disperser et de se dissoudre dans l'existence quotidienne.",
  ], recap: ["Autrui et conscience de soi", "Reconnaissance et conflit", "Autonomie du cogito", "Menace et dissolution du moi"] }),
  makeLesson({ id: "2bac-philo-other-knowledge", chapter: "Le sujet humain — Autrui", title: "Axe 2 : La connaissance d'autrui", question: "Sur quoi se fonde la connaissance d'autrui ? Est-elle possible ou impossible ?", positions: [
    "Nicolas Malebranche : la connaissance d'autrui se fonde sur la supposition et la conjecture, puisque les sensations, émotions et inclinations du moi diffèrent de celles d'autrui.",
    "Gaston Berger : la connaissance d'autrui est impossible en raison de l'isolement du moi et de son monde intérieur ; un mur sépare le moi d'autrui.",
    "Max Scheler : la connaissance d'autrui est possible en considérant l'unité de l'être humain ; l'apparence extérieure peut être la traduction de l'intériorité.",
    "Maurice Merleau-Ponty : la connaissance d'autrui est possible grâce à l'ouverture, à l'empathie et à la communication.",
  ], recap: ["Supposition et conjecture", "Isolement du moi", "Expression de l'intériorité", "Empathie et communication"] }),
  makeLesson({ id: "2bac-philo-other-relation", chapter: "Le sujet humain — Autrui", title: "Axe 3 : La relation à autrui", question: "Quelle est la nature de la relation à autrui ? Est-elle fondée sur l'amitié ou sur le conflit ?", positions: [
    "Aristote : la relation à autrui est positive et repose sur une amitié fondée sur la vertu ; elle est nécessaire à la vie commune et favorise la coopération.",
    "Emmanuel Kant : l'amitié est la plus haute des relations humaines, car elle repose sur le respect mutuel et la bonne volonté ; elle constitue un devoir moral.",
    "Alexandre Kojève : la relation à autrui est un conflit pour obtenir la reconnaissance et imposer sa domination.",
    "Julia Kristeva : autrui est l'étranger qui habite le sujet ; il est présent dans les profondeurs de la subjectivité.",
  ], recap: ["Amitié et vertu", "Respect mutuel", "Lutte pour la reconnaissance", "L'étranger en soi"] }),

  makeLesson({ id: "2bac-philo-theory-experiment", chapter: "La connaissance — Théorie et expérience", title: "Axe 1 : Expérience et expérimentation", question: "Quelle différence entre expérience et expérimentation ? Les théories scientifiques se fondent-elles sur l'expérience ou sur l'expérimentation ?", positions: [
    "Claude Bernard : les théories scientifiques se fondent sur l'expérimentation, qui recrée les conditions de la phénomènes selon les étapes : observation, hypothèse, expérimentation, loi.",
    "René Thom : la science ne peut être réduite à l'expérience empirique ; elle doit aussi s'ouvrir à l'expérience imaginaire et mentale.",
  ], recap: ["Expérience et expérimentation", "Observation", "Hypothèse", "Expérimentation", "Loi scientifique", "Expérience mentale"] }),
  makeLesson({ id: "2bac-philo-scientific-rationality", chapter: "La connaissance — Théorie et expérience", title: "Axe 2 : La rationalité scientifique", question: "Quel rôle la raison joue-t-elle dans la construction des théories scientifiques ? Repose-t-elle sur une rationalité idéale ou ouverte au réel ?", positions: [
    "Albert Einstein : la science moderne accorde une place décisive à la construction rationnelle ; la connaissance ne dépend pas simplement des données de l'expérience, mais aussi de l'activité créatrice de la raison.",
    "Gaston Bachelard : la rationalité scientifique se construit dans un dialogue ouvert entre la raison et l'expérience pour produire une connaissance objective.",
    "Hans Reichenbach : la rationalité scientifique mathématique remplace la simple perception sensible par la compréhension rationnelle des relations formelles.",
  ], recap: ["Primauté de la raison", "Dialogue raison-expérience", "Construction mathématique", "Connaissance objective"] }),
  makeLesson({ id: "2bac-philo-scientific-criteria", chapter: "La connaissance — Théorie et expérience", title: "Axe 3 : Les critères de scientificité des théories", question: "Quels sont les critères de scientificité des théories scientifiques ? Leur validité dépend-elle de la critique ou de leur possibilité d'être réfutées ?", positions: [
    "Ibn al-Haytham : la critique constructive constitue un critère essentiel pour vérifier et évaluer une théorie scientifique.",
    "Karl Popper : le critère fondamental de scientificité est la falsifiabilité, c'est-à-dire la possibilité de mettre la théorie à l'épreuve par des observations susceptibles de la réfuter.",
  ], recap: ["Critique constructive", "Test scientifique", "Falsifiabilité", "Réfutation", "Validité"] }),

  makeLesson({ id: "2bac-philo-truth-opinion", chapter: "La connaissance — La vérité", title: "Axe 1 : Opinion et vérité", question: "Quelle est la relation entre opinion et vérité ? L'opinion fonde-t-elle la vérité ou constitue-t-elle un obstacle ?", positions: [
    "Gaston Bachelard : l'opinion est un obstacle épistémologique au savoir scientifique ; il faut la dépasser par une recherche méthodique.",
    "René Descartes : il faut rompre avec l'opinion et reconstruire la vérité par une méthode rationnelle fondée sur l'examen et l'évidence.",
    "Gottfried Wilhelm Leibniz : malgré son caractère probable, l'opinion peut jouer un rôle productif dans l'histoire des idées en ouvrant des pistes de réflexion.",
  ], recap: ["Opinion comme obstacle", "Rupture méthodique", "Construction rationnelle", "Rôle heuristique de l'opinion"] }),
  makeLesson({ id: "2bac-philo-truth-criteria", chapter: "La connaissance — La vérité", title: "Axe 2 : Les critères de la vérité", question: "Comment peut-on reconnaître la vérité ? Son critère est-il logique, expérimental ou les deux à la fois ?", positions: [
    "René Descartes : l'intuition intellectuelle et la déduction sont deux critères rationnels permettant d'atteindre la vérité.",
    "David Hume : il faut distinguer les vérités de raison, fondées sur les relations entre idées, et les vérités de fait, qui dépendent de l'expérience.",
    "Michel Foucault : la vérité est aussi liée au pouvoir, car elle est produite et diffusée par des dispositifs et des institutions qui déterminent ce qui est reconnu comme vrai.",
  ], recap: ["Intuition", "Déduction", "Vérité de raison", "Vérité de fait", "Pouvoir et production du vrai"] }),
  makeLesson({ id: "2bac-philo-truth-value", chapter: "La connaissance — La vérité", title: "Axe 3 : La valeur de la vérité", question: "D'où la vérité tire-t-elle sa valeur ? Est-elle une fin en soi ou seulement un moyen ?", positions: [
    "Emmanuel Kant : la vérité possède une valeur morale, car elle est liée à l'exigence du devoir et à l'usage responsable de la raison.",
    "William James : la valeur d'une vérité se mesure aussi aux conséquences utiles qu'elle peut produire pour répondre aux besoins des individus.",
    "Friedrich Nietzsche : la vérité comporte une dimension vitale ; elle peut être liée à la conservation et à l'affirmation de la vie.",
  ], recap: ["Valeur morale", "Utilité et conséquences", "Vérité et vie", "Fin ou moyen"] }),

  makeLesson({ id: "2bac-philo-state-legitimacy", chapter: "La politique — L'État", title: "Axe 1 : Légitimité et finalités de l'État", question: "Quelle est la finalité de l'État ? D'où tire-t-il sa légitimité ?", positions: [
    "Baruch Spinoza : l'État a pour finalité de garantir la liberté des individus et de leur permettre de conserver leur droit naturel à l'existence.",
    "Thomas Hobbes : l'État vise la paix et la sécurité, à condition que les individus transfèrent leur droit naturel à une autorité souveraine chargée d'assurer l'ordre.",
    "Max Weber : la légitimité de l'État repose sur trois types de domination : traditionnelle, charismatique et légale-rationnelle.",
  ], recap: ["Liberté", "Paix et sécurité", "Souveraineté", "Légitimité traditionnelle", "Légitimité charismatique", "Légitimité légale-rationnelle"] }),
  makeLesson({ id: "2bac-philo-state-authority", chapter: "La politique — L'État", title: "Axe 2 : La nature du pouvoir politique", question: "Le pouvoir politique est-il transcendant aux individus ou immanent à la société ?", positions: [
    "Louis Althusser : le pouvoir politique peut être autoritaire et s'appuyer sur des appareils répressifs et idéologiques qui reproduisent l'ordre social.",
    "Montesquieu : la concentration des pouvoirs dans une seule main produit l'arbitraire ; il faut séparer les pouvoirs afin que l'autorité appartienne aux institutions.",
    "Ibn Khaldoun : lorsque le souverain est despotique, le pouvoir devient arbitraire et la justice disparaît ; le gouvernement doit rechercher la mesure et la modération.",
    "Michel Foucault : le pouvoir circule dans la société et ne se réduit pas à une autorité centralisée ; il se manifeste dans les pratiques et les relations.",
  ], recap: ["Appareils répressifs et idéologiques", "Séparation des pouvoirs", "Justice et modération", "Pouvoir diffus dans la société"] }),
  makeLesson({ id: "2bac-philo-state-right-force", chapter: "La politique — L'État", title: "Axe 3 : L'État entre droit et violence", question: "Comment l'État exerce-t-il son pouvoir : par le droit, par la force, ou par les deux ?", positions: [
    "Max Weber : l'État détient le monopole de l'usage légitime de la violence physique afin de faire respecter l'ordre juridique.",
    "Nicolas Machiavel : le pouvoir de l'État doit savoir combiner force et stratégie ; le prince peut utiliser des moyens légitimes ou illégitimes selon les nécessités de la conservation du pouvoir.",
    "Jacqueline Russ : l'État contemporain doit être un pouvoir rationalisé et moral, soumis au respect de la personne, de ses droits et de sa dignité.",
    "Abdallah Laroui : l'État despotique est l'opposé de l'État de droit ; il repose sur la domination et manque de légitimité et de consensus.",
  ], recap: ["Violence légitime", "Force et stratégie", "État de droit", "Droits et dignité", "Légitimité"] }),

  makeLesson({ id: "2bac-philo-right-natural-positive", chapter: "La politique — Le droit et la justice", title: "Axe 1 : Droit naturel et droit positif", question: "La justice est-elle liée au droit naturel ou au droit positif ?", positions: [
    "Thomas Hobbes : le droit naturel est la liberté fondamentale d'agir selon la nature et les désirs de l'individu ; il entre en tension avec le droit positif, qui impose des règles communes.",
    "Jean-Jacques Rousseau : le droit est d'origine civile et politique ; il se fonde sur le contrat social et la volonté générale, sources des droits civils.",
  ], recap: ["Droit naturel", "Liberté", "Droit positif", "Contrat social", "Volonté générale"] }),
  makeLesson({ id: "2bac-philo-justice-right", chapter: "La politique — Le droit et la justice", title: "Axe 2 : La justice comme fondement du droit", question: "Quel rapport existe-t-il entre justice et droit ? Lequel fonde l'autre ? Toute loi garantit-elle les droits ?", positions: [
    "Aristote : la justice est une vertu qui consiste à agir conformément aux lois justes et permet de garantir les droits.",
    "Baruch Spinoza : la justice réalise le droit ; il n'existe pas de droit effectif en dehors de l'ordre juridique de l'État.",
    "Cicéron : une loi peut devenir un instrument dangereux de privation des droits lorsqu'elle est injuste ; il faut se référer à la justice comme sentiment naturel commun.",
  ], recap: ["Justice comme vertu", "Droit et ordre juridique", "Limites de la loi", "Justice naturelle"] }),
  makeLesson({ id: "2bac-philo-justice-equality-equity", chapter: "La politique — Le droit et la justice", title: "Axe 3 : La justice entre égalité et équité", question: "Quel est le but de la justice ? Consiste-t-elle dans l'égalité ou dans l'équité ?", positions: [
    "Platon : la justice réalise l'harmonie entre les forces de l'âme et, dans la cité, lorsque chacun accomplit la fonction qui lui revient selon sa nature.",
    "Alain (Émile Chartier) : on ne peut parler de justice sans une égalité aussi complète que possible entre les personnes ; les fortes différences sociales compromettent la justice.",
    "Max Scheler : les êtres humains ne naissent pas identiques et ne vivent pas dans les mêmes situations ; la justice exige donc l'équité plutôt qu'une égalité mécanique.",
    "John Rawls : la justice repose sur l'équité ; les inégalités ne sont admissibles que si elles améliorent la situation des plus défavorisés.",
  ], recap: ["Harmonie", "Égalité", "Équité", "Inégalités", "Justice comme équité"] }),

  makeLesson({ id: "2bac-philo-duty-coercion", chapter: "L'éthique — Le devoir", title: "Axe 1 : Devoir et contrainte", question: "Le devoir provient-il d'une volonté libre ou d'un acte soumis à la nécessité et à la contrainte ?", positions: [
    "Emmanuel Kant : le devoir moral est une obligation qui s'impose à la raison pratique et se réalise par une volonté bonne et libre.",
    "Émile Durkheim : le devoir moral est obligatoire parce qu'il est issu de la conscience collective et des normes sociales, tout en pouvant être intériorisé comme souhaitable.",
  ], recap: ["Obligation morale", "Raison pratique", "Volonté libre", "Conscience collective", "Normes sociales"] }),
  makeLesson({ id: "2bac-philo-moral-consciousness", chapter: "L'éthique — Le devoir", title: "Axe 2 : La conscience morale", question: "La conscience morale vient-elle de la nature ou de la culture et de la société ?", positions: [
    "Sigmund Freud : la conscience morale dépend du surmoi, instance psychique qui intériorise l'autorité et permet d'évaluer le comportement humain.",
    "Jean-Jacques Rousseau : la conscience morale possède une origine naturelle et spontanée ; elle permet de porter des jugements sur les conduites humaines.",
  ], recap: ["Surmoi", "Intériorisation de l'autorité", "Origine psychique", "Origine naturelle"] }),
  makeLesson({ id: "2bac-philo-duty-society", chapter: "L'éthique — Le devoir", title: "Axe 3 : Le devoir et la société", question: "Comment le devoir reflète-t-il les valeurs de la société ? Vient-il de la conscience individuelle ou de la conscience sociale ?", positions: [
    "Émile Durkheim : la société est la source principale du devoir moral ; par son autorité, elle inscrit dans la conscience individuelle ce qu'il faut faire.",
    "Max Weber : le devoir peut être lié à une éthique de conviction fondée sur des principes religieux ou idéologiques, mais aussi à une éthique de responsabilité attentive aux conséquences de l'action.",
    "John Rawls : le devoir moral possède une portée universelle et humaine, notamment à travers la solidarité envers les générations futures.",
  ], recap: ["Société comme source du devoir", "Éthique de conviction", "Éthique de responsabilité", "Universalité", "Solidarité intergénérationnelle"] }),

  makeLesson({ id: "2bac-philo-freedom-determinism", chapter: "L'éthique — La liberté", title: "Axe 1 : Liberté et déterminisme", question: "La liberté s'oppose-t-elle au déterminisme ou la prise de conscience de celui-ci peut-elle en constituer la condition ?", positions: [
    "Ibn Rushd (Averroès) : l'action humaine possède une liberté partielle issue de la volonté de l'individu, tout en restant liée à l'ordre et à la volonté divine.",
    "Maurice Merleau-Ponty : la liberté humaine est relative et se déploie à l'intérieur de conditions sociales, historiques et psychologiques.",
    "Abdallah Laroui : la science constitue un projet d'émancipation qui sert la liberté humaine en permettant de comprendre, maîtriser et réduire certains déterminismes.",
  ], recap: ["Liberté partielle", "Conditions sociales et historiques", "Déterminismes psychologiques", "Science et émancipation"] }),
  makeLesson({ id: "2bac-philo-freedom-will", chapter: "L'éthique — La liberté", title: "Axe 2 : Liberté et volonté", question: "Comment se définit le rapport entre liberté et volonté ? Notre volonté est-elle libre ou soumise à des déterminations extérieures ?", positions: [
    "René Descartes : l'être humain est libre dans ses choix et sa liberté est liée à l'exercice de sa volonté.",
    "Emmanuel Kant : l'être humain possède une volonté libre parce qu'il est doué d'une raison pratique et morale qui lui permet d'agir selon des principes et dans le respect de la dignité.",
    "Jean-Paul Sartre : la volonté permet à l'individu de poursuivre consciemment les fins auxquelles il aspire et de se projeter au-delà de sa situation présente.",
  ], recap: ["Liberté et volonté", "Autonomie", "Raison pratique", "Choix des fins", "Projet"] }),
  makeLesson({ id: "2bac-philo-freedom-law", chapter: "L'éthique — La liberté", title: "Axe 3 : Liberté et loi", question: "Quelle est la relation entre liberté et loi ? La loi garantit-elle la liberté ou la limite-t-elle ?", positions: [
    "Thomas Hobbes : la liberté véritable est une liberté organisée par la loi et compatible avec l'ordre juridique commun.",
    "Montesquieu : être libre signifie pouvoir faire ce que les lois permettent, et non faire tout ce que l'on désire.",
    "Hannah Arendt : la politique et la vie sociale constituent le domaine de la liberté effective ; sans un cadre politique permettant l'action et la participation, la liberté ne peut réellement apparaître.",
  ], recap: ["Liberté civile", "Loi et limites", "Sécurité juridique", "Action politique", "Liberté dans l'espace public"] }),
];
