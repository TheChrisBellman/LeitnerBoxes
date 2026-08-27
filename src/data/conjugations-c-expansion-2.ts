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

const c08 = authored('c-08', [
  { suffix: '01', infinitive: 'aménager', person: 'je', answer: 'j’aménage', distractors: ['tu aménages', 'il aménage', 'nous aménageons'] },
  { suffix: '02', infinitive: 'favoriser', person: 'nous', answer: 'nous favorisons', distractors: ['je favorise', 'tu favorises', 'ils favorisent'] },
  { suffix: '03', infinitive: 'créer', person: 'il/elle', answer: 'il crée / elle crée', distractors: ['je crée', 'tu crées', 'nous créons'] },
  { suffix: '04', infinitive: 'améliorer', person: 'vous', answer: 'vous améliorez', distractors: ['j’améliore', 'tu améliores', 'ils améliorent'] },
  { suffix: '05', infinitive: 'encourager', person: 'ils/elles', answer: 'ils encouragent / elles encouragent', distractors: ['j’encourage', 'tu encourages', 'nous encourageons'] },
  { suffix: '06', infinitive: 'répondre', person: 'tu', answer: 'tu réponds', distractors: ['je réponds', 'il répond', 'nous répondons'] },
])

const c09 = authored('c-09', [
  { suffix: '01', infinitive: 'assumer', person: 'je', answer: 'j’assume', distractors: ['tu assumes', 'il assume', 'nous assumons'] },
  { suffix: '02', infinitive: 'mobiliser', person: 'nous', answer: 'nous mobilisons', distractors: ['je mobilise', 'tu mobilises', 'ils mobilisent'] },
  { suffix: '03', infinitive: 'donner', person: 'il/elle', answer: 'il donne / elle donne', distractors: ['je donne', 'tu donnes', 'nous donnons'] },
  { suffix: '04', infinitive: 'déléguer', person: 'vous', answer: 'vous déléguez', distractors: ['je délègue', 'tu délègues', 'ils délèguent'] },
  { suffix: '05', infinitive: 'reconnaître', person: 'ils/elles', answer: 'ils reconnaissent / elles reconnaissent', distractors: ['je reconnais', 'tu reconnais', 'nous reconnaissons'] },
  { suffix: '06', infinitive: 'suivre', person: 'tu', answer: 'tu suis', distractors: ['je suis', 'il suit', 'nous suivons'] },
])

const c10 = authored('c-10', [
  { suffix: '01', infinitive: 'défendre', person: 'je', answer: 'je défends', distractors: ['tu défends', 'il défend', 'nous défendons'] },
  { suffix: '02', infinitive: 'formuler', person: 'nous', answer: 'nous formulons', distractors: ['je formule', 'tu formules', 'ils formulent'] },
  { suffix: '03', infinitive: 'faire', person: 'il/elle', answer: 'il fait / elle fait', distractors: ['je fais', 'tu fais', 'nous faisons'] },
  { suffix: '04', infinitive: 'ouvrir', person: 'vous', answer: 'vous ouvrez', distractors: ['j’ouvre', 'tu ouvres', 'ils ouvrent'] },
  { suffix: '05', infinitive: 'atteindre', person: 'ils/elles', answer: 'ils atteignent / elles atteignent', distractors: ['j’atteins', 'tu atteins', 'nous atteignons'] },
  { suffix: '06', infinitive: 'faciliter', person: 'tu', answer: 'tu facilites', distractors: ['je facilite', 'il facilite', 'nous facilitons'] },
])

const c11 = authored('c-11', [
  { suffix: '01', infinitive: 'établir', person: 'je', answer: 'j’établis', distractors: ['tu établis', 'il établit', 'nous établissons'] },
  { suffix: '02', infinitive: 'tirer', person: 'nous', answer: 'nous tirons', distractors: ['je tire', 'tu tires', 'ils tirent'] },
  { suffix: '03', infinitive: 'se mesurer', person: 'il/elle', answer: 'il se mesure / elle se mesure', distractors: ['je me mesure', 'tu te mesures', 'nous nous mesurons'] },
  { suffix: '04', infinitive: 'partager', person: 'vous', answer: 'vous partagez', distractors: ['je partage', 'tu partages', 'ils partagent'] },
  { suffix: '05', infinitive: 'créer', person: 'ils/elles', answer: 'ils créent / elles créent', distractors: ['je crée', 'tu crées', 'nous créons'] },
  { suffix: '06', infinitive: 'renforcer', person: 'tu', answer: 'tu renforces', distractors: ['je renforce', 'il renforce', 'nous renforçons'] },
])

const c12 = authored('c-12', [
  { suffix: '01', infinitive: 'négocier', person: 'je', answer: 'je négocie', distractors: ['tu négocies', 'il négocie', 'nous négocions'] },
  { suffix: '02', infinitive: 'interpréter', person: 'nous', answer: 'nous interprétons', distractors: ['j’interprète', 'tu interprètes', 'ils interprètent'] },
  { suffix: '03', infinitive: 'respecter', person: 'il/elle', answer: 'il respecte / elle respecte', distractors: ['je respecte', 'tu respectes', 'nous respectons'] },
  { suffix: '04', infinitive: 'déposer', person: 'vous', answer: 'vous déposez', distractors: ['je dépose', 'tu déposes', 'ils déposent'] },
  { suffix: '05', infinitive: 'prévoir', person: 'ils/elles', answer: 'ils prévoient / elles prévoient', distractors: ['je prévois', 'tu prévois', 'nous prévoyons'] },
  { suffix: '06', infinitive: 'informer', person: 'tu', answer: 'tu informes', distractors: ['j’informe', 'il informe', 'nous informons'] },
])

const c13 = authored('c-13', [
  { suffix: '01', infinitive: 's’intégrer', person: 'je', answer: 'je m’intègre', distractors: ['tu t’intègres', 'il s’intègre', 'nous nous intégrons'] },
  { suffix: '02', infinitive: 'diversifier', person: 'nous', answer: 'nous diversifions', distractors: ['je diversifie', 'tu diversifies', 'ils diversifient'] },
  { suffix: '03', infinitive: 'travailler', person: 'il/elle', answer: 'il travaille / elle travaille', distractors: ['je travaille', 'tu travailles', 'nous travaillons'] },
  { suffix: '04', infinitive: 'adapter', person: 'vous', answer: 'vous adaptez', distractors: ['j’adapte', 'tu adaptes', 'ils adaptent'] },
  { suffix: '05', infinitive: 'franchir', person: 'ils/elles', answer: 'ils franchissent / elles franchissent', distractors: ['je franchis', 'tu franchis', 'nous franchissons'] },
  { suffix: '06', infinitive: 'évaluer', person: 'tu', answer: 'tu évalues', distractors: ['j’évalue', 'il évalue', 'nous évaluons'] },
])

const c14 = authored('c-14', [
  { suffix: '01', infinitive: 'établir', person: 'je', answer: 'j’établis', distractors: ['tu établis', 'il établit', 'nous établissons'] },
  { suffix: '02', infinitive: 'assurer', person: 'nous', answer: 'nous assurons', distractors: ['j’assure', 'tu assures', 'ils assurent'] },
  { suffix: '03', infinitive: 'répondre', person: 'il/elle', answer: 'il répond / elle répond', distractors: ['je réponds', 'tu réponds', 'nous répondons'] },
  { suffix: '04', infinitive: 'résoudre', person: 'vous', answer: 'vous résolvez', distractors: ['je résous', 'tu résous', 'ils résolvent'] },
  { suffix: '05', infinitive: 'offrir', person: 'ils/elles', answer: 'ils offrent / elles offrent', distractors: ['j’offre', 'tu offres', 'nous offrons'] },
  { suffix: '06', infinitive: 'fidéliser', person: 'tu', answer: 'tu fidélises', distractors: ['je fidélise', 'il fidélise', 'nous fidélisons'] },
])

export const conjugationsCExpansion2: ConjugationCard[] = [...c08, ...c09, ...c10, ...c11, ...c12, ...c13, ...c14]
