import type { NumberCard } from './types.ts'

export const TEN = 10
export const TWENTY = 20
const EIGHTY = 80
export const HUNDRED = 100
export const THOUSAND = 1000
export const MILLION = 1_000_000
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

/** 0 to 100 spelled out; index is the number. Used by Sprint. */
export const frenchNumbers: readonly string[] = Array.from({ length: HUNDRED + 1 }, (_, n) => spellFrenchNumber(n))

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

// deux…six each have a sound-alike teen (douze…seize); from trois on the decade sounds alike too (treize, trente).
const FIRST_SOUND_ALIKE_UNIT = 2
const LAST_SOUND_ALIKE_UNIT = 6
const FIRST_SOUND_ALIKE_DECADE = 3
const NINETY = 90
const soundAlikePairs: [number, number][] = Array.from({ length: LAST_SOUND_ALIKE_UNIT - FIRST_SOUND_ALIKE_UNIT + 1 }, (_, offset) => FIRST_SOUND_ALIKE_UNIT + offset)
  .flatMap((unit): [number, number][] => {
    const teen = TEN + unit
    const decade = unit * TEN
    return unit < FIRST_SOUND_ALIKE_DECADE ? [[unit, teen]] : [[unit, teen], [unit, decade], [teen, decade]]
  })

/** Wrong numbers a learner might pick for n, most tempting first: sound-alikes, the 70s/90s mix-up, swapped digits, then neighbours. */
export function numberLookalikes(n: number): number[] {
  const size = Math.abs(n)
  const sign = Math.sign(n) || 1
  const swapped = size >= TEN && size < HUNDRED && size % TEN !== 0 ? (size % TEN) * TEN + Math.floor(size / TEN) : size
  const step = size >= HUNDRED ? TEN ** Math.floor(Math.log10(size)) : TEN
  const near = [
    ...soundAlikePairs.filter((pair) => pair.includes(size)).map(([a, b]) => a === size ? b : a),
    // soixante-douze and quatre-vingt-douze both end in douze.
    ...(size >= SEVENTY && size < EIGHTY ? [size + TWENTY] : []),
    ...(size >= NINETY && size < HUNDRED ? [size - TWENTY] : []),
    swapped,
    ...(size >= HUNDRED ? [size * TEN, size / TEN] : []),
    size + step, size + 1, size - step, size - 1,
  ]
  return [...new Set([...(n < 0 ? [size] : []), ...near.map((value) => value * sign)])]
    .filter((value) => Number.isInteger(value) && value !== n && (n < 0 || value > 0 || (n === 0 && value >= 0)))
}

const teenUnits: Record<string, string> = { onze: 'un', douze: 'deux', treize: 'trois', quatorze: 'quatre', quinze: 'cinq', seize: 'six' }
// A plural vingts or cents: matches "deux cents", not "cent un".
// https://regex101.com/?regex=%5Cb%28vingt%7Ccent%29s%5Cb&testString=deux%20cents%0Aquatre-vingts%0Acent%20un
const FINAL_PLURAL = /\b(vingt|cent)s\b/
// Quatre-vingt or a multiplied cent with more after it: matches "quatre-vingt-un", "deux cent mille", not "vingt-deux" or "cent un".
// https://regex101.com/?regex=%5Cb%28quatre-vingt%7C%28%3F%3Adeux%7Ctrois%7Cquatre%7Ccinq%7Csix%7Csept%7Chuit%7Cneuf%29%20cent%29%5Cb%28%3F%3D%5B%20-%5D%29&testString=quatre-vingt-un%0Adeux%20cent%20mille%0Avingt-deux%0Acent%20un
const INNER_VINGT_OR_CENT = /\b(quatre-vingt|(?:deux|trois|quatre|cinq|six|sept|huit|neuf) cent)\b(?=[ -])/
// Mille after a multiplier: matches "deux mille", not "mille".
// https://regex101.com/?regex=%20mille%5Cb&testString=deux%20mille%0Amille
const MULTIPLIED_MILLE = / mille\b/
// A hyphenated final un or onze: matches "quatre-vingt-un", not "vingt et un".
// https://regex101.com/?regex=-%28un%7Conze%29%24&testString=quatre-vingt-un%0Avingt%20et%20un
const FINAL_UN_OR_ONZE = /-(un|onze)$/
// Onze to seize as a whole word: matches "soixante-douze", not "dix-sept".
// https://regex101.com/?regex=%5Cb%28onze%7Cdouze%7Ctreize%7Cquatorze%7Cquinze%7Cseize%29%5Cb&testString=soixante-douze%0Adix-sept
const TEEN_WORD = /\b(onze|douze|treize|quatorze|quinze|seize)\b/
// The gaps between groups of three digits: matches inside "10000", not in "100".
// https://regex101.com/?regex=%5CB%28%3F%3D%28%5Cd%7B3%7D%29%2B%28%3F%21%5Cd%29%29&testString=10000%0A100
const DIGIT_GROUP = /\B(?=(\d{3})+(?!\d))/g

/** Common misspellings of n: -s on quatre-vingt or a multiplied cent where it does not belong (or missing where it does), a missing or extra « et », « dix-six » for seize. Never just a hyphen change. */
export function frenchNumberMisspellings(n: number): string[] {
  const spelled = spellFrenchNumber(n)
  const loose = (text: string) => text.split('-').join(' ')
  const wrong = [
    spelled.replace(FINAL_PLURAL, '$1'),
    spelled.replace(INNER_VINGT_OR_CENT, '$1s'),
    spelled.replace(MULTIPLIED_MILLE, ' milles'),
    spelled.replace(' et ', '-'),
    spelled.replace(FINAL_UN_OR_ONZE, ' et $1'),
    spelled.replace(TEEN_WORD, (teen) => `dix-${teenUnits[teen]}`).replace(' et dix', '-dix'),
  ]
  return [...new Set(wrong)].filter((text) => loose(text) !== loose(spelled))
}

/** Writes an integer the way the course does: thin groups of three, « 10 000 ». */
export const groupDigits = (n: number) => String(n).replace(DIGIT_GROUP, ' ')
