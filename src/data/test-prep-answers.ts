/** Instructor-style questions for the Test prep "Build the answer" round, units a-01 … a-06. */
export type BuildAnswerItem = {
  id: string
  unitId: string
  /** French, what the instructor asks. Digits in brackets give the fact the answer must state. */
  question: string
  /** The reply as tiles, in order. */
  answer: string[]
  /** Other correct orders of the same tiles, if any. */
  accepted?: string[][]
  /** 2 or 3 tiles that are wrong here. */
  traps: string[]
  /** One English line shown after a miss. */
  note?: string
}

export const buildAnswerItems: BuildAnswerItem[] = [
  // a-01 · S'identifier et identifier des personnes
  { id: 'a-01-build-01', unitId: 'a-01', question: 'Où travaillez-vous?', answer: ['Je', 'travaille', 'à', 'Ottawa'], traps: ['travaillez', 'de'], note: 'je travaille; use à before a city.' },
  { id: 'a-01-build-02', unitId: 'a-01', question: 'Comment vous appelez-vous?', answer: ['Je', 'm’appelle', 'Nadia'], traps: ['appelle', 's’appelle'], note: 'je m’appelle: the pronoun m’ matches je.' },
  { id: 'a-01-build-03', unitId: 'a-01', question: 'Quelle est la profession de Samira?', answer: ['Elle', 'est', 'traductrice'], traps: ['sont', 'traducteur'], note: 'Samira is a woman: traductrice. No article after est with a profession.' },
  { id: 'a-01-build-04', unitId: 'a-01', question: 'Quelle est la profession d’Alex?', answer: ['Alex', 'est', 'chef', 'de', 'projet'], traps: ['sont', 'chefs'], note: 'One person: est and chef, singular.' },
  { id: 'a-01-build-05', unitId: 'a-01', question: 'De la part de qui?', answer: ['C’est', 'de', 'la', 'part', 'de', 'Nadia'], traps: ['du', 'le'], note: 'Fixed phrase: de la part de + name.' },

  // a-02 · Identifier des objets ou des documents
  { id: 'a-02-build-01', unitId: 'a-02', question: 'Qu’est-ce que c’est?', answer: ['C’est', 'un', 'document', 'confidentiel'], traps: ['une', 'confidentielle'], note: 'document is masculine: un document confidentiel.' },
  { id: 'a-02-build-02', unitId: 'a-02', question: 'Et ça, qu’est-ce que c’est?', answer: ['Ce', 'sont', 'des', 'formulaires'], traps: ['est', 'un'], note: 'Plural: ce sont des …' },
  { id: 'a-02-build-03', unitId: 'a-02', question: 'Qu’est-ce que c’est, ça?', answer: ['C’est', 'une', 'gomme', 'à', 'effacer'], traps: ['un', 'sont'], note: 'gomme is feminine: une gomme à effacer.' },
  { id: 'a-02-build-04', unitId: 'a-02', question: 'Et ces documents-là, qu’est-ce que c’est?', answer: ['Ce', 'sont', 'des', 'photocopies', 'du', 'rapport'], traps: ['est', 'une'], note: 'Plural: ce sont des …' },
  { id: 'a-02-build-05', unitId: 'a-02', question: 'Comment est-ce que ça s’appelle?', answer: ['Ça', 's’appelle', 'un', 'scanneur'], traps: ['une', 's’appellent'], note: 'ça takes a singular verb; scanneur is masculine.' },

  // a-03 · Exprimer des relations d'appartenance
  { id: 'a-03-build-01', unitId: 'a-03', question: 'À quel ministère travaillez-vous?', answer: ['Je', 'travaille', 'au', 'ministère', 'des', 'Finances'], traps: ['à', 'du'], note: 'à + le = au; Finances is plural, so des.' },
  { id: 'a-03-build-02', unitId: 'a-03', question: 'De quel ministère êtes-vous?', answer: ['Je', 'suis', 'du', 'ministère', 'de', 'la', 'Santé'], traps: ['des', 'à'], note: 'être de: de + le = du.' },
  { id: 'a-03-build-03', unitId: 'a-03', question: 'À quelle association appartient Alex?', answer: ['Alex', 'appartient', 'à', 'l’association', 'des', 'comptables'], traps: ['appartiens', 'au'], note: 'Alex appartient (one person); à l’ before a vowel, never au.' },
  { id: 'a-03-build-04', unitId: 'a-03', question: 'Pour qui travaillent-ils?', answer: ['Ils', 'travaillent', 'pour', 'le', 'ministre'], traps: ['travaille', 'dans'], note: 'ils travaillent pour + a person.' },
  { id: 'a-03-build-05', unitId: 'a-03', question: 'De quelle association êtes-vous membre?', answer: ['Je', 'suis', 'membre', 'de', 'l’association', 'des', 'gestionnaires'], traps: ['es', 'à'], note: 'être membre de, never à.' },

  // a-04 · Exprimer des relations de possession
  { id: 'a-04-build-01', unitId: 'a-04', question: 'C’est à qui, ce crayon?', answer: ['C’est', 'le', 'mien'], traps: ['la', 'miens'], note: 'crayon is masculine singular: le mien.' },
  { id: 'a-04-build-02', unitId: 'a-04', question: 'C’est à qui, la clé?', answer: ['Elle', 'est', 'à', 'Samira'], traps: ['sont', 'a'], note: 'One key: elle est; être à (with the accent) + person.' },
  { id: 'a-04-build-03', unitId: 'a-04', question: 'Avez-vous un foulard?', answer: ['J’ai', 'un', 'foulard', 'gris'], traps: ['une', 'grise'], note: 'foulard is masculine: un foulard gris.' },
  { id: 'a-04-build-04', unitId: 'a-04', question: 'Comment est votre manteau?', answer: ['Mon', 'manteau', 'est', 'vieux', 'et', 'bleu'], accepted: [['Mon', 'manteau', 'est', 'bleu', 'et', 'vieux']], traps: ['Ma', 'vieille'], note: 'manteau is masculine: mon, vieux.' },
  { id: 'a-04-build-05', unitId: 'a-04', question: 'À qui appartient la bicyclette?', answer: ['Elle', 'appartient', 'au', 'voisin'], traps: ['à', 'appartiens'], note: 'appartenir à + le = au.' },

  // a-05 · Indiquer où est une personne, un objet/document, un lieu
  { id: 'a-05-build-01', unitId: 'a-05', question: 'Où est la salle de conférences?', answer: ['Elle', 'est', 'à', 'côté', 'de', 'l’ascenseur'], traps: ['sont', 'le'], note: 'à côté de; l’ before a vowel.' },
  { id: 'a-05-build-02', unitId: 'a-05', question: 'Où est la cafétéria?', answer: ['Elle', 'est', 'au', 'rez-de-chaussée'], traps: ['sont', 'à'], note: 'à + le = au.' },
  { id: 'a-05-build-03', unitId: 'a-05', question: 'Où se trouve le laboratoire?', answer: ['Il', 'se', 'trouve', 'au', 'sous-sol'], traps: ['trouvent', 'à'], note: 'il se trouve au sous-sol.' },
  { id: 'a-05-build-04', unitId: 'a-05', question: 'Qu’est-ce qu’il y a dans l’édifice?', answer: ['Il', 'y', 'a', 'un', 'dépanneur'], traps: ['une', 'sont'], note: 'il y a never changes; dépanneur is masculine.' },
  { id: 'a-05-build-05', unitId: 'a-05', question: 'Où est la salle d’attente?', answer: ['Elle', 'est', 'en', 'face', 'de', 'l’ascenseur'], traps: ['sont', 'à'], note: 'en face de; l’ before a vowel.' },

  // a-06 · Indiquer des données chiffrées
  { id: 'a-06-build-01', unitId: 'a-06', question: 'Quel est votre numéro de poste? (82)', answer: ['C’est', 'le', 'quatre-vingt-deux'], traps: ['la', 'quatre-vingt-douze'], note: '82 = quatre-vingt-deux; 92 = quatre-vingt-douze.' },
  { id: 'a-06-build-02', unitId: 'a-06', question: 'Combien de documents y a-t-il? (environ 30)', answer: ['Il', 'y', 'a', 'une', 'trentaine', 'de', 'documents'], traps: ['un', 'trente'], note: 'About 30: une trentaine de.' },
  { id: 'a-06-build-03', unitId: 'a-06', question: 'Combien de candidats y a-t-il? (75)', answer: ['Il', 'y', 'a', 'soixante-quinze', 'candidats'], traps: ['soixante-cinq', 'sont'], note: '75 = soixante-quinze; 65 = soixante-cinq.' },
  { id: 'a-06-build-04', unitId: 'a-06', question: 'Combien de chaises y a-t-il? (71)', answer: ['Il', 'y', 'a', 'soixante et onze', 'chaises'], traps: ['soixante et un', 'sont'], note: '71 = soixante et onze; 61 = soixante et un.' },
  { id: 'a-06-build-05', unitId: 'a-06', question: 'Quel dossier est confidentiel?', answer: ['Celui-ci', 'est', 'confidentiel'], traps: ['Celle-ci', 'sont'], note: 'dossier is masculine: celui-ci.' },
]
