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

const b37 = authored('b-37', [
  { suffix: '01', infinitive: 'définir', person: 'je', answer: 'je définis', distractors: ['tu définis', 'il définit', 'nous définissons'] },
  { suffix: '02', infinitive: 'établir', person: 'nous', answer: 'nous établissons', distractors: ['j’établis', 'tu établis', 'ils établissent'] },
  { suffix: '03', infinitive: 'suivre', person: 'vous', answer: 'vous suivez', distractors: ['je suis', 'tu suis', 'ils suivent'] },
  { suffix: '04', infinitive: 'vérifier', person: 'il/elle', answer: 'il vérifie / elle vérifie', distractors: ['je vérifie', 'tu vérifies', 'nous vérifions'] },
  { suffix: '05', infinitive: 'valider', person: 'ils/elles', answer: 'ils valident / elles valident', distractors: ['je valide', 'tu valides', 'nous validons'] },
  { suffix: '06', infinitive: 'conclure', person: 'tu', answer: 'tu conclus', distractors: ['je conclus', 'il conclut', 'nous concluons'] },
])

const b38 = authored('b-38', [
  { suffix: '01', infinitive: 'expliquer', person: 'je', answer: 'j’explique', distractors: ['tu expliques', 'il explique', 'nous expliquons'] },
  { suffix: '02', infinitive: 'entraîner', person: 'nous', answer: 'nous entraînons', distractors: ['j’entraîne', 'tu entraînes', 'ils entraînent'] },
  { suffix: '03', infinitive: 'découler', person: 'il/elle', answer: 'il découle / elle découle', distractors: ['je découle', 'tu découles', 'nous découlons'] },
  { suffix: '04', infinitive: 'provoquer', person: 'vous', answer: 'vous provoquez', distractors: ['je provoque', 'tu provoques', 'ils provoquent'] },
  { suffix: '05', infinitive: 'résulter', person: 'ils/elles', answer: 'ils résultent / elles résultent', distractors: ['je résulte', 'tu résultes', 'nous résultons'] },
  { suffix: '06', infinitive: 'avoir', person: 'tu', answer: 'tu as', distractors: ['j’ai', 'il a', 'nous avons'] },
])

const b39 = authored('b-39', [
  { suffix: '01', infinitive: 'évaluer', person: 'je', answer: 'j’évalue', distractors: ['tu évalues', 'il évalue', 'nous évaluons'] },
  { suffix: '02', infinitive: 'prévoir', person: 'nous', answer: 'nous prévoyons', distractors: ['je prévois', 'tu prévois', 'ils prévoient'] },
  { suffix: '03', infinitive: 'comporter', person: 'il/elle', answer: 'il comporte / elle comporte', distractors: ['je comporte', 'tu comportes', 'nous comportons'] },
  { suffix: '04', infinitive: 'être', person: 'vous', answer: 'vous êtes', distractors: ['je suis', 'tu es', 'ils sont'] },
  { suffix: '05', infinitive: 'accepter', person: 'ils/elles', answer: 'ils acceptent / elles acceptent', distractors: ['j’accepte', 'tu acceptes', 'nous acceptons'] },
  { suffix: '06', infinitive: 'améliorer', person: 'tu', answer: 'tu améliores', distractors: ['j’améliore', 'il améliore', 'nous améliorons'] },
])

const b40 = authored('b-40', [
  { suffix: '01', infinitive: 'défendre', person: 'je', answer: 'je défends', distractors: ['tu défends', 'il défend', 'nous défendons'] },
  { suffix: '02', infinitive: 'présenter', person: 'nous', answer: 'nous présentons', distractors: ['je présente', 'tu présentes', 'ils présentent'] },
  { suffix: '03', infinitive: 'convaincre', person: 'vous', answer: 'vous convainquez', distractors: ['je convaincs', 'tu convaincs', 'ils convainquent'] },
  { suffix: '04', infinitive: 'soutenir', person: 'il/elle', answer: 'il soutient / elle soutient', distractors: ['je soutiens', 'tu soutiens', 'nous soutenons'] },
  { suffix: '05', infinitive: 'recommander', person: 'ils/elles', answer: 'ils recommandent / elles recommandent', distractors: ['je recommande', 'tu recommandes', 'nous recommandons'] },
  { suffix: '06', infinitive: 'persuader', person: 'tu', answer: 'tu persuades', distractors: ['je persuade', 'il persuade', 'nous persuadons'] },
])

export const conjugationsBExpansion2: ConjugationCard[] = [...b37, ...b38, ...b39, ...b40]
