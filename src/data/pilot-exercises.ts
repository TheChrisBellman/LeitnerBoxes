import type {
  AuthoredExercise,
  BestResponseExercise,
  ContextualClozeExercise,
  CorrectionExercise,
  ExerciseTarget,
  Level,
  OrderedExercise,
  Passage,
  ReadingExercise,
  Scenario,
  SupportingDialogue,
  TransformationExercise,
  TypedExercise,
} from './types.ts'

export const earlyLevelExamples: BestResponseExercise[] = [
  {
    id: 'a-01-english-scaffold-01',
    unitId: 'a-01',
    targetId: 'a-01-english-scaffold',
    kind: 'best-response',
    promptLanguage: 'en',
    contextLanguage: 'en',
    situation: 'You meet a new colleague at work. Choose the French sentence that introduces you.',
    prompt: 'Which reply means “My name is Nadia”?',
    answer: 'Je m’appelle Nadia.',
    distractors: [
      'Je suis dans le bureau.',
      'Voici le dossier.',
      'À demain, Nadia.',
    ],
    feedback: '“Je m’appelle…” means “My name is…”. The French answer stays short while the task is explained in English.',
  },
  {
    id: 'a-02-english-scaffold-01',
    unitId: 'a-02',
    targetId: 'a-02-english-scaffold',
    kind: 'best-response',
    promptLanguage: 'en',
    contextLanguage: 'en',
    situation: 'Your manager asks which document is ready. Choose the French sentence that identifies it.',
    prompt: 'Which reply means “It is the report”?',
    answer: 'C’est le rapport.',
    distractors: [
      'C’est Nadia.',
      'Voici la réunion.',
      'Je travaille demain.',
    ],
    feedback: '“C’est…” means “It is…” or “This is…”. Early exercises can keep both the task and the situation in English while you learn the French response pattern.',
  },
]

export const earlyTypedExamples: TypedExercise[] = [
  {
    id: 'a-02-typed-recall-01',
    unitId: 'a-02',
    targetId: 'a-02-typed-recall',
    kind: 'typed',
    promptLanguage: 'en',
    contextLanguage: 'en',
    context: 'Your colleague asks which document you are sending.',
    prompt: 'Type the French words for “the report”.',
    answer: 'le rapport',
    feedback: 'The typed answer is « le rapport ». Early typed recall uses short, accent-safe French phrases.',
  },
]

export const pilotDialogues: SupportingDialogue[] = [
  {
    id: 'a-10-assignment-dialogue',
    unitId: 'a-10',
    title: 'Répartir la vérification finale',
    turns: [
      { speaker: 'Alex', text: 'Pour le dossier d’accueil, qui prépare la première version?' },
      { speaker: 'Samira', text: 'Je peux m’en occuper. Je vous l’enverrai mercredi midi.' },
      { speaker: 'Alex', text: 'Parfait. Élodie vérifiera les chiffres jeudi matin.' },
    ],
  },
]

export const pilotPassages: Passage[] = [
  {
    id: 'c-16-declaration-email',
    unitId: 'c-16',
    genre: 'Courriel interne',
    title: 'Déclarer un lien personnel',
    text: `Bonjour l’équipe,

Pendant l’examen des propositions pour le contrat de formation, j’ai reconnu le nom d’un fournisseur. L’entreprise appartient à ma sœur, Camille. Je vais inscrire ce lien dans le formulaire de déclaration et me retirer de la notation. Merci d’envoyer vos questions à Malik, qui coordonnera la suite de l’examen.

Cette mesure permettra au comité de poursuivre son travail avec une information complète et une répartition claire des rôles.

Merci,
Nora`,
  },
  {
    id: 'c-16-gift-vignette',
    unitId: 'c-16',
    genre: 'Vignette de politique',
    title: 'Un cadeau après l’évaluation',
    text: `Une équipe reçoit un panier de produits locaux après avoir évalué les offres de plusieurs fournisseurs. Le panier est de faible valeur, mais il provient d’une entreprise qui souhaite obtenir un prochain contrat. L’équipe remercie l’expéditeur sans promettre de traitement favorable.

La personne responsable inscrit le cadeau au registre et demande conseil à la personne-ressource en éthique. Pendant cette vérification, l’équipe conserve ses notes d’évaluation et n’accepte aucun autre avantage. La règle vise à protéger l’impartialité réelle et l’apparence d’impartialité.`,
  },
]

export const pilotScenarios: Scenario[] = [
  {
    id: 'c-16-confidential-offer',
    unitId: 'c-16',
    title: 'Une demande de document confidentiel',
    setup: 'Vous siégez à un comité d’évaluation. Un collègue qui ne fait pas partie du comité vous demande de lui envoyer l’offre confidentielle d’un fournisseur.',
    nodes: [
      {
        id: 'next-step',
        prompt: 'Que dites-vous ensuite?',
        choices: [
          'Je ne peux pas la transmettre; je vais vérifier la procédure de partage.',
          'Je vous l’envoie, puisque nous travaillons dans la même organisation.',
          'Je vais supprimer l’offre pour éviter toute question.',
          'Je peux vous en parler, mais je ne garderai aucune trace.',
        ],
        answer: 'Je ne peux pas la transmettre; je vais vérifier la procédure de partage.',
        feedback: 'La réponse protège la confidentialité et propose une vérification concrète plutôt qu’une transmission improvisée.',
      },
    ],
  },
]

const a10BestResponses: BestResponseExercise[] = [
  {
    id: 'a-10-best-01',
    unitId: 'a-10',
    targetId: 'a-10-assignment-ownership',
    kind: 'best-response',
    dialogueId: 'a-10-assignment-dialogue',
    situation: 'Après cette conversation, votre gestionnaire vous demande qui prendra en charge la vérification finale. Quelle réponse est la plus claire?',
    prompt: 'Choisissez la réponse qui attribue clairement la tâche.',
    answer: 'Élodie vérifiera les chiffres jeudi matin.',
    distractors: [
      'Les chiffres seront peut-être vérifiés plus tard.',
      'Quelqu’un devrait regarder le dossier un jour.',
      'Le dossier est important pour toute l’équipe.',
    ],
    feedback: 'La réponse nomme la personne responsable, la tâche et le moment prévu.',
  },
  {
    id: 'a-10-best-02',
    unitId: 'a-10',
    targetId: 'a-10-responsibility-split',
    kind: 'best-response',
    situation: 'Vous répartissez un rapport entre deux collègues. Vous voulez annoncer une répartition précise et collaborative.',
    prompt: 'Quelle formulation convient le mieux au travail?',
    answer: 'Je prépare la première partie et Nadia s’occupera des annexes.',
    distractors: [
      'Nadia fera quelque chose avec le rapport.',
      'Je laisse le rapport à quelqu’un d’autre.',
      'Les annexes sont probablement faciles.',
    ],
    feedback: 'La formulation attribue une responsabilité à chaque personne sans laisser la répartition vague.',
  },
  {
    id: 'a-10-best-03',
    unitId: 'a-10',
    targetId: 'a-10-deadline-request',
    kind: 'best-response',
    situation: 'Une collègue doit terminer sa partie avant une réunion. Vous lui donnez une consigne polie avec une échéance.',
    prompt: 'Quelle demande est la plus appropriée?',
    answer: 'Pourriez-vous me remettre votre partie d’ici jeudi midi?',
    distractors: [
      'Remettez-la quand vous aurez le temps.',
      'Vous remettrez peut-être votre partie un jour.',
      'Pourquoi votre partie n’est-elle pas déjà terminée?',
    ],
    feedback: 'La demande reste polie tout en indiquant clairement la date limite.',
  },
  {
    id: 'a-10-best-04',
    unitId: 'a-10',
    targetId: 'a-10-sequence-directive',
    kind: 'best-response',
    situation: 'Un nouveau membre rejoint l’équipe. Vous lui expliquez dans quel ordre traiter les demandes urgentes.',
    prompt: 'Quelle instruction donne une séquence claire?',
    answer: 'Commencez par les demandes urgentes, puis transmettez le reste à l’équipe.',
    distractors: [
      'Traitez les demandes comme vous voulez.',
      'Les demandes sont dans le dossier partagé.',
      'L’équipe connaît déjà les priorités.',
    ],
    feedback: 'Les marqueurs « commencez par » et « puis » rendent l’ordre des actions explicite.',
  },
]

const a10Clozes: ContextualClozeExercise[] = [
  {
    id: 'a-10-cloze-01',
    unitId: 'a-10',
    targetId: 'a-10-imperative-directive',
    kind: 'contextual-cloze',
    context: 'Le rapport doit partir demain matin. Avant l’envoi,',
    prompt: '___ les chiffres une dernière fois.',
    answer: 'vérifiez',
    distractors: ['vérifier', 'vérifions', 'vérifié'],
    feedback: 'Après « avant », cette consigne s’adresse directement à la personne: « vérifiez les chiffres ».',
  },
  {
    id: 'a-10-cloze-02',
    unitId: 'a-10',
    targetId: 'a-10-imperative-directive',
    kind: 'contextual-cloze',
    context: 'Pour respecter la séquence,',
    prompt: '___ le formulaire avant de l’archiver.',
    answer: 'remplissez',
    distractors: ['remplir', 'remplissez-le', 'rempli'],
    feedback: 'La consigne utilise l’impératif « remplissez » et le complément est déjà placé après le verbe.',
  },
  {
    id: 'a-10-cloze-03',
    unitId: 'a-10',
    targetId: 'a-10-deadline-marker',
    kind: 'contextual-cloze',
    context: 'Merci de me remettre votre partie',
    prompt: '___ jeudi midi.',
    answer: 'd’ici',
    distractors: ['depuis', 'pendant', 'après'],
    feedback: '« D’ici jeudi midi » indique que la tâche doit être terminée au plus tard à cette échéance.',
  },
  {
    id: 'a-10-cloze-04',
    unitId: 'a-10',
    targetId: 'a-10-polite-request',
    kind: 'contextual-cloze',
    context: 'Dans un courriel professionnel,',
    prompt: 'Je ___ vous demander de confirmer la réception.',
    answer: 'voudrais',
    distractors: ['dois', 'viens', 'suis'],
    feedback: '« Je voudrais vous demander » formule une demande polie et adaptée à un courriel professionnel.',
  },
]

const a10Orders: OrderedExercise[] = [
  {
    id: 'a-10-order-01',
    unitId: 'a-10',
    targetId: 'a-10-directive-assignment',
    kind: 'ordered',
    prompt: 'Donnez la directive complète.',
    tokens: ['Veuillez', 'assigner', 'la', 'tâche', 'à', 'Nadia', 'aujourd’hui.'],
    answer: 'Veuillez assigner la tâche à Nadia aujourd’hui.',
    feedback: 'La directive place la personne responsable et le moment après l’action à accomplir.',
  },
  {
    id: 'a-10-order-02',
    unitId: 'a-10',
    targetId: 'a-10-sequence-order',
    kind: 'ordered',
    prompt: 'Mettez les mots dans l’ordre pour donner la première étape.',
    tokens: ['Commencez', 'par', 'vérifier', 'les', 'priorités', 'du', 'service.'],
    answer: 'Commencez par vérifier les priorités du service.',
    feedback: '« Commencez par » introduit la première action, suivie de l’infinitif « vérifier ».',
  },
  {
    id: 'a-10-order-03',
    unitId: 'a-10',
    targetId: 'a-10-deadline-directive',
    kind: 'ordered',
    prompt: 'Mettez les mots dans l’ordre pour fixer une échéance.',
    tokens: ['Envoyez', 'le', 'calendrier', 'à', 'l’équipe', 'avant', 'midi.'],
    answer: 'Envoyez le calendrier à l’équipe avant midi.',
    feedback: 'La consigne indique d’abord l’objet et le destinataire, puis la limite temporelle.',
  },
]

const a10Corrections: CorrectionExercise[] = [
  {
    id: 'a-10-correction-01',
    unitId: 'a-10',
    targetId: 'a-10-imperative-grammar',
    kind: 'correction',
    prompt: 'Quel segment doit être corrigé?',
    segments: [
      { id: 'a', text: 'Veuillez envoyez' },
      { id: 'b', text: 'le relevé' },
      { id: 'c', text: 'à la responsable' },
      { id: 'd', text: 'avant vendredi.' },
    ],
    answerSegmentId: 'a',
    correction: 'Veuillez envoyer',
    feedback: 'Après « veuillez », on emploie l’infinitif: « veuillez envoyer ».',
  },
  {
    id: 'a-10-correction-02',
    unitId: 'a-10',
    targetId: 'a-10-agreement-responsibility',
    kind: 'correction',
    prompt: 'Quel segment doit être corrigé?',
    segments: [
      { id: 'a', text: 'Chaque membre' },
      { id: 'b', text: 'sont responsable' },
      { id: 'c', text: 'de sa partie' },
      { id: 'd', text: 'du dossier.' },
    ],
    answerSegmentId: 'b',
    correction: 'est responsable',
    feedback: '« Chaque membre » est singulier: le verbe et l’adjectif doivent être au singulier.',
  },
]

const c16Reading: ReadingExercise[] = [
  {
    id: 'c-16-reading-01',
    unitId: 'c-16',
    targetId: 'c-16-reading-detail',
    kind: 'reading',
    passageId: 'c-16-declaration-email',
    prompt: 'À qui appartient l’entreprise mentionnée dans le courriel?',
    answer: 'À la sœur de Nora.',
    distractors: ['À Malik.', 'À Nora.', 'À un membre du comité.'],
    feedback: 'Le courriel précise que l’entreprise appartient à la sœur de Nora.',
  },
  {
    id: 'c-16-reading-02',
    unitId: 'c-16',
    targetId: 'c-16-reading-purpose',
    kind: 'reading',
    passageId: 'c-16-declaration-email',
    prompt: 'Quel est le but principal du courriel?',
    answer: 'Déclarer un lien personnel et organiser la suite de l’examen.',
    distractors: ['Annoncer la signature du contrat.', 'Demander une nouvelle proposition au fournisseur.', 'Inviter l’équipe à une formation.'],
    feedback: 'Nora signale le lien, se retire de la notation et indique qui coordonnera la suite.',
  },
  {
    id: 'c-16-reading-03',
    unitId: 'c-16',
    targetId: 'c-16-reading-audience',
    kind: 'reading',
    passageId: 'c-16-declaration-email',
    prompt: 'Quel est le public visé en premier lieu?',
    answer: 'Les membres du comité d’examen.',
    distractors: ['Les clients du fournisseur.', 'Les personnes qui recevront la formation.', 'Le grand public.'],
    feedback: 'La salutation et les consignes concernent les collègues qui examinent les propositions.',
  },
  {
    id: 'c-16-reading-04',
    unitId: 'c-16',
    targetId: 'c-16-reading-inference',
    kind: 'reading',
    passageId: 'c-16-declaration-email',
    prompt: 'Que peut-on déduire du retrait de Nora de la notation?',
    answer: 'Elle veut éviter qu’un lien personnel influence, ou semble influencer, l’évaluation.',
    distractors: ['Elle ne connaît pas le dossier.', 'Elle a déjà choisi le fournisseur.', 'Elle ne veut plus travailler avec le comité.'],
    feedback: 'Le retrait rend la décision plus indépendante et protège la confiance dans le processus.',
  },
  {
    id: 'c-16-reading-05',
    unitId: 'c-16',
    targetId: 'c-16-reading-gift-risk',
    kind: 'reading',
    passageId: 'c-16-gift-vignette',
    prompt: 'Pourquoi le cadeau doit-il être inscrit au registre?',
    answer: 'Parce qu’il peut créer une apparence d’influence, même s’il vaut peu.',
    distractors: ['Parce que l’équipe doit revendre les produits.', 'Parce que le fournisseur a déjà obtenu le contrat.', 'Parce que tout cadeau est automatiquement interdit.'],
    feedback: 'La vignette distingue la faible valeur du cadeau de l’apparence qu’il pourrait créer.',
  },
  {
    id: 'c-16-reading-06',
    unitId: 'c-16',
    targetId: 'c-16-reading-response-tone',
    kind: 'reading',
    passageId: 'c-16-gift-vignette',
    prompt: 'Quelle réponse correspond au ton et à l’objectif de la vignette?',
    answer: 'Remercier l’expéditeur, déclarer le cadeau et demander conseil avant d’accepter quoi que ce soit d’autre.',
    distractors: ['Accepter le cadeau en secret pour remercier le fournisseur.', 'Refuser de garder des notes afin d’éviter une trace.', 'Promettre un avantage au fournisseur pour rester courtois.'],
    feedback: 'Cette réponse reste courtoise tout en documentant la situation et en protégeant l’impartialité.',
  },
]

const c16Clozes: ContextualClozeExercise[] = [
  {
    id: 'c-16-cloze-01',
    unitId: 'c-16',
    targetId: 'c-16-connector-consequence',
    kind: 'contextual-cloze',
    context: 'Le comité a publié ses critères;',
    prompt: '___, chaque fournisseur connaissait la méthode.',
    answer: 'ainsi',
    distractors: ['pourtant', 'avant que', 'bien que'],
    feedback: '« Ainsi » marque ici la conséquence de la publication des critères.',
  },
  {
    id: 'c-16-cloze-02',
    unitId: 'c-16',
    targetId: 'c-16-connector-result',
    kind: 'contextual-cloze',
    context: 'Nora a déclaré son lien;',
    prompt: '___, elle ne participe pas à la notation.',
    answer: 'par conséquent',
    distractors: ['en revanche', 'par exemple', 'entre-temps'],
    feedback: '« Par conséquent » relie la déclaration du lien à la décision de ne pas noter.',
  },
  {
    id: 'c-16-cloze-03',
    unitId: 'c-16',
    targetId: 'c-16-connector-purpose',
    kind: 'contextual-cloze',
    context: '___ la décision soit traçable,',
    prompt: 'les membres conservent leurs notes.',
    answer: 'Afin que',
    distractors: ['Même si', 'Parce que', 'Tandis que'],
    feedback: '« Afin que » introduit le but et demande le subjonctif « soit ».',
  },
  {
    id: 'c-16-cloze-04',
    unitId: 'c-16',
    targetId: 'c-16-connector-contrast',
    kind: 'contextual-cloze',
    context: 'Le cadeau était peu coûteux;',
    prompt: '___, il devait être déclaré.',
    answer: 'néanmoins',
    distractors: ['donc', 'd’abord', 'parce que'],
    feedback: '« Néanmoins » marque le contraste entre la faible valeur et l’obligation de déclarer.',
  },
]

const c16Corrections: CorrectionExercise[] = [
  {
    id: 'c-16-correction-01',
    unitId: 'c-16',
    targetId: 'c-16-proofreading-agreement',
    kind: 'correction',
    prompt: 'Quel segment contient l’erreur?',
    segments: [
      { id: 'a', text: 'Les règles du comité' },
      { id: 'b', text: 'est claires' },
      { id: 'c', text: 'pour tous les membres' },
      { id: 'd', text: 'du groupe.' },
    ],
    answerSegmentId: 'b',
    correction: 'sont claires',
    feedback: 'Le sujet « les règles » est pluriel: il faut écrire « sont claires ».',
  },
  {
    id: 'c-16-correction-02',
    unitId: 'c-16',
    targetId: 'c-16-confidentiality-language',
    kind: 'correction',
    prompt: 'Quel segment devrait être reformulé pour respecter la confidentialité?',
    segments: [
      { id: 'a', text: 'Chaque membre doit' },
      { id: 'b', text: 'conserver ses notes' },
      { id: 'c', text: 'dans un dossier sécurisé' },
      { id: 'd', text: 'et les partager avec tout le monde.' },
    ],
    answerSegmentId: 'd',
    correction: 'et les protéger.',
    feedback: 'Des notes confidentielles doivent être protégées, et non partagées sans autorisation.',
  },
  {
    id: 'c-16-correction-03',
    unitId: 'c-16',
    targetId: 'c-16-proofreading-adjective',
    kind: 'correction',
    prompt: 'Quel segment contient l’erreur d’accord?',
    segments: [
      { id: 'a', text: 'Les données sensibles' },
      { id: 'b', text: 'doivent rester' },
      { id: 'c', text: 'strictement' },
      { id: 'd', text: 'confidentiel.' },
    ],
    answerSegmentId: 'd',
    correction: 'confidentielles.',
    feedback: '« Données » est féminin pluriel: l’adjectif doit être « confidentielles ».',
  },
  {
    id: 'c-16-correction-04',
    unitId: 'c-16',
    targetId: 'c-16-proofreading-no-error',
    kind: 'correction',
    prompt: 'Choisissez le segment à corriger, ou indiquez qu’il n’y a pas d’erreur.',
    segments: [
      { id: 'a', text: 'La décision est' },
      { id: 'b', text: 'documentée dans le registre' },
      { id: 'c', text: 'et communiquée' },
      { id: 'd', text: 'aux personnes concernées.' },
    ],
    answerSegmentId: 'none',
    correction: 'Aucune correction nécessaire.',
    allowNoCorrection: true,
    feedback: 'Les quatre segments sont corrects et la phrase est cohérente.',
  },
]

const c16Responses: (BestResponseExercise | TransformationExercise)[] = [
  {
    id: 'c-16-response-01',
    unitId: 'c-16',
    targetId: 'c-16-ethical-record',
    kind: 'best-response',
    situation: 'Un collègue vous demande d’effacer les notes qui expliquent une décision sensible.',
    prompt: 'Quelle réponse protège la traçabilité?',
    answer: 'Je vais conserver les notes et vérifier la règle de conservation applicable.',
    distractors: [
      'Je vais les effacer pour que le dossier soit plus simple.',
      'Je vais les modifier afin que personne ne pose de question.',
      'Je vais les envoyer à toute l’organisation.',
    ],
    feedback: 'La réponse conserve une trace et propose de vérifier la règle plutôt que de supprimer l’information.',
  },
  {
    id: 'c-16-response-02',
    unitId: 'c-16',
    targetId: 'c-16-conflict-disclosure',
    kind: 'best-response',
    situation: 'Vous devez noter une proposition, mais vous connaissez personnellement la personne qui l’a préparée.',
    prompt: 'Quelle réponse est la plus responsable?',
    answer: 'Je vais déclarer ce lien et demander si je dois me retirer de l’évaluation.',
    distractors: [
      'Je vais noter l’offre rapidement pour prouver mon impartialité.',
      'Je ne dirai rien puisque je connais bien le secteur.',
      'Je vais donner la meilleure note pour éviter un malaise.',
    ],
    feedback: 'La déclaration permet de traiter le risque ouvertement et de suivre la procédure appropriée.',
  },
  {
    id: 'c-16-transformation-01',
    unitId: 'c-16',
    targetId: 'c-16-passive-reformulation',
    kind: 'transformation',
    source: 'Le comité doit documenter chaque décision.',
    prompt: 'Choisissez la reformulation qui conserve le même sens.',
    answer: 'Chaque décision doit être documentée par le comité.',
    distractors: [
      'Le comité peut documenter une décision s’il le souhaite.',
      'Chaque décision documente le comité.',
      'Le comité a déjà documenté toutes les décisions.',
    ],
    feedback: 'La voix passive conserve l’obligation et le rôle du comité.',
  },
  {
    id: 'c-16-transformation-02',
    unitId: 'c-16',
    targetId: 'c-16-cause-reformulation',
    kind: 'transformation',
    source: 'Camille a déclaré un lien personnel, donc elle ne participe pas au vote.',
    prompt: 'Quelle reformulation met clairement la cause en tête?',
    answer: 'Comme Camille a déclaré un lien personnel, elle ne participe pas au vote.',
    distractors: [
      'Même si Camille a déclaré un lien personnel, elle participe au vote.',
      'Camille ne participe pas au vote, mais elle n’a déclaré aucun lien.',
      'Camille participe au vote parce qu’elle a déclaré un lien personnel.',
    ],
    feedback: '« Comme » introduit la cause et conserve la conséquence: Camille ne vote pas.',
  },
]

const c16Scenario: AuthoredExercise = {
  id: 'c-16-scenario-01',
  unitId: 'c-16',
  targetId: 'c-16-confidentiality-response',
  kind: 'scenario',
  scenarioId: 'c-16-confidential-offer',
  nodeId: 'next-step',
  feedback: 'La réponse protège la confidentialité et propose une vérification concrète plutôt qu’une transmission improvisée.',
}

export const pilotExercises: AuthoredExercise[] = [
  ...a10BestResponses,
  ...a10Clozes,
  ...a10Orders,
  ...a10Corrections,
  ...c16Reading,
  ...c16Clozes,
  ...c16Corrections,
  ...c16Responses,
  c16Scenario,
]

const levelForUnit = (unitId: string): Level => unitId.startsWith('c-') ? 'C' : 'A'
const nextTargetOrder = new Map<string, number>()
export const allExercises: AuthoredExercise[] = [...earlyLevelExamples, ...earlyTypedExamples, ...pilotExercises]

const targetDefinitions = new Map<string, { unitId: string; order: number }>()
for (const exercise of allExercises) {
  if (targetDefinitions.has(exercise.targetId)) continue
  const order = (nextTargetOrder.get(exercise.unitId) ?? 0) + 1
  nextTargetOrder.set(exercise.unitId, order)
  targetDefinitions.set(exercise.targetId, { unitId: exercise.unitId, order })
}

export const exerciseTargets: ExerciseTarget[] = [...targetDefinitions].map(([id, definition]) => ({
  id,
  level: levelForUnit(definition.unitId),
  lessonId: definition.unitId,
  kind: 'exercise',
  tier: 'applied',
  order: definition.order,
  targetType: 'exercise',
  queuePriority: 0,
}))

export const exercisesByTargetId = new Map<string, AuthoredExercise[]>()
for (const exercise of allExercises) {
  const variants = exercisesByTargetId.get(exercise.targetId) ?? []
  variants.push(exercise)
  exercisesByTargetId.set(exercise.targetId, variants)
}

export const exerciseTargetsById = new Map(exerciseTargets.map((target) => [target.id, target]))
export const passagesById = new Map(pilotPassages.map((passage) => [passage.id, passage]))
export const dialoguesById = new Map(pilotDialogues.map((dialogue) => [dialogue.id, dialogue]))
export const scenariosById = new Map(pilotScenarios.map((scenario) => [scenario.id, scenario]))

export const allPassages = pilotPassages
export const allDialogues = pilotDialogues
export const allScenarios = pilotScenarios
