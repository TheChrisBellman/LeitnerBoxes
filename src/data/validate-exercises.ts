import { allExercises, allPassages, allScenarios, exerciseTargets } from './pilot-exercises.ts'
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

const unique = (values: readonly string[]) => new Set(values).size === values.length

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
    const choices = exerciseChoices(exercise)
    if (choices.length > 0 && new Set(choices).size !== choices.length) failures.push(`duplicate choices: ${exercise.id}`)
    if (choices.length > 0 && choices.length !== 4 && exercise.kind !== 'correction') failures.push(`choice count is not four: ${exercise.id}`)
    if (exercise.kind === 'correction') {
      if (!unique(exercise.segments.map((segment) => segment.id))) failures.push(`duplicate correction segment IDs: ${exercise.id}`)
      if (exercise.answerSegmentId !== 'none' && !exercise.segments.some((segment) => segment.id === exercise.answerSegmentId)) failures.push(`missing correction answer segment: ${exercise.id}`)
      if (!exercise.correction.trim()) failures.push(`empty correction: ${exercise.id}`)
    }
    if (exercise.kind === 'reading' && !passageIds.has(exercise.passageId)) failures.push(`missing passage: ${exercise.id}`)
    if (exercise.kind === 'scenario') {
      const scenario = allScenarios.find((candidate) => candidate.id === exercise.scenarioId)
      const node = scenario?.nodes.find((candidate) => candidate.id === exercise.nodeId)
      if (!scenarioIds.has(exercise.scenarioId) || !node) failures.push(`missing scenario node: ${exercise.id}`)
      else {
        if (node.choices.length !== 4 || !unique(node.choices) || !node.choices.includes(node.answer)) failures.push(`invalid scenario choices: ${exercise.id}`)
        if (!node.prompt.trim() || !node.feedback.trim()) failures.push(`empty scenario text: ${exercise.id}`)
      }
    }
  }

  for (const passage of allPassages) {
    if (!unitIds.has(passage.unitId)) failures.push(`unknown passage unit: ${passage.id}`)
    if (!passage.title.trim() || !passage.text.trim()) failures.push(`empty passage: ${passage.id}`)
  }
  for (const scenario of allScenarios) {
    if (!unitIds.has(scenario.unitId)) failures.push(`unknown scenario unit: ${scenario.id}`)
    if (!scenario.title.trim() || !scenario.setup.trim() || scenario.nodes.length === 0) failures.push(`empty scenario: ${scenario.id}`)
  }

  for (const unitId of unitIds) {
    for (const kind of SEMANTIC_EXERCISE_KINDS) {
      if (!allExercises.some((exercise) => exercise.unitId === unitId && exercise.kind === kind)) failures.push(`missing ${kind} for ${unitId}`)
    }
  }
  return failures
}

export function assertValidAuthoredExercises(): void {
  const failures = validateAuthoredExercises()
  if (failures.length > 0) throw new Error(`Authored exercise validation failed:\n${failures.join('\n')}`)
}
