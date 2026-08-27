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

const c01 = authored('c-01', [
  { suffix: '01', infinitive: 'exercer', person: 'je', answer: 'j’exerce', distractors: ['tu exerces', 'il exerce', 'nous exerçons'] },
  { suffix: '02', infinitive: 'définir', person: 'nous', answer: 'nous définissons', distractors: ['je définis', 'tu définis', 'ils définissent'] },
  { suffix: '03', infinitive: 'relever', person: 'il/elle', answer: 'il relève / elle relève', distractors: ['je relève', 'tu relèves', 'nous relevons'] },
  { suffix: '04', infinitive: 'coordonner', person: 'vous', answer: 'vous coordonnez', distractors: ['je coordonne', 'tu coordonnes', 'ils coordonnent'] },
  { suffix: '05', infinitive: 'atteindre', person: 'ils/elles', answer: 'ils atteignent / elles atteignent', distractors: ['j’atteins', 'tu atteins', 'nous atteignons'] },
  { suffix: '06', infinitive: 'contribuer', person: 'tu', answer: 'tu contribues', distractors: ['je contribue', 'il contribue', 'nous contribuons'] },
])

const c02 = authored('c-02', [
  { suffix: '01', infinitive: 'connaître', person: 'je', answer: 'je connais', distractors: ['tu connais', 'il connaît', 'nous connaissons'] },
  { suffix: '02', infinitive: 'reconnaître', person: 'nous', answer: 'nous reconnaissons', distractors: ['je reconnais', 'tu reconnais', 'ils reconnaissent'] },
  { suffix: '03', infinitive: 'recevoir', person: 'il/elle', answer: 'il reçoit / elle reçoit', distractors: ['je reçois', 'tu reçois', 'nous recevons'] },
  { suffix: '04', infinitive: 'évoluer', person: 'vous', answer: 'vous évoluez', distractors: ['j’évolue', 'tu évolues', 'ils évoluent'] },
  { suffix: '05', infinitive: 'fixer', person: 'ils/elles', answer: 'ils fixent / elles fixent', distractors: ['je fixe', 'tu fixes', 'nous fixons'] },
  { suffix: '06', infinitive: 'faciliter', person: 'tu', answer: 'tu facilites', distractors: ['je facilite', 'il facilite', 'nous facilitons'] },
])

const c03 = authored('c-03', [
  { suffix: '01', infinitive: 'assumer', person: 'je', answer: 'j’assume', distractors: ['tu assumes', 'il assume', 'nous assumons'] },
  { suffix: '02', infinitive: 'coordonner', person: 'nous', answer: 'nous coordonnons', distractors: ['je coordonne', 'tu coordonnes', 'ils coordonnent'] },
  { suffix: '03', infinitive: 'favoriser', person: 'il/elle', answer: 'il favorise / elle favorise', distractors: ['je favorise', 'tu favorises', 'nous favorisons'] },
  { suffix: '04', infinitive: 'chercher', person: 'vous', answer: 'vous cherchez', distractors: ['je cherche', 'tu cherches', 'ils cherchent'] },
  { suffix: '05', infinitive: 'renforcer', person: 'ils/elles', answer: 'ils renforcent / elles renforcent', distractors: ['je renforce', 'tu renforces', 'nous renforçons'] },
  { suffix: '06', infinitive: 'apporter', person: 'tu', answer: 'tu apportes', distractors: ['j’apporte', 'il apporte', 'nous apportons'] },
])

const c04 = authored('c-04', [
  { suffix: '01', infinitive: 'anticiper', person: 'je', answer: 'j’anticipe', distractors: ['tu anticipes', 'il anticipe', 'nous anticipons'] },
  { suffix: '02', infinitive: 'conduire', person: 'nous', answer: 'nous conduisons', distractors: ['je conduis', 'tu conduis', 'ils conduisent'] },
  { suffix: '03', infinitive: 'résister', person: 'il/elle', answer: 'il résiste / elle résiste', distractors: ['je résiste', 'tu résistes', 'nous résistons'] },
  { suffix: '04', infinitive: 'accompagner', person: 'vous', answer: 'vous accompagnez', distractors: ['j’accompagne', 'tu accompagnes', 'ils accompagnent'] },
  { suffix: '05', infinitive: 'adopter', person: 'ils/elles', answer: 'ils adoptent / elles adoptent', distractors: ['j’adopte', 'tu adoptes', 'nous adoptons'] },
  { suffix: '06', infinitive: 'évaluer', person: 'tu', answer: 'tu évalues', distractors: ['j’évalue', 'il évalue', 'nous évaluons'] },
])

const c05 = authored('c-05', [
  { suffix: '01', infinitive: 'gérer', person: 'je', answer: 'je gère', distractors: ['tu gères', 'il gère', 'nous gérons'] },
  { suffix: '02', infinitive: 'alléger', person: 'nous', answer: 'nous allégeons', distractors: ['j’allège', 'tu allèges', 'ils allègent'] },
  { suffix: '03', infinitive: 'augmenter', person: 'il/elle', answer: 'il augmente / elle augmente', distractors: ['j’augmente', 'tu augmentes', 'nous augmentons'] },
  { suffix: '04', infinitive: 'reconnaître', person: 'vous', answer: 'vous reconnaissez', distractors: ['je reconnais', 'tu reconnais', 'ils reconnaissent'] },
  { suffix: '05', infinitive: 'décider', person: 'ils/elles', answer: 'ils décident / elles décident', distractors: ['je décide', 'tu décides', 'nous décidons'] },
  { suffix: '06', infinitive: 'nuire', person: 'tu', answer: 'tu nuis', distractors: ['je nuis', 'il nuit', 'nous nuisons'] },
])

const c06 = authored('c-06', [
  { suffix: '01', infinitive: 'aménager', person: 'je', answer: 'j’aménage', distractors: ['tu aménages', 'il aménage', 'nous aménageons'] },
  { suffix: '02', infinitive: 'maintenir', person: 'nous', answer: 'nous maintenons', distractors: ['je maintiens', 'tu maintiens', 'ils maintiennent'] },
  { suffix: '03', infinitive: 'décrocher', person: 'il/elle', answer: 'il décroche / elle décroche', distractors: ['je décroche', 'tu décroches', 'nous décrochons'] },
  { suffix: '04', infinitive: 'encourager', person: 'vous', answer: 'vous encouragez', distractors: ['j’encourage', 'tu encourages', 'ils encouragent'] },
  { suffix: '05', infinitive: 'respecter', person: 'ils/elles', answer: 'ils respectent / elles respectent', distractors: ['je respecte', 'tu respectes', 'nous respectons'] },
  { suffix: '06', infinitive: 'préserver', person: 'tu', answer: 'tu préserves', distractors: ['je préserve', 'il préserve', 'nous préservons'] },
])

const c07 = authored('c-07', [
  { suffix: '01', infinitive: 'adapter', person: 'je', answer: 'j’adapte', distractors: ['tu adaptes', 'il adapte', 'nous adaptons'] },
  { suffix: '02', infinitive: 'clarifier', person: 'nous', answer: 'nous clarifions', distractors: ['je clarifie', 'tu clarifies', 'ils clarifient'] },
  { suffix: '03', infinitive: 'vérifier', person: 'il/elle', answer: 'il vérifie / elle vérifie', distractors: ['je vérifie', 'tu vérifies', 'nous vérifions'] },
  { suffix: '04', infinitive: 'transmettre', person: 'vous', answer: 'vous transmettez', distractors: ['je transmets', 'tu transmets', 'ils transmettent'] },
  { suffix: '05', infinitive: 'utiliser', person: 'ils/elles', answer: 'ils utilisent / elles utilisent', distractors: ['j’utilise', 'tu utilises', 'nous utilisons'] },
  { suffix: '06', infinitive: 'interpréter', person: 'tu', answer: 'tu interprètes', distractors: ['j’interprète', 'il interprète', 'nous interprétons'] },
])

export const conjugationsCExpansion1: ConjugationCard[] = [...c01, ...c02, ...c03, ...c04, ...c05, ...c06, ...c07]
