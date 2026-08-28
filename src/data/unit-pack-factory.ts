import type {
  AuthoredExercise,
  BestResponseExercise,
  ContextualClozeExercise,
  CorrectionExercise,
  CorrectionSegment,
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
  narrativeAction?: string
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

const sentenceStart = (value: string) => value.charAt(0).toLocaleUpperCase('fr') + value.slice(1)
const asSentence = (value: string) => /[.!?]$/u.test(value.trim()) ? sentenceStart(value.trim()) : `${sentenceStart(value.trim())}.`

function correctionPosition(unitId: string): number {
  const objective = Number(unitId.slice(2))
  const sequence = unitId.startsWith('c-') ? objective + 39 : objective - 1
  return sequence % 4
}

function agreementFeedback(wrong: string, right: string): string {
  const wrongWords = wrong.split(/\s+/u)
  const rightWords = right.split(/\s+/u)
  const changedIndexes = rightWords.flatMap((word, index) => word === wrongWords[index] ? [] : [index])
  const finiteVerbIndex = wrongWords.findIndex((word, index) => index > 0 && /^(?:est|sont|doit|doivent)$/iu.test(word))
  const subjectEnd = finiteVerbIndex > 0 ? finiteVerbIndex : changedIndexes[0] ?? 1
  const subject = wrongWords.slice(0, Math.max(1, subjectEnd)).join(' ')
  const subjectKey = subject.toLocaleLowerCase('fr')
  const plural = /^(?:les|des|ces|mes|tes|ses|nos|vos|leurs|plusieurs|nous|vous|ils|elles)\b/u.test(subjectKey)
  const correctedForms = changedIndexes.map((index) => `« ${rightWords[index]} »`).join(changedIndexes.length > 1 ? ' and ' : '')
  const wrongForms = changedIndexes.map((index) => `« ${wrongWords[index]} »`).join(changedIndexes.length > 1 ? ' and ' : '')
  if (/^(?:nous|vous)$/u.test(subjectKey)) {
    return `The subject « ${subject} » takes its matching verb form, so use ${correctedForms} rather than ${wrongForms}.`
  }
  return `The subject « ${subject} » is ${plural ? 'plural' : 'singular'}, so use ${correctedForms} rather than ${wrongForms}.`
}

function correctionSegments(seed: UnitPackSeed): CorrectionSegment[] {
  const supporting = [
    { id: 'source', text: asSentence(seed.transformationSource) },
    { id: 'rewrite', text: asSentence(seed.transformationAnswer) },
    { id: 'instruction', text: asSentence(seed.imperative) },
  ]
  supporting.splice(correctionPosition(seed.unitId), 0, { id: 'error', text: asSentence(seed.correctionWrong) })
  return supporting
}

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

type AlternativeSeeds = [UnitPackSeed, UnitPackSeed, UnitPackSeed]

function narrativeAction(seed: UnitPackSeed): string {
  return seed.narrativeAction ?? seed.action
}

function alternativeSeeds(seed: UnitPackSeed, seeds: readonly UnitPackSeed[]): AlternativeSeeds {
  const tokens = (value: string) => new Set((value.toLocaleLowerCase('fr').match(/\p{L}{4,}/gu) ?? []).map((word) => word.replace(/s$/u, '')))
  const seedTokens = tokens([seed.topic, seed.goal, seed.action, seed.decision].join(' '))
  const overlap = (candidate: UnitPackSeed) => [...tokens([candidate.topic, candidate.goal, candidate.action, candidate.decision].join(' '))]
    .filter((word) => seedTokens.has(word)).length
  const distance = (candidate: UnitPackSeed) => Math.abs(Number(candidate.unitId.slice(2)) - Number(seed.unitId.slice(2)))
  const choices = seeds
    .filter((candidate) => candidate.unitId !== seed.unitId)
    .sort((left, right) => {
      const level = Number(left.unitId[0] !== seed.unitId[0]) - Number(right.unitId[0] !== seed.unitId[0])
      if (level) return level
      const band = Number(difficultyBand(left.unitId) !== difficultyBand(seed.unitId)) - Number(difficultyBand(right.unitId) !== difficultyBand(seed.unitId))
      if (band) return band
      const related = overlap(left) - overlap(right)
      if (related) return related
      return distance(left) - distance(right) || left.unitId.localeCompare(right.unitId)
    })
  if (choices.length < 3) throw new Error(`Unit pack needs three alternative actions: ${seed.unitId}`)
  return choices.slice(0, 3) as AlternativeSeeds
}

export function createUnitPack(seed: UnitPackSeed, alternatives: AlternativeSeeds): UnitPack {
  const { unitId, topic, goal, action, imperative, result, decision, correctionWrong, correctionRight, transformationSource, transformationAnswer, scaffold } = seed
  const band = difficultyBand(unitId)
  const [firstAlternative, secondAlternative, thirdAlternative] = alternatives
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
  const thirdPersonAction = narrativeAction(seed)
  const bestSituation = scaffold?.context ?? (isFoundation
    ? `Au travail, vous devez ${goal}. Une collègue vous demande quoi faire ensuite.`
    : band === 'developing' || band === 'advanced'
      ? `${sentenceStart(topicFrame)}, la prochaine étape est de ${thirdPersonAction}. Une collègue vous demande comment procéder.`
      : `${sentenceStart(topicFrame)}, vous devez ${goal}. Une collègue vous demande quelle sera la prochaine étape.`)
  const bestAnswer = `Je vais ${action}.`
  const bestDistractors: ChoiceSet = alternatives.map((alternative) => `Je vais ${alternative.action}.`) as ChoiceSet
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
    prompt: isScaffold ? 'What should you do next?' : `Quelle réponse répond à l’objectif « ${goal} »?`,
    answer: bestAnswer,
    distractors: bestDistractors,
    feedback: isScaffold
      ? `The answer gives one clear action: « ${bestAnswer} ».`
      : isFoundation
        ? `La réponse indique une action claire pour ${goal}.`
        : `La réponse indique l’action précise nécessaire pour « ${goal} » : « ${action} ».`,
  }
  const cloze: ContextualClozeExercise = {
    id: `${targetIds.cloze}-01`,
    unitId,
    targetId: targetIds.cloze,
    kind: 'contextual-cloze',
    ...(isScaffold ? { promptLanguage: 'fr' as const, contextLanguage: 'en' as const } : {}),
    context: clozeContext,
    prompt: scaffold?.clozePrompt ?? `___ pour obtenir ${result}.`,
    answer: scaffold?.clozeAnswer ?? imperative,
    distractors: scaffold?.clozeDistractors ?? alternatives.map((alternative) => alternative.imperative) as ChoiceSet,
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
    prompt: isScaffold ? 'Which part has an error?' : `Quelle partie contient l’erreur dans la consigne « ${goal} »?`,
    segments: correctionSegments(seed),
    answerSegmentId: 'error',
    correction: correctionRight,
    feedback: agreementFeedback(correctionWrong, correctionRight),
  }
  const passage: Passage = {
    id: passageId,
    unitId,
    genre: isScaffold ? 'Work note' : 'Note de travail',
    title: isScaffold ? 'A workplace task' : `Un dossier ${topicReference}`,
    text: scaffold?.context ?? (isFoundation
      ? `Au travail, l’équipe doit ${thirdPersonAction} avant la réunion. Cela permet d’obtenir ${result}.`
      : band === 'developing' || band === 'advanced'
        ? `${sentenceStart(topicFrame)}, l’équipe doit ${thirdPersonAction} avant la réunion. Le résultat attendu est ${result}. Une note de suivi indique ce qui reste à faire et permet de préparer la prochaine discussion.`
        : `L’équipe travaille ${topicFrame}. Pour ${goal}, elle doit ${thirdPersonAction} avant la réunion. Le résultat attendu est ${result}. Une note de suivi indique ce qui reste à faire et permet de préparer la prochaine discussion.`),
  }
  const reading: AuthoredExercise = {
    id: `${targetIds.reading}-01`,
    unitId,
    targetId: targetIds.reading,
    kind: 'reading',
    ...(isScaffold ? { promptLanguage: 'en' as const, contextLanguage: 'en' as const } : {}),
    passageId,
    prompt: isScaffold ? 'What does the team need to do?' : `Que doit faire l’équipe pour ${goal}?`,
    answer: sentenceStart(`Elle doit ${thirdPersonAction}.`),
    distractors: alternatives.map((alternative) => `Elle doit ${narrativeAction(alternative)}.`) as ChoiceSet,
    feedback: isScaffold
      ? `The passage points to this action: « ${action} ».`
      : `Le passage associe l’objectif « ${goal} » à l’action « ${action} ».`,
  }
  const transformationDistractors: ChoiceSet = alternatives.map((alternative) => alternative.transformationAnswer) as ChoiceSet
  const transformation: TransformationExercise = {
    id: `${targetIds.transformation}-01`,
    unitId,
    targetId: targetIds.transformation,
    kind: 'transformation',
    ...(isScaffold ? { promptLanguage: 'en' as const, contextLanguage: 'fr' as const } : {}),
    source: scaffold?.transformationSource ?? transformationSource,
    prompt: isScaffold ? 'Choose the sentence with the same meaning.' : `Quelle reformulation conserve le sens de la tâche « ${goal} »?`,
    answer: scaffold?.transformationAnswer ?? transformationAnswer,
    distractors: transformationDistractors,
    feedback: isScaffold ? 'The second sentence keeps the same meaning.' : 'La reformulation conserve le sens et l’objectif de la phrase de départ.',
  }
  const scenarioAnswer = isScaffold ? `Je vais ${action}.` : `Je vais ${decision}.`
  const scenarioChoices: [string, string, string, string] = [
    scenarioAnswer,
    `Je vais ${firstAlternative.decision}.`,
    `Je vais ${secondAlternative.decision}.`,
    `Je vais ${thirdAlternative.decision}.`,
  ]
  const scenario: Scenario = {
    id: scenarioId,
    unitId,
    title: `Une décision ${topicReference}`,
    setup: scaffold?.context ?? (isFoundation
      ? `Au travail, vous devez ${goal}. Le résultat attendu est ${result}.`
      : band === 'developing' || band === 'advanced'
        ? `${sentenceStart(topicFrame)}, la prochaine étape est de ${thirdPersonAction}. Le résultat attendu est ${result}, mais un collègue propose de passer à l’étape suivante sans vérifier les informations.`
        : `${sentenceStart(topicFrame)}, vous devez ${goal}. Le résultat attendu est ${result}, mais un collègue propose de passer à l’étape suivante sans vérifier les informations.`),
    nodes: [{
      id: 'next-step',
      prompt: isScaffold ? 'What should you do next?' : `Que faites-vous ensuite pour ${goal}?`,
      choices: scenarioChoices,
      answer: scenarioAnswer,
      feedback: isScaffold ? 'Choose the action that helps with the task.' : `La réponse propose l’étape suivante nécessaire pour « ${goal} ».`,
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
    const pack = createUnitPack(seed, alternativeSeeds(seed, seeds))
    result.exercises.push(...pack.exercises)
    result.passages.push(...pack.passages)
    result.scenarios.push(...pack.scenarios)
    return result
  }, { exercises: [], passages: [], scenarios: [] })
}
