import fs from 'node:fs'
import { execFileSync } from 'node:child_process'
import { a04SourceSupplements, baselineSourceRows, isQuarantinedSourceKey, quarantinedSourceKeys, sourceVocabulary } from '../src/data/source-vocabulary.ts'
import { englishEvidenceFragments } from '../src/data/source-evidence.ts'
import { sourceSupplements } from '../src/data/source-supplements.ts'
import { sourceSupplements1120 } from '../src/data/source-supplements-11-20.ts'
import { sourceSupplements2140 } from '../src/data/source-supplements-21-40.ts'
import { sourceSupplementsC } from '../src/data/source-supplements-c.ts'
import { sourceSupplementsFollowup } from '../src/data/source-supplements-followup.ts'
import { allCards, allTargets } from '../src/data/words.ts'
import { buildVocabularyQuestion } from '../src/leitner.ts'

const requiredInputs = ['.tmp/source-audit.json', '.tmp/pdf-text']
const missingInputs = requiredInputs.filter((input) => !fs.existsSync(input))
if (missingInputs.length > 0) {
  console.error(`Source audit requires the supplied PDF extraction inputs: ${missingInputs.join(', ')}. Generate .tmp/pdf-text/*.txt and .tmp/source-audit.json first.`)
  process.exit(2)
}

const audit = JSON.parse(fs.readFileSync('.tmp/source-audit.json', 'utf8'))
const norm = (value) => String(value ?? '').trim().normalize('NFC').toLocaleLowerCase('fr').replace(/[‘’]/g, "'").replace(/\s+/g, ' ')
const sourceKey = (lessonId, french) => `${lessonId}|${norm(french)}`
const forms = (value) => {
  const text = String(value ?? '').trim()
  const result = new Set([norm(text)])
  if (/\([^)]*\)/.test(text)) {
    const bare = text.replace(/\s*\([^)]*\)/g, '').trim()
    result.add(norm(bare))
    if (/\(e\)/i.test(text)) result.add(norm(text.replace(/\(e\)/i, 'e')))
  }
  if (text.includes('/')) {
    const parts = text.split(/\s*\/\s*/).map((part) => part.trim()).filter(Boolean)
    parts.forEach((part) => result.add(norm(part)))
    if (parts.length === 2 && !/^(?:le|la|les|un|une|des|l['’])\s/i.test(parts[1])) result.add(norm(`${parts[0]}${parts[1]}`))
  }
  return [...result]
}

const beforeText = execFileSync('git', ['show', '814fce1:src/data/source-vocabulary.ts'], { encoding: 'utf8' })
const beforeRows = [...beforeText.matchAll(/lessonId: "([^"]+)", french: "([^"]+)", answer: "([^"]+)"/g)].map((match) => ({ lessonId: match[1], french: match[2], answer: match[3] }))
const beforeByUnit = Object.groupBy(beforeRows, (row) => row.lessonId)
const beforeIds = new Map()
const beforeOrders = new Map()
for (const row of beforeRows) {
  const order = (beforeOrders.get(row.lessonId) ?? 24) + 1
  beforeOrders.set(row.lessonId, order)
  beforeIds.set(sourceKey(row.lessonId, row.french), `${row.lessonId}-source-${String(order - 24).padStart(3, '0')}`)
}
const currentIds = new Map(sourceVocabulary.map((row) => [sourceKey(row.lessonId, row.french), row.id]))
const baselineQuarantined = [...beforeIds].filter(([key]) => !currentIds.has(key)).map(([key]) => key)
const baselineIdsChanged = [...beforeIds].filter(([key, id]) => currentIds.has(key) && currentIds.get(key) !== id)
const afterByUnit = Object.groupBy(sourceVocabulary, (row) => row.lessonId)
const sourceKeys = new Set(sourceVocabulary.map((row) => sourceKey(row.lessonId, row.french)))
const sourceIds = new Set(sourceVocabulary.map((row) => row.id))
const canonical = (value) => norm(value)
  .replace(/([a-zàâçéèêëîïôùûüœ]+)\(([^)]+)\)/gi, (_, stem, ending) => `${stem} ${stem}${ending}`)
  .replace(/([a-zàâçéèêëîïôùûüœ]+)ieux\(euse\)/gi, '$1ieux $1ieuse')
  .replace(/([a-zàâçéèêëîïôùûüœ]+)eux\(se\)/gi, '$1eux $1euse')
  .replace(/\(\s*s['’]\s*\)\s*/gi, 's')
  .replace(/[œ]/g, 'oe')
  .replace(/[æ]/g, 'ae')
  .replace(/(?:\[[^\]]+\]|[^]+)/g, ' e ')
  .replace(/…/g, ' ')
  .replace(/\.+/g, ' ')
  .replace(/-/g, ' ')
const termVariants = (term) => {
  const value = canonical(term)
  const variants = new Set([value])
  if (/^(?:l['’]|le |la |les |un |une |des )/.test(value)) variants.add(value.replace(/^(?:l['’]|le |la |les |un |une |des )/, ''))
  if (/^s['’]/.test(value)) variants.add(value.replace(/^s['’]/, ''))
  if (value.startsWith('la chute du')) variants.add('la chute du')
  if (value.endsWith('e')) variants.add(value.slice(0, -1))
  if (value.endsWith('ive')) variants.add(value.slice(0, -3) + 'if')
  if (value.endsWith('ieuse')) variants.add(value.slice(0, -5) + 'ieux')
  if (value.endsWith('euse')) {
    variants.add(value.slice(0, -4) + 'eux')
    variants.add(value.slice(0, -4) + 'eur')
  }
  if (value.endsWith('er')) variants.add(value.slice(0, -2))
  if (value.endsWith('ir')) variants.add(value.slice(0, -2))
  return [...variants]
}
const sequenceIncludes = (term, text) => {
  const normalizedText = canonical(text)
  for (const variant of termVariants(term)) {
    let offset = 0
    let matched = true
    for (const word of variant.split(/\s+/).filter(Boolean)) {
      const next = normalizedText.indexOf(word, offset)
      if (next < 0) { matched = false; break }
      offset = next + word.length
    }
    if (matched) return true
  }
  return false
}
const pdfRecordCache = new Map()
const pdfLineRecords = (pdf) => {
  if (pdfRecordCache.has(pdf)) return pdfRecordCache.get(pdf)
  const textPath = `.tmp/pdf-text/${pdf.replace(/\.pdf$/i, '.txt')}`
  if (!fs.existsSync(textPath)) return []
  const rawText = fs.readFileSync(textPath, 'utf8')
  const parts = rawText.split(/(\r?\n|\f)/)
  const records = []
  let line = 1
  let page = 1
  for (let index = 0; index < parts.length; index += 2) {
    records.push({ line, page, text: parts[index] ?? '' })
    const delimiter = parts[index + 1]
    if (delimiter) {
      line += 1
      if (delimiter === '\f') page += 1
    }
  }
  pdfRecordCache.set(pdf, records)
  return records
}
const pdfNames = fs.readdirSync('.tmp/pdf-text').filter((name) => name.endsWith('.txt')).sort()
const pdfDataCache = new Map()
const pdfData = (pdf) => {
  if (pdfDataCache.has(pdf)) return pdfDataCache.get(pdf)
  const records = pdfLineRecords(pdf)
  const normalizedLines = records.map((record) => norm(record.text.replace('\f', '')))
  const keyStart = normalizedLines.findIndex((line, index) => index > normalizedLines.length * 0.45 && /^(?:corrigé\s*[–-]|corrige\s*[–-]|réponses?\s*[–-]|transcription\s*[–-]|answer key\b)/i.test(line))
  const data = { records, normalizedLines, keyStart, primaryText: normalizedLines.slice(0, keyStart >= 0 ? keyStart : normalizedLines.length).join(' '), wholeText: normalizedLines.join(' ') }
  pdfDataCache.set(pdf, data)
  return data
}
const preferredPdfFor = (row) => {
  if (/^[ab]-/.test(row.lessonId)) return `SC102-2-${Number(row.lessonId.slice(2))}-2005-fra.txt`
  if (/^c-/.test(row.lessonId)) return 'SC102-1-6-2006-fra.txt'
  return undefined
}
const baselineEvidenceOverrides = new Map([
  ['b-39|demeurer sceptique', { pdf: 'SC102-2-39-2005-fra.txt', query: 'Je demeure sceptique', section: '39.1 knowledge and certainty example', category: 'expression' }],
  ['c-19|mettre à jour une base de données', { pdf: 'SC103-29-8-2011-1-fra.txt', query: 'mise à jour d’une base de données', section: 'C-level project scenario example', category: 'expression' }],
  ['c-19|une mise à jour de base de données', { pdf: 'SC103-29-8-2011-1-fra.txt', query: 'mise à jour d’une base de données', section: 'C-level project scenario example', category: 'expression' }],
])
const findLineEvidence = (pdf, query, section, category, evidenceType = 'source-example') => {
  const data = pdfData(pdf)
  for (let index = 0; index < data.records.length; index += 1) {
    const window = data.normalizedLines.slice(index, Math.min(data.records.length, index + 4)).join(' ')
    if (sequenceIncludes(query, window)) {
      const record = data.records[index]
      return { pdf: pdf.replace(/\.txt$/i, '.pdf'), page: record.page, lineRange: `${record.line}-${record.line + 3}`, section, category, evidenceType }
    }
  }
  return undefined
}
const englishMatches = (answer, text) => englishEvidenceFragments(answer).length > 0 && englishEvidenceFragments(answer).every((fragment) => sequenceIncludes(fragment, text))
const findPrimaryEvidence = (row) => {
  const override = baselineEvidenceOverrides.get(`${row.lessonId}|${norm(row.french)}`)
  if (override) return findLineEvidence(override.pdf, override.query, override.section, override.category)

  const preferred = preferredPdfFor(row)
  const candidates = [...new Set([preferred, ...pdfNames].filter(Boolean))]
  for (const pdf of candidates) {
    const data = pdfData(pdf)
    const records = data.records
    if (!records.length) continue
    const keyStart = data.keyStart
    const primaryEnd = keyStart >= 0 ? keyStart : records.length
    for (let index = 0; index < primaryEnd; index += 1) {
      const frenchWindow = data.normalizedLines.slice(index, Math.min(primaryEnd, index + 4)).join(' ')
      if (!sequenceIncludes(row.french, frenchWindow)) continue
      const start = Math.max(0, index - 20)
      const end = Math.min(primaryEnd, index + 24)
      const evidenceWindow = data.normalizedLines.slice(start, end).join(' ')
      if (englishMatches(row.answer, evidenceWindow)) {
        return { pdf: pdf.replace(/\.txt$/i, '.pdf'), page: records[index].page, lineRange: `${records[start].line}-${records[end - 1].line}`, section: 'previously reviewed source candidate', category: 'vocabulary', evidenceType: 'source-table' }
      }
    }
    for (let index = 0; index < primaryEnd; index += 1) {
      const window = data.normalizedLines.slice(index, Math.min(primaryEnd, index + 4)).join(' ')
      if (sequenceIncludes(row.french, window)) {
        const record = records[index]
        return { pdf: pdf.replace(/\.txt$/i, '.pdf'), page: record.page, lineRange: `${record.line}-${records[Math.min(primaryEnd - 1, index + 3)].line}`, section: 'previously reviewed source candidate', category: 'vocabulary', evidenceType: 'source-table' }
      }
    }
    if (keyStart >= 0) {
      for (let index = keyStart; index < records.length; index += 1) {
        const window = data.normalizedLines.slice(index, Math.min(records.length, index + 4)).join(' ')
        if (sequenceIncludes(row.french, window)) {
          const record = records[index]
          return { pdf: pdf.replace(/\.txt$/i, '.pdf'), page: record.page, lineRange: `${record.line}-${record.line + 3}`, section: 'answer-key cross-check only', category: 'vocabulary', evidenceType: 'answer-key-confirmation' }
        }
      }
    }
  }
  return undefined
}
const allSupplementRows = [...a04SourceSupplements, ...sourceSupplements, ...sourceSupplements1120, ...sourceSupplements2140, ...sourceSupplementsC, ...sourceSupplementsFollowup]
const supplementRowsQuarantined = allSupplementRows.filter((row) => quarantinedSourceKeys.has(sourceKey(row.lessonId, row.french)))
const supplementRows = allSupplementRows.filter((row) => !quarantinedSourceKeys.has(sourceKey(row.lessonId, row.french)))
const supplementEvidenceByKey = new Map(supplementRows.map((row) => [sourceKey(row.lessonId, row.french), row.evidence]))
const baselineEvidence = baselineSourceRows.map((row) => ({ ...row, evidence: supplementEvidenceByKey.get(sourceKey(row.lessonId, row.french)) ?? findPrimaryEvidence(row) }))
const baselineWithoutEvidence = baselineEvidence.filter((row) => !row.evidence)
const baselineAnswerKeyOnly = baselineEvidence.filter((row) => row.evidence?.evidenceType === 'answer-key-confirmation')
const baselineBilingualEvidence = baselineEvidence.map((row) => {
  if (!row.evidence) return { ...row, frenchPrimaryMatch: false, englishPrimaryMatch: false, primaryEvidenceMatch: false, primaryRangeMatch: false }
  const data = pdfData(row.evidence.pdf.replace(/\.pdf$/i, '.txt'))
  const [rangeStart, rangeEnd] = row.evidence.lineRange.split('-').map((value) => Number(value))
  const primaryText = data.normalizedLines.slice(Math.max(0, (rangeStart || 1) - 1), rangeEnd || data.normalizedLines.length).join(' ')
  const frenchPrimaryMatch = sequenceIncludes(row.french, data.primaryText)
  const frenchRangeMatch = sequenceIncludes(row.french, primaryText)
  const englishFragments = englishEvidenceFragments(row.answer)
  const englishPrimaryMatch = englishFragments.length > 0 && englishFragments.every((fragment) => sequenceIncludes(fragment, data.primaryText))
  const englishRangeMatch = englishFragments.length > 0 && englishFragments.every((fragment) => sequenceIncludes(fragment, primaryText))
  return { ...row, frenchPrimaryMatch, frenchRangeMatch, englishPrimaryMatch, englishRangeMatch, primaryEvidenceMatch: frenchPrimaryMatch && englishPrimaryMatch, primaryRangeMatch: frenchRangeMatch && englishRangeMatch }
})
const baselineBilingualMismatchesAll = baselineBilingualEvidence.filter((row) => !row.primaryEvidenceMatch)
const baselineBilingualRangeMismatchesAll = baselineBilingualEvidence.filter((row) => !row.primaryRangeMatch)
const activeBaselineBilingualEvidence = baselineBilingualEvidence.filter((row) => !isQuarantinedSourceKey(sourceKey(row.lessonId, row.french)))
const baselineBilingualMismatches = activeBaselineBilingualEvidence.filter((row) => !row.primaryEvidenceMatch)
const baselineBilingualRangeMismatches = activeBaselineBilingualEvidence.filter((row) => !row.primaryRangeMatch)
const baselineFailureKeys = new Set([...baselineBilingualMismatchesAll, ...baselineBilingualRangeMismatchesAll].map((row) => sourceKey(row.lessonId, row.french)))
const baselineAnswerKeyOnlyKeys = new Set(baselineAnswerKeyOnly.map((row) => sourceKey(row.lessonId, row.french)))
const unquarantinedBaselineFailures = [...baselineFailureKeys].filter((key) => !isQuarantinedSourceKey(key))
const unexpectedBaselineQuarantine = baselineQuarantined.filter((key) => !baselineFailureKeys.has(key) && !baselineAnswerKeyOnlyKeys.has(key))
const answerKey = (value) => String(value ?? '').trim().toLocaleLowerCase('en').replace(/[‘’]/g, "'").replace(/\s+/g, ' ')
const baselineByKey = new Map(baselineSourceRows.map((row) => [sourceKey(row.lessonId, row.french), row]))
const activeSupplementAnswerConflicts = supplementRows.filter((row) => {
  const baseline = baselineByKey.get(sourceKey(row.lessonId, row.french))
  return baseline && answerKey(baseline.answer) !== answerKey(row.answer)
}).map((row) => ({ key: sourceKey(row.lessonId, row.french), baseline: baselineByKey.get(sourceKey(row.lessonId, row.french)).answer, supplement: row.answer }))
const evidenceRowsByKey = Object.groupBy([...baselineSourceRows, ...supplementRows], (row) => sourceKey(row.lessonId, row.french))
const runtimeAnswerConflicts = sourceVocabulary.flatMap((card) => (evidenceRowsByKey[sourceKey(card.lessonId, card.french)] ?? []).filter((row) => answerKey(row.answer) !== answerKey(card.answer)).map((row) => ({ id: card.id, key: sourceKey(card.lessonId, card.french), card: card.answer, evidence: row.answer })))
const evidenceKeys = new Set([...baselineEvidence, ...supplementRows].map((row) => sourceKey(row.lessonId, row.french)))
const sourceCardsWithoutEvidence = sourceVocabulary.filter((row) => !evidenceKeys.has(sourceKey(row.lessonId, row.french)))
const baselineAligned = baselineEvidence.filter((row) => sourceKeys.has(sourceKey(row.lessonId, row.french)))
const baselineAnswerKeyOnlyAligned = baselineAligned.filter((row) => row.evidence?.evidenceType === 'answer-key-confirmation')
const supplementMissingEvidence = supplementRows.filter((row) => !row.evidence || !row.evidence.pdf || !row.evidence.page || !row.evidence.lineRange || !row.evidence.section || !row.evidence.category || !row.evidence.evidenceType || !row.evidence.englishFragments?.length)
const supplementCategories = Object.fromEntries(Object.entries(Object.groupBy(supplementRows, (row) => row.evidence.category)).map(([key, value]) => [key, value.length]))
const sourceSupplementEvidence = supplementRows.map((row) => {
  const data = pdfData(row.evidence.pdf.replace(/\.pdf$/i, '.txt'))
  const lines = data.records
  const normalizedFrench = norm(row.french)
  const [rangeStart, rangeEnd] = row.evidence.lineRange.split('-').map((value) => Number(value))
  const primaryText = data.normalizedLines.slice(Math.max(0, (rangeStart || 1) - 1), rangeEnd || data.normalizedLines.length).join(' ')
  const frenchPrimaryMatch = normalizedFrench && (sequenceIncludes(normalizedFrench, data.primaryText) || (row.evidence.sourceFragments?.length > 0 && row.evidence.sourceFragments.every((fragment) => sequenceIncludes(fragment, data.primaryText))))
  const frenchRangeMatch = normalizedFrench && (sequenceIncludes(normalizedFrench, primaryText) || (row.evidence.sourceFragments?.length > 0 && row.evidence.sourceFragments.every((fragment) => sequenceIncludes(fragment, primaryText))))
  const englishFragments = row.evidence.englishFragments ?? []
  const englishPrimaryMatch = englishFragments.length > 0 && englishFragments.every((fragment) => sequenceIncludes(fragment, data.primaryText))
  const englishRangeMatch = englishFragments.length > 0 && englishFragments.every((fragment) => sequenceIncludes(fragment, primaryText))
  const primaryEvidenceMatch = frenchPrimaryMatch && englishPrimaryMatch
  const primaryRangeMatch = frenchRangeMatch && englishRangeMatch
  const secondaryEvidence = []
  const answerKeyStart = data.keyStart >= 0 ? data.keyStart : lines.length
  lines.forEach((record, index) => {
    if (index < answerKeyStart) return
    const normalizedLine = data.normalizedLines[index]
    if (normalizedFrench && sequenceIncludes(normalizedFrench, normalizedLine)) {
      secondaryEvidence.push({ pdf: row.evidence.pdf, page: record.page, line: record.line, evidenceType: 'answer-key-confirmation' })
    }
  })
  return { lessonId: row.lessonId, french: row.french, answer: row.answer, primaryEvidence: row.evidence, primaryEvidenceMatch, primaryRangeMatch, frenchPrimaryMatch, frenchRangeMatch, englishPrimaryMatch, englishRangeMatch, secondaryEvidence }
})
const secondaryEvidenceCount = sourceSupplementEvidence.filter((row) => row.secondaryEvidence.length > 0).length
const primaryEvidenceMismatches = sourceSupplementEvidence.filter((row) => !row.primaryEvidenceMatch)
const primaryEvidenceRangeMismatches = sourceSupplementEvidence.filter((row) => !row.primaryRangeMatch)
const malformed = sourceVocabulary.filter((row) => /[\\/()]/.test(`${row.french}${row.answer}`))
const duplicatePrompts = sourceVocabulary.length - sourceKeys.size
const duplicateSourceIds = sourceVocabulary.length - sourceIds.size
const choiceFailures = []
for (const row of sourceVocabulary) {
  for (const reverse of [false, true]) {
    const question = buildVocabularyQuestion(row, reverse, sourceVocabulary)
    if (new Set([question.answer, ...question.distractors]).size !== 4) choiceFailures.push(`${row.id}:${reverse}`)
  }
}

const coverageFor = (file) => {
  const units = file.units ?? []
  if (units.length !== 1) return { evaluated: false, candidateCount: 0, coveredCount: 0, missing: [] }
  const candidates = [
    ...(file.reportCandidates ?? []),
    ...(file.bilingualCandidates ?? []).map((candidate) => ({ french: candidate.french, english: candidate.english, field: candidate.category })),
  ].filter((candidate) => candidate.french)
  const missing = candidates.filter((candidate) => !forms(candidate.french).some((form) => sourceKeys.has(sourceKey(units[0], form))))
  const quarantined = missing.filter((candidate) => forms(candidate.french).some((form) => isQuarantinedSourceKey(sourceKey(units[0], form))))
  const unresolved = missing.filter((candidate) => !quarantined.includes(candidate))
  return {
    evaluated: true,
    candidateCount: candidates.length,
    coveredCount: candidates.length - missing.length,
    quarantined: quarantined.slice(0, 100).map((candidate) => ({ french: candidate.french, english: candidate.english, field: candidate.field })),
    missing: unresolved.slice(0, 100).map((candidate) => ({ french: candidate.french, english: candidate.english, field: candidate.field })),
  }
}

const files = audit.files.map((file) => ({
  pdf: file.pdf,
  units: file.units,
  disposition: file.disposition,
  objective: file.objective,
  pagesWithSections: new Set((file.sections ?? []).map((section) => section.page)).size,
  sectionCount: (file.sections ?? []).length,
  candidateCounts: {
    bilingual: (file.bilingualCandidates ?? []).length,
    report: (file.reportCandidates ?? []).length,
    unmapped: (file.unmappedLexicalCandidates ?? []).length,
    answerKeyMarkers: (file.answerKeyLines ?? []).length,
  },
  categories: Object.fromEntries(Object.entries(Object.groupBy(file.bilingualCandidates ?? [], (candidate) => candidate.category)).map(([key, value]) => [key, value.length])),
  answerKeyMarkers: file.answerKeyLines ?? [],
  coverage: coverageFor(file),
}))

const units = [...new Set([...Object.keys(beforeByUnit), ...Object.keys(afterByUnit)])].sort()
const unitChanges = Object.fromEntries(units.map((unit) => [unit, {
  before: beforeByUnit[unit]?.length ?? 0,
  after: afterByUnit[unit]?.length ?? 0,
  added: Math.max(0, (afterByUnit[unit]?.length ?? 0) - (beforeByUnit[unit]?.length ?? 0)),
}]))
const dispositions = Object.fromEntries(Object.entries(Object.groupBy(files, (file) => file.disposition)).map(([key, value]) => [key, value.length]))
const answerKeyBearingPdfs = files.filter((file) => file.answerKeyMarkers.length > 0).map((file) => file.pdf)
const sourceUnits = Object.keys(afterByUnit).sort()

const report = {
  generatedAt: new Date().toISOString(),
  criteria: audit.criteria,
  workflow: {
    textSource: '.tmp/pdf-text/*.txt generated from the supplied PDFs',
    pageEvidence: 'Every candidate retains PDF text line and extracted page numbers; sections are tracked from objective headings.',
    primarySources: 'Named bilingual vocabulary, lexicon, grammar, spelling, function, and phonetics tables.',
    crossChecks: 'Answer keys, corrections, and transcriptions are inventoried but excluded from primary candidate generation.',
    exclusions: 'Incidental prose, source exercises, recordings, and answer-key-only sentences are not turned into cards.',
  },
  pdfCount: files.length,
  dispositions,
  answerKeyBearingPdfs: answerKeyBearingPdfs.length,
  answerKeyMarkerCount: files.reduce((sum, file) => sum + file.answerKeyMarkers.length, 0),
  sourceCards: sourceVocabulary.length,
  sourceUnits: sourceUnits.length,
  emptySourceUnits: units.filter((unit) => !afterByUnit[unit]?.length),
  a04: { before: beforeByUnit['a-04']?.length ?? 0, after: afterByUnit['a-04']?.length ?? 0, sourceTerms: afterByUnit['a-04']?.map((row) => row.french) ?? [] },
  unitChanges,
  baselineQuarantined,
  supplementQuarantined: supplementRowsQuarantined.map((row) => ({ lessonId: row.lessonId, french: row.french, answer: row.answer, evidence: row.evidence })),
  checks: {
    duplicatePrompts,
    duplicateSourceIds,
    malformedForms: malformed.length,
    choiceFailures: choiceFailures.length,
    allTargetIdsUnique: allTargets.length === new Set(allTargets.map((target) => target.id)).size,
    supplementRows: supplementRows.length,
    supplementRowsQuarantined: supplementRowsQuarantined.length,
    supplementMissingEvidence: supplementMissingEvidence.length,
    baselineRows: baselineEvidence.length,
    baselineRowsQuarantined: baselineQuarantined.length,
    baselineWithoutEvidence: baselineWithoutEvidence.length,
    baselineAnswerKeyOnly: baselineAnswerKeyOnly.length,
    baselineAnswerKeyOnlyAligned: baselineAnswerKeyOnlyAligned.length,
    sourceCardsWithoutEvidence: sourceCardsWithoutEvidence.length,
    baselineIdsChanged: baselineIdsChanged.length,
    supplementCategories,
    supplementEvidenceRows: sourceSupplementEvidence.length,
    supplementRowsWithAnswerKeyConfirmation: secondaryEvidenceCount,
    primaryEvidenceMismatches: primaryEvidenceMismatches.length,
    primaryEvidenceRangeMismatches: primaryEvidenceRangeMismatches.length,
    primaryEnglishEvidenceMismatches: sourceSupplementEvidence.filter((row) => !row.englishPrimaryMatch).length,
    primaryEnglishRangeMismatches: sourceSupplementEvidence.filter((row) => !row.englishRangeMatch).length,
    baselineBilingualFailures: baselineBilingualMismatchesAll.length,
    baselineBilingualRangeFailures: baselineBilingualRangeMismatchesAll.length,
    baselineBilingualMismatches: baselineBilingualMismatches.length,
    baselineBilingualRangeMismatches: baselineBilingualRangeMismatches.length,
    unquarantinedBaselineFailures: unquarantinedBaselineFailures.length,
    unexpectedBaselineQuarantine: unexpectedBaselineQuarantine.length,
    activeSupplementAnswerConflicts: activeSupplementAnswerConflicts.length,
    runtimeAnswerConflicts: runtimeAnswerConflicts.length,
    combinedCards: allCards.length,
    combinedTargets: allTargets.length,
  },
  files,
  sourceSupplementEvidence,
  baselineEvidence,
  baselineBilingualEvidence,
  baselineBilingualMismatchesAll,
  baselineBilingualRangeMismatchesAll,
  baselineBilingualMismatches,
  baselineBilingualRangeMismatches,
  unquarantinedBaselineFailures,
  unexpectedBaselineQuarantine,
  activeSupplementAnswerConflicts,
  runtimeAnswerConflicts,
}
fs.writeFileSync('.tmp/source-coverage-report.json', JSON.stringify(report, null, 2))
console.log(JSON.stringify({ pdfCount: report.pdfCount, dispositions: report.dispositions, answerKeyBearingPdfs: report.answerKeyBearingPdfs, answerKeyMarkerCount: report.answerKeyMarkerCount, sourceCards: report.sourceCards, sourceUnits: report.sourceUnits, emptySourceUnits: report.emptySourceUnits, a04: report.a04, supplementRows: report.checks.supplementRows, supplementRowsQuarantined: report.checks.supplementRowsQuarantined, baselineRows: report.checks.baselineRows, baselineRowsQuarantined: report.checks.baselineRowsQuarantined, checks: report.checks }))
if (report.pdfCount !== 76 || report.sourceUnits !== 61 || report.emptySourceUnits.length || report.checks.duplicatePrompts || report.checks.duplicateSourceIds || report.checks.malformedForms || report.checks.choiceFailures || report.checks.supplementMissingEvidence || report.checks.baselineWithoutEvidence || report.checks.baselineAnswerKeyOnlyAligned || report.checks.sourceCardsWithoutEvidence || report.checks.baselineIdsChanged || report.checks.primaryEvidenceMismatches || report.checks.primaryEvidenceRangeMismatches || report.checks.baselineBilingualMismatches || report.checks.baselineBilingualRangeMismatches || report.checks.unquarantinedBaselineFailures || report.checks.unexpectedBaselineQuarantine || report.checks.activeSupplementAnswerConflicts || report.checks.runtimeAnswerConflicts || !report.checks.allTargetIdsUnique) process.exitCode = 1
