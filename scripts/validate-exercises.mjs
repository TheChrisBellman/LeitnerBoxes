import { assertValidAuthoredExercises } from '../src/data/validate-exercises.ts'
import { allExercises, exerciseTargets } from '../src/data/pilot-exercises.ts'

assertValidAuthoredExercises()
console.log(`Validated ${allExercises.length} authored exercise variants across ${exerciseTargets.length} targets.`)
