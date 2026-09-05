import type { Exercise } from "../../types/content";

const target=(topic:string)=>({trackIds:["SMA","SMB"] as const,subjectId:"maths" as const,chapter:"Nombres complexes",topic});
const make=(id:string,topic:string,title:string,statement:string,answer:string,correction:string,difficulty:1|2|3|4,minutes:number,type:Exercise["type"]="calculation"):Exercise=>({id,mode:"BASE",source:"APPROVED",target:target(topic),type,difficulty,title,statement,expectedAnswer:answer,acceptedAnswers:[answer],correction,hint:"Choisis la forme algébrique ou trigonométrique selon l'objectif.",examTip:"En complexe, traduis le calcul en algèbre, module, argument ou géométrie avant de manipuler.",estimatedMinutes:minutes,xpValue:difficulty*6+6,tags:["2BAC SM","complexes","géométrie"]});

export const base2BacSMComplexExercises:Exercise[]=[
make("sm-cplx-01","Forme algébrique","Somme de complexes","Écrire z=4i-(2+5i) sous forme algébrique.","-2-i","4i-2-5i=-2-i.",1,2,"short-answer"),
make("sm-cplx-02","Forme algébrique","Produit","Calculer (2+3i)(-1+i).","-5-i","Développer puis utiliser i²=-1: -2+2i-3i+3i²=-5-i.",1,3),
make("sm-cplx-03","Forme algébrique","Conjugué et inverse","Mettre 1/(2+3i) sous forme algébrique.","(2-3i)/13","Multiplier par 2-3i: 1/(2+3i)=(2-3i)/(4+9)=(2-3i)/13.",1,3),
make("sm-cplx-04","Égalité","Parties réelle et imaginaire","Déterminer a,b réels tels que (1+2i)a+b=5-4i.","a=-2 et b=7","Comparer les parties imaginaires: 2a=-4, donc a=-2. Puis a+b=5, donc b=7.",2,3,"multi-step"),
make("sm-cplx-05","Conjugué","Symétrie","Si z=5+6i, donner z̄.","5-6i","Le conjugué change le signe de la partie imaginaire.",1,1,"short-answer"),
make("sm-cplx-06","Module","Calcul de module","Calculer |3-4i|.","5","|z|=√(3²+(-4)²)=5.",1,2,"short-answer"),
make("sm-cplx-07","Distance","Distance dans le plan complexe","A a pour affixe -1+6i et B a pour affixe 1+9i. Calculer AB.","√13","AB=|zB-zA|=|2+3i|=√13.",1,3),
make("sm-cplx-08","Lieu géométrique","Cercle","Déterminer l'ensemble des M(z) tels que |z-(2-i)|=4.","Cercle de centre 2-i et de rayon 4","Une équation |z-z0|=R décrit le cercle de centre d'affixe z0 et de rayon R.",1,2,"short-answer"),
make("sm-cplx-09","Alignement","Trois points alignés","Montrer que A,B,C sont alignés si (zB-zA)/(zC-zA) est réel.","Le quotient réel implique deux vecteurs colinéaires","Un quotient réel signifie que les deux affixes de vecteurs diffèrent par un facteur réel, donc les vecteurs sont colinéaires.",2,3,"proof"),
make("sm-cplx-10","Forme trigonométrique","Module et argument","Donner la forme trigonométrique de z=1+i√3.","2(cos(π/3)+i sin(π/3))","|z|=2 et arg(z)=π/3.",2,3),
make("sm-cplx-11","Forme trigonométrique","Complexe dans le troisième quadrant","Donner la forme trigonométrique de z=-1-i√3.","2(cos(4π/3)+i sin(4π/3))","|z|=2 et un argument est 4π/3.",2,3),
make("sm-cplx-12","Produit","Arguments","z1 a pour argument π/2 et z2 a pour argument π/4. Déterminer arg(z1z2).","3π/4 modulo 2π","Les arguments s'additionnent: π/2+π/4=3π/4.",1,2,"short-answer"),
make("sm-cplx-13","Puissance","Formule de Moivre","Si z=[2,π/6], déterminer z³ en forme trigonométrique.","[8,π/2]","|z³|=2³=8 et arg(z³)=3π/6=π/2.",1,2),
make("sm-cplx-14","Quotient","Argument d'un quotient","Si arg(z)=π/2 et arg(z')=π/4, calculer arg(z'/z).","-π/4 modulo 2π","Les arguments d'un quotient se soustraient.",1,2,"short-answer"),
make("sm-cplx-15","Géométrie","Milieu","A et B ont pour affixes zA=2i et zB=3. Donner l'affixe du milieu I de [AB].","3/2+i","zI=(zA+zB)/2=(3+2i)/2.",1,2),
make("sm-cplx-16","Géométrie","Vecteur","A a pour affixe 2i et B a pour affixe 1-i. Donner l'affixe de AB.","1-3i","zAB=zB-zA=1-i-2i=1-3i.",1,2),
make("sm-cplx-17","Transformation","Translation","Une translation a pour vecteur d'affixe -1+2i. Donner sa représentation complexe.","z'=z-1+2i","Une translation ajoute l'affixe de son vecteur à z.",1,2,"short-answer"),
make("sm-cplx-18","Transformation","Translation inverse","Une translation vérifie z'=z-1+2i. Quel z donne z'=2-3i ?","z=3-5i","z=z'+1-2i=3-5i.",2,3,"multi-step"),
make("sm-cplx-19","Transformation","Homothétie","Une homothétie a pour centre Ω d'affixe 2-i et rapport 4. Donner sa représentation complexe.","z'=4z-6+3i","z'=ω+4(z-ω)=4z-3ω=4z-6+3i.",2,3),
make("sm-cplx-20","Équation","Équation linéaire complexe","Résoudre iz-1=z+3i.","z=(-1+3i)/(i-1)","Regrouper: (i-1)z=1+3i, puis rationaliser si une forme algébrique est demandée.",2,4,"multi-step"),
make("sm-cplx-21","Réel ou imaginaire pur","Critère réel","Pour z=3i·w-w avec w=x+iy, quelle condition donne z réel ?","Im(z)=0","Développer z en fonction de x,y puis annuler sa partie imaginaire.",3,4),
make("sm-cplx-22","Argument","Angle orienté","A,B,C ont des affixes zA,zB,zC. Donner une expression de l'angle (AB,AC).","arg((zC-zA)/(zB-zA)) modulo 2π","L'affixe de AB et AC permet d'utiliser l'argument de leur quotient.",2,3,"short-answer"),
make("sm-cplx-23","Cercle","Cocyclicité","Comment tester que quatre points A,B,C,D sont cocycliques avec leurs affixes ?","(zA-zB)/(zC-zB) × (zC-zD)/(zA-zD) doit être réel","Le critère complexe de cocyclicité est la réalité de ce rapport croisé.",3,4,"proof"),
make("sm-cplx-24","Module","Produit et puissance","Si |z1|=2 et |z2|=3, calculer |z1z2| et |z1^4|.","6 et 16","|z1z2|=2×3=6 et |z1^4|=2^4=16.",1,2),
make("sm-cplx-25","Équation","Équation par parties réelle et imaginaire","Résoudre z+z̄=6 et z-z̄=4i.","z=3+2i","z+z̄=2Re(z)=6 donne Re(z)=3. z-z̄=2i Im(z)=4i donne Im(z)=2.",2,3,"multi-step"),
];
