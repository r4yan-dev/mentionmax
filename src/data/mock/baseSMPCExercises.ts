import type { Exercise } from "../../types/content";

const tracks = ["SMA", "SMB"] as const;
const target = (chapter: string, topic: string) => ({ trackIds: [...tracks], subjectId: "physique-chimie" as const, chapter, topic });

export const baseSMPCExercises: Exercise[] = [
  {
    id: "sm-pc-travail-01", mode: "BASE", source: "APPROVED", target: target("Travail et puissance", "Travail d'une force"), type: "calculation", difficulty: 1,
    title: "Travail d'une force constante", statement: "Une force constante de 20 N agit sur un objet qui se déplace de 5,0 m dans la même direction. Calculer le travail.", acceptedAnswers: ["100", "100 J"], expectedAnswer: "100 J", correction: "W=F·d·cos(0°)=20×5,0=100 J.", hint: "Le déplacement et la force sont colinéaires et de même sens.", examTip: "Identifier l'angle avant d'utiliser la formule du travail.", estimatedMinutes: 2, xpValue: 8, tags: ["travail", "force", "énergie"]
  },
  {
    id: "sm-pc-energie-01", mode: "BASE", source: "APPROVED", target: target("Énergie cinétique", "Énergie cinétique"), type: "calculation", difficulty: 1,
    title: "Calculer une énergie cinétique", statement: "Un mobile de masse 2,0 kg se déplace à 6,0 m·s⁻¹. Calculer son énergie cinétique.", acceptedAnswers: ["36", "36 J"], expectedAnswer: "36 J", correction: "E_c=½mv²=½×2,0×6,0²=36 J.", hint: "Attention : la vitesse est au carré.", examTip: "Conserver les unités SI avant le calcul.", estimatedMinutes: 2, xpValue: 8, tags: ["énergie cinétique"]
  },
  {
    id: "sm-pc-electrostatique-01", mode: "BASE", source: "APPROVED", target: target("Champ électrostatique", "Loi de Coulomb"), type: "calculation", difficulty: 2,
    title: "Force électrostatique", statement: "Deux charges q₁=+2,0 μC et q₂=−3,0 μC sont séparées de 0,30 m. Avec k=9,0×10⁹ SI, calculer la norme de la force.", acceptedAnswers: ["0.60", "0,60", "0.6 N", "0,6 N"], expectedAnswer: "0,60 N", correction: "F=k|q₁q₂|/r²=9,0×10⁹×(2,0×10⁻⁶)(3,0×10⁻⁶)/(0,30)²=0,60 N. Les charges étant de signes opposés, l'interaction est attractive.", hint: "Convertis μC en C.", examTip: "Séparer calcul de la norme et interprétation attractive/répulsive.", estimatedMinutes: 4, xpValue: 16, tags: ["électrostatique", "Coulomb"]
  },
  {
    id: "sm-pc-champ-01", mode: "BASE", source: "APPROVED", target: target("Champ électrostatique", "Champ uniforme"), type: "calculation", difficulty: 2,
    title: "Champ entre deux plaques", statement: "Deux plaques parallèles sont séparées de d=4,0 cm et soumises à U=200 V. Calculer la norme du champ uniforme E.", acceptedAnswers: ["5000", "5e3", "5000 V/m"], expectedAnswer: "5,0×10³ V·m⁻¹", correction: "E=U/d=200/0,040=5,0×10³ V·m⁻¹.", hint: "Convertis 4,0 cm en m.", examTip: "Un champ uniforme entre plaques vérifie E=U/d.", estimatedMinutes: 3, xpValue: 12, tags: ["champ", "plaques", "électrostatique"]
  },
  {
    id: "sm-pc-matiere-01", mode: "BASE", source: "APPROVED", target: target("Quantité de matière", "Masse et quantité de matière"), type: "calculation", difficulty: 1,
    title: "Calculer une quantité de matière", statement: "On dispose de 9,8 g de H₂SO₄ de masse molaire M=98 g·mol⁻¹. Calculer n.", acceptedAnswers: ["0.10", "0,10", "0.1 mol"], expectedAnswer: "0,10 mol", correction: "n=m/M=9,8/98=0,10 mol.", hint: "Utilise n=m/M.", examTip: "M et m doivent être dans des unités compatibles.", estimatedMinutes: 2, xpValue: 8, tags: ["quantité de matière", "mole"]
  },
  {
    id: "sm-pc-concentration-01", mode: "BASE", source: "APPROVED", target: target("Quantité de matière", "Concentration molaire"), type: "calculation", difficulty: 1,
    title: "Concentration d'une solution", statement: "Une solution contient 0,20 mol de soluté dans 500 mL. Calculer la concentration molaire.", acceptedAnswers: ["0.4", "0,4", "0.4 mol/L"], expectedAnswer: "0,40 mol·L⁻¹", correction: "V=0,500 L puis C=n/V=0,20/0,500=0,40 mol·L⁻¹.", hint: "Le volume doit être en litres.", examTip: "Toujours convertir les mL en L pour une concentration en mol·L⁻¹.", estimatedMinutes: 2, xpValue: 8, tags: ["concentration", "solutions"]
  },
  {
    id: "sm-pc-dilution-01", mode: "BASE", source: "APPROVED", target: target("Solutions aqueuses", "Dilution"), type: "calculation", difficulty: 2,
    title: "Volume à prélever", statement: "Préparer 100 mL d'une solution fille à 0,20 mol·L⁻¹ à partir d'une solution mère à 1,0 mol·L⁻¹. Quel volume de solution mère prélever ?", acceptedAnswers: ["20", "20 mL"], expectedAnswer: "20 mL", correction: "C_mV_m=C_fV_f, donc V_m=(0,20×100)/1,0=20 mL.", hint: "Utilise la relation de dilution.", examTip: "Le volume final est celui de la fiole jaugée.", estimatedMinutes: 3, xpValue: 12, tags: ["dilution", "solution mère"]
  },
  {
    id: "sm-pc-ph-01", mode: "BASE", source: "APPROVED", target: target("Réactions acido-basiques", "pH"), type: "calculation", difficulty: 1,
    title: "Retrouver une concentration", statement: "Une solution aqueuse a un pH de 3,0. Déterminer [H₃O⁺].", acceptedAnswers: ["1e-3", "10^-3", "0.001"], expectedAnswer: "1,0×10⁻³ mol·L⁻¹", correction: "pH=-log[H₃O⁺], donc [H₃O⁺]=10⁻³ mol·L⁻¹.", hint: "Isole [H₃O⁺] dans la définition du pH.", examTip: "Un pH entier positif donne directement une puissance de dix négative.", estimatedMinutes: 2, xpValue: 8, tags: ["pH", "acide-base"]
  },
  {
    id: "sm-pc-dosage-01", mode: "BASE", source: "APPROVED", target: target("Dosage", "Équivalence"), type: "calculation", difficulty: 2,
    title: "Concentration à l'équivalence", statement: "Pour un dosage 1:1, 10,0 mL d'une solution inconnue sont titrés par une solution à 0,100 mol·L⁻¹. L'équivalence est atteinte à 12,0 mL. Calculer la concentration de la solution inconnue.", acceptedAnswers: ["0.12", "0,12", "0.120 mol/L"], expectedAnswer: "0,120 mol·L⁻¹", correction: "À l'équivalence C_A V_A=C_B V_BE. Donc C_A=0,100×0,0120/0,0100=0,120 mol·L⁻¹.", hint: "La stœchiométrie est 1:1.", examTip: "Utiliser les volumes en litres pour éviter les erreurs d'unité.", estimatedMinutes: 4, xpValue: 16, tags: ["dosage", "équivalence"]
  },
  {
    id: "sm-pc-redox-01", mode: "BASE", source: "APPROVED", target: target("Oxydoréduction", "Échange d'électrons"), type: "short-answer", difficulty: 2,
    title: "Identifier le réducteur", statement: "Dans un couple Ox/Red, quelle espèce donne des électrons lors d'une réaction d'oxydoréduction ?", acceptedAnswers: ["red", "réducteur", "le réducteur"], expectedAnswer: "Le réducteur", correction: "Le réducteur cède des électrons : Red → Ox + ne⁻. L'oxydant les capte.", hint: "Pense à qui cède et qui capte les électrons.", examTip: "Réducteur = donneur d'électrons ; oxydant = accepteur.", estimatedMinutes: 2, xpValue: 8, tags: ["redox", "électrons"]
  },
  {
    id: "sm-pc-work-energy-01", mode: "BASE", source: "APPROVED", target: target("Énergie cinétique", "Théorème de l'énergie cinétique"), type: "multi-step", difficulty: 3,
    title: "Vitesse obtenue par le travail", statement: "Un mobile de 2,0 kg part du repos. La somme des travaux des forces entre A et B vaut 100 J. Déterminer sa vitesse en B.", acceptedAnswers: ["10", "10 m/s"], expectedAnswer: "10 m·s⁻¹", correction: "ΔE_c=ΣW. Comme E_c(A)=0, ½mv²=100. Donc v²=100 et v=10 m·s⁻¹.", hint: "Applique le théorème de l'énergie cinétique.", examTip: "Choisir la solution positive pour une norme de vitesse.", estimatedMinutes: 4, xpValue: 16, tags: ["énergie", "travail", "théorème"]
  },
];
