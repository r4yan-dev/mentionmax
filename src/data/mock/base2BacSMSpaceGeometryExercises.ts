import type { Exercise } from "../../types/content";

const tracks = ["SMA", "SMB"] as const;
const target = () => ({ trackIds: [...tracks], subjectId: "maths" as const, chapter: "Géométrie de l’espace", topic: "Vecteurs, droites, plans, sphères et distances" });
const make = (id: string, title: string, statement: string, answer: string, correction: string, hint: string, difficulty: 1 | 2 | 3 | 4 | 5, minutes: number, type: Exercise["type"] = "multi-step"): Exercise => ({
  id, mode: "BASE", source: "APPROVED", target: target(), type, difficulty, title, statement, expectedAnswer: answer, acceptedAnswers: [answer], correction, hint,
  examTip: "Traduis la géométrie en coordonnées : vecteur, produit scalaire, produit vectoriel, équation de plan ou distance selon la question.", estimatedMinutes: minutes, xpValue: difficulty * 6 + 6,
  tags: ["2BAC SM", "géométrie de l'espace"],
});

export const base2BacSMSpaceGeometryExercises: Exercise[] = [
  make("sm-geo-01", "Vecteur", "A(1,−2,3), B(4,1,−1). Déterminer les coordonnées de AB.", "(3,3,−4)", "AB=B−A=(3,3,−4).", "Soustrais les coordonnées de A à celles de B.", 1, 3, "calculation"),
  make("sm-geo-02", "Distance", "Calculer AB pour A(1,0,2) et B(4,4,2).", "5", "AB=√(3²+4²)=5.", "Calcule d'abord le vecteur AB.", 1, 3, "calculation"),
  make("sm-geo-03", "Orthogonalité", "u=(1,2,−1), v=(2,0,2). Montrer que u et v sont orthogonaux.", "u·v=0", "u·v=1×2+2×0+(−1)×2=0.", "Utilise le produit scalaire.", 1, 3, "proof"),
  make("sm-geo-04", "Droite", "Déterminer une représentation paramétrique de la droite passant par A(1,−2,0) et de directeur u=(2,1,3).", "x=1+2t, y=−2+t, z=3t", "Une droite est A+t u.", "Écris séparément les trois coordonnées.", 2, 4),
  make("sm-geo-05", "Appartenance", "M(5,0,6) appartient-il à la droite précédente ?", "Oui, pour t=2", "Avec x=5 on obtient t=2 ; alors y=0 et z=6. Donc M appartient à D.", "Déduis t d'une coordonnée puis vérifie les deux autres.", 2, 4, "proof"),
  make("sm-geo-06", "Plan et normal", "Déterminer une équation du plan passant par A(1,2,−1) et de vecteur normal n=(2,−1,3).", "2x−y+3z+1=0", "n·AM=0 donne 2(x−1)−(y−2)+3(z+1)=0, soit 2x−y+3z+1=0.", "Utilise n·AM=0.", 2, 5),
  make("sm-geo-07", "Distance point-plan", "Calculer la distance de A(1,2,0) au plan 2x−y+2z−3=0.", "1", "d=|2−2−3|/√(4+1+4)=3/3=1.", "Substitue le point dans l'équation du plan.", 2, 4),
  make("sm-geo-08", "Sphère", "Déterminer l'équation de la sphère de centre Ω(1,−2,3) et de rayon 4.", "(x−1)^2+(y+2)^2+(z−3)^2=16", "On applique l'équation d'une sphère de centre Ω et de rayon R.", "Centre et rayon s'insèrent directement dans la formule.", 1, 3),
  make("sm-geo-09", "Sphère développée", "Identifier le centre et le rayon de x²+y²+z²−2x+4y−6z−2=0.", "Ω(1,−2,3), R=4", "On complète les carrés : (x−1)²+(y+2)²+(z−3)²=16.", "Complète les carrés variable par variable.", 3, 6),
  make("sm-geo-10", "Plan-sphère", "Une sphère de centre O et de rayon 5 est coupée par le plan x=3. Déterminer le rayon du cercle d'intersection.", "4", "La distance de O au plan est 3. Donc r=√(25−9)=4.", "Utilise r²=R²−d².", 3, 5),
  make("sm-geo-11", "Droite-sphère", "Étudier les intersections de D : (x,y,z)=(t,0,0) avec x²+y²+z²=9.", "(−3,0,0) et (3,0,0)", "La substitution donne t²=9, donc t=±3.", "Remplace x,y,z dans l'équation de la sphère.", 3, 5),
  make("sm-geo-12", "Produit vectoriel", "Calculer u∧v pour u=(1,0,2) et v=(0,3,1).", "(−6,−1,3)", "u∧v=(0−6,0−1,3−0)=(−6,−1,3).", "Applique la formule du produit vectoriel.", 3, 5, "calculation"),
  make("sm-geo-13", "Aire triangle", "Calculer l'aire du triangle OAB avec A(1,0,0) et B(0,2,0).", "1", "OA∧OB=(0,0,2), donc son norme vaut 2. L'aire du triangle est la moitié : 1.", "A=1/2||OA∧OB||.", 2, 4),
  make("sm-geo-14", "Distance point-droite", "D passe par A(0,0,0) et a pour directeur u=(1,1,0). Calculer la distance de M(0,1,1) à D.", "√(3/2)", "AM=(0,1,1), AM∧u=(−1,1,−1), de norme √3. Comme ||u||=√2, d=√3/√2=√(3/2).", "Utilise d=||AM∧u||/||u||.", 4, 6),
  make("sm-geo-15", "Intersection de plans", "Déterminer un vecteur directeur de l'intersection de P: x+y+z=0 et Q: x−y=0.", "(1,1,−2) ou un multiple non nul", "nP=(1,1,1), nQ=(1,−1,0). Alors nP∧nQ=(1,1,−2), directeur de la droite d'intersection.", "Prends le produit vectoriel des deux normaux.", 3, 5),
  make("sm-geo-16", "Plan tangent", "Déterminer le plan tangent à la sphère x²+y²+z²=9 au point A(2,1,2).", "2x+y+2z=9", "OA=(2,1,2) est normal au plan tangent. Donc 2(x−2)+(y−1)+2(z−2)=0, soit 2x+y+2z=9.", "Le rayon au point de contact est un vecteur normal.", 4, 6),
  make("sm-geo-17", "Droite et plan", "Déterminer l'intersection de D:(x,y,z)=(1,0,2)+t(1,2,−1) avec P:x+y+z=4.", "(3/2,1,3/2)", "On obtient 3+2t=4, donc t=1/2. Le point est (3/2,1,3/2).", "Substitue la paramétrisation dans l'équation du plan.", 4, 6),
  make("sm-geo-18", "Cercle d'intersection", "Déterminer le centre et le rayon du cercle d'intersection de (x−1)²+y²+z²=9 avec le plan x=2.", "Centre (2,0,0), rayon √8", "La projection de Ω(1,0,0) sur x=2 est H(2,0,0). La distance ΩH=1, donc r=√(9−1)=√8.", "Projette le centre sur le plan.", 4, 7),
  make("sm-geo-19", "Plan par trois points", "A(1,1,0), B(2,−1,1), C(0,1,2). Déterminer une équation du plan ABC.", "4x+3y+2z−7=0", "AB=(1,−2,1), AC=(−1,0,2). Un normal est (4,3,2). En utilisant A, 4+3−7=0.", "Calcule AB∧AC puis utilise A.", 5, 8),
  make("sm-geo-20", "Synthèse Bac", "Pour le plan P:4x+3y+2z−7=0, déterminer la distance de O à P puis le rayon du cercle d'intersection avec la sphère de centre O et de rayon 5, en supposant l'intersection non vide.", "d=7/√29 ; r=√(25−49/29)=√(676/29)=26/√29", "La distance vaut |−7|/√29=7/√29<5. Le cercle existe et r²=25−49/29=676/29, donc r=26/√29.", "Enchaîne distance point-plan puis formule du rayon de section.", 5, 9),
];
