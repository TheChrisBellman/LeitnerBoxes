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

const a23 = authored('a-23', [
  { suffix: '01', infinitive: 'dépendre', person: 'il/elle', answer: 'il dépend / elle dépend', distractors: ['je dépends', 'tu dépends', 'nous dépendons'] },
  { suffix: '02', infinitive: 'tenir', person: 'nous', answer: 'nous tenons', distractors: ['je tiens', 'tu tiens', 'ils tiennent'] },
  { suffix: '03', infinitive: 'être', person: 'il/elle', answer: 'il est / elle est', distractors: ['je suis', 'tu es', 'nous sommes'] },
  { suffix: '04', infinitive: 'prévoir', person: 'vous', answer: 'vous prévoyez', distractors: ['je prévois', 'tu prévois', 'ils prévoient'] },
  { suffix: '05', infinitive: 'avancer', person: 'il/elle', answer: 'il avance / elle avance', distractors: ['j’avance', 'tu avances', 'nous avançons'] },
  { suffix: '06', infinitive: 'évaluer', person: 'nous', answer: 'nous évaluons', distractors: ['j’évalue', 'tu évalues', 'ils évaluent'] },
])

const a24 = authored('a-24', [
  { suffix: '01', infinitive: 'appeler', person: 'je', answer: 'j’appelle', distractors: ['tu appelles', 'il appelle', 'nous appelons'] },
  { suffix: '02', infinitive: 'partir', person: 'vous', answer: 'vous partez', distractors: ['je pars', 'tu pars', 'ils partent'] },
  { suffix: '03', infinitive: 'attendre', person: 'tu', answer: 'tu attends', distractors: ['j’attends', 'il attend', 'nous attendons'] },
  { suffix: '04', infinitive: 'redémarrer', person: 'il/elle', answer: 'il redémarre / elle redémarre', distractors: ['je redémarre', 'tu redémarres', 'nous redémarrons'] },
  { suffix: '05', infinitive: 'signer', person: 'nous', answer: 'nous signons', distractors: ['je signe', 'tu signes', 'ils signent'] },
  { suffix: '06', infinitive: 'recevoir', person: 'ils/elles', answer: 'ils reçoivent / elles reçoivent', distractors: ['je reçois', 'tu reçois', 'nous recevons'] },
])

const a25 = authored('a-25', [
  { suffix: '01', infinitive: 'commencer', person: 'vous', answer: 'vous commencez', distractors: ['je commence', 'tu commences', 'ils commencent'] },
  { suffix: '02', infinitive: 'vérifier', person: 'tu', answer: 'tu vérifies', distractors: ['je vérifie', 'il vérifie', 'nous vérifions'] },
  { suffix: '03', infinitive: 'envoyer', person: 'vous', answer: 'vous envoyez', distractors: ['j’envoie', 'tu envoies', 'ils envoient'] },
  { suffix: '04', infinitive: 'passer', person: 'ils/elles', answer: 'ils passent / elles passent', distractors: ['je passe', 'tu passes', 'nous passons'] },
  { suffix: '05', infinitive: 'archiver', person: 'je', answer: 'j’archive', distractors: ['tu archives', 'il archive', 'nous archivons'] },
  { suffix: '06', infinitive: 'suivre', person: 'nous', answer: 'nous suivons', distractors: ['je suis', 'tu suis', 'ils suivent'] },
])

const a26 = authored('a-26', [
  { suffix: '01', infinitive: 'se rendre', person: 'je', answer: 'je me rends', distractors: ['tu te rends', 'il se rend', 'nous nous rendons'] },
  { suffix: '02', infinitive: 'quitter', person: 'il/elle', answer: 'il quitte / elle quitte', distractors: ['je quitte', 'tu quittes', 'nous quittons'] },
  { suffix: '03', infinitive: 'déplacer', person: 'nous', answer: 'nous déplaçons', distractors: ['je déplace', 'tu déplaces', 'ils déplacent'] },
  { suffix: '04', infinitive: 'transporter', person: 'ils/elles', answer: 'ils transportent / elles transportent', distractors: ['je transporte', 'tu transportes', 'nous transportons'] },
  { suffix: '05', infinitive: 'aller', person: 'vous', answer: 'vous allez', distractors: ['je vais', 'tu vas', 'ils vont'] },
  { suffix: '06', infinitive: 'partir', person: 'nous', answer: 'nous partons', distractors: ['je pars', 'tu pars', 'ils partent'] },
])

const a27 = authored('a-27', [
  { suffix: '01', infinitive: 'soulever', person: 'vous', answer: 'vous soulevez', distractors: ['je soulève', 'tu soulèves', 'ils soulèvent'] },
  { suffix: '02', infinitive: 'poser', person: 'tu', answer: 'tu poses', distractors: ['je pose', 'il pose', 'nous posons'] },
  { suffix: '03', infinitive: 'tirer', person: 'je', answer: 'je tire', distractors: ['tu tires', 'il tire', 'nous tirons'] },
  { suffix: '04', infinitive: 'pousser', person: 'vous', answer: 'vous poussez', distractors: ['je pousse', 'tu pousses', 'ils poussent'] },
  { suffix: '05', infinitive: 'brancher', person: 'il/elle', answer: 'il branche / elle branche', distractors: ['je branche', 'tu branches', 'nous branchons'] },
  { suffix: '06', infinitive: 'installer', person: 'nous', answer: 'nous installons', distractors: ['j’installe', 'tu installes', 'ils installent'] },
])

const a28 = authored('a-28', [
  { suffix: '01', infinitive: 'être', person: 'il/elle', answer: 'il est / elle est', distractors: ['je suis', 'tu es', 'nous sommes'] },
  { suffix: '02', infinitive: 'insister', person: 'il/elle', answer: 'il insiste / elle insiste', distractors: ['j’insiste', 'tu insistes', 'nous insistons'] },
  { suffix: '03', infinitive: 'mettre', person: 'vous', answer: 'vous mettez', distractors: ['je mets', 'tu mets', 'ils mettent'] },
  { suffix: '04', infinitive: 's’appliquer', person: 'il/elle', answer: 'il s’applique / elle s’applique', distractors: ['je m’applique', 'tu t’appliques', 'nous nous appliquons'] },
  { suffix: '05', infinitive: 'oublier', person: 'vous', answer: 'vous oubliez', distractors: ['j’oublie', 'tu oublies', 'ils oublient'] },
  { suffix: '06', infinitive: 'vérifier', person: 'nous', answer: 'nous vérifions', distractors: ['je vérifie', 'tu vérifies', 'ils vérifient'] },
])

const a29 = authored('a-29', [
  { suffix: '01', infinitive: 'savoir', person: 'il/elle', answer: 'il sait / elle sait', distractors: ['je sais', 'tu sais', 'nous savons'] },
  { suffix: '02', infinitive: 'être', person: 'vous', answer: 'vous êtes', distractors: ['je suis', 'tu es', 'ils sont'] },
  { suffix: '03', infinitive: 'maîtriser', person: 'il/elle', answer: 'il maîtrise / elle maîtrise', distractors: ['je maîtrise', 'tu maîtrises', 'nous maîtrisons'] },
  { suffix: '04', infinitive: 'pouvoir', person: 'je', answer: 'je peux', distractors: ['tu peux', 'il peut', 'nous pouvons'] },
  { suffix: '05', infinitive: 'se débrouiller', person: 'ils/elles', answer: 'ils se débrouillent / elles se débrouillent', distractors: ['je me débrouille', 'tu te débrouilles', 'nous nous débrouillons'] },
  { suffix: '06', infinitive: 'apprendre', person: 'nous', answer: 'nous apprenons', distractors: ['j’apprends', 'tu apprends', 'ils apprennent'] },
])

const a30 = authored('a-30', [
  { suffix: '01', infinitive: 'autoriser', person: 'il/elle', answer: 'il autorise / elle autorise', distractors: ['j’autorise', 'tu autorises', 'nous autorisons'] },
  { suffix: '02', infinitive: 'interdire', person: 'vous', answer: 'vous interdisez', distractors: ['j’interdis', 'tu interdis', 'ils interdisent'] },
  { suffix: '03', infinitive: 'permettre', person: 'il/elle', answer: 'il permet / elle permet', distractors: ['je permets', 'tu permets', 'nous permettons'] },
  { suffix: '04', infinitive: 'devoir', person: 'ils/elles', answer: 'ils doivent / elles doivent', distractors: ['je dois', 'tu dois', 'nous devons'] },
  { suffix: '05', infinitive: 'pouvoir', person: 'vous', answer: 'vous pouvez', distractors: ['je peux', 'tu peux', 'ils peuvent'] },
  { suffix: '06', infinitive: 'garder', person: 'tu', answer: 'tu gardes', distractors: ['je garde', 'il garde', 'nous gardons'] },
])

const a31 = authored('a-31', [
  { suffix: '01', infinitive: 'compter', person: 'je', answer: 'je compte', distractors: ['tu comptes', 'il compte', 'nous comptons'] },
  { suffix: '02', infinitive: 'espérer', person: 'nous', answer: 'nous espérons', distractors: ['j’espère', 'tu espères', 'ils espèrent'] },
  { suffix: '03', infinitive: 'être', person: 'il/elle', answer: 'il est / elle est', distractors: ['je suis', 'tu es', 'nous sommes'] },
  { suffix: '04', infinitive: 'accepter', person: 'vous', answer: 'vous acceptez', distractors: ['j’accepte', 'tu acceptes', 'ils acceptent'] },
  { suffix: '05', infinitive: 'refuser', person: 'il/elle', answer: 'il refuse / elle refuse', distractors: ['je refuse', 'tu refuses', 'nous refusons'] },
  { suffix: '06', infinitive: 'décider', person: 'ils/elles', answer: 'ils décident / elles décident', distractors: ['je décide', 'tu décides', 'nous décidons'] },
])

const a32 = authored('a-32', [
  { suffix: '01', infinitive: 'avoir', person: 'vous', answer: 'vous avez', distractors: ["j’ai", 'tu as', 'ils ont'] },
  { suffix: '02', infinitive: 'agir', person: 'nous', answer: 'nous agissons', distractors: ['j’agis', 'tu agis', 'ils agissent'] },
  { suffix: '03', infinitive: 'pouvoir', person: 'vous', answer: 'vous pouvez', distractors: ['je peux', 'tu peux', 'ils peuvent'] },
  { suffix: '04', infinitive: 'être', person: 'il/elle', answer: 'il est / elle est', distractors: ['je suis', 'tu es', 'nous sommes'] },
  { suffix: '05', infinitive: 'devoir', person: 'nous', answer: 'nous devons', distractors: ['je dois', 'tu dois', 'ils doivent'] },
  { suffix: '06', infinitive: 'respecter', person: 'ils/elles', answer: 'ils respectent / elles respectent', distractors: ['je respecte', 'tu respectes', 'nous respectons'] },
])

export const conjugationsAExpansion3: ConjugationCard[] = [...a23, ...a24, ...a25, ...a26, ...a27, ...a28, ...a29, ...a30, ...a31, ...a32]
