import type {
  AuthoredExercise,
  BestResponseExercise,
  ContextualClozeExercise,
  CorrectionExercise,
  Passage,
  Scenario,
  TransformationExercise,
} from './types.ts'

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

export function createUnitPack(seed: UnitPackSeed): UnitPack {
  const { unitId, topic, goal, action, imperative, result, decision, correctionWrong, correctionRight, transformationSource, transformationAnswer } = seed
  const targetIds = ids(unitId)
  const passageId = `${unitId}-unit-pack-passage`
  const scenarioId = `${unitId}-unit-pack-scenario-context`
  const topicReference = `au sujet ${withDe(topic)}`
  const topicFrame = `dans le cadre ${withDe(topic)}`
  const best: BestResponseExercise = {
    id: `${targetIds.best}-01`,
    unitId,
    targetId: targetIds.best,
    kind: 'best-response',
    situation: `${sentenceStart(topicFrame)}, vous devez ${goal}. Une collègue vous demande quelle sera la prochaine étape.`,
    prompt: 'Quelle réponse propose une prochaine étape claire?',
    answer: `Je vais ${action} pour obtenir ${result}.`,
    distractors: [
      'Je ne sais pas; nous verrons bien un jour.',
      'Le dossier est là, mais personne ne doit le lire.',
      'Cette question attendra sans doute la semaine prochaine.',
    ],
    feedback: `La réponse relie l’objectif « ${goal} » à une action précise et au résultat « ${result} ».`,
  }
  const cloze: ContextualClozeExercise = {
    id: `${targetIds.cloze}-01`,
    unitId,
    targetId: targetIds.cloze,
    kind: 'contextual-cloze',
    context: `Pour ${goal} ${topicFrame},`,
    prompt: '___ avant la réunion.',
    answer: imperative,
    distractors: ['attendez', 'reportez', 'oubliez'],
    feedback: `L’impératif « ${imperative} » correspond à l’action attendue pour ${goal}.`,
  }
  const correction: CorrectionExercise = {
    id: `${targetIds.correction}-01`,
    unitId,
    targetId: targetIds.correction,
    kind: 'correction',
    prompt: 'Quel segment contient l’erreur?',
    segments: [
      { id: 'a', text: `Pour ${goal}, la note indique que` },
      { id: 'b', text: correctionWrong },
      { id: 'c', text: 'afin d’obtenir' },
      { id: 'd', text: `${result}.` },
    ],
    answerSegmentId: 'b',
    correction: correctionRight,
    feedback: `La correction « ${correctionRight} » rend la phrase grammaticalement correcte.`,
  }
  const passage: Passage = {
    id: passageId,
    unitId,
    genre: 'Note de travail',
    title: `Un dossier ${topicReference}`,
    text: `L’équipe travaille ${topicFrame}. Pour ${goal}, elle doit ${action} avant la réunion. Le résultat attendu est ${result}. Une note de suivi indique ce qui reste à faire et permet de préparer la prochaine discussion.`,
  }
  const reading: AuthoredExercise = {
    id: `${targetIds.reading}-01`,
    unitId,
    targetId: targetIds.reading,
    kind: 'reading',
    passageId,
    prompt: `Que doit faire l’équipe pour ${goal}?`,
    answer: sentenceStart(`Elle doit ${action}.`),
    distractors: [
      'Elle doit supprimer le dossier avant la réunion.',
      'Elle reporte la discussion au mois suivant.',
      'Elle refuse de vérifier les informations du dossier.',
    ],
    feedback: `Le passage associe l’objectif « ${goal} » à l’action « ${action} ».`,
  }
  const transformation: TransformationExercise = {
    id: `${targetIds.transformation}-01`,
    unitId,
    targetId: targetIds.transformation,
    kind: 'transformation',
    source: transformationSource,
    prompt: 'Choisissez la reformulation qui conserve le même sens.',
    answer: transformationAnswer,
    distractors: [
      `Pour ${goal}, l’équipe peut éviter ${withDeBeforeInfinitive(action)}.`,
      `Pour ${goal}, l’équipe a déjà terminé sans ${action}.`,
      `Pour ${goal}, personne ne demande ${withDeBeforeInfinitive(action)}.`,
    ],
    feedback: 'La reformulation conserve le sens et l’objectif de la phrase de départ.',
  }
  const scenario: Scenario = {
    id: scenarioId,
    unitId,
    title: `Une décision ${topicReference}`,
    setup: `${sentenceStart(topicFrame)}, vous devez ${goal}. Le résultat attendu est ${result}, mais un collègue propose de passer à l’étape suivante sans vérifier les informations.`,
    nodes: [{
      id: 'next-step',
      prompt: 'Que faites-vous ensuite?',
      choices: [
        `Je vais ${decision}.`,
        'Je transmets la réponse immédiatement sans la lire.',
        'Je supprime le dossier pour éviter toute question.',
        'Je demande à chacun de deviner la réponse.',
      ],
      answer: `Je vais ${decision}.`,
      feedback: 'La réponse vérifie la situation avant de poursuivre la démarche.',
    }],
  }
  const scenarioExercise: AuthoredExercise = {
    id: `${targetIds.scenario}-01`,
    unitId,
    targetId: targetIds.scenario,
    kind: 'scenario',
    scenarioId,
    nodeId: 'next-step',
    feedback: `La décision proposée soutient l’objectif « ${goal} ».`,
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
