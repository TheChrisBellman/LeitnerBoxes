import type { VocabularyPractice } from './types.ts'

type VocabularyRow = { lessonId: string; french: string; answer: string }

const normalize = (value: string) => value.trim().toLocaleLowerCase('fr').replace(/[‘’]/g, "'").replace(/\s+/g, ' ')
const keyFor = (row: VocabularyRow) => `${row.lessonId}|${normalize(row.french)}`

type RecognitionOptions = {
  promptLanguage?: 'fr' | 'en'
  context?: string
  contextLanguage?: 'fr' | 'en'
  answerLanguage?: 'fr' | 'en'
}

function recognition(
  prompt: string,
  answer: string,
  distractors: [string, string, string],
  feedback: string,
  help: string,
  options: RecognitionOptions = {},
): VocabularyPractice {
  return {
    kind: 'recognition',
    prompt,
    promptLanguage: options.promptLanguage ?? 'en',
    ...(options.context ? { context: options.context } : {}),
    ...(options.contextLanguage ? { contextLanguage: options.contextLanguage } : {}),
    answer,
    answerLanguage: options.answerLanguage ?? 'fr',
    distractors,
    feedback,
    help,
  }
}

const practices = new Map<string, VocabularyPractice>()
const add = (lessonId: string, french: string, practice: VocabularyPractice) => practices.set(`${lessonId}|${normalize(french)}`, practice)

const spellingExamples: Record<string, { answer: string; distractors: [string, string, string]; feedback: string; help: string }> = {
  'l’accent aigu': {
    answer: 'été',
    distractors: ['père', 'forêt', 'Noël'],
    feedback: '« Été » uses the acute accent: é.',
    help: 'The acute accent rises to the right and appears as ´ over a vowel.',
  },
  'l’accent grave': {
    answer: 'père',
    distractors: ['été', 'forêt', 'Noël'],
    feedback: '« Père » uses the grave accent: è.',
    help: 'The grave accent slopes down to the right; common forms include è, à, and ù.',
  },
  'l’accent circonflexe': {
    answer: 'forêt',
    distractors: ['été', 'père', 'Noël'],
    feedback: '« Forêt » uses the circumflex accent: ê.',
    help: 'The circumflex is the small roof-shaped mark: â, ê, î, ô, or û.',
  },
  'la cédille': {
    answer: 'leçon',
    distractors: ['bureau', 'pomme', 'réunion'],
    feedback: '« Leçon » uses a cedilla under c: ç.',
    help: 'A cedilla sits under c and gives it an s-like sound before a, o, or u.',
  },
  'le tréma': {
    answer: 'Noël',
    distractors: ['été', 'père', 'forêt'],
    feedback: '« Noël » uses a diaeresis over ë.',
    help: 'The diaeresis has two dots and shows that nearby vowels are pronounced separately.',
  },
  'le trait d’union': {
    answer: 'porte-monnaie',
    distractors: ['bureau', 'courriel', 'ordinateur'],
    feedback: '« Porte-monnaie » joins its two parts with a hyphen.',
    help: 'A hyphen joins parts of a compound word with a short horizontal line.',
  },
  'l’apostrophe': {
    answer: 'l’équipe',
    distractors: ['le bureau', 'une réunion', 'des notes'],
    feedback: '« L’équipe » uses an apostrophe where the article is shortened before a vowel.',
    help: 'An apostrophe marks a vowel that has been omitted in a contracted word.',
  },
  'la majuscule': {
    answer: 'Paris',
    distractors: ['bureau', 'rapport', 'équipe'],
    feedback: '« Paris » begins with a capital letter.',
    help: 'A capital letter is used at the beginning of a sentence and for proper names.',
  },
  'la minuscule': {
    answer: 'bureau',
    distractors: ['Paris', 'Nadia', 'Canada'],
    feedback: '« Bureau » begins with a lowercase letter.',
    help: 'A lowercase letter is the ordinary small form used when a capital is not required.',
  },
}
for (const [term, example] of Object.entries(spellingExamples)) {
  add('a-01', term, recognition(`Which example uses « ${term} »?`, example.answer, example.distractors, example.feedback, example.help))
}

const phonetics: Record<string, { answer: string; distractors: [string, string, string]; feedback: string; help: string }> = {
  'l’intonation': {
    answer: 'the rise and fall of the voice',
    distractors: ['the regular beat of speech', 'a mark over a vowel', 'a silent final letter'],
    feedback: 'Intonation is the rise and fall of the voice across an utterance.',
    help: 'Think about the pitch movement of a whole phrase, not a written mark.',
  },
  'l’accentuation': {
    answer: 'the stress placed on a syllable',
    distractors: ['the rise and fall of the voice', 'the regular beat of speech', 'a silent final letter'],
    feedback: 'Accentuation is the stress placed on one syllable or word.',
    help: 'It concerns which syllable stands out in speech.',
  },
  'le rythme': {
    answer: 'the regular pattern of beats in speech',
    distractors: ['the stress placed on a syllable', 'the rise and fall of the voice', 'a mark over a vowel'],
    feedback: 'Rhythm is the recurring pattern of beats and timing in speech.',
    help: 'It is the timing and beat pattern across a phrase.',
  },
  'la chute du e muet': {
    answer: 'dropping a silent e in connected speech',
    distractors: ['joining two words with a hyphen', 'stressing the final syllable', 'changing c to ç'],
    feedback: 'The phrase describes leaving out a silent e when people speak naturally.',
    help: 'It is a pronunciation change in connected speech, not a spelling mark.',
  },
  'l’assimilation': {
    answer: 'a sound becoming more like a neighboring sound',
    distractors: ['the regular pattern of beats in speech', 'dropping a silent e', 'the rise and fall of the voice'],
    feedback: 'Assimilation occurs when one sound becomes more like a nearby sound.',
    help: 'Listen for neighboring sounds influencing one another.',
  },
  'la liaison': {
    answer: 'pronouncing a normally silent final consonant before a following vowel',
    distractors: ['dropping a silent e in connected speech', 'stressing one syllable', 'joining two words with a hyphen'],
    feedback: 'A liaison links words by pronouncing a normally silent final consonant before a vowel sound.',
    help: 'It links spoken words; it is not the same thing as a written hyphen.',
  },
}
for (const [term, definition] of Object.entries(phonetics)) {
  add('a-04', term, recognition(`What does « ${term} » describe?`, definition.answer, definition.distractors, definition.feedback, definition.help, { answerLanguage: 'en' }))
}

const interrogativeForms: Record<string, { noun: string; agreement: string }> = {
  quel: { noun: 'dossier', agreement: 'masculine singular' },
  quelle: { noun: 'demande', agreement: 'feminine singular' },
  quels: { noun: 'documents', agreement: 'masculine plural' },
  quelles: { noun: 'personnes', agreement: 'feminine plural' },
}
for (const lessonId of ['a-01', 'a-02']) {
  for (const [form, detail] of Object.entries(interrogativeForms)) {
    if (lessonId === 'a-02' && form !== 'quel') continue
    add(lessonId, form, recognition(
      `Which form completes « ___ ${detail.noun} »?`,
      form,
      (Object.keys(interrogativeForms).filter((candidate) => candidate !== form).slice(0, 3)) as [string, string, string],
      `« ${form} » agrees with the ${detail.agreement} noun « ${detail.noun} ».`,
      'Question words agree with the noun that follows them in gender and number.',
    ))
  }
}

const articleExamples: Record<string, { phrase: string; forms: [string, string, string, string]; feedback: string }> = {
  le: { phrase: 'rapport', forms: ['le', 'la', 'l’', 'les'], feedback: '« Rapport » is masculine singular, so the definite article is « le ».' },
  la: { phrase: 'demande', forms: ['la', 'le', 'l’', 'les'], feedback: '« Demande » is feminine singular, so the definite article is « la ».' },
  'l’': { phrase: 'ordre du jour', forms: ['l’', 'le', 'la', 'les'], feedback: 'Before a vowel sound, « le » or « la » becomes « l’ »: l’ordre du jour.' },
  les: { phrase: 'documents', forms: ['les', 'le', 'la', 'l’'], feedback: '« Documents » is plural, so the definite article is « les ».' },
  un: { phrase: 'rapport', forms: ['un', 'une', 'des', 'du'], feedback: '« Rapport » is masculine singular, so the indefinite article is « un ».' },
  une: { phrase: 'demande', forms: ['une', 'un', 'des', 'du'], feedback: '« Demande » is feminine singular, so the indefinite article is « une ».' },
  des: { phrase: 'documents', forms: ['des', 'du', 'de la', 'de l’'], feedback: 'For an unspecified plural quantity, « documents » takes « des ».' },
  du: { phrase: 'matériel', forms: ['du', 'de la', 'de l’', 'des'], feedback: 'For an unspecified quantity of masculine « matériel », use « du ».' },
  'de la': { phrase: 'documentation', forms: ['de la', 'du', 'de l’', 'des'], feedback: 'For an unspecified quantity of feminine « documentation », use « de la ».' },
  'de l’': { phrase: 'information', forms: ['de l’', 'du', 'de la', 'des'], feedback: 'Before a vowel sound, « de la » becomes « de l’ »: de l’information.' },
  'pas de': { phrase: 'documents', forms: ['pas de', 'des', 'du', 'de la'], feedback: 'After a negative expression, the indefinite or partitive article becomes « pas de ».' },
}
for (const lessonId of ['a-02', 'a-12']) {
  for (const [form, detail] of Object.entries(articleExamples)) {
    if (lessonId === 'a-02' && form === 'pas de') continue
    if (lessonId === 'a-12' && !['du', 'de la', 'des', 'pas de'].includes(form)) continue
    const articleKind = ['le', 'la', 'l’', 'les'].includes(form)
      ? 'definite'
      : ['un', 'une'].includes(form)
        ? 'indefinite singular'
        : form === 'pas de'
          ? 'negative'
          : 'unspecified-quantity'
    const prompt = form === 'pas de'
      ? `Which negative form completes « Il n’y a ___ ${detail.phrase} »?`
      : `Which ${articleKind} article completes « ___ ${detail.phrase} »?`
    add(lessonId, form, recognition(
      prompt,
      form,
      detail.forms.filter((candidate) => candidate !== form).slice(0, 3) as [string, string, string],
      detail.feedback,
      'Articles agree with the noun or express whether the quantity is definite, indefinite, or partitive.',
    ))
  }
}

const contractions: Record<string, { formula: string; answer: string; feedback: string }> = {
  'à + le = au': { formula: 'à + le', answer: 'au', feedback: '« Au » is the contraction of « à + le ».' },
  'à + les = aux': { formula: 'à + les', answer: 'aux', feedback: '« Aux » is the contraction of « à + les ».' },
  'de + le = du': { formula: 'de + le', answer: 'du', feedback: '« Du » is the contraction of « de + le ».' },
  'de + les = des': { formula: 'de + les', answer: 'des', feedback: '« Des » is the contraction of « de + les ».' },
}
for (const [term, detail] of Object.entries(contractions)) {
  add('a-03', term, recognition(
    `Which form combines « ${detail.formula} »?`,
    detail.answer,
    (Object.values(contractions).map((candidate) => candidate.answer).filter((candidate) => candidate !== detail.answer).slice(0, 3)) as [string, string, string],
    detail.feedback,
    'French contracts common prepositions with definite articles; identify both parts before choosing the short form.',
  ))
}

const possessiveDeterminers: Record<string, { owner: string; noun: string; forms: string[] }> = {
  mon: { owner: 'my', noun: 'dossier', forms: ['mon', 'ma', 'mes', 'ton'] },
  ma: { owner: 'my', noun: 'demande', forms: ['mon', 'ma', 'mes', 'ta'] },
  mes: { owner: 'my', noun: 'documents', forms: ['mon', 'ma', 'mes', 'tes'] },
  ton: { owner: 'your (informal singular)', noun: 'dossier', forms: ['ton', 'ta', 'tes', 'mon'] },
  ta: { owner: 'your (informal singular)', noun: 'demande', forms: ['ton', 'ta', 'tes', 'ma'] },
  tes: { owner: 'your (informal singular)', noun: 'documents', forms: ['ton', 'ta', 'tes', 'mes'] },
  votre: { owner: 'your (formal singular)', noun: 'dossier', forms: ['votre', 'vos', 'mon', 'mes'] },
  vos: { owner: 'your (formal or plural)', noun: 'documents', forms: ['votre', 'vos', 'mon', 'mes'] },
  son: { owner: 'his, her, or its', noun: 'dossier', forms: ['son', 'sa', 'ses', 'ton'] },
  sa: { owner: 'his, her, or its', noun: 'demande', forms: ['son', 'sa', 'ses', 'ta'] },
  ses: { owner: 'his, her, or its', noun: 'documents', forms: ['son', 'sa', 'ses', 'tes'] },
  notre: { owner: 'our', noun: 'dossier', forms: ['notre', 'nos', 'mon', 'mes'] },
  nos: { owner: 'our', noun: 'documents', forms: ['notre', 'nos', 'mon', 'mes'] },
  leur: { owner: 'their', noun: 'dossier', forms: ['leur', 'leurs', 'mon', 'mes'] },
  leurs: { owner: 'their', noun: 'documents', forms: ['leur', 'leurs', 'mon', 'mes'] },
}
for (const [form, detail] of Object.entries(possessiveDeterminers)) {
  add('a-04', form, recognition(
    `Which form completes « ___ ${detail.noun} » for “${detail.owner}”?`,
    form,
    detail.forms.filter((candidate) => candidate !== form).slice(0, 3) as [string, string, string],
    `The possessive form « ${form} » matches the noun « ${detail.noun} » in gender and number.`,
    'Possessive determiners agree with the noun that follows, not with the person who owns it.',
  ))
}

const possessivePronouns: Record<string, { owner: string; noun: string; forms: string[] }> = {
  'le mien': { owner: 'mine', noun: 'dossier', forms: ['le mien', 'la mienne', 'les miens', 'les miennes'] },
  'la mienne': { owner: 'mine', noun: 'demande', forms: ['le mien', 'la mienne', 'les miens', 'les miennes'] },
  'les miens': { owner: 'mine', noun: 'documents', forms: ['le mien', 'la mienne', 'les miens', 'les miennes'] },
  'les miennes': { owner: 'mine', noun: 'notes', forms: ['le mien', 'la mienne', 'les miens', 'les miennes'] },
  'le tien': { owner: 'yours', noun: 'dossier', forms: ['le tien', 'la tienne', 'les tiens', 'les tiennes'] },
  'la tienne': { owner: 'yours', noun: 'demande', forms: ['le tien', 'la tienne', 'les tiens', 'les tiennes'] },
  'les tiens': { owner: 'yours', noun: 'documents', forms: ['le tien', 'la tienne', 'les tiens', 'les tiennes'] },
  'les tiennes': { owner: 'yours', noun: 'notes', forms: ['le tien', 'la tienne', 'les tiens', 'les tiennes'] },
  'le vôtre': { owner: 'yours (formal)', noun: 'dossier', forms: ['le vôtre', 'la vôtre', 'les vôtres', 'le tien'] },
  'la vôtre': { owner: 'yours (formal)', noun: 'demande', forms: ['le vôtre', 'la vôtre', 'les vôtres', 'la tienne'] },
  'les vôtres': { owner: 'yours (formal)', noun: 'documents', forms: ['le vôtre', 'la vôtre', 'les vôtres', 'les tiens'] },
  'le sien': { owner: 'his, hers, or its', noun: 'dossier', forms: ['le sien', 'la sienne', 'les siens', 'les siennes'] },
  'la sienne': { owner: 'his, hers, or its', noun: 'demande', forms: ['le sien', 'la sienne', 'les siens', 'les siennes'] },
  'les siens': { owner: 'his, hers, or its', noun: 'documents', forms: ['le sien', 'la sienne', 'les siens', 'les siennes'] },
  'les siennes': { owner: 'his, hers, or its', noun: 'notes', forms: ['le sien', 'la sienne', 'les siens', 'les siennes'] },
  'le nôtre': { owner: 'ours', noun: 'dossier', forms: ['le nôtre', 'la nôtre', 'les nôtres', 'le mien'] },
  'la nôtre': { owner: 'ours', noun: 'demande', forms: ['le nôtre', 'la nôtre', 'les nôtres', 'la mienne'] },
  'les nôtres': { owner: 'ours', noun: 'documents', forms: ['le nôtre', 'la nôtre', 'les nôtres', 'les miens'] },
  'le leur': { owner: 'theirs', noun: 'dossier', forms: ['le leur', 'la leur', 'les leurs', 'le nôtre'] },
  'la leur': { owner: 'theirs', noun: 'demande', forms: ['le leur', 'la leur', 'les leurs', 'la nôtre'] },
  'les leurs': { owner: 'theirs', noun: 'documents', forms: ['le leur', 'la leur', 'les leurs', 'les nôtres'] },
}
for (const [form, detail] of Object.entries(possessivePronouns)) {
  const agreement = /^le\b/u.test(form) ? 'masculine singular' : /^la\b/u.test(form) ? 'feminine singular' : /miennes|tiennes|siennes\b/u.test(form) ? 'feminine plural' : 'plural'
  add('a-04', form, recognition(
    `Which form means “${detail.owner}” for a ${agreement} item?`,
    form,
    detail.forms.filter((candidate) => candidate !== form).slice(0, 3) as [string, string, string],
    `The possessive pronoun « ${form} » agrees with the item it replaces.`,
    'Possessive pronouns replace a noun and agree with that noun in gender and number.',
  ))
}

const subjectForms: Array<{ lessonId: string; forms: string[]; verb: string; noun: string; subjects: Record<string, string> }> = [
  {
    lessonId: 'a-01',
    forms: ['je suis', 'tu es', 'il est', 'elle est', 'on est', 'nous sommes', 'vous êtes', 'ils sont', 'elles sont'],
    verb: 'être',
    noun: 'responsable',
    subjects: { 'je suis': 'I', 'tu es': 'you (informal singular)', 'il est': 'he', 'elle est': 'she', 'on est': 'we (informal)', 'nous sommes': 'we', 'vous êtes': 'you (formal or plural)', 'ils sont': 'they (masculine or mixed)', 'elles sont': 'they (feminine)' },
  },
  {
    lessonId: 'a-04',
    forms: ['j’ai', 'tu as', 'il a', 'elle a', 'on a', 'nous avons', 'vous avez', 'ils ont', 'elles ont'],
    verb: 'avoir',
    noun: 'un dossier',
    subjects: { 'j’ai': 'I', 'tu as': 'you (informal singular)', 'il a': 'he', 'elle a': 'she', 'on a': 'we (informal)', 'nous avons': 'we', 'vous avez': 'you (formal or plural)', 'ils ont': 'they (masculine or mixed)', 'elles ont': 'they (feminine)' },
  },
]
for (const group of subjectForms) {
  for (const form of group.forms) {
    const detail = group.subjects[form]
    add(group.lessonId, form, recognition(
      `Which form completes « ___ ${group.noun} » for “${detail}”?`,
      form,
      group.forms.filter((candidate) => candidate !== form).slice(0, 3) as [string, string, string],
      `The subject « ${detail} » takes « ${form} » in the present tense of ${group.verb}.`,
      'The subject determines the present-tense form; keep the subject and verb together.',
    ))
  }
}
const êtreCopula: Record<string, { phrase: string; subject: string }> = {
  'c’est': { phrase: '___ le rapport', subject: 'one item' },
  'ce sont': { phrase: '___ les rapports', subject: 'several items' },
}
for (const [form, detail] of Object.entries(êtreCopula)) {
  add('a-01', form, recognition(
    `Which form completes « ${detail.phrase} » for ${detail.subject}?`,
    form,
    (Object.keys(êtreCopula).filter((candidate) => candidate !== form).concat(['je suis', 'tu es'])) as [string, string, string],
    `Use the ${detail.subject} form of être in the present tense.`,
    'The subject and the number of the item determine the present-tense form.',
  ))
  add('a-04', form, recognition(
    `Which form completes « ${detail.phrase} » for ${detail.subject}?`,
    form,
    (Object.keys(êtreCopula).filter((candidate) => candidate !== form).concat(['je suis', 'tu es'])) as [string, string, string],
    `Use the ${detail.subject} form of être in the present tense.`,
    'The subject and the number of the item determine the present-tense form.',
  ))
  add('a-02', form, recognition(
    `Which form completes « ${detail.phrase} » for ${detail.subject}?`,
    form,
    (Object.keys(êtreCopula).filter((candidate) => candidate !== form).concat(['je suis', 'tu es'])) as [string, string, string],
    `Use the ${detail.subject} form of être in the present tense.`,
    'The subject and the number of the item determine the present-tense form.',
  ))
  add('a-05', form, recognition(
    `Which form completes « ${detail.phrase} » for ${detail.subject}?`,
    form,
    (Object.keys(êtreCopula).filter((candidate) => candidate !== form).concat(['je suis', 'tu es'])) as [string, string, string],
    `Use the ${detail.subject} form of être in the present tense.`,
    'The subject and the number of the item determine the present-tense form.',
  ))
}

const questionWords: Record<string, { prompt: string; feedback: string }> = {
  qui: { prompt: 'Which word asks about a person?', feedback: '« Qui » asks who or which person.' },
  quoi: { prompt: 'Which word asks “what” in « C’est ___? »?', feedback: '« Quoi » asks what in an informal question such as « C’est quoi? ».' },
}
for (const [form, detail] of Object.entries(questionWords)) {
  add(form === 'qui' ? 'a-01' : 'a-02', form, recognition(
    detail.prompt,
    form,
    (Object.keys(questionWords).filter((candidate) => candidate !== form).concat(['où', 'quand'])) as [string, string, string],
    detail.feedback,
    'Question words have different jobs; choose the one that matches the person or thing being asked about.',
  ))
}
add('a-01', 'de la part de qui', recognition(
  'Which phrase asks who is calling?',
  'de la part de qui',
  ['qui est-ce?', 'qu’est-ce que c’est?', 'où est-ce?'],
  '« De la part de qui? » asks who is calling or who sent someone.',
  'This phone phrase asks for the caller’s identity.',
))
add('a-02', 'ça s’appelle', recognition(
  'Which phrase says “it is called” before a name?',
  'ça s’appelle',
  ['c’est', 'ce sont', 'qu’est-ce que c’est?'],
  '« Ça s’appelle » introduces the name of something.',
  'Use this phrase to name or identify something, not simply to say what it is.',
))

const shortPrepositions: Record<string, { lessonId: string; prompt: string; answer: string; distractors: [string, string, string]; feedback: string; help: string }> = {
  'a-04|de': {
    lessonId: 'a-04', prompt: 'Which preposition shows possession in « Le dossier ___ Nadia »?', answer: 'de', distractors: ['à', 'par', 'pour'],
    feedback: '« Le dossier de Nadia » shows that the dossier belongs to or is associated with Nadia.', help: 'Use the possessive preposition to connect a thing with its owner or source.',
  },
  'a-07|à': {
    lessonId: 'a-07', prompt: 'Which preposition fits « Je vais ___ la réunion »?', answer: 'à', distractors: ['de', 'par', 'pour'],
    feedback: '« Je vais à la réunion » uses « à » for the destination or event.', help: 'This short preposition can mark a destination, place, or event.',
  },
  'a-26|à': {
    lessonId: 'a-26', prompt: 'Which preposition fits « Je vais ___ Ottawa »?', answer: 'à', distractors: ['de', 'par', 'pour'],
    feedback: '« Je vais à Ottawa » uses the destination preposition before a city.', help: 'Before a city, use the destination preposition to mark where someone is going.',
  },
  'a-07|y': {
    lessonId: 'a-07', prompt: 'In « J’y vais », what does « y » refer to?', answer: 'there', distractors: ['here', 'that person', 'what'],
    feedback: 'Here « y » replaces a place: « J’y vais » means “I’m going there.”', help: '« Y » often replaces a previously mentioned place.',
  },
  'a-11|par': {
    lessonId: 'a-11', prompt: 'Which preposition means “by” in « envoyé ___ courriel »?', answer: 'par', distractors: ['à', 'de', 'avec'],
    feedback: '« Envoyé par courriel » means sent by email.', help: 'Use the preposition that introduces a means or method in this kind of phrase.',
  },
  'a-24|comme': {
    lessonId: 'a-24', prompt: 'Which word fits « ___ prévu, la réunion commence à neuf heures »?', answer: 'comme', distractors: ['quand', 'bien que', 'pourvu que'],
    feedback: '« Comme prévu » means as planned.', help: 'Here the word means as or in the manner expected.',
  },
}
for (const [key, detail] of Object.entries(shortPrepositions)) {
  const [, form] = key.split('|')
  add(detail.lessonId, form, recognition(detail.prompt, detail.answer, detail.distractors, detail.feedback, detail.help))
}

const timeExpressions: Array<{ lessonId: string; form: string; prompt: string; answer: string; distractors: [string, string, string]; feedback: string; help: string; answerLanguage?: 'fr' | 'en' }> = [
  {
    lessonId: 'a-05', form: 'il y a', prompt: 'Which phrase says that something exists: « ___ un dossier sur la table »?', answer: 'il y a', distractors: ['c’est', 'ce sont', 'ça s’appelle'],
    feedback: '« Il y a un dossier » means that there is a file.', help: 'Use this phrase to say that something exists or is present.',
  },
  {
    lessonId: 'a-13', form: 'il y a', prompt: 'In « Il y a deux heures », what does the phrase express?', answer: 'ago', distractors: ['there is or there are', 'it is', 'it has been'],
    feedback: 'With a time period before it, « il y a » means ago.', help: 'A time expression can turn this phrase into a reference to the past.', answerLanguage: 'en',
  },
  {
    lessonId: 'a-13', form: 'ça fait', prompt: 'In « Ça fait deux heures que nous travaillons », what does the phrase express?', answer: 'it has been', distractors: ['ago', 'there is or there are', 'it is'],
    feedback: '« Ça fait deux heures que… » means it has been two hours since the action began.', help: 'This pattern measures the duration of an action that is still continuing.', answerLanguage: 'en',
  },
  {
    lessonId: 'a-17', form: 'il y a', prompt: 'Which phrase says that something exists or is present?', answer: 'il y a', distractors: ['c’est', 'ce sont', 'ça s’appelle'],
    feedback: '« Il y a » means there is or there are.', help: 'Use this phrase to introduce something that exists or is present.',
  },
  {
    lessonId: 'a-22', form: 'ça fait', prompt: 'In « Ça fait trois jours que le dossier est prêt », what does the phrase express?', answer: 'it has been', distractors: ['ago', 'there is or there are', 'it is'],
    feedback: 'This pattern says that three days have elapsed since the dossier became ready.', help: 'This pattern measures elapsed time from a past event to now.', answerLanguage: 'en',
  },
]
for (const detail of timeExpressions) add(detail.lessonId, detail.form, recognition(detail.prompt, detail.answer, detail.distractors, detail.feedback, detail.help, { answerLanguage: detail.answerLanguage }))

const demonstrativeAdjectives: Record<string, { phrase: string; feedback: string }> = {
  ce: { phrase: '___ dossier', feedback: 'Use « ce » before a masculine singular noun beginning with a consonant.' },
  cet: { phrase: '___ ordre du jour', feedback: 'Use « cet » before a masculine singular noun beginning with a vowel sound.' },
  cette: { phrase: '___ demande', feedback: 'Use « cette » before a feminine singular noun.' },
  ces: { phrase: '___ documents', feedback: 'Use « ces » before a plural noun.' },
}
for (const [form, detail] of Object.entries(demonstrativeAdjectives)) {
  add('a-06', form, recognition(
    `Which form completes « ${detail.phrase} »?`,
    form,
    (Object.keys(demonstrativeAdjectives).filter((candidate) => candidate !== form)) as [string, string, string],
    detail.feedback,
    'Demonstrative adjectives agree with the noun in gender and number; a different form is used before a vowel sound.'
  ))
}
const demonstrativePronouns: Record<string, { description: string; noun: string }> = {
  'celui-ci': { description: 'this masculine singular one', noun: 'dossier' },
  'celui-là': { description: 'that masculine singular one', noun: 'dossier' },
  'celle-ci': { description: 'this feminine singular one', noun: 'demande' },
  'celle-là': { description: 'that feminine singular one', noun: 'demande' },
  'ceux-ci': { description: 'these masculine or mixed plural ones', noun: 'documents' },
  'ceux-là': { description: 'those masculine or mixed plural ones', noun: 'documents' },
  'celles-ci': { description: 'these feminine plural ones', noun: 'notes' },
  'celles-là': { description: 'those feminine plural ones', noun: 'notes' },
}
for (const [form, detail] of Object.entries(demonstrativePronouns)) {
  add('a-06', form, recognition(
    `Which form means “${detail.description}” when referring to ${detail.noun}?`,
    form,
    (Object.keys(demonstrativePronouns).filter((candidate) => candidate !== form).slice(0, 3)) as [string, string, string],
    `« ${form} » matches the gender, number, and distance indicated by the prompt.`,
    'Demonstrative pronouns agree with the noun they replace; -ci is near and -là is farther away.',
  ))
}
const neutralDemonstratives: Record<string, { prompt: string; feedback: string }> = {
  ça: { prompt: 'Which informal neutral form appears in « ___ va »?', feedback: '« Ça » is the informal neutral demonstrative used in « Ça va ». ' },
  ceci: { prompt: 'Which neutral form points to something being introduced: « ___ est important »?', feedback: '« Ceci » points forward to something being introduced.' },
  cela: { prompt: 'Which neutral form refers back to something: « ___ est clair »?', feedback: '« Cela » commonly refers back to something already mentioned.' },
}
for (const [form, detail] of Object.entries(neutralDemonstratives)) {
  add('a-06', form, recognition(
    detail.prompt,
    form,
    (Object.keys(neutralDemonstratives).filter((candidate) => candidate !== form).concat(['ce']).slice(0, 3)) as [string, string, string],
    detail.feedback,
    'Neutral demonstratives refer to an idea or situation rather than agreeing with a named noun.',
  ))
}

const quantities: Record<string, { prompt: string; noun: string; feedback: string }> = {
  'beaucoup de': { prompt: 'Which phrase describes a large quantity?', noun: 'dossiers', feedback: '« Beaucoup de » means a large quantity of dossiers.' },
  'peu de': { prompt: 'Which phrase describes a small quantity?', noun: 'temps', feedback: '« Peu de » means a small quantity of time.' },
  'un peu': { prompt: 'Which phrase means a small amount in « J’ai ___ de temps »?', noun: 'temps', feedback: '« Un peu » introduces a small amount.' },
  'un peu de': { prompt: 'Which phrase means a small amount of something?', noun: 'temps', feedback: '« Un peu de » means a small amount of time.' },
  'un bon nombre de': { prompt: 'Which phrase means a good number of items?', noun: 'dossiers', feedback: '« Un bon nombre de » means a good number of dossiers.' },
  'un certain nombre de': { prompt: 'Which phrase means an unspecified number of items?', noun: 'dossiers', feedback: '« Un certain nombre de » means a number of dossiers without specifying the exact count.' },
  'un grand nombre de': { prompt: 'Which phrase means a great number of items?', noun: 'dossiers', feedback: '« Un grand nombre de » means a great number of dossiers.' },
  'une dizaine': { prompt: 'Which phrase means about ten?', noun: 'dossiers', feedback: '« Une dizaine » means about ten dossiers.' },
  'une vingtaine': { prompt: 'Which phrase means about twenty?', noun: 'dossiers', feedback: '« Une vingtaine » means about twenty dossiers.' },
  'une trentaine': { prompt: 'Which phrase means about thirty?', noun: 'dossiers', feedback: '« Une trentaine » means about thirty dossiers.' },
  'une cinquantaine': { prompt: 'Which phrase means about fifty?', noun: 'dossiers', feedback: '« Une cinquantaine » means about fifty dossiers.' },
  'un millier': { prompt: 'Which phrase means about one thousand?', noun: 'dossiers', feedback: '« Un millier » means about one thousand dossiers.' },
  quelques: { prompt: 'Which word means a few?', noun: 'dossiers', feedback: '« Quelques » means a few dossiers and comes before a plural noun.' },
  'quelques-uns': { prompt: 'Which pronoun means a few of them?', noun: 'dossiers', feedback: '« Quelques-uns » replaces a plural masculine or mixed group.' },
  plusieurs: { prompt: 'Which word means several?', noun: 'dossiers', feedback: '« Plusieurs » means several dossiers.' },
}
const quantityForms = Object.keys(quantities)
for (const [form, detail] of Object.entries(quantities)) {
  const lessons = ['a-12', 'a-06', 'a-11', 'a-22'].filter((lessonId) => {
    if (lessonId === 'a-12') return ['beaucoup de', 'peu de', 'un bon nombre de', 'un certain nombre de', 'un grand nombre de', 'quelques', 'quelques-uns', 'plusieurs', 'un peu de'].includes(form)
    if (lessonId === 'a-06') return form === 'une vingtaine'
    if (lessonId === 'a-11') return form === 'un peu'
    return form === 'une dizaine'
  })
  lessons.forEach((lessonId) => add(lessonId, form, recognition(
    detail.prompt,
    form,
    quantityForms.filter((candidate) => candidate !== form).slice(0, 3) as [string, string, string],
    detail.feedback,
    'Quantity words tell how much or how many; check whether the noun is singular, plural, or omitted.',
  )))
}

const tenses: Record<string, { prompt: string; feedback: string }> = {
  'passé composé': { prompt: 'Which tense commonly presents a completed past event?', feedback: 'The passé composé commonly presents a completed past event.' },
  imparfait: { prompt: 'Which tense commonly describes a past habit or background situation?', feedback: 'The imparfait commonly describes a past habit or background situation.' },
  'futur simple': { prompt: 'Which tense presents a future event without the near-future « aller » pattern?', feedback: 'The futur simple presents a future event directly.' },
  'futur proche': { prompt: 'Which tense uses a present form of « aller » plus an infinitive for the near future?', feedback: 'The futur proche uses « aller » in the present plus an infinitive.' },
}
for (const [form, detail] of Object.entries(tenses)) {
  add('a-09', form, recognition(
    detail.prompt,
    form,
    (Object.keys(tenses).filter((candidate) => candidate !== form)) as [string, string, string],
    detail.feedback,
    'Choose the tense by its time frame and use, not by a word-for-word English label.',
  ))
}

const advancedGrammar: Record<string, { prompt: string; feedback: string }> = {
  'le conditionnel passé': { prompt: 'Which form can express an unrealized past wish or hypothetical result?', feedback: 'The conditionnel passé frames a past possibility, regret, or hypothetical result.' },
  'interrogation indirecte': { prompt: 'Which term names a question reported inside another sentence?', feedback: 'An interrogation indirecte reports a question instead of asking it directly.' },
  'style indirect': { prompt: 'Which term names reported speech rather than a direct quotation?', feedback: 'Style indirect reports someone’s words without quoting them directly.' },
}
for (const [form, detail] of Object.entries(advancedGrammar)) {
  add('a-31', form, recognition(
    detail.prompt,
    form,
    (Object.keys(advancedGrammar).filter((candidate) => candidate !== form).concat(['le futur proche']).slice(0, 3)) as [string, string, string],
    detail.feedback,
    'These labels describe how a sentence is built or reported; use the definition and context together.',
  ))
}

add('a-18', 'aimer au conditionnel', recognition(
  'Which form politely expresses a preference or wish?',
  'j’aimerais',
  ['j’aime', 'j’aimais', 'j’aimerai'],
  '« J’aimerais » is the conditional form used for a polite preference or wish.',
  'The conditional softens a request or presents a wish; it is not the same as the present or future.',
))

add('a-08', 'près de', recognition(
  'In « La réunion commence dans près de dix minutes », what does « près de » express?',
  'almost / close to',
  ['exactly', 'after', 'instead of'],
  'Here « près de » means almost or close to ten minutes.',
  'This expression changes meaning with context; before a quantity or time, it means nearly or close to.',
  { answerLanguage: 'en' },
))
add('a-08', 'vers', recognition(
  'Which phrase fits « La réunion commence ___ trois heures »?',
  'vers',
  ['près de', 'à quelle heure', 'en quelle saison'],
  '« Vers trois heures » means around three o’clock.',
  'For an approximate clock time, use the short preposition meaning around or about.'
))
add('a-22', 'une tranche de', recognition(
  'Which phrase means “a portion of” a report or budget?',
  'une tranche de',
  ['une dizaine de', 'beaucoup de', 'peu de'],
  '« Une tranche de » means a portion or section of something.',
  'This expression names a portion; it is not a count such as ten or a quantity such as a little.',
))
add('a-17', 'à la disposition de', recognition(
  'Which phrase says that information is available for a colleague to use?',
  'à la disposition de',
  ['à la demande de', 'au moyen de', 'en avance'],
  '« À la disposition de » says that something is available for someone to use.',
  'This phrase describes availability for a person, not a request or a method.',
))

export const vocabularyPracticeKeys = new Set(practices.keys())

export function vocabularyPracticeFor(row: VocabularyRow): VocabularyPractice | undefined {
  return practices.get(keyFor(row))
}

export function requiresVocabularyPractice(row: VocabularyRow): boolean {
  const french = normalize(row.french)
  const answer = normalize(row.answer)
  const spelling = row.lessonId === 'a-01' && /accent|cédille|tréma|trait d'union|apostrophe|majuscule|minuscule/iu.test(french)
  const phonetics = row.lessonId === 'a-04' && /intonation|accentuation|rythme|chute du e|assimilation|liaison/iu.test(french)
  return practices.has(keyFor(row)) || spelling || phonetics
    || /masculine singular|feminine singular|masculine plural|feminine plural|perfect tense|imperfect tense|future tense|immediate future|conditional|indirect question|indirect speech/iu.test(answer)
    || /^a-0[12]\|(?:le|la|l['’]|les|un|une|des|du|de la|de l['’])$/iu.test(`${row.lessonId}|${french}`)
}
