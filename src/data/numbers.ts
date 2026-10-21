import type { NumberCard } from './types.ts'

const TEN = 10
const TWENTY = 20
const EIGHTY = 80
const HUNDRED = 100
const THOUSAND = 1000
const MILLION = 1_000_000
const FIRST_COMPOUND_TEEN = 17
const SEVENTY = 70
const MIN_PLURAL_HUNDREDS = 2

const units = ['zéro', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize']
// Indexed by tens digit. An empty entry counts on from the decade before: soixante-dix, quatre-vingt-onze.
const decadeWords = ['', '', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', '', 'quatre-vingt', '']
// « et » joins un and onze to vingt through soixante: vingt et un, soixante et onze, but quatre-vingt-un.
const etUnits = new Set(['un', 'onze'])

// Traditional spelling: hyphens below 100; vingt and cent take -s only when final or before million(s).
function under100(n: number, plural: boolean): string {
  if (n < FIRST_COMPOUND_TEEN) return units[n]
  if (n < TWENTY) return `dix-${units[n - TEN]}`
  const decade = n - (n % TEN)
  const base = decadeWords[decade / TEN] ? decade : decade - TEN
  const rest = n - base
  const word = decadeWords[base / TEN]
  if (rest === 0) return base === EIGHTY && plural ? `${word}s` : word
  const restWord = under100(rest, plural)
  return `${word}${base < EIGHTY && etUnits.has(restWord) ? ' et ' : '-'}${restWord}`
}

function under1000(n: number, plural: boolean): string {
  const hundreds = Math.floor(n / HUNDRED)
  const rest = n % HUNDRED
  const words: string[] = []
  if (hundreds > 1) words.push(units[hundreds])
  if (hundreds > 0) words.push(rest === 0 && plural && hundreds > 1 ? 'cents' : 'cent')
  if (rest > 0 || hundreds === 0) words.push(under100(rest, plural))
  return words.join(' ')
}

export function spellFrenchNumber(n: number): string {
  if (n === 0) return units[0]
  const millions = Math.floor(n / MILLION)
  const thousands = Math.floor(n / THOUSAND) % THOUSAND
  const rest = n % THOUSAND
  const words: string[] = []
  if (millions === 1) words.push('un million')
  if (millions > 1) words.push(`${under1000(millions, true)} millions`)
  if (thousands === 1) words.push('mille')
  if (thousands > 1) words.push(`${under1000(thousands, false)} mille`)
  if (rest > 0) words.push(under1000(rest, true))
  return words.join(' ')
}

// Splits on spaces and hyphens: "vingt et un" and "quatre-vingt-un" both become one tile per word; "dix" has no break.
// https://regex101.com/?regex=%5B%20-%5D&testString=vingt%20et%20un%0Aquatre-vingt-un%0Adix
const tileBreak = /[ -]/

export function frenchNumberTokens(n: number): string[] {
  return spellFrenchNumber(n).split(tileBreak)
}

const between = (random: () => number, min: number, max: number) => min + Math.floor(random() * (max - min + 1))
const pickOne = <T>(random: () => number, items: readonly T[]): T => items[between(random, 0, items.length - 1)]

// Each card is a pattern; every review draws a fresh number from it. Generators keep answers to about 12 tiles.
const patterns: { id: string; label: string; pick: (random: () => number) => number }[] = [
  { id: 'number-0-16', label: '0 to 16', pick: (random) => between(random, 0, FIRST_COMPOUND_TEEN - 1) },
  { id: 'number-17-69', label: '17 to 69', pick: (random) => between(random, FIRST_COMPOUND_TEEN, SEVENTY - 1) },
  { id: 'number-70-79', label: '70 to 79', pick: (random) => between(random, SEVENTY, EIGHTY - 1) },
  { id: 'number-80-99', label: '80 to 99', pick: (random) => between(random, EIGHTY, HUNDRED - 1) },
  { id: 'number-hundreds', label: '100 to 999', pick: (random) => between(random, HUNDRED, THOUSAND - 1) },
  {
    id: 'number-plural-agreement',
    label: 'Plural vingts and cents',
    pick: (random) => {
      const hundred = between(random, MIN_PLURAL_HUNDREDS, TEN - 1) * HUNDRED
      return pickOne(random, [EIGHTY, hundred, hundred + EIGHTY, EIGHTY * THOUSAND, hundred * THOUSAND, EIGHTY * MILLION, hundred * MILLION])
    },
  },
  { id: 'number-thousands', label: '1 000 to 9 999', pick: (random) => between(random, THOUSAND, TEN * THOUSAND - 1) },
  { id: 'number-large-thousands', label: '10 000 to 999 999', pick: (random) => between(random, TEN, THOUSAND - 1) * THOUSAND + pickOne(random, [0, between(random, 1, HUNDRED - 1)]) },
  {
    id: 'number-millions',
    label: 'Millions',
    pick: (random) => between(random, 1, HUNDRED - 1) * MILLION + pickOne(random, [0, between(random, 1, THOUSAND - 1) * THOUSAND, between(random, 1, THOUSAND - 1)]),
  },
]

export const numberCards: NumberCard[] = patterns.map(({ id, label }, order) => ({
  id, level: 'A', lessonId: 'a-06', kind: 'number', tier: 'core', order, label,
}))

export function pickNumber(card: NumberCard, random: () => number = Math.random): number {
  return patterns.find((pattern) => pattern.id === card.id)!.pick(random)
}
