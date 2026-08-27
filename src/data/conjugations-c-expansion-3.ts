import type { ConjugationCard, ConjugationPerson } from './types.ts'

type Row = {
  suffix: string
  infinitive: string
  person: ConjugationPerson
  answer: string
  distractors: [string, string, string]
}

const authored = (lessonId: string, rows: readonly Row[]): ConjugationCard[] => rows.map((row, index) => ({
  id: `conj-${lessonId}-${row.suffix}`,
  infinitive: row.infinitive,
  tense: 'present',
  person: row.person,
  answer: row.answer,
  distractors: row.distractors,
  level: 'C',
  lessonId,
  kind: 'conjugation',
  tier: 'core',
  order: index + 1,
}))

const c15 = authored('c-15', [
  { suffix: '01', infinitive: 'préparer', person: 'je', answer: 'je prépare', distractors: ['tu prépares', 'il prépare', 'nous préparons'] },
  { suffix: '02', infinitive: 'distribuer', person: 'nous', answer: 'nous distribuons', distractors: ['je distribue', 'tu distribues', 'ils distribuent'] },
  { suffix: '03', infinitive: 'faire', person: 'il/elle', answer: 'il fait / elle fait', distractors: ['je fais', 'tu fais', 'nous faisons'] },
  { suffix: '04', infinitive: 'demander', person: 'vous', answer: 'vous demandez', distractors: ['je demande', 'tu demandes', 'ils demandent'] },
  { suffix: '05', infinitive: 'conclure', person: 'ils/elles', answer: 'ils concluent / elles concluent', distractors: ['je conclus', 'tu conclus', 'nous concluons'] },
  { suffix: '06', infinitive: 'porter', person: 'tu', answer: 'tu portes', distractors: ['je porte', 'il porte', 'nous portons'] },
])

const c16 = authored('c-16', [
  { suffix: '01', infinitive: 'déclarer', person: 'je', answer: 'je déclare', distractors: ['tu déclares', 'il déclare', 'nous déclarons'] },
  { suffix: '02', infinitive: 'protéger', person: 'nous', answer: 'nous protégeons', distractors: ['je protège', 'tu protèges', 'ils protègent'] },
  { suffix: '03', infinitive: 'rendre compte', person: 'il/elle', answer: 'il rend compte / elle rend compte', distractors: ['je rends compte', 'tu rends compte', 'nous rendons compte'] },
  { suffix: '04', infinitive: 'agir', person: 'vous', answer: 'vous agissez', distractors: ['j’agis', 'tu agis', 'ils agissent'] },
  { suffix: '05', infinitive: 'assumer', person: 'ils/elles', answer: 'ils assument / elles assument', distractors: ['j’assume', 'tu assumes', 'nous assumons'] },
  { suffix: '06', infinitive: 'signaler', person: 'tu', answer: 'tu signales', distractors: ['je signale', 'il signale', 'nous signalons'] },
])

const c17 = authored('c-17', [
  { suffix: '01', infinitive: 'définir', person: 'je', answer: 'je définis', distractors: ['tu définis', 'il définit', 'nous définissons'] },
  { suffix: '02', infinitive: 'assurer', person: 'nous', answer: 'nous assurons', distractors: ['j’assure', 'tu assures', 'ils assurent'] },
  { suffix: '03', infinitive: 'coordonner', person: 'il/elle', answer: 'il coordonne / elle coordonne', distractors: ['je coordonne', 'tu coordonnes', 'nous coordonnons'] },
  { suffix: '04', infinitive: 'suivre', person: 'vous', answer: 'vous suivez', distractors: ['je suis', 'tu suis', 'ils suivent'] },
  { suffix: '05', infinitive: 'guider', person: 'ils/elles', answer: 'ils guident / elles guident', distractors: ['je guide', 'tu guides', 'nous guidons'] },
  { suffix: '06', infinitive: 'présenter', person: 'tu', answer: 'tu présentes', distractors: ['je présente', 'il présente', 'nous présentons'] },
])

const c18 = authored('c-18', [
  { suffix: '01', infinitive: 'favoriser', person: 'je', answer: 'je favorise', distractors: ['tu favorises', 'il favorise', 'nous favorisons'] },
  { suffix: '02', infinitive: 'offrir', person: 'nous', answer: 'nous offrons', distractors: ['j’offre', 'tu offres', 'ils offrent'] },
  { suffix: '03', infinitive: 'éliminer', person: 'il/elle', answer: 'il élimine / elle élimine', distractors: ['j’élimine', 'tu élimines', 'nous éliminons'] },
  { suffix: '04', infinitive: 'représenter', person: 'vous', answer: 'vous représentez', distractors: ['je représente', 'tu représentes', 'ils représentent'] },
  { suffix: '05', infinitive: 'lutter', person: 'ils/elles', answer: 'ils luttent / elles luttent', distractors: ['je lutte', 'tu luttes', 'nous luttons'] },
  { suffix: '06', infinitive: 'participer', person: 'tu', answer: 'tu participes', distractors: ['je participe', 'il participe', 'nous participons'] },
])

const c19 = authored('c-19', [
  { suffix: '01', infinitive: 'déployer', person: 'je', answer: 'je déploie', distractors: ['tu déploies', 'il déploie', 'nous déployons'] },
  { suffix: '02', infinitive: 'sécuriser', person: 'nous', answer: 'nous sécurisons', distractors: ['je sécurise', 'tu sécurises', 'ils sécurisent'] },
  { suffix: '03', infinitive: 'transformer', person: 'il/elle', answer: 'il transforme / elle transforme', distractors: ['je transforme', 'tu transformes', 'nous transformons'] },
  { suffix: '04', infinitive: 'installer', person: 'vous', answer: 'vous installez', distractors: ['j’installe', 'tu installes', 'ils installent'] },
  { suffix: '05', infinitive: 'automatiser', person: 'ils/elles', answer: 'ils automatisent / elles automatisent', distractors: ['j’automatise', 'tu automatises', 'nous automatisons'] },
  { suffix: '06', infinitive: 'détecter', person: 'tu', answer: 'tu détectes', distractors: ['je détecte', 'il détecte', 'nous détectons'] },
])

const c20 = authored('c-20', [
  { suffix: '01', infinitive: 'mettre', person: 'je', answer: 'je mets', distractors: ['tu mets', 'il met', 'nous mettons'] },
  { suffix: '02', infinitive: 'acquérir', person: 'nous', answer: 'nous acquérons', distractors: ['j’acquiers', 'tu acquiers', 'ils acquièrent'] },
  { suffix: '03', infinitive: 'partager', person: 'il/elle', answer: 'il partage / elle partage', distractors: ['je partage', 'tu partages', 'nous partageons'] },
  { suffix: '04', infinitive: 'élaborer', person: 'vous', answer: 'vous élaborez', distractors: ['j’élabore', 'tu élabores', 'ils élaborent'] },
  { suffix: '05', infinitive: 'révéler', person: 'ils/elles', answer: 'ils révèlent / elles révèlent', distractors: ['je révèle', 'tu révèles', 'nous révélons'] },
  { suffix: '06', infinitive: 'revoir', person: 'tu', answer: 'tu revois', distractors: ['je revois', 'il revoit', 'nous revoyons'] },
])

const c21 = authored('c-21', [
  { suffix: '01', infinitive: 'préserver', person: 'je', answer: 'je préserve', distractors: ['tu préserves', 'il préserve', 'nous préservons'] },
  { suffix: '02', infinitive: 'réduire', person: 'nous', answer: 'nous réduisons', distractors: ['je réduis', 'tu réduis', 'ils réduisent'] },
  { suffix: '03', infinitive: 'gérer', person: 'il/elle', answer: 'il gère / elle gère', distractors: ['je gère', 'tu gères', 'nous gérons'] },
  { suffix: '04', infinitive: 'favoriser', person: 'vous', answer: 'vous favorisez', distractors: ['je favorise', 'tu favorises', 'ils favorisent'] },
  { suffix: '05', infinitive: 'mesurer', person: 'ils/elles', answer: 'ils mesurent / elles mesurent', distractors: ['je mesure', 'tu mesures', 'nous mesurons'] },
  { suffix: '06', infinitive: 'limiter', person: 'tu', answer: 'tu limites', distractors: ['je limite', 'il limite', 'nous limitons'] },
])

export const conjugationsCExpansion3: ConjugationCard[] = [...c15, ...c16, ...c17, ...c18, ...c19, ...c20, ...c21]
