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
  { id: 'a-02-build-03', unitId: 'a-02', question: 'Quel document signez-vous?', answer: ['Je', 'signe', 'le', 'contrat'], traps: ['signez', 'la'], note: 'je signe; contrat is masculine.' },
  { id: 'a-02-build-04', unitId: 'a-02', question: 'Qu’est-ce qu’ils lisent?', answer: ['Ils', 'lisent', 'le', 'procès-verbal'], traps: ['lisez', 'la'], note: 'ils lisent; procès-verbal is masculine.' },
  { id: 'a-02-build-05', unitId: 'a-02', question: 'Comment ça s’appelle?', answer: ['Ça', 's’appelle', 'un', 'scanneur'], traps: ['une', 's’appellent'], note: 'ça takes a singular verb; scanneur is masculine.' },

  // a-03 · Exprimer des relations d'appartenance
  { id: 'a-03-build-01', unitId: 'a-03', question: 'À quel ministère travaillez-vous?', answer: ['Je', 'travaille', 'au', 'ministère', 'des', 'Finances'], traps: ['à', 'du'], note: 'à + le = au; Finances is plural, so des.' },
  { id: 'a-03-build-02', unitId: 'a-03', question: 'De quel ministère êtes-vous?', answer: ['Je', 'suis', 'du', 'ministère', 'de', 'la', 'Santé'], traps: ['des', 'à'], note: 'être de: de + le = du.' },
  { id: 'a-03-build-03', unitId: 'a-03', question: 'À quelle association appartient Alex?', answer: ['Alex', 'appartient', 'à', 'l’association', 'des', 'comptables'], traps: ['appartiens', 'au'], note: 'Alex appartient (one person); à l’ before a vowel, never au.' },
  { id: 'a-03-build-04', unitId: 'a-03', question: 'Pour qui travaillent-ils?', answer: ['Ils', 'travaillent', 'pour', 'le', 'ministre'], traps: ['travaille', 'dans'], note: 'ils travaillent pour + a person.' },
  { id: 'a-03-build-05', unitId: 'a-03', question: 'De quelle association êtes-vous membre?', answer: ['Je', 'suis', 'membre', 'de', 'l’association', 'des', 'gestionnaires'], traps: ['es', 'à'], note: 'être membre de, never à.' },

  // a-04 · Exprimer des relations de possession
  { id: 'a-04-build-01', unitId: 'a-04', question: 'À qui est ce stylo?', answer: ['C’est', 'le', 'mien'], traps: ['la', 'miens'], note: 'stylo is masculine singular: le mien.' },
  { id: 'a-04-build-02', unitId: 'a-04', question: 'À qui est la clé?', answer: ['Elle', 'est', 'à', 'Samira'], traps: ['sont', 'a'], note: 'One key: elle est; être à (with the accent) + person.' },
  { id: 'a-04-build-03', unitId: 'a-04', question: 'Avez-vous un parapluie?', answer: ['J’ai', 'un', 'parapluie', 'noir'], traps: ['une', 'noire'], note: 'parapluie is masculine: un parapluie noir.' },
  { id: 'a-04-build-04', unitId: 'a-04', question: 'Comment est votre manteau?', answer: ['Mon', 'manteau', 'est', 'vieux', 'et', 'bleu'], accepted: [['Mon', 'manteau', 'est', 'bleu', 'et', 'vieux']], traps: ['Ma', 'vieille'], note: 'manteau is masculine: mon, vieux.' },
  { id: 'a-04-build-05', unitId: 'a-04', question: 'À qui appartient le fauteuil?', answer: ['Il', 'appartient', 'au', 'directeur', 'général'], traps: ['à', 'appartiens'], note: 'appartenir à + le = au.' },

  // a-05 · Indiquer où est une personne, un objet/document, un lieu
  { id: 'a-05-build-01', unitId: 'a-05', question: 'Où est la salle de conférences?', answer: ['Elle', 'est', 'à', 'côté', 'de', 'l’ascenseur'], traps: ['sont', 'le'], note: 'à côté de; l’ before a vowel.' },
  { id: 'a-05-build-02', unitId: 'a-05', question: 'Où est la cafétéria?', answer: ['Elle', 'est', 'au', 'rez-de-chaussée'], traps: ['sont', 'à'], note: 'à + le = au.' },
  { id: 'a-05-build-03', unitId: 'a-05', question: 'Où se trouve le laboratoire?', answer: ['Il', 'se', 'trouve', 'au', 'sous-sol'], traps: ['trouvent', 'à'], note: 'il se trouve au sous-sol.' },
  { id: 'a-05-build-04', unitId: 'a-05', question: 'Qu’est-ce qu’il y a dans l’édifice?', answer: ['Il', 'y', 'a', 'un', 'dépanneur'], traps: ['une', 'sont'], note: 'il y a never changes; dépanneur is masculine.' },
  { id: 'a-05-build-05', unitId: 'a-05', question: 'Où attendent-ils?', answer: ['Ils', 'attendent', 'dans', 'la', 'salle', 'd’attente'], traps: ['attend', 'le'], note: 'ils attendent; salle is feminine.' },

  // a-06 · Indiquer des données chiffrées
  { id: 'a-06-build-01', unitId: 'a-06', question: 'Quel est votre numéro de poste? (82)', answer: ['C’est', 'le', 'quatre-vingt-deux'], traps: ['la', 'quatre-vingt-douze'], note: '82 = quatre-vingt-deux; 92 = quatre-vingt-douze.' },
  { id: 'a-06-build-02', unitId: 'a-06', question: 'Combien de documents y a-t-il? (environ 30)', answer: ['Il', 'y', 'a', 'une', 'trentaine', 'de', 'documents'], traps: ['un', 'trente'], note: 'About 30: une trentaine de.' },
  { id: 'a-06-build-03', unitId: 'a-06', question: 'Combien de personnes compte la division? (75)', answer: ['Elle', 'compte', 'soixante-quinze', 'personnes'], traps: ['comptent', 'soixante-cinq'], note: '75 = soixante-quinze; 65 = soixante-cinq.' },
  { id: 'a-06-build-04', unitId: 'a-06', question: 'Combien de chaises reste-t-il? (71)', answer: ['Il', 'reste', 'soixante et onze', 'chaises'], traps: ['restent', 'soixante et un'], note: '71 = soixante et onze; il reste never changes.' },
  { id: 'a-06-build-05', unitId: 'a-06', question: 'Quel fichier est confidentiel?', answer: ['Celui-ci', 'est', 'confidentiel'], traps: ['Celle-ci', 'sont'], note: 'fichier is masculine: celui-ci.' },
]
