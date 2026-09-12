import type { Exercise } from '../../types/content';

const tracks = ['SMA', 'SMB'] as const;
const subjectId = 'physique-chimie' as const;

type Def = {
  id: string;
  chapter: string;
  topic: string;
  title: string;
  statement: string;
  expectedAnswer: string;
  correction: string;
  hint: string;
  type: Exercise['type'];
  difficulty: 1 | 2 | 3;
  estimatedMinutes: number;
  tags: string[];
};

const r = (n: number) => Number(n.toPrecision(5));
const calc = (id: number, chapter: string, topic: string, title: string, statement: string, answer: string, correction: string, hint: string, difficulty: 1 | 2 | 3 = 2, type: Exercise['type'] = 'calculation'): Def => ({
  id: `sm-phys-300-${String(id).padStart(3, '0')}`,
  chapter, topic, title, statement, expectedAnswer: answer, correction, hint, type, difficulty,
  estimatedMinutes: difficulty === 1 ? 2 : difficulty === 2 ? 3 : 5,
  tags: ['2BAC SM', 'physique', 'SMA', 'SMB', topic.toLowerCase()],
});

const defs: Def[] = [];
let id = 1;

// 1 — Ondes mécaniques progressives
{
  const data = [[12,3],[18,6],[25,5],[30,10],[7.5,2.5],[42,7],[16,4],[54,9],[20,2],[36,12]] as const;
  for (const [d,v] of data) {
    const t=r(d/v);
    defs.push(calc(id++,'Ondes mécaniques progressives','Célérité et retard','Retard de propagation',`Une onde parcourt ${d} m à la célérité ${v} m·s⁻¹. Calculer le retard de propagation.`,`${t} s`,`τ=d/v=${d}/${v}=${t} s.`,'Utilise τ = d/v.',1));
  }
  const data2 = [[0.8,15],[1.2,20],[2.5,8],[0.05,240],[0.6,30],[1.5,12],[0.25,40],[3,7],[0.4,25],[2.2,18]] as const;
  for (const [t,v] of data2) {
    const d=r(t*v);
    defs.push(calc(id++,'Ondes mécaniques progressives','Distance parcourue','Distance parcourue',`Une onde se propage à ${v} m·s⁻¹ pendant ${t} s. Quelle distance parcourt-elle ?`,`${d} m`,`d=vτ=${v}×${t}=${d} m.`,'Utilise d = vτ.',1));
  }
}

// 2 — Ondes mécaniques progressives périodiques
{
  const data = [[8,2],[12,3],[15,5],[24,6],[30,10],[18,4],[25,5],[40,8],[9,3],[36,4]] as const;
  for (const [v,f] of data) {
    const lam=r(v/f);
    defs.push(calc(id++,'Ondes mécaniques progressives périodiques','Longueur d’onde','Déterminer λ',`Une onde périodique se propage à ${v} m·s⁻¹ avec une fréquence de ${f} Hz. Déterminer sa longueur d’onde.`,`${lam} m`,`λ=v/f=${v}/${f}=${lam} m.`,'Utilise v = λf.',1));
  }
  const data2 = [[0.50,20],[2,5],[0.25,40],[1.5,8],[0.8,25],[3,6],[0.4,50],[2.5,4],[1.2,10],[0.6,16]] as const;
  for (const [lam,f] of data2) {
    const T=r(1/f), v=r(lam*f);
    defs.push(calc(id++,'Ondes mécaniques progressives périodiques','Période et célérité','Période et célérité',`Une onde a λ=${lam} m et f=${f} Hz. Calculer sa période puis sa célérité.`,`T=${T} s ; v=${v} m·s⁻¹`,`T=1/f=${T} s ; v=λf=${v} m·s⁻¹.`,'Calcule d’abord T = 1/f.',2));
  }
}

// 3 — Diffraction
{
  const data = [[600,1.5,0.30],[500,2,0.40],[650,1.2,0.25],[450,1.8,0.20],[750,1.5,0.50],[550,1,0.20],[700,2,0.35],[400,1.5,0.15],[800,1,0.40],[520,1.6,0.32]] as const;
  for (const [lnm,D,dmm] of data) {
    const Lmm=r(244*lnm*1e-6*D/dmm);
    defs.push(calc(id++,'Propagation d’une onde lumineuse','Diffraction','Diamètre de la tache centrale',`Un laser de longueur d’onde λ=${lnm} nm éclaire un diaphragme circulaire de diamètre d=${dmm} mm. L’écran est à D=${D} m. Avec L≈2,44λD/d, calculer L.`,`${Lmm} mm`,`L≈2,44λD/d≈${Lmm} mm.`,'Convertis λ et d en unités SI.',2));
  }
  const data2 = [[6,1.5,600],[5,2,500],[8,1.2,650],[4,1.8,450],[7.5,1.5,750],[5.5,1,550],[7,2,700],[3.5,1.5,400],[8,1,800],[5.2,1.6,520]] as const;
  for (const [Lmm,D,lnm] of data2) {
    const dmm=r(244*lnm*1e-6*D/(Lmm*1e-3)*1e3);
    defs.push(calc(id++,'Propagation d’une onde lumineuse','Diamètre du diaphragme','Retrouver le diamètre du diaphragme',`On mesure L=${Lmm} mm à D=${D} m avec λ=${lnm} nm. Déterminer d.`,`${dmm} mm`,`d≈2,44λD/L≈${dmm} mm.`,'Isole d dans L = 2,44λD/d.',3));
  }
}

// 4 — Radioactivité
{
  const data = [[8e20,4,3],[1.2e21,6,4],[6e20,5,2],[9e19,10,5],[4e18,2,6],[3e21,8,2],[7e19,3,4],[5e20,12,3],[2.4e18,4,5],[9e21,10,1]] as const;
  for (const [N0,T,n] of data) {
    const N=r(N0/2**n), t=T*n;
    defs.push(calc(id++,'Décroissance radioactive','Loi de décroissance','Noyaux restants',`Un échantillon contient initialement N₀=${N0.toExponential(2)} noyaux et sa demi-vie vaut ${T} jours. Combien de noyaux restent après ${t} jours ?`,`${N.toExponential(3)} noyaux`,`N=N₀/2ⁿ=${N.toExponential(3)} avec n=${n}.`,'Détermine le nombre de demi-vies écoulées.',1));
  }
  const data2 = [[8,0.125],[12,0.0625],[5,0.25],[10,0.03125],[3,0.5],[6,0.125],[20,0.25],[9,0.015625],[4,0.0625],[15,0.125]] as const;
  for (const [T,fraction] of data2) {
    const n=Math.round(-Math.log2(fraction)), t=T*n;
    defs.push(calc(id++,'Décroissance radioactive','Temps de décroissance','Déterminer la durée',`La demi-vie d’un radioélément vaut ${T} jours. Après combien de temps reste-t-il une fraction ${fraction} de la quantité initiale ?`,`${t} jours`,`fraction=(1/2)^${n}, donc t=${n}T₁/₂=${t} jours.`,'Écris la fraction comme une puissance de 1/2.',2));
  }
}

// 5 — Noyaux, masse et énergie
{
  const dmData=[0.002,0.0035,0.010,0.015,0.0012,0.006,0.009,0.012,0.0045,0.020] as const;
  for (const dm of dmData) {
    const E=r(dm*931.5);
    defs.push(calc(id++,'Noyaux, masse et énergie','Énergie de liaison','Défaut de masse',`Le défaut de masse d’un noyau vaut Δm=${dm} u. Calculer l’énergie correspondante, avec 1 u·c²=931,5 MeV.`,`${E} MeV`,`E=Δmc²=${dm}×931,5=${E} MeV.`,'Multiplie Δm par 931,5 MeV/u.',1));
  }
  const data2=[[210.0000,209.9960],[226.0000,225.9952],[238.0000,237.9945],[14.0000,13.9969],[60.0000,59.9978],[4.0000,3.9990],[56.0000,55.9947],[40.0000,39.9982],[27.0000,26.9981],[12.0000,11.9992]] as const;
  for (const [mi,mf] of data2) {
    const dm=r(mi-mf), E=r(dm*931.5);
    defs.push(calc(id++,'Noyaux, masse et énergie','Bilan énergétique','Énergie libérée',`Les masses totale initiale et finale d’une transformation nucléaire sont ${mi} u et ${mf} u. Calculer l’énergie libérée.`,`${E} MeV`,`Δm=mi−mf=${dm} u ; E=Δmc²=${E} MeV.`,'Soustrais les masses avant de multiplier par 931,5.',2));
  }
}

// 6 — RC
{
  const data=[[1000,1],[2000,5],[4700,2.2],[10000,10],[500,20],[3300,4.7],[2200,3.3],[1500,6.8],[6800,1.5],[820,8.2]] as const;
  for (const [R,CuF] of data) {
    const tau=r(R*CuF*1e-6);
    defs.push(calc(id++,'Dipôle RC','Charge et décharge','Constante de temps',`Un dipôle RC possède R=${R} Ω et C=${CuF} μF. Calculer τ.`,`${r(tau*1000)} ms`,`τ=RC=${tau} s=${r(tau*1000)} ms.`,'Convertis C en farads.',1));
  }
  const data2=[[12,1],[10,2],[6,3],[15,4],[8,2],[5,1],[20,3],[9,2],[18,4],[7,3]] as const;
  for (const [E,n] of data2) {
    const u=r(E*(1-Math.exp(-n)));
    defs.push(calc(id++,'Dipôle RC','Charge exponentielle','Tension du condensateur',`Un condensateur se charge sous E=${E} V. Calculer uC après t=${n}τ.`,`${u} V`,`uC=E(1−e^(−t/τ))=E(1−e^(-${n}))≈${u} V.`,'Remplace t/τ par n.',2));
  }
}

// 7 — RL
{
  const data=[[0.20,10],[0.50,25],[0.12,6],[0.80,40],[0.30,15],[0.15,5],[1,50],[0.25,20],[0.40,16],[0.60,30]] as const;
  for (const [L,R] of data) {
    const tau=r(L/R);
    defs.push(calc(id++,'Dipôle RL','Établissement du courant','Constante de temps',`Une bobine d’inductance L=${L} H est en série avec R=${R} Ω. Calculer τ.`,`${r(tau*1000)} ms`,`τ=L/R=${tau} s=${r(tau*1000)} ms.`,'Utilise τ = L/R.',1));
  }
  const data2=[[2,1],[1.5,2],[4,3],[0.8,4],[3,2],[2.5,1],[5,3],[1.2,2],[3.5,4],[0.6,3]] as const;
  for (const [Iinf,n] of data2) {
    const I=r(Iinf*(1-Math.exp(-n)));
    defs.push(calc(id++,'Dipôle RL','Établissement du courant','Courant à t=nτ',`Le courant final vaut I∞=${Iinf} A. Calculer i après t=${n}τ.`,`${I} A`,`i=I∞(1−e^(−${n}))≈${I} A.`,'Utilise la loi d’établissement RL.',2));
  }
}

// 8 — RLC
{
  const data=[[0.20,10],[0.50,5],[0.10,20],[0.40,8],[0.25,4],[0.60,10],[0.15,15],[0.30,12],[0.80,2],[0.12,30]] as const;
  for (const [L,CuF] of data) {
    const w=r(1/Math.sqrt(L*CuF*1e-6));
    defs.push(calc(id++,'Oscillations libres dans un circuit RLC série','Oscillations RLC','Pulsation propre',`Un circuit LC idéal possède L=${L} H et C=${CuF} μF. Calculer ω₀.`,`${w} rad·s⁻¹`,`ω₀=1/√(LC)≈${w} rad·s⁻¹.`,'Utilise les unités SI.',2));
  }
  const data2=[[500,0.2],[800,0.5],[1000,0.1],[1200,0.4],[1600,0.25],[700,0.3],[900,0.6],[1400,0.15],[1800,0.2],[600,0.12]] as const;
  for (const [w,L] of data2) {
    const C=1/(L*w*w), T=2*Math.PI/w;
    defs.push(calc(id++,'Oscillations libres dans un circuit RLC série','Période propre RLC','Capacité et période',`On impose ω₀=${w} rad·s⁻¹ à un circuit LC avec L=${L} H. Déterminer C puis T₀.`,`C≈${r(C*1e6)} μF ; T₀≈${r(T)} s`,`C=1/(Lω₀²)≈${r(C*1e6)} μF ; T₀=2π/ω₀≈${r(T)} s.`,'Isole C puis utilise T = 2π/ω₀.',3));
  }
}

// 9 — Modulation
{
  const data=[[6,2],[8,4],[10,2],[5,3],[9,1],[12,4],[7,5],[10,6],[15,5],[4,2]] as const;
  for (const [Umax,Umin] of data) {
    const m=r((Umax-Umin)/(Umax+Umin));
    defs.push(calc(id++,'Transmission d’information / modulation d’amplitude','Modulation','Taux de modulation',`Une onde modulée a Umax=${Umax} V et Umin=${Umin} V. Calculer m.`,`m=${m}`,`m=(Umax−Umin)/(Umax+Umin)=${m}.`,'Applique la formule de l’enveloppe.',1));
  }
  const data2=[[5,0.2],[8,0.25],[10,0.3],[6,0.25],[12,1/3],[7,0.5],[9,0.4],[4,0.25],[15,0.2],[10,0.4]] as const;
  for (const [Uc,m] of data2) {
    const umax=r(Uc*(1+m)), umin=r(Uc*(1-m));
    defs.push(calc(id++,'Transmission d’information / modulation d’amplitude','Enveloppe AM','Valeurs extrêmes de l’enveloppe',`Une porteuse a Uc=${Uc} V et le taux de modulation vaut m=${m}. Calculer Umax et Umin.`,`Umax=${umax} V ; Umin=${umin} V`,`Umax=Uc(1+m)=${umax} V ; Umin=Uc(1−m)=${umin} V.`,'Utilise les deux expressions de l’enveloppe.',2));
  }
}

// 10 — Newton
{
  const data=[[2,10],[5,25],[0.5,3],[8,40],[12,60],[1.5,9],[4,28],[10,15],[3,18],[6,42]] as const;
  for (const [m,F] of data) {
    const a=r(F/m);
    defs.push(calc(id++,'Lois de Newton','Dynamique','Accélération',`Un solide de masse ${m} kg est soumis à une résultante de ${F} N. Déterminer son accélération.`,`${a} m·s⁻²`,`a=ΣF/m=${F}/${m}=${a} m·s⁻².`,'Applique ΣF = ma.',1));
  }
  const data2=[[2,3],[5,4],[0.5,8],[10,2],[4,6],[3,7],[8,2.5],[6,5],[1.5,4],[12,1.5]] as const;
  for (const [m,a] of data2) {
    const F=r(m*a);
    defs.push(calc(id++,'Lois de Newton','Résultante des forces','Calculer ΣF',`Un objet de masse ${m} kg possède une accélération de ${a} m·s⁻². Calculer la résultante des forces.`,`${F} N`,`ΣF=ma=${m}×${a}=${F} N.`,'Calcule m×a.',1));
  }
}

// 11 — Chute verticale
{
  const data=[[10,2],[9.81,3],[9.8,1.5],[10,4],[9.81,0.8],[10,2.5],[9.8,3.2],[10,1.2],[9.81,2.2],[10,0.5]] as const;
  for (const [g,t] of data) {
    const v=r(g*t), h=r(0.5*g*t*t);
    defs.push(calc(id++,'Chute verticale d’un solide','Chute verticale','Vitesse et distance',`Un objet est lâché sans vitesse initiale. Avec g=${g} m·s⁻², calculer v et la distance parcourue après ${t} s.`,`v=${v} m·s⁻¹ ; h=${h} m`,`v=gt=${v} m·s⁻¹ ; h=½gt²=${h} m.`,'Utilise v = gt et h = ½gt².',2));
  }
  const data2=[[20,10],[45,10],[80,10],[19.62,9.81],[4.9,9.8],[30,10],[60,9.8],[12.5,10],[100,10],[7.2,9.81]] as const;
  for (const [h,g] of data2) {
    const t=r(Math.sqrt(2*h/g));
    defs.push(calc(id++,'Chute verticale d’un solide','Temps de chute','Durée de chute',`Un objet est lâché sans vitesse initiale d’une hauteur h=${h} m. Avec g=${g} m·s⁻², déterminer la durée de chute.`,`${t} s`,`h=½gt², donc t=√(2h/g)≈${t} s.`,'Isole t dans h = ½gt².',2));
  }
}

// 12 — Mouvements plans
{
  const data=[[20,30],[30,30],[20,45],[25,60],[40,30],[10,45],[50,60],[18,30],[24,45],[36,60]] as const;
  for (const [v,aDeg] of data) {
    const a=aDeg*Math.PI/180, vx=r(v*Math.cos(a)), vy=r(v*Math.sin(a));
    defs.push(calc(id++,'Mouvements plans','Projectile','Composantes initiales',`Un projectile est lancé avec v₀=${v} m·s⁻¹ sous α=${aDeg}°. Déterminer v₀x et v₀y.`,`v₀x=${vx} m·s⁻¹ ; v₀y=${vy} m·s⁻¹`,`v₀x=v₀cosα≈${vx} ; v₀y=v₀sinα≈${vy}.`,'Projette la vitesse sur les axes.',2));
  }
  const data2=[[20,10,30],[20,10,45],[30,10,60],[25,9.8,30],[40,10,45],[18,9.8,60],[24,10,30],[36,10,45],[15,10,60],[50,9.8,30]] as const;
  for (const [v,g,aDeg] of data2) {
    const a=aDeg*Math.PI/180, tv=r(2*v*Math.sin(a)/g), range=r(v*v*Math.sin(2*a)/g);
    defs.push(calc(id++,'Mouvements plans','Portée du projectile','Durée de vol et portée',`Un projectile est lancé à v₀=${v} m·s⁻¹ sous α=${aDeg}°, avec g=${g} m·s⁻². Déterminer la durée totale de vol et la portée.`,`t≈${tv} s ; R≈${range} m`,`t=2v₀sinα/g≈${tv} s ; R=v₀²sin(2α)/g≈${range} m.`,'Suppose départ et arrivée à la même altitude.',3));
  }
}

// 13 — Satellites
{
  const data=[[6.67e-11,6e24,4e7],[6.67e-11,5e24,2e7],[6.67e-11,7e24,5e7],[6.67e-11,6e24,7e7],[6.67e-11,8e24,8e7],[6.67e-11,5.97e24,7e6],[6.67e-11,6e24,1e8],[6.67e-11,4e24,4e7],[6.67e-11,9e24,6e7],[6.67e-11,3e24,3e7]] as const;
  for (const [G,M,radius] of data) {
    const v=Math.sqrt(G*M/radius);
    defs.push(calc(id++,'Satellites artificiels et planètes','Gravitation','Vitesse orbitale',`Un satellite décrit une orbite circulaire de rayon r=${radius.toExponential(2)} m autour d’un astre de masse M=${M.toExponential(2)} kg. Avec G=${G.toExponential(2)} SI, calculer sa vitesse.`,`${r(v)} m·s⁻¹`,`v=√(GM/r)≈${r(v)} m·s⁻¹.`,'Égalise la force gravitationnelle à la force centripète.',3));
  }
  const data2=[[4e7,2e4],[5e7,3e4],[7e6,6e3],[8e7,4e4],[3e7,1.5e4],[6e7,2.5e4],[9e7,5e4],[2e7,1e4],[4.5e7,2.2e4],[7.5e7,3.5e4]] as const;
  for (const [radius,T] of data2) {
    const M=4*Math.PI**2*radius**3/(6.67e-11*T**2);
    defs.push(calc(id++,'Satellites artificiels et planètes','Masse de l’astre','Masse de l’astre central',`Un satellite a r=${radius.toExponential(2)} m et une période T=${T.toExponential(2)} s. Avec G=6,67×10⁻¹¹ SI, estimer la masse de l’astre central.`,`${M.toExponential(3)} kg`,`M=4π²r³/(GT²)≈${M.toExponential(3)} kg.`,'Utilise la troisième loi de Kepler sous forme orbitale.',3));
  }
}

// 14 — Rotation
{
  const data=[[0.20,5],[0.50,4],[0.10,8],[0.80,3],[0.30,6],[1.2,2],[0.25,10],[0.60,5],[0.15,12],[0.90,4]] as const;
  for (const [J,alpha] of data) {
    const M=r(J*alpha);
    defs.push(calc(id++,'Relation entre moments et accélération angulaire','Rotation','Moment résultant',`Une poulie de moment d’inertie J=${J} kg·m² a une accélération angulaire α=${alpha} rad·s⁻². Calculer le moment résultant.`,`${M} N·m`,`ΣM=Jα=${J}×${alpha}=${M} N·m.`,'Utilise ΣM = Jα.',1));
  }
  const data2=[[0.20,10,90],[0.50,8,30],[0.30,20,60],[0.40,15,90],[0.25,12,45],[0.60,6,30],[0.10,20,90],[0.35,10,60],[0.45,9,45],[0.80,7,30]] as const;
  for (const [radius,F,deg] of data2) {
    const M=r(radius*F*Math.sin(deg*Math.PI/180));
    defs.push(calc(id++,'Relation entre moments et accélération angulaire','Moment d’une force','Moment d’une force',`Une force F=${F} N agit à r=${radius} m de l’axe avec un angle de ${deg}°. Calculer la norme du moment.`,`${M} N·m`,`|M|=rFsinθ≈${M} N·m.`,'Prends la composante perpendiculaire de la force.',2));
  }
}

// 15 — Oscillateurs mécaniques
{
  const data=[[0.20,50],[0.50,80],[0.10,40],[0.25,100],[0.40,60],[0.30,75],[0.15,30],[0.60,90],[0.12,48],[0.80,128]] as const;
  for (const [m,k] of data) {
    const T=2*Math.PI*Math.sqrt(m/k);
    defs.push(calc(id++,'Systèmes mécaniques oscillants','Oscillateur mécanique','Période propre',`Un solide de masse m=${m} kg est attaché à un ressort de raideur k=${k} N·m⁻¹. Calculer la période propre.`,`${r(T)} s`,`T₀=2π√(m/k)≈${r(T)} s.`,'Utilise la formule de la période masse-ressort.',2));
  }
  const data2=[[50,0.10],[80,0.08],[100,0.06],[40,0.15],[60,0.12],[75,0.09],[30,0.20],[90,0.05],[48,0.18],[128,0.07]] as const;
  for (const [k,A] of data2) {
    const E=0.5*k*A*A;
    defs.push(calc(id++,'Systèmes mécaniques oscillants','Énergie d’un oscillateur','Énergie mécanique maximale',`Un ressort de raideur k=${k} N·m⁻¹ oscille avec une amplitude A=${A} m. Calculer l’énergie mécanique maximale.`,`${r(E)} J`,`Eₘ=½kA²=${r(E)} J.`,'À l’élongation maximale, l’énergie est potentielle élastique dans le modèle idéal.',2));
  }
}

if (defs.length !== 300) throw new Error(`SM physics bank must contain 300 exercises; got ${defs.length}`);

export const smPhysics300Exercises: Exercise[] = defs.map((item) => ({
  ...item,
  mode: 'BASE',
  source: 'APPROVED',
  target: { trackIds: tracks, subjectId, chapter: item.chapter, topic: item.topic },
  acceptedAnswers: [item.expectedAnswer],
  examTip: 'Rédiger la formule littérale avant l’application numérique et vérifier les unités.',
  xpValue: item.difficulty === 1 ? 8 : item.difficulty === 2 ? 12 : 16,
}));
