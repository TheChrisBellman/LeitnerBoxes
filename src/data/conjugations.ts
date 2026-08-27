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
  level: 'A',
  lessonId,
  kind: 'conjugation',
  tier: 'core',
  order: index + 1,
}))

export const conjugationsACore: ConjugationCard[] = [
  ...authored('a-01', [
    { suffix: '01', infinitive: 'être', person: 'vous', answer: 'vous êtes', distractors: ['tu es', 'il est', 'ils sont'] },
    { suffix: '02', infinitive: 'travailler', person: 'je', answer: 'je travaille', distractors: ['tu travailles', 'il travaille', 'nous travaillons'] },
    { suffix: '03', infinitive: 'avoir', person: 'tu', answer: 'tu as', distractors: ["j’ai", 'il a', 'vous avez'] },
    { suffix: '04', infinitive: 'habiter', person: 'nous', answer: 'nous habitons', distractors: ["j’habite", 'tu habites', 'ils habitent'] },
    { suffix: '05', infinitive: 'être', person: 'il/elle', answer: 'il est / elle est', distractors: ['je suis', 'tu es', 'nous sommes'] },
    { suffix: '06', infinitive: 'travailler', person: 'vous', answer: 'vous travaillez', distractors: ['je travaille', 'tu travailles', 'ils travaillent'] },
  ]),
  ...authored('a-02', [
    { suffix: '01', infinitive: 'imprimer', person: 'vous', answer: 'vous imprimez', distractors: ['j’imprime', 'tu imprimes', 'ils impriment'] },
    { suffix: '02', infinitive: 'remplir', person: 'tu', answer: 'tu remplis', distractors: ['je remplis', 'il remplit', 'nous remplissons'] },
    { suffix: '03', infinitive: 'envoyer', person: 'il/elle', answer: 'il envoie / elle envoie', distractors: ['j’envoie', 'tu envoies', 'nous envoyons'] },
    { suffix: '04', infinitive: 'signer', person: 'je', answer: 'je signe', distractors: ['tu signes', 'il signe', 'nous signons'] },
    { suffix: '05', infinitive: 'ouvrir', person: 'nous', answer: 'nous ouvrons', distractors: ['j’ouvre', 'tu ouvres', 'ils ouvrent'] },
    { suffix: '06', infinitive: 'lire', person: 'ils/elles', answer: 'ils lisent / elles lisent', distractors: ['je lis', 'tu lis', 'nous lisons'] },
  ]),
  ...authored('a-03', [
    { suffix: '01', infinitive: 'appartenir', person: 'il/elle', answer: 'il appartient / elle appartient', distractors: ['j’appartiens', 'tu appartiens', 'nous appartenons'] },
    { suffix: '02', infinitive: 'faire', person: 'vous', answer: 'vous faites', distractors: ['je fais', 'tu fais', 'ils font'] },
    { suffix: '03', infinitive: 'relever', person: 'je', answer: 'je relève', distractors: ['tu relèves', 'il relève', 'nous relevons'] },
    { suffix: '04', infinitive: 'travailler', person: 'ils/elles', answer: 'ils travaillent / elles travaillent', distractors: ['je travaille', 'vous travaillez', 'nous travaillons'] },
    { suffix: '05', infinitive: 'diriger', person: 'tu', answer: 'tu diriges', distractors: ['je dirige', 'il dirige', 'vous dirigez'] },
    { suffix: '06', infinitive: 'avoir', person: 'nous', answer: 'nous avons', distractors: ["j’ai", 'tu as', 'ils ont'] },
  ]),
]
