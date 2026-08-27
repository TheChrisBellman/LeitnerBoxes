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

const a13 = authored('a-13', [
  { suffix: '01', infinitive: 'avoir', person: 'nous', answer: 'nous avons', distractors: ["j’ai", 'tu as', 'ils ont'] },
  { suffix: '02', infinitive: 'travailler', person: 'il/elle', answer: 'il travaille / elle travaille', distractors: ['je travaille', 'tu travailles', 'nous travaillons'] },
  { suffix: '03', infinitive: 'participer', person: 'je', answer: 'je participe', distractors: ['tu participes', 'il participe', 'nous participons'] },
  { suffix: '04', infinitive: 'se rencontrer', person: 'ils/elles', answer: 'ils se rencontrent / elles se rencontrent', distractors: ['je me rencontre', 'tu te rencontres', 'nous nous rencontrons'] },
  { suffix: '05', infinitive: 'se souvenir', person: 'il/elle', answer: 'il se souvient / elle se souvient', distractors: ['je me souviens', 'tu te souviens', 'nous nous souvenons'] },
  { suffix: '06', infinitive: 'fonctionner', person: 'il/elle', answer: 'il fonctionne / elle fonctionne', distractors: ['je fonctionne', 'tu fonctionnes', 'nous fonctionnons'] },
])

const a14 = authored('a-14', [
  { suffix: '01', infinitive: 'annoncer', person: 'je', answer: 'j’annonce', distractors: ['tu annonces', 'il annonce', 'nous annonçons'] },
  { suffix: '02', infinitive: 'signaler', person: 'il/elle', answer: 'il signale / elle signale', distractors: ['je signale', 'tu signales', 'nous signalons'] },
  { suffix: '03', infinitive: 'recevoir', person: 'nous', answer: 'nous recevons', distractors: ['je reçois', 'tu reçois', 'ils reçoivent'] },
  { suffix: '04', infinitive: 'changer', person: 'il/elle', answer: 'il change / elle change', distractors: ['je change', 'tu changes', 'nous changeons'] },
  { suffix: '05', infinitive: 'tenir', person: 'vous', answer: 'vous tenez', distractors: ['je tiens', 'tu tiens', 'ils tiennent'] },
  { suffix: '06', infinitive: 'expliquer', person: 'ils/elles', answer: 'ils expliquent / elles expliquent', distractors: ['j’explique', 'tu expliques', 'nous expliquons'] },
])

const a15 = authored('a-15', [
  { suffix: '01', infinitive: 'vouloir', person: 'je', answer: 'je veux', distractors: ['tu veux', 'il veut', 'nous voulons'] },
  { suffix: '02', infinitive: 'transmettre', person: 'vous', answer: 'vous transmettez', distractors: ['je transmets', 'tu transmets', 'ils transmettent'] },
  { suffix: '03', infinitive: 'demander', person: 'nous', answer: 'nous demandons', distractors: ['je demande', 'tu demandes', 'ils demandent'] },
  { suffix: '04', infinitive: 'recevoir', person: 'il/elle', answer: 'il reçoit / elle reçoit', distractors: ['je reçois', 'tu reçois', 'nous recevons'] },
  { suffix: '05', infinitive: 'remplir', person: 'ils/elles', answer: 'ils remplissent / elles remplissent', distractors: ['je remplis', 'tu remplis', 'nous remplissons'] },
  { suffix: '06', infinitive: 'confirmer', person: 'je', answer: 'je confirme', distractors: ['tu confirmes', 'il confirme', 'nous confirmons'] },
])

const a16 = authored('a-16', [
  { suffix: '01', infinitive: 'proposer', person: 'je', answer: 'je propose', distractors: ['tu proposes', 'il propose', 'nous proposons'] },
  { suffix: '02', infinitive: 'convenir', person: 'il/elle', answer: 'il convient / elle convient', distractors: ['je conviens', 'tu conviens', 'nous convenons'] },
  { suffix: '03', infinitive: 'accepter', person: 'nous', answer: 'nous acceptons', distractors: ['j’accepte', 'tu acceptes', 'ils acceptent'] },
  { suffix: '04', infinitive: 'préférer', person: 'vous', answer: 'vous préférez', distractors: ['je préfère', 'tu préfères', 'ils préfèrent'] },
  { suffix: '05', infinitive: 'refuser', person: 'il/elle', answer: 'il refuse / elle refuse', distractors: ['je refuse', 'tu refuses', 'nous refusons'] },
  { suffix: '06', infinitive: 'retenir', person: 'ils/elles', answer: 'ils retiennent / elles retiennent', distractors: ['je retiens', 'tu retiens', 'nous retenons'] },
])

const a17 = authored('a-17', [
  { suffix: '01', infinitive: 'être', person: 'je', answer: 'je suis', distractors: ['tu es', 'il est', 'nous sommes'] },
  { suffix: '02', infinitive: 'rester', person: 'nous', answer: 'nous restons', distractors: ['je reste', 'tu restes', 'ils restent'] },
  { suffix: '03', infinitive: 'joindre', person: 'vous', answer: 'vous joignez', distractors: ['je joins', 'tu joins', 'ils joignent'] },
  { suffix: '04', infinitive: 'pouvoir', person: 'il/elle', answer: 'il peut / elle peut', distractors: ['je peux', 'tu peux', 'nous pouvons'] },
  { suffix: '05', infinitive: 'travailler', person: 'ils/elles', answer: 'ils travaillent / elles travaillent', distractors: ['je travaille', 'tu travailles', 'nous travaillons'] },
  { suffix: '06', infinitive: 'avoir', person: 'vous', answer: 'vous avez', distractors: ["j’ai", 'tu as', 'ils ont'] },
])

const a18 = authored('a-18', [
  { suffix: '01', infinitive: 'souhaiter', person: 'nous', answer: 'nous souhaitons', distractors: ['je souhaite', 'tu souhaites', 'ils souhaitent'] },
  { suffix: '02', infinitive: 'préférer', person: 'il/elle', answer: 'il préfère / elle préfère', distractors: ['je préfère', 'tu préfères', 'nous préférons'] },
  { suffix: '03', infinitive: 'aimer', person: 'vous', answer: 'vous aimez', distractors: ['j’aime', 'tu aimes', 'ils aiment'] },
  { suffix: '04', infinitive: 'vouloir', person: 'ils/elles', answer: 'ils veulent / elles veulent', distractors: ['je veux', 'tu veux', 'nous voulons'] },
  { suffix: '05', infinitive: 'espérer', person: 'je', answer: 'j’espère', distractors: ['tu espères', 'il espère', 'nous espérons'] },
  { suffix: '06', infinitive: 'attendre', person: 'tu', answer: 'tu attends', distractors: ['j’attends', 'il attend', 'nous attendons'] },
])

const a19 = authored('a-19', [
  { suffix: '01', infinitive: 'être', person: 'il/elle', answer: 'il est / elle est', distractors: ['je suis', 'tu es', 'nous sommes'] },
  { suffix: '02', infinitive: 'coûter', person: 'il/elle', answer: 'il coûte / elle coûte', distractors: ['je coûte', 'tu coûtes', 'nous coûtons'] },
  { suffix: '03', infinitive: 'sembler', person: 'il/elle', answer: 'il semble / elle semble', distractors: ['je semble', 'tu sembles', 'nous semblons'] },
  { suffix: '04', infinitive: 'offrir', person: 'nous', answer: 'nous offrons', distractors: ['j’offre', 'tu offres', 'ils offrent'] },
  { suffix: '05', infinitive: 'donner', person: 'il/elle', answer: 'il donne / elle donne', distractors: ['je donne', 'tu donnes', 'nous donnons'] },
  { suffix: '06', infinitive: 'paraître', person: 'vous', answer: 'vous paraissez', distractors: ['je parais', 'tu parais', 'ils paraissent'] },
])

const a20 = authored('a-20', [
  { suffix: '01', infinitive: 'être', person: 'il/elle', answer: 'il est / elle est', distractors: ['je suis', 'tu es', 'nous sommes'] },
  { suffix: '02', infinitive: 'pouvoir', person: 'il/elle', answer: 'il peut / elle peut', distractors: ['je peux', 'tu peux', 'nous pouvons'] },
  { suffix: '03', infinitive: 'apprendre', person: 'il/elle', answer: 'il apprend / elle apprend', distractors: ['j’apprends', 'tu apprends', 'nous apprenons'] },
  { suffix: '04', infinitive: 'faire', person: 'il/elle', answer: 'il fait / elle fait', distractors: ['je fais', 'tu fais', 'nous faisons'] },
  { suffix: '05', infinitive: 'apprécier', person: 'nous', answer: 'nous apprécions', distractors: ['j’apprécie', 'tu apprécies', 'ils apprécient'] },
  { suffix: '06', infinitive: 's’adapter', person: 'ils/elles', answer: 'ils s’adaptent / elles s’adaptent', distractors: ['je m’adapte', 'tu t’adaptes', 'nous nous adaptons'] },
])

const a21 = authored('a-21', [
  { suffix: '01', infinitive: 'respecter', person: 'vous', answer: 'vous respectez', distractors: ['je respecte', 'tu respectes', 'ils respectent'] },
  { suffix: '02', infinitive: 'être', person: 'il/elle', answer: 'il est / elle est', distractors: ['je suis', 'tu es', 'nous sommes'] },
  { suffix: '03', infinitive: 'devoir', person: 'vous', answer: 'vous devez', distractors: ['je dois', 'tu dois', 'ils doivent'] },
  { suffix: '04', infinitive: 'obtenir', person: 'nous', answer: 'nous obtenons', distractors: ['j’obtiens', 'tu obtiens', 'ils obtiennent'] },
  { suffix: '05', infinitive: 'suivre', person: 'ils/elles', answer: 'ils suivent / elles suivent', distractors: ['je suis', 'tu suis', 'nous suivons'] },
  { suffix: '06', infinitive: 's’appliquer', person: 'il/elle', answer: 'il s’applique / elle s’applique', distractors: ['je m’applique', 'tu t’appliques', 'nous nous appliquons'] },
])

const a22 = authored('a-22', [
  { suffix: '01', infinitive: 'ouvrir', person: 'il/elle', answer: 'il ouvre / elle ouvre', distractors: ['j’ouvre', 'tu ouvres', 'nous ouvrons'] },
  { suffix: '02', infinitive: 'traiter', person: 'nous', answer: 'nous traitons', distractors: ['je traite', 'tu traites', 'ils traitent'] },
  { suffix: '03', infinitive: 'travailler', person: 'il/elle', answer: 'il travaille / elle travaille', distractors: ['je travaille', 'tu travailles', 'nous travaillons'] },
  { suffix: '04', infinitive: 'fonctionner', person: 'il/elle', answer: 'il fonctionne / elle fonctionne', distractors: ['je fonctionne', 'tu fonctionnes', 'nous fonctionnons'] },
  { suffix: '05', infinitive: 'prendre', person: 'il/elle', answer: 'il prend / elle prend', distractors: ['je prends', 'tu prends', 'nous prenons'] },
  { suffix: '06', infinitive: 'durer', person: 'il/elle', answer: 'il dure / elle dure', distractors: ['je dure', 'tu dures', 'nous durons'] },
])

export const conjugationsAExpansion2: ConjugationCard[] = [...a13, ...a14, ...a15, ...a16, ...a17, ...a18, ...a19, ...a20, ...a21, ...a22]
