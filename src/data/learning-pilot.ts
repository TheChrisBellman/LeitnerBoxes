import type { CardProgress } from '../leitner.ts'
import { allCards } from './words.ts'
import type { LearningNote, VocabularyCard } from './types.ts'

export type LearningPilotLesson = {
  lessonId: string
  cardIds: readonly string[]
}

export type LearningPilotTerm = {
  card: VocabularyCard
  note: LearningNote
}

export const learningNotesByCardId: Record<string, LearningNote> = {
  'a-01-source-052': {
    exampleFrench: 'Je suis l’agent responsable du dossier.',
    exampleEnglish: 'I am the officer responsible for the file.',
    note: 'The title changes with the person: un agent / une agente.',
  },
  'a-01-source-010': {
    exampleFrench: 'La conseillère répond aux questions du personnel.',
    exampleEnglish: 'The advisor answers staff questions.',
  },
  'a-01-source-014': {
    exampleFrench: 'La gestionnaire approuve la demande avant la réunion.',
    exampleEnglish: 'The manager approves the request before the meeting.',
  },
  'a-01-source-079': {
    exampleFrench: 'Bonjour, je suis Alex Martin, de l’équipe des services numériques.',
    exampleEnglish: 'Hello, I am Alex Martin, from the digital services team.',
  },
  'a-01-source-085': {
    exampleFrench: 'Vous êtes la personne-ressource pour ce dossier.',
    exampleEnglish: 'You are the contact person for this file.',
  },
  'a-01-source-073': {
    exampleFrench: 'Bonjour, c’est de la part de qui ?',
    exampleEnglish: 'Hello, who is calling?',
  },
  'a-02-source-007': {
    exampleFrench: 'L’ordre du jour est joint à l’invitation.',
    exampleEnglish: 'The agenda is attached to the invitation.',
    note: 'Ordre is masculine even though the article contracts to l’.',
  },
  'a-02-source-021': {
    exampleFrench: 'Le rapport sera prêt vendredi.',
    exampleEnglish: 'The report will be ready on Friday.',
  },
  'a-02-source-024': {
    exampleFrench: 'Le document est dans le dossier partagé.',
    exampleEnglish: 'The document is in the shared folder.',
  },
  'a-02-source-056': {
    exampleFrench: 'Je vous enverrai le courriel après la réunion.',
    exampleEnglish: 'I will send you the email after the meeting.',
  },
  'a-02-source-057': {
    exampleFrench: 'La demande doit être approuvée par la gestionnaire.',
    exampleEnglish: 'The request must be approved by the manager.',
  },
  'a-02-source-061': {
    exampleFrench: 'Remplissez le formulaire avant de l’envoyer.',
    exampleEnglish: 'Complete the form before sending it.',
  },
  'a-03-source-001': {
    exampleFrench: 'Je travaille dans l’équipe des communications.',
    exampleEnglish: 'I work in the communications team.',
  },
  'a-03-source-002': {
    exampleFrench: 'Je travaille pour le ministère de la Justice.',
    exampleEnglish: 'I work for the Department of Justice.',
  },
  'a-03-source-005': {
    exampleFrench: 'Elle est membre du comité de santé et de sécurité.',
    exampleEnglish: 'She is a member of the health and safety committee.',
  },
  'a-03-source-010': {
    exampleFrench: 'Notre direction fait partie de la Région de la capitale nationale.',
    exampleEnglish: 'Our directorate is part of the National Capital Region.',
  },
  'a-03-source-011': {
    exampleFrench: 'Ce dossier appartient à la gestionnaire.',
    exampleEnglish: 'This file belongs to the manager.',
  },
  'a-03-source-012': {
    exampleFrench: 'Nous répondons au directeur avant midi.',
    exampleEnglish: 'We reply to the director before noon.',
    note: 'Au combines à + le before a masculine singular noun.',
  },
}

export const learningPilotLessons: readonly LearningPilotLesson[] = [
  { lessonId: 'a-01', cardIds: ['a-01-source-052', 'a-01-source-010', 'a-01-source-014', 'a-01-source-079', 'a-01-source-085', 'a-01-source-073'] },
  { lessonId: 'a-02', cardIds: ['a-02-source-007', 'a-02-source-021', 'a-02-source-024', 'a-02-source-056', 'a-02-source-057', 'a-02-source-061'] },
  { lessonId: 'a-03', cardIds: ['a-03-source-001', 'a-03-source-002', 'a-03-source-005', 'a-03-source-010', 'a-03-source-011', 'a-03-source-012'] },
]

export function recommendedLearningPilotLesson(progress: Record<string, CardProgress>): LearningPilotLesson | undefined {
  for (const lesson of learningPilotLessons) {
    const started = lesson.cardIds.filter((cardId) => Boolean(progress[cardId])).length
    if (started === 0) return lesson
    if (started < lesson.cardIds.length) return undefined
  }
  return undefined
}

export function focusedLearningTargetQueue(
  lesson: LearningPilotLesson,
  cards: readonly VocabularyCard[] = allCards.filter((card): card is VocabularyCard => card.kind === 'vocabulary'),
): VocabularyCard[] {
  const cardsById = new Map(cards.map((card) => [card.id, card]))
  return lesson.cardIds.map((cardId) => {
    const card = cardsById.get(cardId)
    if (!card) throw new Error(`Unknown learning-pilot card: ${cardId}`)
    return card
  })
}

export function learningPilotTerms(lesson: LearningPilotLesson): LearningPilotTerm[] {
  return focusedLearningTargetQueue(lesson).map((card) => ({ card, note: learningNotesByCardId[card.id] }))
}

export function assertValidLearningPilot(cards: readonly VocabularyCard[] = allCards.filter((card): card is VocabularyCard => card.kind === 'vocabulary')): void {
  const pilotCardIds = new Set(learningPilotLessons.flatMap((lesson) => lesson.cardIds))
  Object.entries(learningNotesByCardId).forEach(([cardId, note]) => {
    if (!cards.some((card) => card.id === cardId)) throw new Error(`Unknown learning-pilot card: ${cardId}`)
    if (!pilotCardIds.has(cardId)) throw new Error(`Learning-pilot note is not in a lesson: ${cardId}`)
    if (!note.exampleFrench.trim() || !note.exampleEnglish.trim()) throw new Error(`Learning-pilot card needs bilingual examples: ${cardId}`)
  })
  const seenCardIds = new Set<string>()
  learningPilotLessons.forEach((lesson) => {
    if (lesson.cardIds.length < 5 || lesson.cardIds.length > 8) throw new Error(`${lesson.lessonId} needs 5–8 learning-pilot terms`)
    focusedLearningTargetQueue(lesson, cards).forEach((card) => {
      if (seenCardIds.has(card.id)) throw new Error(`Learning-pilot card is repeated: ${card.id}`)
      seenCardIds.add(card.id)
      if (!learningNotesByCardId[card.id]) throw new Error(`Learning-pilot card needs a note: ${card.id}`)
    })
  })
}
