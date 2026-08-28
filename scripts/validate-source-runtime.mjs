import { curriculumUnits } from '../src/data/curriculum.ts'
import { sourceVocabulary } from '../src/data/source-vocabulary.ts'
import { allCards, allWords } from '../src/data/words.ts'

const expectedSourceCards = 2033
const expectedCurriculumUnits = 61
const expectedUnitsByLevel = { A: 32, B: 8, C: 21 }
const failures = []
const runtimeVocabulary = allCards.filter((card) => card.kind === 'vocabulary')
const sourceIds = new Set(sourceVocabulary.map((card) => card.id))
const runtimeIds = new Set(runtimeVocabulary.map((card) => card.id))
const curriculumIds = new Set(curriculumUnits.map((unit) => unit.id))
const sourceUnitIds = new Set(sourceVocabulary.map((card) => card.lessonId))
const missingUnits = curriculumUnits.filter((unit) => !sourceUnitIds.has(unit.id)).map((unit) => unit.id)
const unexpectedSourceUnits = [...sourceUnitIds].filter((unitId) => !curriculumIds.has(unitId))
const unexpectedRuntimeIds = runtimeVocabulary.filter((card) => !sourceIds.has(card.id)).map((card) => card.id)
const missingRuntimeIds = sourceVocabulary.filter((card) => !runtimeIds.has(card.id)).map((card) => card.id)
const unitsByLevel = Object.fromEntries(Object.entries(Object.groupBy(curriculumUnits, (unit) => unit.level)).map(([level, units]) => [level, units.length]))

if (sourceVocabulary.length !== expectedSourceCards) failures.push(`expected ${expectedSourceCards} source vocabulary cards, found ${sourceVocabulary.length}`)
if (curriculumUnits.length !== expectedCurriculumUnits) failures.push(`expected ${expectedCurriculumUnits} curriculum units, found ${curriculumUnits.length}`)
for (const [level, expected] of Object.entries(expectedUnitsByLevel)) {
  if ((unitsByLevel[level] ?? 0) !== expected) failures.push(`expected ${expected} ${level}-level units, found ${unitsByLevel[level] ?? 0}`)
}
if (runtimeVocabulary.length !== sourceVocabulary.length) failures.push(`runtime vocabulary count ${runtimeVocabulary.length} does not match source count ${sourceVocabulary.length}`)
if (allWords.length !== sourceVocabulary.length) failures.push(`allWords count ${allWords.length} does not match source count ${sourceVocabulary.length}`)
if (unexpectedRuntimeIds.length > 0) failures.push(`runtime contains non-source vocabulary: ${unexpectedRuntimeIds.slice(0, 5).join(', ')}`)
if (missingRuntimeIds.length > 0) failures.push(`runtime is missing source vocabulary: ${missingRuntimeIds.slice(0, 5).join(', ')}`)
if (missingUnits.length > 0) failures.push(`source vocabulary is missing curriculum units: ${missingUnits.join(', ')}`)
if (unexpectedSourceUnits.length > 0) failures.push(`source vocabulary contains unknown curriculum units: ${unexpectedSourceUnits.join(', ')}`)

const sourceLevelCounts = Object.fromEntries(Object.entries(Object.groupBy(sourceVocabulary, (card) => card.level)).map(([level, cards]) => [level, cards.length]))

if (failures.length > 0) {
  console.error(`Source runtime validation failed:\n${failures.join('\n')}`)
  process.exit(1)
}

console.log(`Validated ${runtimeVocabulary.length} PDF-source vocabulary cards across ${sourceUnitIds.size}/${curriculumUnits.length} curriculum units (A ${unitsByLevel.A ?? 0}, B ${unitsByLevel.B ?? 0}, C ${unitsByLevel.C ?? 0}; cards ${sourceLevelCounts.A ?? 0}/${sourceLevelCounts.B ?? 0}/${sourceLevelCounts.C ?? 0}).`)
