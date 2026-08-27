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
  level: 'B',
  lessonId,
  kind: 'conjugation',
  tier: 'core',
  order: index + 1,
}))

const b33 = authored('b-33', [
  { suffix: '01', infinitive: 'choisir', person: 'tu', answer: 'tu choisis', distractors: ['je choisis', 'il choisit', 'nous choisissons'] },
  { suffix: '02', infinitive: 'devoir', person: 'nous', answer: 'nous devons', distractors: ['je dois', 'tu dois', 'ils doivent'] },
  { suffix: '03', infinitive: 'préférer', person: 'je', answer: 'je préfère', distractors: ['tu préfères', 'il préfère', 'nous préférons'] },
  { suffix: '04', infinitive: 'retenir', person: 'il/elle', answer: 'il retient / elle retient', distractors: ['je retiens', 'tu retiens', 'nous retenons'] },
  { suffix: '05', infinitive: 'recommander', person: 'vous', answer: 'vous recommandez', distractors: ['je recommande', 'tu recommandes', 'ils recommandent'] },
  { suffix: '06', infinitive: 'hésiter', person: 'ils/elles', answer: 'ils hésitent / elles hésitent', distractors: ['j’hésite', 'tu hésites', 'nous hésitons'] },
])

const b34 = authored('b-34', [
  { suffix: '01', infinitive: 'identifier', person: 'je', answer: 'j’identifie', distractors: ['tu identifies', 'il identifie', 'nous identifions'] },
  { suffix: '02', infinitive: 'proposer', person: 'vous', answer: 'vous proposez', distractors: ['je propose', 'tu proposes', 'ils proposent'] },
  { suffix: '03', infinitive: 'résoudre', person: 'nous', answer: 'nous résolvons', distractors: ['je résous', 'tu résous', 'ils résolvent'] },
  { suffix: '04', infinitive: 'mettre', person: 'il/elle', answer: 'il met / elle met', distractors: ['je mets', 'tu mets', 'nous mettons'] },
  { suffix: '05', infinitive: 'traiter', person: 'il/elle', answer: 'il traite / elle traite', distractors: ['je traite', 'tu traites', 'nous traitons'] },
  { suffix: '06', infinitive: 'prévenir', person: 'ils/elles', answer: 'ils préviennent / elles préviennent', distractors: ['je préviens', 'tu préviens', 'nous prévenons'] },
])

const b35 = authored('b-35', [
  { suffix: '01', infinitive: 'prévoir', person: 'je', answer: 'je prévois', distractors: ['tu prévois', 'il prévoit', 'nous prévoyons'] },
  { suffix: '02', infinitive: 'annoncer', person: 'nous', answer: 'nous annonçons', distractors: ['j’annonce', 'tu annonces', 'ils annoncent'] },
  { suffix: '03', infinitive: 'devoir', person: 'il/elle', answer: 'il doit / elle doit', distractors: ['je dois', 'tu dois', 'nous devons'] },
  { suffix: '04', infinitive: 'anticiper', person: 'vous', answer: 'vous anticipez', distractors: ['j’anticipe', 'tu anticipes', 'ils anticipent'] },
  { suffix: '05', infinitive: 'évoluer', person: 'ils/elles', answer: 'ils évoluent / elles évoluent', distractors: ['j’évolue', 'tu évolues', 'nous évoluons'] },
  { suffix: '06', infinitive: 'rester', person: 'tu', answer: 'tu restes', distractors: ['je reste', 'il reste', 'nous restons'] },
])

const b36 = authored('b-36', [
  { suffix: '01', infinitive: 'demander', person: 'je', answer: 'je demande', distractors: ['tu demandes', 'il demande', 'nous demandons'] },
  { suffix: '02', infinitive: 'fournir', person: 'nous', answer: 'nous fournissons', distractors: ['je fournis', 'tu fournis', 'ils fournissent'] },
  { suffix: '03', infinitive: 'communiquer', person: 'vous', answer: 'vous communiquez', distractors: ['je communique', 'tu communiques', 'ils communiquent'] },
  { suffix: '04', infinitive: 'avancer', person: 'il/elle', answer: 'il avance / elle avance', distractors: ['j’avance', 'tu avances', 'nous avançons'] },
  { suffix: '05', infinitive: 'prendre', person: 'ils/elles', answer: 'ils prennent / elles prennent', distractors: ['je prends', 'tu prends', 'nous prenons'] },
  { suffix: '06', infinitive: 'rendre compte', person: 'ils/elles', answer: 'ils rendent compte / elles rendent compte', distractors: ['je rends compte', 'tu rends compte', 'nous rendons compte'] },
])

export const conjugationsBExpansion1: ConjugationCard[] = [...b33, ...b34, ...b35, ...b36]
