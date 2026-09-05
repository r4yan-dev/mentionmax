import type { LessonDocument, SubjectId } from "../../types/academic";

const lesson = (
  id: string,
  subjectId: SubjectId,
  title: string,
  chapter: string,
  topic: string,
  intro: string,
  formula: string,
  method: string,
  mistake: string,
  recap: string[],
): LessonDocument => ({
  id,
  title,
  language: "fr",
  source: "APPROVED",
  subjectId,
  chapter,
  topic,
  blocks: [
    { type: "title", title },
    { type: "intro", text: intro },
    { type: "concept", title: "Idée clé", text: intro },
    { type: "formula", latex: formula },
    { type: "method", title: "Méthode Bac", text: method },
    { type: "common-mistake", title: "Erreur fréquente", text: mistake },
    { type: "exam-tip", title: "Réflexe Bac", text: "Dans une réponse scientifique, pars d'une observation précise, mobilise la notion étudiée, puis formule une conclusion qui répond exactement à la question." },
    { type: "recap", title: "À retenir", items: recap },
  ],
});

export const secondBacSvtLessons: LessonDocument[] = [
  lesson("2bac-svt-energy", "svt", "Libération de l'énergie de la matière organique", "Énergie et métabolisme", "Respiration et fermentation", "Les cellules utilisent la matière organique pour produire de l'ATP, notamment par respiration ou fermentation.", "C_6H_{12}O_6+6O_2\\rightarrow6CO_2+6H_2O+\\text{énergie}", "Comparer les voies métaboliques à partir des conditions du milieu et du bilan énergétique.", "Dire que respiration et fermentation ont exactement le même rendement énergétique.", ["Respiration", "Fermentation", "ATP", "Bilan énergétique"]),
  lesson("2bac-svt-muscle", "svt", "Conversion d'énergie dans le muscle", "Physiologie musculaire", "Contraction de la fibre musculaire", "La contraction musculaire résulte de l'interaction entre filaments protéiques et consomme de l'ATP.", "ATP\\rightarrow ADP+P_i+\\text{énergie}", "Relier organisation de la fibre, glissement des filaments et utilisation de l'ATP.", "Confondre énergie musculaire et matière musculaire.", ["Fibre musculaire", "Actine", "Myosine", "ATP"]),
  lesson("2bac-svt-genetic-nature", "svt", "La nature de l'information génétique", "Génétique moléculaire", "ADN et gènes", "L'ADN porte l'information génétique sous une séquence de nucléotides organisée en gènes.", "ADN=A+T+C+G", "Analyser un document moléculaire en identifiant support, séquence et rôle du gène.", "Confondre gène et chromosome.", ["ADN", "Nucléotide", "Gène", "Chromosome"]),
  lesson("2bac-svt-expression", "svt", "Expression de l'information génétique", "Génétique moléculaire", "Transcription et traduction", "L'expression d'un gène implique notamment la transcription de l'ADN en ARN puis la traduction en protéine.", "ADN\\xrightarrow{transcription}ARNm\\xrightarrow{traduction}Protéine", "Distinguer les deux étapes et repérer le rôle du codon et de l'ARN messager.", "Inverser transcription et traduction.", ["ARNm", "Transcription", "Traduction", "Code génétique"]),
  lesson("2bac-svt-sexual", "svt", "Transmission de l'information génétique lors de la reproduction sexuée", "Hérédité", "Méiose et fécondation", "La méiose produit des cellules haploïdes et contribue au brassage génétique, tandis que la fécondation rétablit la diploïdie.", "2n\\xrightarrow{méiose}n+n\\xrightarrow{fécondation}2n", "Suivre les étapes de la méiose et relier brassage interchromosomique, intrachromosomique et fécondation.", "Dire que la méiose conserve le nombre de chromosomes.", ["Méiose", "Brassage génétique", "Gamètes", "Fécondation"]),
  lesson("2bac-svt-mendel", "svt", "Lois statistiques de la transmission des caractères", "Génétique", "Monohybridisme et dihybridisme", "Les croisements permettent d'établir des proportions théoriques et de tester une hypothèse de transmission.", "P(A)=\\frac{\\text{cas favorables}}{\\text{cas possibles}}", "Construire les gamètes, établir le tableau de croisement puis comparer les proportions observées et théoriques.", "Oublier le génotype des parents avant de construire les gamètes.", ["Génotype", "Phénotype", "Croisement", "Mendel"]),
  lesson("2bac-svt-human-heredity", "svt", "Hérédité humaine", "Génétique humaine", "Arbres généalogiques et maladies héréditaires", "L'étude des pedigrees permet d'inférer le mode de transmission d'un caractère ou d'une maladie.", "P(événement)=\\frac{\\text{cas compatibles}}{\\text{cas totaux}}", "Identifier les personnes atteintes, proposer les génotypes compatibles avec le pedigree puis tester les modes autosomique dominant, récessif ou lié au sexe.", "Déduire un mode de transmission à partir d'un seul individu sans vérifier l'ensemble du pedigree.", ["Pedigree", "Génotype", "Transmission", "Maladie héréditaire"]),
  lesson("2bac-svt-self-nonself", "svt", "La notion de soi et de non-soi", "Immunologie", "Reconnaissance immunitaire", "Le système immunitaire distingue des marqueurs propres de l'organisme de structures étrangères.", "CMH\\rightarrow\\text{présentation de l'antigène}", "Relier CMH, antigènes et compatibilité lors d'une greffe.", "Réduire le soi/non-soi à une simple notion de groupe sanguin.", ["Soi", "Non-soi", "CMH", "Greffe"]),
  lesson("2bac-svt-defense", "svt", "Les moyens de défense du soi", "Immunologie", "Immunité innée et adaptative", "La défense de l'organisme associe des mécanismes rapides et non spécifiques à des réponses adaptatives spécifiques.", "Antigène\\rightarrow\\text{réponse immunitaire spécifique}", "Distinguer réponse humorale, cellulaire, anticorps et lymphocytes.", "Confondre lymphocyte B et anticorps.", ["Immunité innée", "Immunité adaptative", "Anticorps", "Lymphocytes"]),
  lesson("2bac-svt-dysfunction", "svt", "Dysfonctionnements et aide au système immunitaire", "Immunologie", "Allergies, auto-immunité et vaccination", "Le système immunitaire peut être insuffisant, excessif ou mal orienté; certaines stratégies médicales renforcent ou orientent sa réponse.", "Vaccination\\rightarrow\\text{mémoire immunitaire}", "Comparer vaccination et sérothérapie en fonction de la nature et de la durée de la protection.", "Dire que le vaccin apporte directement des anticorps actifs.", ["Allergie", "Auto-immunité", "Vaccination", "Sérothérapie"]),
  lesson("2bac-svt-mountains", "svt", "Formation des chaînes de montagnes", "Géologie", "Subduction, collision et métamorphisme", "Les chaînes de montagnes résultent de mouvements tectoniques conduisant à la convergence et à l'épaississement crustal.", "Convergence\\rightarrow\\text{raccourcissement}\\rightarrow\\text{épaississement}", "Relier observations géologiques, structures tectoniques et contexte de convergence.", "Confondre subduction et collision continent-continent.", ["Convergence", "Subduction", "Collision", "Métamorphisme"]),
];

export const secondBacEnglishLessons: LessonDocument[] = [
  lesson("2bac-eng-globalization", "anglais", "Globalization and intercultural exchange", "Culture & Society", "Globalization", "Globalization increases exchanges between countries while raising questions about culture, inequality and interdependence.", "Although + clause,\\quad however,\\quad therefore", "Build an argument with a clear claim, evidence, example and conclusion.", "Listing ideas without explaining the link between them.", ["Globalization", "Interdependence", "Culture", "Argument"]),
  lesson("2bac-eng-environment", "anglais", "Protecting the environment", "Environment", "Sustainability", "Environmental issues require individual choices, public policy and long-term collective action.", "If + present,\\quad will + verb", "Separate causes, consequences and solutions when writing a structured response.", "Mixing a cause with a solution in the same sentence.", ["Climate", "Pollution", "Sustainability", "Solutions"]),
  lesson("2bac-eng-education", "anglais", "Education and lifelong learning", "Education", "Learning skills", "Education develops knowledge, critical thinking and practical skills throughout life.", "not only...but also...", "Compare two educational approaches with linking words and specific examples.", "Using very general vocabulary without a concrete example.", ["Education", "Skills", "Critical thinking", "Lifelong learning"]),
  lesson("2bac-eng-technology", "anglais", "Technology and communication", "Technology", "Digital communication", "Digital tools make communication faster and wider while creating new responsibilities around information and privacy.", "both...and... / whereas / while", "Present a benefit, introduce a limitation and finish with a balanced conclusion.", "Treating every technological change as automatically positive.", ["Technology", "Communication", "Privacy", "Digital literacy"]),
  lesson("2bac-eng-work", "anglais", "Work, entrepreneurship and future careers", "Work", "The future of work", "The world of work changes with technology, new business models and changing skill requirements.", "should + verb / ought to + verb", "Write practical recommendations and support them with reasons.", "Giving advice without an explicit reason.", ["Career", "Entrepreneurship", "Skills", "Advice"]),
  lesson("2bac-eng-health", "anglais", "Health and balanced lifestyles", "Health", "Healthy choices", "A balanced lifestyle combines physical activity, rest, nutrition and healthy social habits.", "Present simple\\quad /\\quad frequency adverbs", "Describe routines accurately and distinguish habits from actions happening now.", "Using present continuous for permanent habits.", ["Lifestyle", "Habits", "Health", "Well-being"]),
  lesson("2bac-eng-media", "anglais", "Media, information and critical thinking", "Media", "Evaluating information", "Reading critically means checking claims, evidence, source and purpose before accepting information.", "It is claimed that... / The source suggests that...", "Separate fact, opinion and inference when analysing a text.", "Treating an author's claim as proven fact.", ["Media", "Source", "Evidence", "Critical thinking"]),
  lesson("2bac-eng-writing", "anglais", "Writing a formal opinion piece", "Writing", "Argumentative writing", "A strong formal response has a focused thesis, organised paragraphs, linking devices and a controlled conclusion.", "First,\\quad moreover,\\quad however,\\quad finally", "Plan the paragraph before writing: claim → explanation → example → link.", "Writing the introduction as one giant paragraph with no clear thesis.", ["Thesis", "Paragraphing", "Connectors", "Conclusion"]),
];
