import { allExercises, allPassages, allScenarios, exerciseTargets } from './pilot-exercises.ts'
import { unitPacksA } from './unit-packs-a.ts'
import { curriculumUnits } from './curriculum.ts'
import type { AuthoredExercise, ExerciseKind } from './types.ts'

export const SEMANTIC_EXERCISE_KINDS: ExerciseKind[] = [
  'best-response',
  'contextual-cloze',
  'correction',
  'reading',
  'transformation',
  'scenario',
]

const normalizeChoice = (value: string) => value.trim().toLocaleLowerCase('fr').replace(/[‘’]/g, "'").replace(/\s+/g, ' ')
const unique = (values: readonly string[]) => new Set(values.map(normalizeChoice)).size === values.length
const legacyGeneratedChoice = /Je vais attendre demain|Je vais oublier la tâche|Je vais partir sans agir|Je vais attendre sans agir|Je vais annuler la tâche|Je ne sais pas quoi faire|Je ne sais pas; nous verrons bien|Le dossier est là, mais personne ne doit le lire|Cette question attendra|Je transmets la réponse immédiatement|Je supprime le dossier|Je demande à chacun de deviner|Elle doit attendre sans agir|Elle doit annuler la tâche|Elle ne sait pas quoi faire/iu
const invalidContraction = /(?:au sujet|cadre) de (?:le|les|un|une)\b|liées à (?:le|les)\b/iu
const invalidInfinitiveElision = /\b(?:éviter|demande) de (?=[aeiouyàâéèêëîïôùûüœ])/iu
const scaffoldAUnits = new Set(['a-01', 'a-02', 'a-03', 'a-04'])
const earlyAUnit = /^a-(?:0[1-9]|1[0-2])$/
const repeatedDocumentFrame = /documents(?: de référence)?[^.?!]*dans le cadre[^.?!]*documents(?: de référence)?/iu
const topicsByUnit = new Map(unitPacksA.map((seed) => [seed.unitId, seed.topic]))

function phraseCount(text: string, phrase: string): number {
  return phrase ? text.split(phrase).length - 1 : 0
}

function exerciseChoices(exercise: AuthoredExercise): string[] {
  if ('distractors' in exercise) return [exercise.answer, ...exercise.distractors]
  if (exercise.kind === 'correction') return exercise.segments.map((segment) => segment.id)
  return []
}

export function validateAuthoredExercises(): string[] {
  const failures: string[] = []
  const unitIds = new Set(curriculumUnits.map((unit) => unit.id))
  const targetsById = new Map(exerciseTargets.map((target) => [target.id, target]))
  const targetIds = new Set(exerciseTargets.map((target) => target.id))
  const passageIds = new Set(allPassages.map((passage) => passage.id))
  const scenarioIds = new Set(allScenarios.map((scenario) => scenario.id))

  if (new Set(exerciseTargets.map((target) => target.id)).size !== exerciseTargets.length) failures.push('duplicate exercise target IDs')
  if (new Set(allExercises.map((exercise) => exercise.id)).size !== allExercises.length) failures.push('duplicate exercise IDs')
  if (new Set(allPassages.map((passage) => passage.id)).size !== allPassages.length) failures.push('duplicate passage IDs')
  if (new Set(allScenarios.map((scenario) => scenario.id)).size !== allScenarios.length) failures.push('duplicate scenario IDs')

  const generatedExercises = allExercises.filter((exercise) => exercise.id.includes('-unit-pack-'))
  const targetIdsByExercise = new Set(allExercises.map((exercise) => exercise.targetId))
  for (const targetId of targetIdsByExercise) {
    if (!targetIds.has(targetId)) failures.push(`missing target for ${targetId}`)
  }
  for (const target of exerciseTargets) {
    if (!targetIdsByExercise.has(target.id)) failures.push(`target has no exercise: ${target.id}`)
  }

  for (const exercise of allExercises) {
    const unit = curriculumUnits.find((candidate) => candidate.id === exercise.unitId)
    const target = targetsById.get(exercise.targetId)
    if (!unit) failures.push(`unknown unit: ${exercise.id}`)
    if (target?.lessonId !== exercise.unitId) failures.push(`target/unit mismatch: ${exercise.id}`)
    if (unit && target?.level !== unit.level) failures.push(`target/level mismatch: ${exercise.id}`)
    if ('prompt' in exercise && !exercise.prompt) failures.push(`empty prompt: ${exercise.id}`)
    if (!exercise.feedback.trim()) failures.push(`empty feedback: ${exercise.id}`)
    const text = JSON.stringify(exercise)
    if (invalidContraction.test(text)) failures.push(`invalid contraction: ${exercise.id}`)
    if (exercise.id.includes('-unit-pack-') && invalidInfinitiveElision.test(text)) failures.push(`invalid infinitive elision: ${exercise.id}`)
    if (exercise.id.includes('-unit-pack-') && /\bJe vais [^.?!]*(?:\bson\b|\bses\b)/iu.test(text)) failures.push(`wrong first-person possessive: ${exercise.id}`)
    if (exercise.id.includes('-unit-pack-') && earlyAUnit.test(exercise.unitId) && /dans le cadre/iu.test(text)) failures.push(`too-formal early A context: ${exercise.id}`)
    if (exercise.id.includes('-unit-pack-') && exercise.kind === 'contextual-cloze' && repeatedDocumentFrame.test(text)) failures.push(`repeated topic in cloze context: ${exercise.id}`)
    const topic = topicsByUnit.get(exercise.unitId)
    if (exercise.id.includes('-unit-pack-') && topic && /dans le cadre/iu.test(text) && phraseCount(text, topic) > 1) failures.push(`repeated topic frame: ${exercise.id}`)
    if (exercise.id.includes('-unit-pack-') && scaffoldAUnits.has(exercise.unitId)) {
      const expectedPromptLanguage = exercise.kind === 'contextual-cloze' ? 'fr' : 'en'
      const expectedContextLanguage = exercise.kind === 'correction' || exercise.kind === 'transformation' ? 'fr' : 'en'
      if (exercise.promptLanguage !== expectedPromptLanguage) failures.push(`missing scaffold prompt language: ${exercise.id}`)
      if (exercise.contextLanguage !== expectedContextLanguage) failures.push(`missing scaffold context language: ${exercise.id}`)
    }
    const choices = exerciseChoices(exercise)
    if (choices.length > 0 && (!choices.every((choice) => choice.trim()) || !unique(choices))) failures.push(`duplicate or empty choices: ${exercise.id}`)
    if (choices.length > 0 && choices.length !== 4 && exercise.kind !== 'correction') failures.push(`choice count is not four: ${exercise.id}`)
    if (choices.length > 0 && 'answer' in exercise && choices.filter((choice) => normalizeChoice(choice) === normalizeChoice(exercise.answer)).length !== 1) failures.push(`answer is not unique: ${exercise.id}`)
    if (exercise.id.includes('-unit-pack-') && legacyGeneratedChoice.test(JSON.stringify(choices))) failures.push(`legacy generated choice: ${exercise.id}`)
    if (exercise.id.includes('-unit-pack-') && exercise.kind === 'contextual-cloze' && !choices.every((choice) => /^\p{L}+ez\b/iu.test(choice.trim()))) failures.push(`generated cloze choices are not imperatives: ${exercise.id}`)
    if (exercise.id.includes('-unit-pack-') && exercise.kind === 'best-response' && !choices.every((choice) => /^Je vais\s/iu.test(choice.trim()))) failures.push(`generated best-response choices do not share a frame: ${exercise.id}`)
    if (exercise.id.includes('-unit-pack-') && exercise.kind === 'reading' && !choices.every((choice) => /^Elle doit\s/iu.test(choice.trim()))) failures.push(`generated reading choices do not share a frame: ${exercise.id}`)
    if (exercise.kind === 'correction') {
      if (!unique(exercise.segments.map((segment) => segment.id))) failures.push(`duplicate correction segment IDs: ${exercise.id}`)
      if (exercise.answerSegmentId === 'none' && !exercise.allowNoCorrection) failures.push(`missing allowNoCorrection: ${exercise.id}`)
      if (exercise.answerSegmentId !== 'none' && !exercise.segments.some((segment) => segment.id === exercise.answerSegmentId)) failures.push(`missing correction answer segment: ${exercise.id}`)
      if (!exercise.correction.trim()) failures.push(`empty correction: ${exercise.id}`)
    }
    if (exercise.kind === 'reading' && !passageIds.has(exercise.passageId)) failures.push(`missing passage: ${exercise.id}`)
    if (exercise.kind === 'scenario') {
      const scenario = allScenarios.find((candidate) => candidate.id === exercise.scenarioId)
      const node = scenario?.nodes.find((candidate) => candidate.id === exercise.nodeId)
      if (!scenarioIds.has(exercise.scenarioId) || !node) failures.push(`missing scenario node: ${exercise.id}`)
      else {
        if (node.choices.length !== 4 || !node.choices.every((choice) => choice.trim()) || !unique(node.choices) || node.choices.filter((choice) => normalizeChoice(choice) === normalizeChoice(node.answer)).length !== 1) failures.push(`invalid scenario choices: ${exercise.id}`)
        if (exercise.id.includes('-unit-pack-') && (legacyGeneratedChoice.test(JSON.stringify(node.choices)) || !node.choices.every((choice) => /^Je vais\s/iu.test(choice.trim())))) failures.push(`generated scenario choices do not share a frame: ${exercise.id}`)
        if (!node.prompt.trim() || !node.feedback.trim()) failures.push(`empty scenario text: ${exercise.id}`)
      }
    }
  }

  for (const passage of allPassages) {
    if (!unitIds.has(passage.unitId)) failures.push(`unknown passage unit: ${passage.id}`)
    if (!passage.title.trim() || !passage.text.trim()) failures.push(`empty passage: ${passage.id}`)
    const text = JSON.stringify(passage)
    if (invalidContraction.test(text)) failures.push(`invalid passage contraction: ${passage.id}`)
    if (passage.id.includes('-unit-pack-') && invalidInfinitiveElision.test(text)) failures.push(`invalid passage infinitive elision: ${passage.id}`)
    if (passage.id.includes('-unit-pack-') && earlyAUnit.test(passage.unitId) && /dans le cadre/iu.test(text)) failures.push(`too-formal early A passage: ${passage.id}`)
    const topic = topicsByUnit.get(passage.unitId)
    if (passage.id.includes('-unit-pack-') && topic && /dans le cadre/iu.test(text) && phraseCount(passage.text, topic) > 1) failures.push(`repeated topic frame: ${passage.id}`)
  }
  for (const scenario of allScenarios) {
    if (!unitIds.has(scenario.unitId)) failures.push(`unknown scenario unit: ${scenario.id}`)
    if (!scenario.title.trim() || !scenario.setup.trim() || scenario.nodes.length === 0) failures.push(`empty scenario: ${scenario.id}`)
    if (scenario.id.includes('-unit-pack-') && earlyAUnit.test(scenario.unitId) && /dans le cadre/iu.test(JSON.stringify(scenario))) failures.push(`too-formal early A scenario: ${scenario.id}`)
    const topic = topicsByUnit.get(scenario.unitId)
    if (scenario.id.includes('-unit-pack-') && topic && /dans le cadre/iu.test(scenario.setup) && phraseCount(scenario.setup, topic) > 1) failures.push(`repeated topic frame: ${scenario.id}`)
  }

  for (const unitId of unitIds) {
    for (const kind of SEMANTIC_EXERCISE_KINDS) {
      const generatedCount = generatedExercises.filter((exercise) => exercise.unitId === unitId && exercise.kind === kind).length
      if (generatedCount !== 1) failures.push(`expected one generated ${kind} for ${unitId}, found ${generatedCount}`)
    }
  }
  return failures
}

export function assertValidAuthoredExercises(): void {
  const failures = validateAuthoredExercises()
  if (failures.length > 0) throw new Error(`Authored exercise validation failed:\n${failures.join('\n')}`)
}
