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

const a04 = authored('a-04', [
  { suffix: '01', infinitive: 'avoir', person: 'vous', answer: 'vous avez', distractors: ["j’ai", 'tu as', 'ils ont'] },
  { suffix: '02', infinitive: 'appartenir', person: 'il/elle', answer: 'il appartient / elle appartient', distractors: ['j’appartiens', 'tu appartiens', 'nous appartenons'] },
  { suffix: '03', infinitive: 'garder', person: 'je', answer: 'je garde', distractors: ['tu gardes', 'il garde', 'nous gardons'] },
  { suffix: '04', infinitive: 'partager', person: 'nous', answer: 'nous partageons', distractors: ['je partage', 'tu partages', 'ils partagent'] },
  { suffix: '05', infinitive: 'rendre', person: 'vous', answer: 'vous rendez', distractors: ['je rends', 'il rend', 'nous rendons'] },
  { suffix: '06', infinitive: 'devoir', person: 'tu', answer: 'tu dois', distractors: ['je dois', 'il doit', 'nous devons'] },
])

const a05 = authored('a-05', [
  { suffix: '01', infinitive: 'se trouver', person: 'il/elle', answer: 'il se trouve / elle se trouve', distractors: ['je me trouve', 'tu te trouves', 'nous nous trouvons'] },
  { suffix: '02', infinitive: 'être', person: 'vous', answer: 'vous êtes', distractors: ['je suis', 'tu es', 'ils sont'] },
  { suffix: '03', infinitive: 'tourner', person: 'tu', answer: 'tu tournes', distractors: ['je tourne', 'il tourne', 'vous tournez'] },
  { suffix: '04', infinitive: 'passer', person: 'je', answer: 'je passe', distractors: ['tu passes', 'il passe', 'nous passons'] },
  { suffix: '05', infinitive: 'aller', person: 'nous', answer: 'nous allons', distractors: ['je vais', 'tu vas', 'ils vont'] },
  { suffix: '06', infinitive: 'attendre', person: 'ils/elles', answer: 'ils attendent / elles attendent', distractors: ['j’attends', 'tu attends', 'nous attendons'] },
])

const a06 = authored('a-06', [
  { suffix: '01', infinitive: 'coûter', person: 'il/elle', answer: 'il coûte / elle coûte', distractors: ['je coûte', 'tu coûtes', 'nous coûtons'] },
  { suffix: '02', infinitive: 'augmenter', person: 'il/elle', answer: 'il augmente / elle augmente', distractors: ['j’augmente', 'tu augmentes', 'nous augmentons'] },
  { suffix: '03', infinitive: 'rester', person: 'il/elle', answer: 'il reste / elle reste', distractors: ['je reste', 'tu restes', 'nous restons'] },
  { suffix: '04', infinitive: 'compter', person: 'il/elle', answer: 'il compte / elle compte', distractors: ['je compte', 'tu comptes', 'nous comptons'] },
  { suffix: '05', infinitive: 'durer', person: 'il/elle', answer: 'il dure / elle dure', distractors: ['je dure', 'tu dures', 'nous durons'] },
  { suffix: '06', infinitive: 'être', person: 'il/elle', answer: 'il est / elle est', distractors: ['je suis', 'tu es', 'nous sommes'] },
])

const a07 = authored('a-07', [
  { suffix: '01', infinitive: 'continuer', person: 'vous', answer: 'vous continuez', distractors: ['je continue', 'tu continues', 'ils continuent'] },
  { suffix: '02', infinitive: 'prendre', person: 'tu', answer: 'tu prends', distractors: ['je prends', 'il prend', 'nous prenons'] },
  { suffix: '03', infinitive: 'descendre', person: 'nous', answer: 'nous descendons', distractors: ['je descends', 'tu descends', 'ils descendent'] },
  { suffix: '04', infinitive: 'suivre', person: 'ils/elles', answer: 'ils suivent / elles suivent', distractors: ['je suis', 'tu suis', 'nous suivons'] },
  { suffix: '05', infinitive: 'attendre', person: 'je', answer: 'j’attends', distractors: ['tu attends', 'il attend', 'nous attendons'] },
  { suffix: '06', infinitive: 'revenir', person: 'il/elle', answer: 'il revient / elle revient', distractors: ['je reviens', 'tu reviens', 'nous revenons'] },
])

const a08 = authored('a-08', [
  { suffix: '01', infinitive: 'commencer', person: 'il/elle', answer: 'il commence / elle commence', distractors: ['je commence', 'tu commences', 'nous commençons'] },
  { suffix: '02', infinitive: 'revoir', person: 'vous', answer: 'vous revoyez', distractors: ['je revois', 'tu revois', 'ils revoient'] },
  { suffix: '03', infinitive: 'arriver', person: 'vous', answer: 'vous arrivez', distractors: ['j’arrive', 'tu arrives', 'ils arrivent'] },
  { suffix: '04', infinitive: 'être', person: 'il/elle', answer: 'il est / elle est', distractors: ['je suis', 'tu es', 'nous sommes'] },
  { suffix: '05', infinitive: 'fermer', person: 'il/elle', answer: 'il ferme / elle ferme', distractors: ['je ferme', 'tu fermes', 'nous fermons'] },
  { suffix: '06', infinitive: 'envoyer', person: 'vous', answer: 'vous envoyez', distractors: ['j’envoie', 'tu envoies', 'ils envoient'] },
])

const a09 = authored('a-09', [
  { suffix: '01', infinitive: 'terminer', person: 'nous', answer: 'nous terminons', distractors: ['je termine', 'tu termines', 'ils terminent'] },
  { suffix: '02', infinitive: 'travailler', person: 'il/elle', answer: 'il travaille / elle travaille', distractors: ['je travaille', 'tu travailles', 'nous travaillons'] },
  { suffix: '03', infinitive: 'ouvrir', person: 'il/elle', answer: 'il ouvre / elle ouvre', distractors: ['j’ouvre', 'tu ouvres', 'nous ouvrons'] },
  { suffix: '04', infinitive: 'commencer', person: 'ils/elles', answer: 'ils commencent / elles commencent', distractors: ['je commence', 'tu commences', 'nous commençons'] },
  { suffix: '05', infinitive: 'fonctionner', person: 'il/elle', answer: 'il fonctionne / elle fonctionne', distractors: ['je fonctionne', 'tu fonctionnes', 'nous fonctionnons'] },
  { suffix: '06', infinitive: 'changer', person: 'vous', answer: 'vous changez', distractors: ['je change', 'tu changes', 'ils changent'] },
])

const a10 = authored('a-10', [
  { suffix: '01', infinitive: 'confier', person: 'je', answer: 'je confie', distractors: ['tu confies', 'il confie', 'nous confions'] },
  { suffix: '02', infinitive: 'désigner', person: 'il/elle', answer: 'il désigne / elle désigne', distractors: ['je désigne', 'tu désignes', 'nous désignons'] },
  { suffix: '03', infinitive: 'prendre', person: 'vous', answer: 'vous prenez', distractors: ['je prends', 'tu prends', 'ils prennent'] },
  { suffix: '04', infinitive: 'recevoir', person: 'ils/elles', answer: 'ils reçoivent / elles reçoivent', distractors: ['je reçois', 'tu reçois', 'nous recevons'] },
  { suffix: '05', infinitive: 'remplacer', person: 'tu', answer: 'tu remplaces', distractors: ['je remplace', 'il remplace', 'vous remplacez'] },
  { suffix: '06', infinitive: 'informer', person: 'nous', answer: 'nous informons', distractors: ['j’informe', 'tu informes', 'ils informent'] },
])

const a11 = authored('a-11', [
  { suffix: '01', infinitive: 'lire', person: 'vous', answer: 'vous lisez', distractors: ['je lis', 'tu lis', 'ils lisent'] },
  { suffix: '02', infinitive: 'signer', person: 'je', answer: 'je signe', distractors: ['tu signes', 'il signe', 'nous signons'] },
  { suffix: '03', infinitive: 'vérifier', person: 'tu', answer: 'tu vérifies', distractors: ['je vérifie', 'il vérifie', 'vous vérifiez'] },
  { suffix: '04', infinitive: 'conserver', person: 'il/elle', answer: 'il conserve / elle conserve', distractors: ['je conserve', 'tu conserves', 'nous conservons'] },
  { suffix: '05', infinitive: 'utiliser', person: 'nous', answer: 'nous utilisons', distractors: ['j’utilise', 'tu utilises', 'ils utilisent'] },
  { suffix: '06', infinitive: 'remplir', person: 'ils/elles', answer: 'ils remplissent / elles remplissent', distractors: ['je remplis', 'tu remplis', 'nous remplissons'] },
])

const a12 = authored('a-12', [
  { suffix: '01', infinitive: 'distribuer', person: 'vous', answer: 'vous distribuez', distractors: ['je distribue', 'tu distribues', 'ils distribuent'] },
  { suffix: '02', infinitive: 'recevoir', person: 'il/elle', answer: 'il reçoit / elle reçoit', distractors: ['je reçois', 'tu reçois', 'nous recevons'] },
  { suffix: '03', infinitive: 'partager', person: 'nous', answer: 'nous partageons', distractors: ['je partage', 'tu partages', 'ils partagent'] },
  { suffix: '04', infinitive: 'se relayer', person: 'ils/elles', answer: 'ils se relaient / elles se relaient', distractors: ['je me relaie', 'tu te relaies', 'nous nous relayons'] },
  { suffix: '05', infinitive: 'rester', person: 'ils/elles', answer: 'ils restent / elles restent', distractors: ['je reste', 'tu restes', 'nous restons'] },
  { suffix: '06', infinitive: 'répartir', person: 'je', answer: 'je répartis', distractors: ['tu répartis', 'il répartit', 'nous répartissons'] },
])

export const conjugationsAExpansion1: ConjugationCard[] = [...a04, ...a05, ...a06, ...a07, ...a08, ...a09, ...a10, ...a11, ...a12]
