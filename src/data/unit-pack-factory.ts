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
  focus: string
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

export function createUnitPack({ unitId, focus }: UnitPackSeed): UnitPack {
  const topic = focus.charAt(0).toLocaleLowerCase('fr') + focus.slice(1)
  const targetIds = ids(unitId)
  const passageId = `${unitId}-unit-pack-passage`
  const scenarioId = `${unitId}-unit-pack-scenario-context`
  const best: BestResponseExercise = {
    id: `${targetIds.best}-01`,
    unitId,
    targetId: targetIds.best,
    kind: 'best-response',
    situation: `Votre équipe prépare un dossier sur ${topic}. Une collègue vous demande quelle sera la prochaine étape.`,
    prompt: 'Quelle réponse propose une prochaine étape claire?',
    answer: `Je vais vérifier les informations sur ${topic} avant la réunion.`,
    distractors: [
      'Je ne sais pas; nous verrons bien un jour.',
      'Le dossier est là, mais personne ne doit le lire.',
      'Cette question attendra sans doute la semaine prochaine.',
    ],
    feedback: 'La bonne réponse annonce une action précise et un moment clair.',
  }
  const cloze: ContextualClozeExercise = {
    id: `${targetIds.cloze}-01`,
    unitId,
    targetId: targetIds.cloze,
    kind: 'contextual-cloze',
    context: `Pour préparer le dossier sur ${topic},`,
    prompt: '___ les informations essentielles avant de répondre.',
    answer: 'vérifiez',
    distractors: ['vérifier', 'vérifions', 'vérifié'],
    feedback: 'La consigne emploie l’impératif « vérifiez » pour s’adresser directement à une équipe.',
  }
  const correction: CorrectionExercise = {
    id: `${targetIds.correction}-01`,
    unitId,
    targetId: targetIds.correction,
    kind: 'correction',
    prompt: 'Quel segment contient l’erreur?',
    segments: [
      { id: 'a', text: `Les informations sur ${topic}` },
      { id: 'b', text: 'doit être vérifiées' },
      { id: 'c', text: 'avant la réunion' },
      { id: 'd', text: 'par toute l’équipe.' },
    ],
    answerSegmentId: 'b',
    correction: 'doivent être vérifiées',
    feedback: 'Le sujet « les informations » est pluriel: le verbe doit être « doivent ».',
  }
  const passage: Passage = {
    id: passageId,
    unitId,
    genre: 'Note de travail',
    title: `Préparer un dossier sur ${topic}`,
    text: `L’équipe prépare un dossier sur ${topic}. Chaque personne vérifie les informations qui relèvent de sa partie et signale rapidement les points incertains. Avant la réunion, la responsable rassemble les remarques dans une courte note. Le groupe peut ainsi discuter des prochaines étapes avec des éléments vérifiés.`,
  }
  const reading: AuthoredExercise = {
    id: `${targetIds.reading}-01`,
    unitId,
    targetId: targetIds.reading,
    kind: 'reading',
    passageId,
    prompt: 'Quelle action est faite avant la réunion?',
    answer: 'La responsable rassemble les remarques dans une note.',
    distractors: [
      'Chaque personne annule sa partie du dossier.',
      'Le groupe transmet la note sans la vérifier.',
      'La responsable reporte la discussion au mois suivant.',
    ],
    feedback: 'Le texte indique que la responsable rassemble les remarques avant la réunion.',
  }
  const transformation: TransformationExercise = {
    id: `${targetIds.transformation}-01`,
    unitId,
    targetId: targetIds.transformation,
    kind: 'transformation',
    source: `Nous devons vérifier les informations sur ${topic}.`,
    prompt: 'Choisissez la reformulation qui conserve le même sens.',
    answer: `Il faut vérifier les informations sur ${topic}.`,
    distractors: [
      `Nous pouvons ignorer les informations sur ${topic}.`,
      `Nous avons déjà supprimé les informations sur ${topic}.`,
      `Les informations sur ${topic} vérifieront notre équipe.`,
    ],
    feedback: '« Il faut » conserve l’idée de nécessité exprimée par « nous devons ».',
  }
  const scenario: Scenario = {
    id: scenarioId,
    unitId,
    title: `Une question sur ${topic}`,
    setup: `Vous coordonnez un dossier sur ${topic}. Un collègue vous demande de transmettre une information qui n’a pas encore été vérifiée.`,
    nodes: [{
      id: 'next-step',
      prompt: 'Que faites-vous ensuite?',
      choices: [
        'Je vérifie l’information avant de la transmettre.',
        'Je la transmets immédiatement sans la lire.',
        'Je la supprime pour éviter toute question.',
        'Je demande à chacun de deviner la réponse.',
      ],
      answer: 'Je vérifie l’information avant de la transmettre.',
      feedback: 'Vérifier l’information avant de la transmettre protège la qualité du dossier.',
    }],
  }
  const scenarioExercise: AuthoredExercise = {
    id: `${targetIds.scenario}-01`,
    unitId,
    targetId: targetIds.scenario,
    kind: 'scenario',
    scenarioId,
    nodeId: 'next-step',
    feedback: 'La réponse propose une vérification concrète avant la transmission.',
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
