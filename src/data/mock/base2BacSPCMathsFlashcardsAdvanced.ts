import type { Flashcard } from "../../types/content";

const trackIds = ["SP"] as const;
const make = (id:number, chapter:string, front:string, back:string, tags:string[] = ["2BAC SPC","maths"]) => ({ id:`spc-maths-${id}`, mode:"BASE" as const, source:"APPROVED" as const, target:{ trackIds, subjectId:"maths" as const, chapter, topic:"Formules et méthodes" }, front, back, tags:[...tags], difficulty:1 as const });

export const base2BacSPCMathsAdvancedFlashcards: Flashcard[] = [
...[
[264,"X. Forme exponentielle des complexes","Forme exponentielle d'un complexe non nul ?","z=re^{iθ}, r=|z|."],
[265,"X. Forme exponentielle des complexes","Comment passer de la forme trigonométrique à exponentielle ?","Remplacer cosθ+i sinθ par e^{iθ}."],
[266,"X. Forme exponentielle des complexes","re^{iθ} sous forme trigonométrique ?","r(cosθ+i sinθ)."],
[267,"X. Forme exponentielle des complexes","|e^{iθ}|=?","1."],
[268,"X. Forme exponentielle des complexes","arg(e^{iθ})=?","θ mod 2π."],
[269,"X. Forme exponentielle des complexes","Conjugué de e^{iθ} ?","e^{-iθ}."],
[270,"X. Forme exponentielle des complexes","re^{iθ} × r'e^{iθ'} = ?","rr'e^{i(θ+θ')}."],
[271,"X. Forme exponentielle des complexes","Quotient exponentiel ?","(r/r')e^{i(θ-θ')}."],
[272,"X. Forme exponentielle des complexes","(re^{iθ})^n = ?","r^n e^{inθ}."],
[273,"X. Forme exponentielle des complexes","Inverse de re^{iθ} ?","(1/r)e^{-iθ}."],
[274,"X. Forme exponentielle des complexes","Argument d'un produit ?","Additionner les arguments."],
[275,"X. Forme exponentielle des complexes","Argument d'un quotient ?","Soustraire les arguments."],
[276,"X. Forme exponentielle des complexes","Argument de z^n ?","n arg(z), modulo 2π."],
[277,"X. Forme exponentielle des complexes","Forme exponentielle de 1-i ?","√2 e^{-iπ/4}."],
[278,"X. Forme exponentielle des complexes","Forme exponentielle de 2i ?","2e^{iπ/2}."],
[279,"X. Forme exponentielle des complexes","Forme exponentielle de 3+3√3 i ?","6e^{iπ/3}."],
[280,"X. Forme exponentielle des complexes","Forme exponentielle de -3 ?","3e^{iπ}."],
[281,"X. Forme exponentielle des complexes","4e^{-iπ/3} sous forme algébrique ?","2-2√3 i."],
[282,"X. Forme exponentielle des complexes","e^{i5π/4} sous forme algébrique ?","-√2/2-√2/2 i."],
[283,"X. Forme exponentielle des complexes","Que faire si le module écrit est négatif ?","Remplacer le module par sa valeur positive et ajouter π à l'argument."],
[284,"X. Forme exponentielle des complexes","Formule de Moivre ?","(cosθ+i sinθ)^n=cos(nθ)+i sin(nθ)."],
[285,"X. Forme exponentielle des complexes","Formule d'Euler ?","e^{iθ}=cosθ+i sinθ."],
[286,"X. Forme exponentielle des complexes","cosθ avec les exponentielles ?","(e^{iθ}+e^{-iθ})/2."],
[287,"X. Forme exponentielle des complexes","sinθ avec les exponentielles ?","(e^{iθ}-e^{-iθ})/(2i)."],
[288,"X. Forme exponentielle des complexes","cos²x = ?","(1+cos2x)/2."],
[289,"X. Forme exponentielle des complexes","sin²x = ?","(1-cos2x)/2."],
[290,"X. Forme exponentielle des complexes","cos³x = ?","(3cosx+cos3x)/4."],
[291,"X. Forme exponentielle des complexes","sin2x = ?","2sinx cosx."],
[292,"X. Forme exponentielle des complexes","cos2x = ? avec cos²x","2cos²x-1."],
[293,"X. Forme exponentielle des complexes","cos2x = ? avec sin²x","1-2sin²x."],
[294,"X. Forme exponentielle des complexes","Comment linéariser cos⁴x ?","Écrire (cos²x)² puis utiliser cos²x=(1+cos2x)/2."],
[295,"X. Forme exponentielle des complexes","Pourquoi la forme exponentielle est efficace ?","Les modules se multiplient et les arguments s'additionnent."],
[296,"XI. Second degré dans C","Discriminant de az²+bz+c ?","Δ=b²-4ac."],[297,"XI. Second degré dans C","Si Δ>0 ?","Deux solutions réelles distinctes."],[298,"XI. Second degré dans C","Si Δ=0 ?","Une solution réelle double."],[299,"XI. Second degré dans C","Si Δ<0 ?","Deux solutions complexes conjuguées."],[300,"XI. Second degré dans C","Solutions si Δ<0 ?","z=(-b±i√(-Δ))/(2a)."],[301,"XI. Second degré dans C","Résoudre z²=-4.","z=±2i."],[302,"XI. Second degré dans C","Résoudre z²+2√3z+4=0.","z=-√3±i."],[303,"XI. Second degré dans C","Résoudre 2z²-3z+2=0.","z=(3±i√7)/4."],[304,"XI. Second degré dans C","Avec Δ<0, que vaut -Δ ?","Une quantité strictement positive sous la racine."],[305,"XI. Second degré dans C","Racine z0 d'un polynôme : facteur associé ?","(z-z0)."],[306,"XI. Second degré dans C","Factoriser z³-6z²+12z-16.","(z-4)(z²-2z+4)."],[307,"XI. Second degré dans C","Racines de z²-2z+4 ?","1±i√3."],[308,"XI. Second degré dans C","Racine non réelle d'un polynôme réel : conséquence ?","Sa conjuguée est aussi racine."],[309,"XI. Second degré dans C","Pourquoi les racines complexes non réelles vont-elles par paires ?","Les coefficients du polynôme sont réels."],[310,"XI. Second degré dans C","Comment vérifier une factorisation ?","Développer puis comparer les coefficients."],[311,"XI. Second degré dans C","Après résolution, que vérifier ?","Le discriminant, les calculs et éventuellement la substitution."],[312,"XI. Second degré dans C","Pourquoi résoudre dans C élargit-il les solutions ?","Tout polynôme non constant admet au moins une racine complexe."],
[313,"XII. Transformations complexes","Translation de vecteur u ?","z'=z+u."],[314,"XII. Transformations complexes","Rotation de centre ω et angle θ ?","z'=(z-ω)e^{iθ}+ω."],[315,"XII. Transformations complexes","Homothétie de centre ω et rapport k ?","z'=k(z-ω)+ω."],[316,"XII. Transformations complexes","Rotation de centre O ?","z'=e^{iθ}z."],[317,"XII. Transformations complexes","Homothétie de centre O ?","z'=kz."],[318,"XII. Transformations complexes","Nature de z'=z-3i ?","Translation de vecteur -3i."],[319,"XII. Transformations complexes","Nature de z'=4z-3i ?","Homothétie de rapport 4 autour de son point fixe."],[320,"XII. Transformations complexes","Comment trouver le point fixe de z'=az+b ?","Résoudre z=az+b."],[321,"XII. Transformations complexes","Point fixe de z'=-iz+i-1 ?","z=i."],[322,"XII. Transformations complexes","Image par une rotation ?","Appliquer z'=(z-ω)e^{iθ}+ω."],[323,"XII. Transformations complexes","Rotation inverse ?","z-ω=(z'-ω)e^{-iθ}."],[324,"XII. Transformations complexes","Une rotation conserve quoi ?","Distances, longueurs et angles."],[325,"XII. Transformations complexes","Une homothétie de rapport k transforme une longueur L en ?","|k|L."],[326,"XII. Transformations complexes","Effet de k<0 ?","Le point image est de l'autre côté du centre."],[327,"XII. Transformations complexes","Critère pratique d'un carré ?","Deux côtés consécutifs de même longueur et perpendiculaires."],[328,"XII. Transformations complexes","Critère d'un triangle équilatéral ?","(zB-zA)/(zC-zA)=e^{±iπ/3}."],[329,"XII. Transformations complexes","Critère d'un triangle isocèle rectangle ?","Deux côtés adjacents sont perpendiculaires et de même longueur."],[330,"XII. Transformations complexes","Critère d'alignement ?","(zB-zA)/(zC-zA)∈R."],[331,"XII. Transformations complexes","Que représente |z-zA|=r ?","Le cercle de centre A et de rayon r."],[332,"XII. Transformations complexes","Que représente |z-zA|=|z-zB| ?","La médiatrice de [AB]."],[333,"XII. Transformations complexes","(z'-ω)/(z-ω)=e^{iθ} signifie ?","Rotation de centre ω et angle θ."],[334,"XII. Transformations complexes","Argument du rapport de deux vecteurs ?","Un angle orienté entre les directions."],[335,"XII. Transformations complexes","Comment traiter une cocyclicité avec les complexes ?","Utiliser une relation d'angles ou une équation de cercle à laquelle les quatre affixes satisfont."],[336,"XII. Transformations complexes","Géométriquement, que représente z̄ ?","La symétrie axiale par rapport à l'axe réel."],[337,"XII. Transformations complexes","|z-zA| représente ?","La distance AM."],[338,"XII. Transformations complexes","|z-2i|=2 : centre et rayon ?","Centre d'affixe 2i, rayon 2."],[339,"XII. Transformations complexes","Dans z'=az+b, quoi regarder en premier ?","Le module et l'argument de a, puis le point fixe."],
].map(([id,chapter,front,back])=>make(id as number,chapter as string,front as string,back as string,["2BAC SPC","maths","complexes"]))
];
