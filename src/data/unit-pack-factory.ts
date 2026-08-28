import type {
  AuthoredExercise,
  BestResponseExercise,
  ContextualClozeExercise,
  CorrectionExercise,
  Passage,
  Scenario,
  TransformationExercise,
} from './types.ts'

type ChoiceSet = [string, string, string]

export type UnitPackScaffold = {
  context: string
  clozePrompt: string
  clozeAnswer: string
  clozeDistractors: ChoiceSet
  transformationSource: string
  transformationAnswer: string
}

export type UnitPackSeed = {
  unitId: string
  topic: string
  goal: string
  action: string
  imperative: string
  result: string
  decision: string
  correctionWrong: string
  correctionRight: string
  transformationSource: string
  transformationAnswer: string
  scaffold?: UnitPackScaffold
}

export type UnitPack = {
  exercises: AuthoredExercise[]
  passages: Passage[]
  scenarios: Scenario[]
}

function ids(unitId: string) {
  const base = `${unitId}-unit-pack`
  return {
    best: `${base}-best-response`,
    cloze: `${base}-contextual-cloze`,
    correction: `${base}-correction`,
    reading: `${base}-reading`,
    transformation: `${base}-transformation`,
    scenario: `${base}-scenario`,
  }
}

function withDe(value: string): string {
  if (/^le\s/iu.test(value)) return `du ${value.slice(3)}`
  if (/^les\s/iu.test(value)) return `des ${value.slice(4)}`
  if (/^un\s/iu.test(value)) return `d’un ${value.slice(3)}`
  if (/^une\s/iu.test(value)) return `d’une ${value.slice(4)}`
  return `de ${value}`
}

function withA(value: string): string {
  if (/^le\s/iu.test(value)) return `au ${value.slice(3)}`
  if (/^les\s/iu.test(value)) return `aux ${value.slice(4)}`
  return `à ${value}`
}

function withDeBeforeInfinitive(value: string): string {
  return /^[aeiouyàâéèêëîïôùûüœ]/iu.test(value) ? `d’${value}` : `de ${value}`
}

const sentenceStart = (value: string) => value.charAt(0).toLocaleUpperCase('fr') + value.slice(1)

function sharesContentWord(left: string, right: string): boolean {
  const words = (value: string) => value.toLocaleLowerCase('fr').match(/\p{L}{6,}/gu) ?? []
  const leftWords = new Set(words(left))
  return words(right).some((word) => leftWords.has(word))
}

type DifficultyBand = 'scaffold' | 'foundation' | 'developing' | 'advanced' | 'other'

function difficultyBand(unitId: string): DifficultyBand {
  if (!unitId.startsWith('a-')) return 'other'
  const objective = Number(unitId.slice(2))
  if (objective <= 4) return 'scaffold'
  if (objective <= 12) return 'foundation'
  if (objective <= 22) return 'developing'
  return 'advanced'
}

export function createUnitPack(seed: UnitPackSeed): UnitPack {
  const { unitId, topic, goal, action, imperative, result, decision, correctionWrong, correctionRight, transformationSource, transformationAnswer, scaffold } = seed
  const band = difficultyBand(unitId)
  const isScaffold = band === 'scaffold'
  const isFoundation = band === 'foundation'
  const isLaterA = band === 'developing' || band === 'advanced'
  const targetIds = ids(unitId)
  const passageId = `${unitId}-unit-pack-passage`
  const scenarioId = `${unitId}-unit-pack-scenario-context`
  const topicReference = `au sujet ${withDe(topic)}`
  const topicFrame = isFoundation
    ? 'au travail'
    : isLaterA && (sharesContentWord(topic, goal) || sharesContentWord(topic, action))
      ? 'dans ce dossier'
      : band === 'developing'
        ? `au sujet ${withDe(topic)}`
        : `dans le cadre ${withDe(topic)}`
  const bestSituation = scaffold?.context ?? (isFoundation
    ? `Au travail, vous devez ${goal}. Une collègue vous demande quoi faire ensuite.`
    : band === 'developing' || band === 'advanced'
      ? `${sentenceStart(topicFrame)}, la prochaine étape est de ${action}. Une collègue vous demande comment procéder.`
      : `${sentenceStart(topicFrame)}, vous devez ${goal}. Une collègue vous demande quelle sera la prochaine étape.`)
  const bestAnswer = isScaffold || isFoundation ? `Je vais ${action}.` : `Je vais ${action} pour obtenir ${result}.`
  const bestDistractors: ChoiceSet = isScaffold
    ? ['Je vais attendre demain.', 'Je vais oublier la tâche.', 'Je vais partir sans agir.']
    : isFoundation
      ? ['Je vais attendre sans agir.', 'Je vais annuler la tâche.', 'Je ne sais pas quoi faire.']
      : [
        'Je ne sais pas; nous verrons bien un jour.',
        'Le dossier est là, mais personne ne doit le lire.',
        'Cette question attendra sans doute la semaine prochaine.',
      ]
  const clozeContext = scaffold?.context ?? (isFoundation
    ? `Pour ${goal},`
    : band === 'developing'
      ? `Quand l’équipe doit ${goal},`
      : band === 'advanced'
        ? `Avant de poursuivre, si l’équipe doit ${goal},`
        : `Pour ${goal} ${topicFrame},`)
  const best: BestResponseExercise = {
    id: `${targetIds.best}-01`,
    unitId,
    targetId: targetIds.best,
    kind: 'best-response',
    ...(isScaffold ? { promptLanguage: 'en' as const, contextLanguage: 'en' as const } : {}),
    situation: bestSituation,
    prompt: isScaffold ? 'What should you do next?' : 'Quelle réponse propose une prochaine étape claire?',
    answer: bestAnswer,
    distractors: bestDistractors,
    feedback: isScaffold
      ? `The answer gives one clear action: « ${bestAnswer} ».`
      : isFoundation
        ? `La réponse indique une action claire pour ${goal}.`
        : `La réponse relie l’objectif « ${goal} » à une action précise et au résultat « ${result} ».`,
  }
  const cloze: ContextualClozeExercise = {
    id: `${targetIds.cloze}-01`,
    unitId,
    targetId: targetIds.cloze,
    kind: 'contextual-cloze',
    ...(isScaffold ? { promptLanguage: 'fr' as const, contextLanguage: 'en' as const } : {}),
    context: clozeContext,
    prompt: scaffold?.clozePrompt ?? '___ avant la réunion.',
    answer: scaffold?.clozeAnswer ?? imperative,
    distractors: scaffold?.clozeDistractors ?? ['attendez', 'reportez', 'oubliez'],
    feedback: isScaffold
      ? `The missing word is « ${scaffold?.clozeAnswer} ».`
      : `L’impératif « ${imperative} » correspond à l’action attendue pour ${goal}.`,
  }
  const correction: CorrectionExercise = {
    id: `${targetIds.correction}-01`,
    unitId,
    targetId: targetIds.correction,
    kind: 'correction',
    ...(isScaffold ? { promptLanguage: 'en' as const, contextLanguage: 'fr' as const } : {}),
    prompt: isScaffold ? 'Which segment has an error?' : 'Quel segment contient l’erreur?',
    segments: [
      { id: 'a', text: isScaffold ? 'La phrase :' : `Pour ${goal}, la note indique que` },
      { id: 'b', text: correctionWrong },
      { id: 'c', text: isScaffold || isFoundation ? 'avant la réunion.' : 'afin d’obtenir' },
      { id: 'd', text: isScaffold ? 'Merci.' : `${result}.` },
    ],
    answerSegmentId: 'b',
    correction: correctionRight,
    feedback: isScaffold
      ? `Choose the segment with the incorrect French form: « ${correctionWrong} ».`
      : `La correction « ${correctionRight} » rend la phrase grammaticalement correcte.`,
  }
  const passage: Passage = {
    id: passageId,
    unitId,
    genre: isScaffold ? 'Work note' : 'Note de travail',
    title: isScaffold ? 'A workplace task' : `Un dossier ${topicReference}`,
    text: scaffold?.context ?? (isFoundation
      ? `Au travail, l’équipe doit ${action} avant la réunion. Cela permet d’obtenir ${result}.`
      : band === 'developing' || band === 'advanced'
        ? `${sentenceStart(topicFrame)}, l’équipe doit ${action} avant la réunion. Le résultat attendu est ${result}. Une note de suivi indique ce qui reste à faire et permet de préparer la prochaine discussion.`
        : `L’équipe travaille ${topicFrame}. Pour ${goal}, elle doit ${action} avant la réunion. Le résultat attendu est ${result}. Une note de suivi indique ce qui reste à faire et permet de préparer la prochaine discussion.`),
  }
  const reading: AuthoredExercise = {
    id: `${targetIds.reading}-01`,
    unitId,
    targetId: targetIds.reading,
    kind: 'reading',
    ...(isScaffold ? { promptLanguage: 'en' as const, contextLanguage: 'en' as const } : {}),
    passageId,
    prompt: isScaffold ? 'What does the team need to do?' : isFoundation || band === 'developing' || band === 'advanced' ? 'Que doit faire l’équipe?' : `Que doit faire l’équipe pour ${goal}?`,
    answer: sentenceStart(`Elle doit ${action}.`),
    distractors: isScaffold || isFoundation
      ? ['Elle doit attendre sans agir.', 'Elle doit annuler la tâche.', 'Elle ne sait pas quoi faire.']
      : [
        'Elle doit supprimer le dossier avant la réunion.',
        'Elle reporte la discussion au mois suivant.',
        'Elle refuse de vérifier les informations du dossier.',
      ],
    feedback: isScaffold
      ? `The passage points to this action: « ${action} ».`
      : `Le passage associe l’objectif « ${goal} » à l’action « ${action} ».`,
  }
  const transformationDistractors: ChoiceSet = isScaffold
    ? ['Je vais attendre demain.', 'Je vais oublier la tâche.', 'Je ne fais rien.']
    : [
      `Pour ${goal}, l’équipe peut éviter ${withDeBeforeInfinitive(action)}.`,
      `Pour ${goal}, l’équipe a déjà terminé sans ${action}.`,
      `Pour ${goal}, personne ne demande ${withDeBeforeInfinitive(action)}.`,
    ]
  const transformation: TransformationExercise = {
    id: `${targetIds.transformation}-01`,
    unitId,
    targetId: targetIds.transformation,
    kind: 'transformation',
    ...(isScaffold ? { promptLanguage: 'en' as const, contextLanguage: 'fr' as const } : {}),
    source: scaffold?.transformationSource ?? transformationSource,
    prompt: isScaffold ? 'Choose the sentence with the same meaning.' : 'Choisissez la reformulation qui conserve le même sens.',
    answer: scaffold?.transformationAnswer ?? transformationAnswer,
    distractors: transformationDistractors,
    feedback: isScaffold ? 'The second sentence keeps the same meaning.' : 'La reformulation conserve le sens et l’objectif de la phrase de départ.',
  }
  const scenarioAnswer = isScaffold ? `Je vais ${action}.` : `Je vais ${decision}.`
  const scenarioChoices: [string, string, string, string] = isScaffold
    ? [scenarioAnswer, 'Je vais attendre demain.', 'Je vais oublier la tâche.', 'Je vais partir sans agir.']
    : [
      scenarioAnswer,
      'Je transmets la réponse immédiatement sans la lire.',
      'Je supprime le dossier pour éviter toute question.',
      'Je demande à chacun de deviner la réponse.',
    ]
  const scenario: Scenario = {
    id: scenarioId,
    unitId,
    title: `Une décision ${topicReference}`,
    setup: scaffold?.context ?? (isFoundation
      ? `Au travail, vous devez ${goal}. Le résultat attendu est ${result}.`
      : band === 'developing' || band === 'advanced'
        ? `${sentenceStart(topicFrame)}, la prochaine étape est de ${action}. Le résultat attendu est ${result}, mais un collègue propose de passer à l’étape suivante sans vérifier les informations.`
        : `${sentenceStart(topicFrame)}, vous devez ${goal}. Le résultat attendu est ${result}, mais un collègue propose de passer à l’étape suivante sans vérifier les informations.`),
    nodes: [{
      id: 'next-step',
      prompt: isScaffold ? 'What should you do next?' : 'Que faites-vous ensuite?',
      choices: scenarioChoices,
      answer: scenarioAnswer,
      feedback: isScaffold ? 'Choose the action that helps with the task.' : 'La réponse vérifie la situation avant de poursuivre la démarche.',
    }],
  }
  const scenarioExercise: AuthoredExercise = {
    id: `${targetIds.scenario}-01`,
    unitId,
    targetId: targetIds.scenario,
    kind: 'scenario',
    ...(isScaffold ? { promptLanguage: 'en' as const, contextLanguage: 'en' as const } : {}),
    scenarioId,
    nodeId: 'next-step',
    feedback: isScaffold
      ? 'The answer gives a clear next step.'
      : `La décision proposée soutient l’objectif « ${goal} ».`,
  }
  return {
    exercises: [best, cloze, correction, reading, transformation, scenarioExercise],
    passages: [passage],
    scenarios: [scenario],
  }
}

export function createUnitPacks(seeds: readonly UnitPackSeed[]): UnitPack {
  return seeds.reduce<UnitPack>((result, seed) => {
    const pack = createUnitPack(seed)
    result.exercises.push(...pack.exercises)
    result.passages.push(...pack.passages)
    result.scenarios.push(...pack.scenarios)
    return result
  }, { exercises: [], passages: [], scenarios: [] })
}
